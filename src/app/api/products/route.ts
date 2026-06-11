import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sanitizeUser } from '@/lib/auth';

/**
 * GET /api/products
 * List all active products with optional filters.
 * Query params: category, search, sort, page, limit
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'newest';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

    // Build where clause — only active products
    const where: Record<string, unknown> = { isActive: true };

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    // Determine ordering
    const orderBy: Record<string, string> =
      sort === 'price_asc'
        ? { price: 'asc' }
        : sort === 'price_desc'
          ? { price: 'desc' }
          : sort === 'name'
            ? { name: 'asc' }
            : { createdAt: 'desc' }; // newest by default

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          wholesaler: {
            select: {
              id: true,
              name: true,
              businessName: true,
              city: true,
              isVerified: true,
              avatar: true,
            },
          },
        },
      }),
      db.product.count({ where }),
    ]);

    // Parse JSON string fields for each product
    const parsed = products.map((p) => ({
      ...p,
      images: JSON.parse(p.images || '[]'),
      priceTiers: JSON.parse(p.priceTiers || '{}'),
      wholesaler: p.wholesaler ? sanitizeUser(p.wholesaler as Record<string, unknown>) : null,
    }));

    return NextResponse.json({
      products: parsed,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[PRODUCTS_GET_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 },
    );
  }
}

/**
 * POST /api/products
 * Create a new product (wholesaler only).
 * Body: { userId, name, description, category, price, priceTiers?, moq?, stock?, images? }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      name,
      description,
      category,
      price,
      priceTiers,
      moq,
      stock,
      images,
    } = body;

    // ── Validate required fields ──
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
    }
    if (!description || typeof description !== 'string' || !description.trim()) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    }
    if (!category || typeof category !== 'string' || !category.trim()) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }
    if (price === undefined || price === null || typeof price !== 'number' || price < 0) {
      return NextResponse.json({ error: 'A valid price is required' }, { status: 400 });
    }

    // ── Verify user exists and is a wholesaler ──
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    if (user.role !== 'WHOLESALER') {
      return NextResponse.json(
        { error: 'Only wholesalers can create products' },
        { status: 403 },
      );
    }
    if (user.isSuspended) {
      return NextResponse.json(
        { error: 'Your account has been suspended' },
        { status: 403 },
      );
    }

    // ── Create product ──
    const product = await db.product.create({
      data: {
        name: name.trim(),
        description: description.trim(),
        category: category.trim(),
        price,
        priceTiers: JSON.stringify(priceTiers || {}),
        moq: moq ?? 1,
        stock: stock ?? 0,
        images: JSON.stringify(images || []),
        wholesalerId: userId,
      },
      include: {
        wholesaler: {
          select: {
            id: true,
            name: true,
            businessName: true,
            city: true,
            isVerified: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        product: {
          ...product,
          images: JSON.parse(product.images || '[]'),
          priceTiers: JSON.parse(product.priceTiers || '{}'),
        },
        message: 'Product created successfully',
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('[PRODUCTS_POST_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 },
    );
  }
}
