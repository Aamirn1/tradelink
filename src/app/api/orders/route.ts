import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sanitizeUser } from '@/lib/auth';

// ──────────────────────────────────────────────
// GET /api/orders — List orders for a user
// ──────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const role = searchParams.get('role'); // "buyer" | "seller" | undefined (both)

    if (!userId) {
      return NextResponse.json(
        { error: 'userId query parameter is required' },
        { status: 400 },
      );
    }

    // Verify user exists
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Build the where clause based on role
    const whereClause: Record<string, unknown> = {};

    if (role === 'buyer') {
      whereClause.buyerId = userId;
    } else if (role === 'seller') {
      whereClause.sellerId = userId;
    } else {
      whereClause.OR = [{ buyerId: userId }, { sellerId: userId }];
    }

    if (status) {
      const validStatuses = [
        'PENDING',
        'PROCESSING',
        'SHIPPED',
        'DELIVERED',
        'DISPUTED',
        'CANCELLED',
        'COMPLETED',
      ];
      if (!validStatuses.includes(status.toUpperCase())) {
        return NextResponse.json(
          { error: `Invalid status filter. Valid values: ${validStatuses.join(', ')}` },
          { status: 400 },
        );
      }
      whereClause.status = status.toUpperCase();
    }

    const orders = await db.order.findMany({
      where: whereClause,
      include: {
        items: true,
        payments: true,
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            businessName: true,
            role: true,
            avatar: true,
            isVerified: true,
            city: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            businessName: true,
            role: true,
            avatar: true,
            isVerified: true,
            city: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    console.error('[ORDERS GET ERROR]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// ──────────────────────────────────────────────
// POST /api/orders — Create a new order
// ──────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { buyerId, sellerId, items, paymentType, depositPercent, notes } =
      body;

    // ── Validate required fields ──
    if (!buyerId) {
      return NextResponse.json(
        { error: 'buyerId is required' },
        { status: 400 },
      );
    }
    if (!sellerId) {
      return NextResponse.json(
        { error: 'sellerId is required' },
        { status: 400 },
      );
    }
    if (buyerId === sellerId) {
      return NextResponse.json(
        { error: 'Buyer and seller cannot be the same user' },
        { status: 400 },
      );
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'items must be a non-empty array' },
        { status: 400 },
      );
    }

    // Validate paymentType
    const validPaymentTypes = ['FULL', 'PARTIAL'];
    const resolvedPaymentType = paymentType?.toUpperCase() || 'FULL';
    if (!validPaymentTypes.includes(resolvedPaymentType)) {
      return NextResponse.json(
        { error: 'paymentType must be FULL or PARTIAL' },
        { status: 400 },
      );
    }

    // Validate each item
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.productId) {
        return NextResponse.json(
          { error: `items[${i}].productId is required` },
          { status: 400 },
        );
      }
      if (!item.productName) {
        return NextResponse.json(
          { error: `items[${i}].productName is required` },
          { status: 400 },
        );
      }
      if (!item.quantity || item.quantity <= 0) {
        return NextResponse.json(
          { error: `items[${i}].quantity must be a positive integer` },
          { status: 400 },
        );
      }
      if (!item.unitPrice || item.unitPrice <= 0) {
        return NextResponse.json(
          { error: `items[${i}].unitPrice must be a positive number` },
          { status: 400 },
        );
      }
    }

    // ── Verify buyer and seller exist ──
    const [buyer, seller] = await Promise.all([
      db.user.findUnique({ where: { id: buyerId } }),
      db.user.findUnique({ where: { id: sellerId } }),
    ]);

    if (!buyer) {
      return NextResponse.json(
        { error: 'Buyer not found' },
        { status: 404 },
      );
    }
    if (!seller) {
      return NextResponse.json(
        { error: 'Seller not found' },
        { status: 404 },
      );
    }

    // ── Calculate financial fields ──
    const orderItems = items.map(
      (item: { productId: string; productName: string; quantity: number; unitPrice: number }) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.quantity) * Number(item.unitPrice),
      }),
    );

    const totalAmount = orderItems.reduce((sum: number, item: { totalPrice: number }) => sum + item.totalPrice, 0);

    // Determine depositPercent
    let resolvedDepositPercent = 100;
    if (resolvedPaymentType === 'PARTIAL') {
      resolvedDepositPercent =
        depositPercent !== undefined && depositPercent !== null
          ? Math.min(Math.max(Number(depositPercent), 1), 99) // clamp 1-99
          : 50; // default 50% for partial
    }
    // For FULL payment, deposit is 100%

    const depositAmount = totalAmount * (resolvedDepositPercent / 100);
    const commissionRate = 0.03;
    const commissionAmount = totalAmount * commissionRate;
    const lockedAmount = totalAmount;

    // ── Verify products exist and have enough stock ──
    const productIds = orderItems.map((item: { productId: string }) => item.productId);
    const products = await db.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    for (const item of orderItems) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.productId}` },
          { status: 404 },
        );
      }
      if (product.stock < item.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for product "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}`,
          },
          { status: 400 },
        );
      }
    }

    // ── Generate order number ──
    const now = new Date();
    const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const randomSuffix = String(Math.floor(1000 + Math.random() * 9000));
    const orderNumber = `TL-${datePart}-${randomSuffix}`;

    // ── Create order in a transaction ──
    const order = await db.$transaction(async (tx) => {
      // Create the order with items
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          status: 'PENDING',
          totalAmount,
          depositAmount,
          depositPercent: resolvedDepositPercent,
          lockedAmount,
          releasedAmount: 0,
          commissionRate,
          commissionAmount,
          paymentType: resolvedPaymentType,
          notes: notes || null,
          buyerId,
          sellerId,
          items: {
            create: orderItems.map(
              (item: { productId: string; productName: string; quantity: number; unitPrice: number; totalPrice: number }) => ({
                productId: item.productId,
                productName: item.productName,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.totalPrice,
              }),
            ),
          },
        },
        include: {
          items: true,
        },
      });

      // Create deposit payment record
      await tx.payment.create({
        data: {
          amount: depositAmount,
          type: 'DEPOSIT',
          status: 'PENDING',
          method: 'ESCROW',
          userId: buyerId,
          orderId: newOrder.id,
        },
      });

      // Decrement stock for each product
      for (const item of orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return newOrder;
    });

    // Fetch the complete order with relations
    const completeOrder = await db.order.findUnique({
      where: { id: order.id },
      include: {
        items: true,
        payments: true,
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            businessName: true,
            role: true,
            avatar: true,
            isVerified: true,
            city: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            businessName: true,
            role: true,
            avatar: true,
            isVerified: true,
            city: true,
          },
        },
      },
    });

    return NextResponse.json(
      { order: completeOrder, message: 'Order created successfully' },
      { status: 201 },
    );
  } catch (error) {
    console.error('[ORDERS POST ERROR]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
