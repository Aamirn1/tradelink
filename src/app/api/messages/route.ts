import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sanitizeUser } from '@/lib/auth';

// ── Contact info detection patterns ──
const PHONE_REGEX_1 = /\+?\d[\d\s\-]{7,}\d/;
const PHONE_REGEX_2 = /\(\d{3}\)\s?\d{3}[\s\-]\d{4}/;
const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/;

function containsContactInfo(content: string): boolean {
  return (
    PHONE_REGEX_1.test(content) ||
    PHONE_REGEX_2.test(content) ||
    EMAIL_REGEX.test(content)
  );
}

// ──────────────────────────────────────────────
// GET /api/messages — List chat rooms for a user
// ──────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

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

    // ── Find all chat rooms the user participates in ──
    const chatRooms = await db.chatRoom.findMany({
      where: {
        isActive: true,
        participants: {
          some: { userId },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                businessName: true,
                role: true,
                avatar: true,
                isVerified: true,
                city: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // ── Enrich each room with unread count and other participant info ──
    const enrichedRooms = await Promise.all(
      chatRooms.map(async (room) => {
        // Get the participant entry for the current user to determine lastReadAt
        const myParticipant = room.participants.find(
          (p) => p.userId === userId,
        );

        // Count unread messages (messages not from self, and created after lastReadAt)
        const unreadWhere: Record<string, unknown> = {
          chatRoomId: room.id,
          senderId: { not: userId },
          isRead: false,
        };

        if (myParticipant?.lastReadAt) {
          unreadWhere.createdAt = { gt: myParticipant.lastReadAt };
        }

        const unreadCount = await db.message.count({
          where: unreadWhere,
        });

        // Get the other participant's info
        const otherParticipant = room.participants.find(
          (p) => p.userId !== userId,
        );

        const otherUser = otherParticipant
          ? sanitizeUser(otherParticipant.user)
          : null;

        // Get last message
        const lastMessage = room.messages.length > 0 ? room.messages[0] : null;

        return {
          id: room.id,
          orderId: room.orderId,
          isActive: room.isActive,
          createdAt: room.createdAt,
          updatedAt: room.updatedAt,
          lastMessage,
          unreadCount,
          otherUser,
        };
      }),
    );

    return NextResponse.json({ chatRooms: enrichedRooms }, { status: 200 });
  } catch (error) {
    console.error('[MESSAGES GET ERROR]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// ──────────────────────────────────────────────
// POST /api/messages — Send a message (and optionally create a chat room)
// ──────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      chatRoomId,
      senderId,
      receiverId,
      content,
      participantIds,
      orderId,
    } = body as {
      chatRoomId?: string;
      senderId: string;
      receiverId: string;
      content: string;
      participantIds?: string[];
      orderId?: string;
    };

    // ── Validate required fields ──
    if (!senderId || !receiverId || !content) {
      return NextResponse.json(
        { error: 'senderId, receiverId, and content are required' },
        { status: 400 },
      );
    }

    // Verify sender exists
    const sender = await db.user.findUnique({ where: { id: senderId } });
    if (!sender) {
      return NextResponse.json(
        { error: 'Sender not found' },
        { status: 404 },
      );
    }

    // Verify receiver exists
    const receiver = await db.user.findUnique({
      where: { id: receiverId },
    });
    if (!receiver) {
      return NextResponse.json(
        { error: 'Receiver not found' },
        { status: 404 },
      );
    }

    // ── Scan content for contact info ──
    const isFlagged = containsContactInfo(content);
    const flagReason = isFlagged
      ? 'Contact information detected'
      : null;

    // ── If flagged, increment suspension count and potentially suspend ──
    if (isFlagged) {
      const updatedCount = sender.suspensionCount + 1;
      const shouldSuspend = updatedCount >= 2;

      await db.user.update({
        where: { id: senderId },
        data: {
          suspensionCount: updatedCount,
          ...(shouldSuspend ? { isSuspended: true } : {}),
        },
      });
    }

    // ── Find or create chat room ──
    let resolvedChatRoomId = chatRoomId;

    if (!resolvedChatRoomId) {
      // Try to find an existing room with these two participants
      const existingRooms = await db.chatRoom.findMany({
        where: {
          isActive: true,
          participants: {
            every: {
              userId: { in: [senderId, receiverId] },
            },
          },
        },
        include: {
          participants: true,
        },
      });

      // Find a room that has exactly these 2 participants (no more, no less)
      const exactRoom = existingRooms.find(
        (room) => room.participants.length === 2,
      );

      if (exactRoom) {
        resolvedChatRoomId = exactRoom.id;
      } else {
        // Create a new chat room
        const pIds = participantIds && participantIds.length >= 2
          ? participantIds
          : [senderId, receiverId];

        const newRoom = await db.chatRoom.create({
          data: {
            orderId: orderId || null,
            isActive: true,
            participants: {
              create: pIds.map((pId: string) => ({
                userId: pId,
              })),
            },
          },
        });

        resolvedChatRoomId = newRoom.id;
      }
    } else {
      // Verify the chat room exists
      const existingRoom = await db.chatRoom.findUnique({
        where: { id: resolvedChatRoomId },
      });
      if (!existingRoom) {
        return NextResponse.json(
          { error: 'Chat room not found' },
          { status: 404 },
        );
      }
    }

    // ── Create the message ──
    const message = await db.message.create({
      data: {
        content,
        chatRoomId: resolvedChatRoomId,
        senderId,
        receiverId,
        isFlagged,
        flagReason,
        isRead: false,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
          },
        },
      },
    });

    // ── Update chat room's updatedAt timestamp ──
    await db.chatRoom.update({
      where: { id: resolvedChatRoomId },
      data: { updatedAt: new Date() },
    });

    // ── Create a notification for the receiver ──
    await db.notification.create({
      data: {
        userId: receiverId,
        title: 'New Message',
        message: `${sender.name} sent you a message`,
        type: 'MESSAGE',
        isRead: false,
      },
    });

    // ── Build response ──
    const response: Record<string, unknown> = {
      message,
      chatRoomId: resolvedChatRoomId,
    };

    if (isFlagged) {
      response.warning =
        'Your message was flagged for containing contact information. Repeated violations will result in account suspension.';
      response.isFlagged = true;
      response.flagReason = flagReason;

      // Check if sender is now suspended
      const updatedSender = await db.user.findUnique({
        where: { id: senderId },
      });
      if (updatedSender?.isSuspended) {
        response.suspensionWarning =
          'Your account has been suspended due to repeated contact information sharing violations.';
      }
    }

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('[MESSAGES POST ERROR]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
