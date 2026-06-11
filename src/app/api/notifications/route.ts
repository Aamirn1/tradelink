import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ──────────────────────────────────────────────
// GET /api/notifications — List notifications for a user
// ──────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type'); // ORDER | PAYMENT | MESSAGE | SYSTEM
    const isRead = searchParams.get('isRead'); // "true" | "false"
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

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

    // ── Build where clause ──
    const whereClause: Record<string, unknown> = { userId };

    if (type) {
      const validTypes = ['ORDER', 'PAYMENT', 'MESSAGE', 'SYSTEM'];
      if (!validTypes.includes(type.toUpperCase())) {
        return NextResponse.json(
          { error: `Invalid type filter. Valid values: ${validTypes.join(', ')}` },
          { status: 400 },
        );
      }
      whereClause.type = type.toUpperCase();
    }

    if (isRead !== null && isRead !== undefined && isRead !== '') {
      whereClause.isRead = isRead === 'true';
    }

    // ── Get notifications and unread count in parallel ──
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      db.notification.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.notification.count({ where: whereClause }),
      db.notification.count({
        where: { userId, isRead: false },
      }),
    ]);

    return NextResponse.json({
      notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }, { status: 200 });
  } catch (error) {
    console.error('[NOTIFICATIONS GET ERROR]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// ──────────────────────────────────────────────
// POST /api/notifications — Create a notification
// ──────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, title, message, type } = body as {
      userId: string;
      title: string;
      message: string;
      type?: string;
    };

    // ── Validate required fields ──
    if (!userId || !title || !message) {
      return NextResponse.json(
        { error: 'userId, title, and message are required' },
        { status: 400 },
      );
    }

    // Validate type if provided
    if (type) {
      const validTypes = ['ORDER', 'PAYMENT', 'MESSAGE', 'SYSTEM'];
      if (!validTypes.includes(type.toUpperCase())) {
        return NextResponse.json(
          { error: `Invalid type. Valid values: ${validTypes.join(', ')}` },
          { status: 400 },
        );
      }
    }

    // Verify user exists
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const notification = await db.notification.create({
      data: {
        userId,
        title,
        message,
        type: type?.toUpperCase() || 'SYSTEM',
        isRead: false,
      },
    });

    return NextResponse.json(
      { notification, message: 'Notification created successfully' },
      { status: 201 },
    );
  } catch (error) {
    console.error('[NOTIFICATIONS POST ERROR]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// ──────────────────────────────────────────────
// PUT /api/notifications — Mark notifications as read
// ──────────────────────────────────────────────
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, notificationIds } = body as {
      userId: string;
      notificationIds: string[] | 'all';
    };

    // ── Validate required fields ──
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 },
      );
    }

    if (!notificationIds) {
      return NextResponse.json(
        { error: 'notificationIds (array of IDs or "all") is required' },
        { status: 400 },
      );
    }

    // Verify user exists
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let updatedCount: number;

    if (notificationIds === 'all') {
      // Mark all notifications as read for this user
      const result = await db.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });
      updatedCount = result.count;
    } else {
      // Mark specific notifications as read
      if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
        return NextResponse.json(
          { error: 'notificationIds must be a non-empty array or "all"' },
          { status: 400 },
        );
      }
      const result = await db.notification.updateMany({
        where: {
          userId,
          id: { in: notificationIds },
        },
        data: { isRead: true },
      });
      updatedCount = result.count;
    }

    return NextResponse.json({
      message: `${updatedCount} notification(s) marked as read`,
      updatedCount,
    }, { status: 200 });
  } catch (error) {
    console.error('[NOTIFICATIONS PUT ERROR]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
