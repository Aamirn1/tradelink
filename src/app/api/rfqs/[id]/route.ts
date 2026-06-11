import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sanitizeUser } from '@/lib/auth';

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/rfqs/[id]
 * Get a single RFQ with quotes and retailer info.
 */
export async function GET(
  _request: NextRequest,
  { params }: RouteContext,
) {
  try {
    const { id } = await params;

    const rfq = await db.rFQ.findUnique({
      where: { id },
      include: {
        retailer: {
          select: {
            id: true,
            name: true,
            businessName: true,
            city: true,
            address: true,
            isVerified: true,
            avatar: true,
          },
        },
        quotes: {
          orderBy: { createdAt: 'desc' },
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
        },
      },
    });

    if (!rfq) {
      return NextResponse.json({ error: 'RFQ not found' }, { status: 404 });
    }

    return NextResponse.json({
      rfq: {
        ...rfq,
        retailer: rfq.retailer ? sanitizeUser(rfq.retailer as Record<string, unknown>) : null,
        quotes: rfq.quotes.map((q) => ({
          ...q,
          wholesaler: q.wholesaler ? sanitizeUser(q.wholesaler as Record<string, unknown>) : null,
        })),
      },
    });
  } catch (error) {
    console.error('[RFQ_GET_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to fetch RFQ' },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/rfqs/[id]
 * Update an RFQ (only by the owning retailer).
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

    // ── Verify RFQ exists ──
    const rfq = await db.rFQ.findUnique({ where: { id } });
    if (!rfq) {
      return NextResponse.json({ error: 'RFQ not found' }, { status: 404 });
    }

    // ── Verify ownership ──
    if (rfq.retailerId !== userId) {
      return NextResponse.json(
        { error: 'You can only update your own RFQs' },
        { status: 403 },
      );
    }

    // ── Verify user is a retailer ──
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'RETAILER') {
      return NextResponse.json(
        { error: 'Only retailers can update RFQs' },
        { status: 403 },
      );
    }

    // ── Don't allow updates on closed/cancelled RFQs ──
    if (rfq.status === 'CLOSED' || rfq.status === 'CANCELLED') {
      return NextResponse.json(
        { error: `Cannot update an RFQ with status "${rfq.status}"` },
        { status: 400 },
      );
    }

    // ── Build update payload ──
    const data: Record<string, unknown> = {};
    if (updateData.title !== undefined) data.title = String(updateData.title).trim();
    if (updateData.description !== undefined) data.description = String(updateData.description).trim();
    if (updateData.category !== undefined) data.category = String(updateData.category).trim();
    if (updateData.quantity !== undefined) {
      if (typeof updateData.quantity !== 'number' || updateData.quantity < 1) {
        return NextResponse.json({ error: 'Quantity must be at least 1' }, { status: 400 });
      }
      data.quantity = updateData.quantity;
    }
    if (updateData.unit !== undefined) data.unit = String(updateData.unit).trim();
    if (updateData.budget !== undefined) {
      if (updateData.budget !== null && (typeof updateData.budget !== 'number' || updateData.budget < 0)) {
        return NextResponse.json({ error: 'Budget must be a non-negative number or null' }, { status: 400 });
      }
      data.budget = updateData.budget;
    }
    if (updateData.deadline !== undefined) {
      if (updateData.deadline === null) {
        data.deadline = null;
      } else {
        const deadlineDate = new Date(updateData.deadline);
        if (isNaN(deadlineDate.getTime())) {
          return NextResponse.json({ error: 'Invalid deadline date' }, { status: 400 });
        }
        data.deadline = deadlineDate;
      }
    }
    if (updateData.status !== undefined) {
      const validStatuses = ['OPEN', 'QUOTED', 'CLOSED', 'CANCELLED'];
      if (!validStatuses.includes(updateData.status)) {
        return NextResponse.json(
          { error: `Status must be one of: ${validStatuses.join(', ')}` },
          { status: 400 },
        );
      }
      data.status = updateData.status;
    }

    const updated = await db.rFQ.update({
      where: { id },
      data,
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

    return NextResponse.json({
      rfq: {
        ...updated,
        retailer: updated.retailer ? sanitizeUser(updated.retailer as Record<string, unknown>) : null,
        quoteCount: updated._count.quotes,
      },
      message: 'RFQ updated successfully',
    });
  } catch (error) {
    console.error('[RFQ_PUT_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to update RFQ' },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/rfqs/[id]
 * Cancel an RFQ (set status to CANCELLED).
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

    // ── Verify RFQ exists ──
    const rfq = await db.rFQ.findUnique({ where: { id } });
    if (!rfq) {
      return NextResponse.json({ error: 'RFQ not found' }, { status: 404 });
    }

    // ── Verify ownership ──
    if (rfq.retailerId !== userId) {
      return NextResponse.json(
        { error: 'You can only cancel your own RFQs' },
        { status: 403 },
      );
    }

    // ── Verify user is a retailer ──
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'RETAILER') {
      return NextResponse.json(
        { error: 'Only retailers can cancel RFQs' },
        { status: 403 },
      );
    }

    // ── Already cancelled? ──
    if (rfq.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'RFQ is already cancelled' },
        { status: 400 },
      );
    }

    // ── Set status to CANCELLED ──
    await db.rFQ.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    return NextResponse.json({ message: 'RFQ cancelled successfully' });
  } catch (error) {
    console.error('[RFQ_DELETE_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to cancel RFQ' },
      { status: 500 },
    );
  }
}
