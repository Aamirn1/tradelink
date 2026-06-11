import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ──────────────────────────────────────────────
// GET /api/messages/[chatRoomId] — Get messages for a chat room with pagination
// ──────────────────────────────────────────────
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chatRoomId: string }> },
) {
  try {
    const { chatRoomId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '30', 10);

    // ── Validate required params ──
    if (!chatRoomId) {
      return NextResponse.json(
        { error: 'chatRoomId is required' },
        { status: 400 },
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'userId query parameter is required' },
        { status: 400 },
      );
    }

    // ── Verify the chat room exists ──
    const chatRoom = await db.chatRoom.findUnique({
      where: { id: chatRoomId },
      include: {
        participants: true,
      },
    });

    if (!chatRoom) {
      return NextResponse.json(
        { error: 'Chat room not found' },
        { status: 404 },
      );
    }

    // ── Verify user is a participant ──
    const isParticipant = chatRoom.participants.some(
      (p) => p.userId === userId,
    );
    if (!isParticipant) {
      return NextResponse.json(
        { error: 'You are not a participant in this chat room' },
        { status: 403 },
      );
    }

    // ── Pagination ──
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      db.message.findMany({
        where: { chatRoomId },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatar: true,
              role: true,
              isVerified: true,
            },
          },
          receiver: {
            select: {
              id: true,
              name: true,
              avatar: true,
              role: true,
              isVerified: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.message.count({ where: { chatRoomId } }),
    ]);

    // ── Mark messages as read for the requesting user ──
    // Mark all unread messages where the user is the receiver
    await db.message.updateMany({
      where: {
        chatRoomId,
        receiverId: userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    // ── Update lastReadAt for the participant ──
    await db.chatParticipant.updateMany({
      where: {
        chatRoomId,
        userId,
      },
      data: { lastReadAt: new Date() },
    });

    // Return messages in chronological order (oldest first for display)
    const sortedMessages = [...messages].reverse();

    return NextResponse.json({
      messages: sortedMessages,
      chatRoom: {
        id: chatRoom.id,
        orderId: chatRoom.orderId,
        isActive: chatRoom.isActive,
        createdAt: chatRoom.createdAt,
        updatedAt: chatRoom.updatedAt,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }, { status: 200 });
  } catch (error) {
    console.error('[MESSAGES CHATROOM GET ERROR]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
