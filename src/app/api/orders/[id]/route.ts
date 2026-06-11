import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ──────────────────────────────────────────────
// GET /api/orders/[id] — Get single order
// ──────────────────────────────────────────────
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const order = await db.order.findUnique({
      where: { id },
      include: {
        items: true,
        payments: {
          orderBy: { createdAt: 'desc' },
        },
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
            phone: true,
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
            phone: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ order }, { status: 200 });
  } catch (error) {
    console.error('[ORDER GET ERROR]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// ──────────────────────────────────────────────
// PUT /api/orders/[id] — Update order status
// ──────────────────────────────────────────────
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status: newStatus, userId } = body;

    if (!newStatus) {
      return NextResponse.json(
        { error: 'status is required' },
        { status: 400 },
      );
    }
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required to determine role' },
        { status: 400 },
      );
    }

    const validStatuses = [
      'PENDING',
      'PROCESSING',
      'SHIPPED',
      'DELIVERED',
      'DISPUTED',
      'CANCELLED',
      'COMPLETED',
    ];
    const normalizedStatus = newStatus.toUpperCase();
    if (!validStatuses.includes(normalizedStatus)) {
      return NextResponse.json(
        { error: `Invalid status. Valid values: ${validStatuses.join(', ')}` },
        { status: 400 },
      );
    }

    // Fetch the current order
    const order = await db.order.findUnique({
      where: { id },
      include: {
        items: true,
        payments: true,
        buyer: { select: { id: true } },
        seller: { select: { id: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const currentStatus = order.status;
    const isBuyer = order.buyerId === userId;
    const isSeller = order.sellerId === userId;

    if (!isBuyer && !isSeller) {
      return NextResponse.json(
        { error: 'You are not authorized to update this order' },
        { status: 403 },
      );
    }

    // ── Validate status transitions based on role ──
    const sellerTransitions: Record<string, string[]> = {
      PENDING: ['PROCESSING'],
      PROCESSING: ['SHIPPED'],
    };

    const buyerTransitions: Record<string, string[]> = {
      SHIPPED: ['DELIVERED', 'DISPUTED'],
    };

    // Either party can cancel from PENDING
    const eitherTransitions: Record<string, string[]> = {
      PENDING: ['CANCELLED'],
    };

    // Check if the transition is allowed
    let allowed = false;

    // Seller transitions
    if (isSeller && sellerTransitions[currentStatus]?.includes(normalizedStatus)) {
      allowed = true;
    }

    // Buyer transitions
    if (isBuyer && buyerTransitions[currentStatus]?.includes(normalizedStatus)) {
      allowed = true;
    }

    // Either-party transitions
    if (eitherTransitions[currentStatus]?.includes(normalizedStatus)) {
      allowed = true;
    }

    // Admin override: allow any valid forward transition (optional, for future use)

    if (!allowed) {
      return NextResponse.json(
        {
          error: `Invalid status transition from ${currentStatus} to ${normalizedStatus}. ${
            isSeller
              ? 'As seller, you can: PENDING→PROCESSING→SHIPPED'
              : isBuyer
                ? 'As buyer, you can: SHIPPED→DELIVERED, SHIPPED→DISPUTED'
                : ''
          }. Either party can: PENDING→CANCELLED`,
        },
        { status: 400 },
      );
    }

    // ── Handle special logic for status changes ──
    if (normalizedStatus === 'CANCELLED') {
      // Restore product stock
      const updatedOrder = await db.$transaction(async (tx) => {
        // Restore stock for each item
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }

        // Update any PENDING payments to FAILED
        await tx.payment.updateMany({
          where: {
            orderId: order.id,
            status: 'PENDING',
          },
          data: { status: 'FAILED' },
        });

        // Update the order
        const updated = await tx.order.update({
          where: { id: order.id },
          data: {
            status: normalizedStatus,
            lockedAmount: 0,
          },
          include: {
            items: true,
            payments: { orderBy: { createdAt: 'desc' } },
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

        return updated;
      });

      return NextResponse.json(
        { order: updatedOrder, message: 'Order cancelled successfully' },
        { status: 200 },
      );
    }

    if (normalizedStatus === 'DELIVERED') {
      // Fund release: create REMAINDER and COMMISSION payments
      const updatedOrder = await db.$transaction(async (tx) => {
        const remainderAmount = order.totalAmount - order.depositAmount;

        // Mark the DEPOSIT payment as COMPLETED
        await tx.payment.updateMany({
          where: {
            orderId: order.id,
            type: 'DEPOSIT',
            status: 'PENDING',
          },
          data: { status: 'COMPLETED' },
        });

        // Create REMAINDER payment if there's a remainder (partial payment orders)
        if (remainderAmount > 0) {
          await tx.payment.create({
            data: {
              amount: remainderAmount,
              type: 'REMAINDER',
              status: 'COMPLETED',
              method: 'ESCROW',
              userId: order.buyerId,
              orderId: order.id,
            },
          });
        }

        // Create COMMISSION payment (deducted from seller's payout)
        await tx.payment.create({
          data: {
            amount: order.commissionAmount,
            type: 'COMMISSION',
            status: 'COMPLETED',
            method: 'ESCROW',
            userId: order.sellerId,
            orderId: order.id,
          },
        });

        // Calculate released amount: total - commission
        const sellerPayout = order.totalAmount - order.commissionAmount;

        const updated = await tx.order.update({
          where: { id: order.id },
          data: {
            status: normalizedStatus,
            lockedAmount: 0,
            releasedAmount: sellerPayout,
          },
          include: {
            items: true,
            payments: { orderBy: { createdAt: 'desc' } },
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

        return updated;
      });

      return NextResponse.json(
        { order: updatedOrder, message: 'Delivery confirmed. Funds released to seller (minus commission).' },
        { status: 200 },
      );
    }

    if (normalizedStatus === 'COMPLETED') {
      // Release all remaining funds
      const updatedOrder = await db.$transaction(async (tx) => {
        // Release any remaining locked funds
        const sellerPayout = order.totalAmount - order.commissionAmount;

        const updated = await tx.order.update({
          where: { id: order.id },
          data: {
            status: normalizedStatus,
            lockedAmount: 0,
            releasedAmount: sellerPayout,
          },
          include: {
            items: true,
            payments: { orderBy: { createdAt: 'desc' } },
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

        return updated;
      });

      return NextResponse.json(
        { order: updatedOrder, message: 'Order completed. All funds released.' },
        { status: 200 },
      );
    }

    // ── Default: simple status update (PROCESSING, SHIPPED, DISPUTED) ──
    const updatedOrder = await db.order.update({
      where: { id: order.id },
      data: { status: normalizedStatus },
      include: {
        items: true,
        payments: { orderBy: { createdAt: 'desc' } },
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

    const statusMessages: Record<string, string> = {
      PROCESSING: 'Order is now being processed by the seller.',
      SHIPPED: 'Order has been shipped by the seller.',
      DISPUTED: 'Order has been disputed. A resolution process will begin.',
    };

    return NextResponse.json(
      {
        order: updatedOrder,
        message: statusMessages[normalizedStatus] || `Order status updated to ${normalizedStatus}.`,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('[ORDER PUT ERROR]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
