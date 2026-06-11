import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sanitizeUser } from '@/lib/auth';

/**
 * POST /api/quotes
 * Submit a quote on an RFQ (wholesaler only).
 * Updates RFQ status to QUOTED if it's the first quote.
 * Body: { userId, rfqId, price, quantity, description, deliveryTime }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      rfqId,
      price,
      quantity,
      description,
      deliveryTime,
    } = body;

    // ── Validate required fields ──
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    if (!rfqId) {
      return NextResponse.json({ error: 'RFQ ID is required' }, { status: 400 });
    }
    if (price === undefined || price === null || typeof price !== 'number' || price <= 0) {
      return NextResponse.json({ error: 'A valid price greater than 0 is required' }, { status: 400 });
    }
    if (quantity === undefined || quantity === null || typeof quantity !== 'number' || quantity < 1) {
      return NextResponse.json({ error: 'A valid quantity (at least 1) is required' }, { status: 400 });
    }
    if (!description || typeof description !== 'string' || !description.trim()) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    }
    if (!deliveryTime || typeof deliveryTime !== 'string' || !deliveryTime.trim()) {
      return NextResponse.json({ error: 'Delivery time is required' }, { status: 400 });
    }

    // ── Verify user exists and is a wholesaler ──
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    if (user.role !== 'WHOLESALER') {
      return NextResponse.json(
        { error: 'Only wholesalers can submit quotes' },
        { status: 403 },
      );
    }
    if (user.isSuspended) {
      return NextResponse.json(
        { error: 'Your account has been suspended' },
        { status: 403 },
      );
    }

    // ── Verify RFQ exists and is open ──
    const rfq = await db.rFQ.findUnique({
      where: { id: rfqId },
      include: { _count: { select: { quotes: true } } },
    });

    if (!rfq) {
      return NextResponse.json({ error: 'RFQ not found' }, { status: 404 });
    }
    if (rfq.status === 'CLOSED' || rfq.status === 'CANCELLED') {
      return NextResponse.json(
        { error: `Cannot quote on an RFQ with status "${rfq.status}"` },
        { status: 400 },
      );
    }

    // ── Check if wholesaler already quoted on this RFQ ──
    const existingQuote = await db.quote.findFirst({
      where: { rfqId, wholesalerId: userId },
    });
    if (existingQuote) {
      return NextResponse.json(
        { error: 'You have already submitted a quote for this RFQ' },
        { status: 409 },
      );
    }

    // ── Create quote ──
    const quote = await db.quote.create({
      data: {
        price,
        quantity,
        description: description.trim(),
        deliveryTime: deliveryTime.trim(),
        status: 'PENDING',
        rfqId,
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
        rfq: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });

    // ── Update RFQ status to QUOTED if it's the first quote ──
    if (rfq.status === 'OPEN') {
      await db.rFQ.update({
        where: { id: rfqId },
        data: { status: 'QUOTED' },
      });
    }

    return NextResponse.json(
      {
        quote: {
          ...quote,
          wholesaler: quote.wholesaler ? sanitizeUser(quote.wholesaler as Record<string, unknown>) : null,
        },
        message: 'Quote submitted successfully',
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('[QUOTES_POST_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to submit quote' },
      { status: 500 },
    );
  }
}
