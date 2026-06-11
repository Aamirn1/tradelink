import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sanitizeUser } from '@/lib/auth';

type RouteContext = { params: Promise<{ id: string }> };

/**
 * PUT /api/quotes/[id]
 * Accept or reject a quote (retailer only, owns the RFQ).
 * Body: { userId, action: "accept" | "reject" }
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteContext,
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { userId, action } = body;

    // ── Validate required fields ──
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    if (!action || !['accept', 'reject'].includes(action.toLowerCase())) {
      return NextResponse.json(
        { error: 'Action must be "accept" or "reject"' },
        { status: 400 },
      );
    }

    // ── Verify user exists and is a retailer ──
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    if (user.role !== 'RETAILER') {
      return NextResponse.json(
        { error: 'Only retailers can accept or reject quotes' },
        { status: 403 },
      );
    }

    // ── Verify quote exists ──
    const quote = await db.quote.findUnique({
      where: { id },
      include: {
        rfq: {
          select: {
            id: true,
            title: true,
            status: true,
            retailerId: true,
          },
        },
      },
    });

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    // ── Verify the retailer owns the RFQ ──
    if (quote.rfq.retailerId !== userId) {
      return NextResponse.json(
        { error: 'You can only respond to quotes on your own RFQs' },
        { status: 403 },
      );
    }

    // ── Verify the quote is still pending ──
    if (quote.status !== 'PENDING') {
      return NextResponse.json(
        { error: `Quote has already been ${quote.status.toLowerCase()}` },
        { status: 400 },
      );
    }

    // ── Verify the RFQ is not closed or cancelled ──
    if (quote.rfq.status === 'CLOSED' || quote.rfq.status === 'CANCELLED') {
      return NextResponse.json(
        { error: `Cannot respond to quotes on an RFQ with status "${quote.rfq.status}"` },
        { status: 400 },
      );
    }

    const normalizedAction = action.toLowerCase();

    if (normalizedAction === 'accept') {
      // ── Accept the quote ──
      const updatedQuote = await db.quote.update({
        where: { id },
        data: { status: 'ACCEPTED' },
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

      // ── Reject all other pending quotes on the same RFQ ──
      await db.quote.updateMany({
        where: {
          rfqId: quote.rfqId,
          id: { not: id },
          status: 'PENDING',
        },
        data: { status: 'REJECTED' },
      });

      // ── Update RFQ status to CLOSED ──
      await db.rFQ.update({
        where: { id: quote.rfqId },
        data: { status: 'CLOSED' },
      });

      return NextResponse.json({
        quote: {
          ...updatedQuote,
          wholesaler: updatedQuote.wholesaler
            ? sanitizeUser(updatedQuote.wholesaler as Record<string, unknown>)
            : null,
        },
        message: 'Quote accepted successfully. Other pending quotes have been rejected and the RFQ is now closed.',
      });
    } else {
      // ── Reject the quote ──
      const updatedQuote = await db.quote.update({
        where: { id },
        data: { status: 'REJECTED' },
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

      return NextResponse.json({
        quote: {
          ...updatedQuote,
          wholesaler: updatedQuote.wholesaler
            ? sanitizeUser(updatedQuote.wholesaler as Record<string, unknown>)
            : null,
        },
        message: 'Quote rejected successfully.',
      });
    }
  } catch (error) {
    console.error('[QUOTE_PUT_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to update quote' },
      { status: 500 },
    );
  }
}
