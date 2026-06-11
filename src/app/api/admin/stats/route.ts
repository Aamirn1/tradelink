import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ──────────────────────────────────────────────
// GET /api/admin/stats — Return platform statistics
// ──────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get('adminId');

    // ── Verify admin ──
    if (!adminId) {
      return NextResponse.json(
        { error: 'adminId query parameter is required' },
        { status: 400 },
      );
    }

    const admin = await db.user.findUnique({ where: { id: adminId } });
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized: admin access required' },
        { status: 403 },
      );
    }

    // ── Run independent queries in parallel ──
    const [
      totalUsers,
      wholesalersCount,
      retailersCount,
      totalOrders,
      ordersByStatus,
      completedOrdersRevenue,
      activeDisputes,
      recentLogs,
      allOrders,
    ] = await Promise.all([
      // Total users
      db.user.count(),

      // Wholesalers count
      db.user.count({ where: { role: 'WHOLESALER' } }),

      // Retailers count
      db.user.count({ where: { role: 'RETAILER' } }),

      // Total orders
      db.order.count(),

      // Orders by status breakdown
      db.order.groupBy({
        by: ['status'],
        _count: { status: true },
      }),

      // Total revenue from completed orders
      db.order.aggregate({
        _sum: { commissionAmount: true },
        where: { status: 'COMPLETED' },
      }),

      // Active disputes count
      db.order.count({ where: { status: 'DISPUTED' } }),

      // Recent activity (last 10 AdminLog entries)
      db.adminLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
      }),

      // All orders for monthly trend & category analysis
      db.order.findMany({
        select: {
          createdAt: true,
          commissionAmount: true,
          status: true,
          items: {
            select: {
              productId: true,
              productName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // ── Monthly revenue trend (last 6 months) ──
    const now = new Date();
    const monthlyRevenue: { month: string; revenue: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const monthLabel = monthStart.toLocaleString('default', {
        month: 'short',
        year: 'numeric',
      });

      const monthOrders = allOrders.filter(
        (o) =>
          o.status === 'COMPLETED' &&
          o.createdAt >= monthStart &&
          o.createdAt < monthEnd,
      );

      const revenue = monthOrders.reduce(
        (sum, o) => sum + (o.commissionAmount || 0),
        0,
      );

      monthlyRevenue.push({ month: monthLabel, revenue });
    }

    // ── Top categories by order count ──
    const categoryMap = new Map<string, number>();
    for (const order of allOrders) {
      for (const item of order.items) {
        // Extract category from product name (use productId grouping as proxy)
        const key = item.productName || 'Uncategorized';
        categoryMap.set(key, (categoryMap.get(key) || 0) + 1);
      }
    }

    const topCategories = Array.from(categoryMap.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // ── Format orders by status ──
    const orderStatusBreakdown: Record<string, number> = {};
    for (const entry of ordersByStatus) {
      orderStatusBreakdown[entry.status] = entry._count.status;
    }

    // ── Build response ──
    const stats = {
      users: {
        total: totalUsers,
        wholesalers: wholesalersCount,
        retailers: retailersCount,
      },
      orders: {
        total: totalOrders,
        byStatus: orderStatusBreakdown,
      },
      revenue: {
        totalCommission: completedOrdersRevenue._sum.commissionAmount || 0,
      },
      activeDisputes,
      monthlyRevenueTrend: monthlyRevenue,
      topCategories,
      recentActivity: recentLogs,
    };

    return NextResponse.json({ stats }, { status: 200 });
  } catch (error) {
    console.error('[ADMIN STATS GET ERROR]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
