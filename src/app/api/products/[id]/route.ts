import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sanitizeUser } from '@/lib/auth';

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/products/[id]
 * Get a single product by ID with wholesaler info.
 */
export async function GET(
  _request: NextRequest,
  { params }: RouteContext,
) {
  try {
    const { id } = await params;

    const product = await db.product.findUnique({
      where: { id },
      include: {
        wholesaler: {
          select: {
            id: true,
            name: true,
            businessName: true,
            businessType: true,
            city: true,
            address: true,
            isVerified: true,
            avatar: true,
            category: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({
      product: {
        ...product,
        images: JSON.parse(product.images || '[]'),
        priceTiers: JSON.parse(product.priceTiers || '{}'),
        wholesaler: product.wholesaler
          ? sanitizeUser(product.wholesaler as Record<string, unknown>)
          : null,
      },
    });
  } catch (error) {
    console.error('[PRODUCT_GET_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/products/[id]
 * Update a product (only by the owning wholesaler).
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteContext,
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { userId, ...updateData } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // ── Verify product exists ──
    const product = await db.product.findUnique({ where: { id } });
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // ── Verify ownership ──
    if (product.wholesalerId !== userId) {
      return NextResponse.json(
        { error: 'You can only update your own products' },
        { status: 403 },
      );
    }

    // ── Verify user is a wholesaler ──
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'WHOLESALER') {
      return NextResponse.json(
        { error: 'Only wholesalers can update products' },
        { status: 403 },
      );
    }

    // ── Build update payload ──
    const data: Record<string, unknown> = {};
    if (updateData.name !== undefined) data.name = String(updateData.name).trim();
    if (updateData.description !== undefined) data.description = String(updateData.description).trim();
    if (updateData.category !== undefined) data.category = String(updateData.category).trim();
    if (updateData.price !== undefined) {
      if (typeof updateData.price !== 'number' || updateData.price < 0) {
        return NextResponse.json({ error: 'Price must be a non-negative number' }, { status: 400 });
      }
      data.price = updateData.price;
    }
    if (updateData.priceTiers !== undefined) data.priceTiers = JSON.stringify(updateData.priceTiers);
    if (updateData.moq !== undefined) {
      if (typeof updateData.moq !== 'number' || updateData.moq < 1) {
        return NextResponse.json({ error: 'MOQ must be at least 1' }, { status: 400 });
      }
      data.moq = updateData.moq;
    }
    if (updateData.stock !== undefined) {
      if (typeof updateData.stock !== 'number' || updateData.stock < 0) {
        return NextResponse.json({ error: 'Stock must be a non-negative number' }, { status: 400 });
      }
      data.stock = updateData.stock;
    }
    if (updateData.images !== undefined) data.images = JSON.stringify(updateData.images);
    if (updateData.isActive !== undefined) data.isActive = Boolean(updateData.isActive);

    const updated = await db.product.update({
      where: { id },
      data,
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

    return NextResponse.json({
      product: {
        ...updated,
        images: JSON.parse(updated.images || '[]'),
        priceTiers: JSON.parse(updated.priceTiers || '{}'),
      },
      message: 'Product updated successfully',
    });
  } catch (error) {
    console.error('[PRODUCT_PUT_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/products/[id]
 * Soft delete a product (set isActive to false).
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteContext,
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // ── Verify product exists ──
    const product = await db.product.findUnique({ where: { id } });
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // ── Verify ownership ──
    if (product.wholesalerId !== userId) {
      return NextResponse.json(
        { error: 'You can only delete your own products' },
        { status: 403 },
      );
    }

    // ── Verify user is a wholesaler ──
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'WHOLESALER') {
      return NextResponse.json(
        { error: 'Only wholesalers can delete products' },
        { status: 403 },
      );
    }

    // ── Soft delete ──
    await db.product.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('[PRODUCT_DELETE_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 },
    );
  }
}
