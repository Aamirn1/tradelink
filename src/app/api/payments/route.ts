import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ──────────────────────────────────────────────
// GET /api/payments — List payments for a user
// ──────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const orderId = searchParams.get('orderId');

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

    // Build the where clause
    const whereClause: Record<string, unknown> = {
      userId,
    };

    // Filter by type
    if (type) {
      const validTypes = ['DEPOSIT', 'REMAINDER', 'REFUND', 'COMMISSION'];
      if (!validTypes.includes(type.toUpperCase())) {
        return NextResponse.json(
          { error: `Invalid type filter. Valid values: ${validTypes.join(', ')}` },
          { status: 400 },
        );
      }
      whereClause.type = type.toUpperCase();
    }

    // Filter by status
    if (status) {
      const validStatuses = ['PENDING', 'COMPLETED', 'FAILED'];
      if (!validStatuses.includes(status.toUpperCase())) {
        return NextResponse.json(
          { error: `Invalid status filter. Valid values: ${validStatuses.join(', ')}` },
          { status: 400 },
        );
      }
      whereClause.status = status.toUpperCase();
    }

    // Filter by orderId
    if (orderId) {
      whereClause.orderId = orderId;
    }

    const payments = await db.payment.findMany({
      where: whereClause,
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            totalAmount: true,
            buyer: {
              select: {
                id: true,
                name: true,
                businessName: true,
              },
            },
            seller: {
              select: {
                id: true,
                name: true,
                businessName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate summary stats
    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    const completedAmount = payments
      .filter((p) => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + p.amount, 0);
    const pendingAmount = payments
      .filter((p) => p.status === 'PENDING')
      .reduce((sum, p) => sum + p.amount, 0);

    return NextResponse.json(
      {
        payments,
        summary: {
          totalPayments: payments.length,
          totalAmount,
          completedAmount,
          pendingAmount,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('[PAYMENTS GET ERROR]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
