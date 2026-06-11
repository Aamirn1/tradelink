import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sanitizeUser } from '@/lib/auth';

/**
 * GET /api/rfqs
 * List RFQs with optional filters.
 * Query params: status, category, search, page, limit
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

    // Build where clause
    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status.toUpperCase();
    }

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const [rfqs, total] = await Promise.all([
      db.rFQ.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          retailer: {
            select: {
              id: true,
              name: true,
              businessName: true,
              city: true,
              isVerified: true,
              avatar: true,
            },
          },
          _count: {
            select: { quotes: true },
          },
        },
      }),
      db.rFQ.count({ where }),
    ]);

    const parsed = rfqs.map((rfq) => ({
      ...rfq,
      retailer: rfq.retailer ? sanitizeUser(rfq.retailer as Record<string, unknown>) : null,
      quoteCount: rfq._count.quotes,
    }));

    return NextResponse.json({
      rfqs: parsed,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[RFQS_GET_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to fetch RFQs' },
      { status: 500 },
    );
  }
}

/**
 * POST /api/rfqs
 * Create a new RFQ (retailer only).
 * Body: { userId, title, description, category, quantity, unit?, deadline?, budget? }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      title,
      description,
      category,
      quantity,
      unit,
      deadline,
      budget,
    } = body;

    // ── Validate required fields ──
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    if (!description || typeof description !== 'string' || !description.trim()) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    }
    if (!category || typeof category !== 'string' || !category.trim()) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }
    if (quantity === undefined || quantity === null || typeof quantity !== 'number' || quantity < 1) {
      return NextResponse.json({ error: 'A valid quantity (at least 1) is required' }, { status: 400 });
    }

    // ── Verify user exists and is a retailer ──
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    if (user.role !== 'RETAILER') {
      return NextResponse.json(
        { error: 'Only retailers can create RFQs' },
        { status: 403 },
      );
    }
    if (user.isSuspended) {
      return NextResponse.json(
        { error: 'Your account has been suspended' },
        { status: 403 },
      );
    }

    // ── Validate budget if provided ──
    if (budget !== undefined && budget !== null && (typeof budget !== 'number' || budget < 0)) {
      return NextResponse.json({ error: 'Budget must be a non-negative number' }, { status: 400 });
    }

    // ── Validate deadline if provided ──
    let deadlineDate: Date | undefined;
    if (deadline) {
      deadlineDate = new Date(deadline);
      if (isNaN(deadlineDate.getTime())) {
        return NextResponse.json({ error: 'Invalid deadline date' }, { status: 400 });
      }
      if (deadlineDate <= new Date()) {
        return NextResponse.json({ error: 'Deadline must be in the future' }, { status: 400 });
      }
    }

    // ── Create RFQ ──
    const rfq = await db.rFQ.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        quantity,
        unit: unit || 'pieces',
        deadline: deadlineDate || null,
        budget: budget ?? null,
        status: 'OPEN',
        retailerId: userId,
      },
      include: {
        retailer: {
          select: {
            id: true,
            name: true,
            businessName: true,
            city: true,
            isVerified: true,
            avatar: true,
          },
        },
        _count: {
          select: { quotes: true },
        },
      },
    });

    return NextResponse.json(
      {
        rfq: {
          ...rfq,
          retailer: rfq.retailer ? sanitizeUser(rfq.retailer as Record<string, unknown>) : null,
          quoteCount: rfq._count.quotes,
        },
        message: 'RFQ created successfully',
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('[RFQS_POST_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to create RFQ' },
      { status: 500 },
    );
  }
}
