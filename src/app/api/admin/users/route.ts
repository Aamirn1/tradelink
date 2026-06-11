import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sanitizeUser } from '@/lib/auth';

// ──────────────────────────────────────────────
// GET /api/admin/users — List all users with pagination, search, role filter
// ──────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get('adminId');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || ''; // WHOLESALER | RETAILER | ADMIN

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

    // ── Build where clause ──
    const whereClause: Record<string, unknown> = {};

    if (role) {
      const validRoles = ['WHOLESALER', 'RETAILER', 'ADMIN'];
      if (!validRoles.includes(role.toUpperCase())) {
        return NextResponse.json(
          { error: `Invalid role filter. Valid values: ${validRoles.join(', ')}` },
          { status: 400 },
        );
      }
      whereClause.role = role.toUpperCase();
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { businessName: { contains: search } },
        { city: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    // ── Pagination ──
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      db.user.findMany({
        where: whereClause,
        select: {
          id: true,
          email: true,
          phone: true,
          name: true,
          role: true,
          businessName: true,
          businessType: true,
          category: true,
          city: true,
          address: true,
          avatar: true,
          isVerified: true,
          isSuspended: true,
          suspensionCount: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.user.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }, { status: 200 });
  } catch (error) {
    console.error('[ADMIN USERS GET ERROR]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// ──────────────────────────────────────────────
// POST /api/admin/users — Admin action: suspend/unsuspend/ban/verify user
// ──────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action, adminId } = body as {
      userId: string;
      action: 'SUSPEND' | 'UNSUSPEND' | 'BAN' | 'VERIFY';
      adminId: string;
    };

    // ── Validate required fields ──
    if (!userId || !action || !adminId) {
      return NextResponse.json(
        { error: 'userId, action, and adminId are required' },
        { status: 400 },
      );
    }

    const validActions = ['SUSPEND', 'UNSUSPEND', 'BAN', 'VERIFY'];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: `Invalid action. Valid values: ${validActions.join(', ')}` },
        { status: 400 },
      );
    }

    // ── Verify admin ──
    const admin = await db.user.findUnique({ where: { id: adminId } });
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized: admin access required' },
        { status: 403 },
      );
    }

    // ── Verify target user exists ──
    const targetUser = await db.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      return NextResponse.json(
        { error: 'Target user not found' },
        { status: 404 },
      );
    }

    // ── Perform action ──
    let updateData: Record<string, unknown> = {};
    let logDetails = '';

    switch (action) {
      case 'SUSPEND':
        updateData = {
          isSuspended: true,
          suspensionCount: { increment: 1 },
        };
        logDetails = `User "${targetUser.name}" (${targetUser.email}) suspended by admin`;
        break;

      case 'UNSUSPEND':
        updateData = {
          isSuspended: false,
        };
        logDetails = `User "${targetUser.name}" (${targetUser.email}) unsuspended by admin`;
        break;

      case 'BAN':
        // Ban = permanent suspension with high suspension count
        updateData = {
          isSuspended: true,
          suspensionCount: 999,
        };
        logDetails = `User "${targetUser.name}" (${targetUser.email}) banned by admin`;
        break;

      case 'VERIFY':
        updateData = {
          isVerified: true,
        };
        logDetails = `User "${targetUser.name}" (${targetUser.email}) verified by admin`;
        break;
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: updateData,
    });

    // ── Create AdminLog entry ──
    await db.adminLog.create({
      data: {
        action,
        details: logDetails,
        adminId,
        targetId: userId,
      },
    });

    return NextResponse.json({
      user: sanitizeUser(updatedUser),
      message: `User ${action.toLowerCase()} successfully`,
    }, { status: 200 });
  } catch (error) {
    console.error('[ADMIN USERS POST ERROR]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
