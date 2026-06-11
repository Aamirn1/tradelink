import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

// ── Global ZAI singleton (cached like Prisma client) ──────────
const globalForZAI = globalThis as unknown as { _zai: ZAI | undefined };

async function getZAI(): Promise<ZAI> {
  if (!globalForZAI._zai) {
    globalForZAI._zai = await ZAI.create();
  }
  return globalForZAI._zai;
}

// ── Conversation history store (in-memory) ────────────────────
interface ConversationMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const MAX_HISTORY = 20;
const conversationStore = new Map<string, ConversationMessage[]>();

function getSessionHistory(sessionId: string): ConversationMessage[] {
  if (!conversationStore.has(sessionId)) {
    conversationStore.set(sessionId, []);
  }
  return conversationStore.get(sessionId)!;
}

function addToHistory(sessionId: string, message: ConversationMessage): void {
  const history = getSessionHistory(sessionId);
  history.push(message);
  // Keep only the last MAX_HISTORY messages
  if (history.length > MAX_HISTORY) {
    conversationStore.set(sessionId, history.slice(-MAX_HISTORY));
  }
}

// ── Input sanitization ────────────────────────────────────────
function sanitizeInput(input: string): string {
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .slice(0, 2000); // Limit length
}

// ── System prompt ─────────────────────────────────────────────
const SYSTEM_PROMPT = `You are the Bulk Stock Trade AI Assistant, a helpful support bot for the B2B wholesale marketplace platform Bulk Stock Trade. 

Key information about Bulk Stock Trade:
- It's a B2B marketplace connecting wholesalers and retailers
- Wholesalers list products with pricing tiers and MOQ (minimum order quantity)
- Retailers post RFQs (Request for Quotes) to find suppliers
- Escrow payment system: funds are held until delivery is confirmed
- 3% commission on all transactions
- Contact information sharing is PROHIBITED - violations result in suspension (7 days first offense, permanent ban after)
- Payment options: Full upfront or Partial deposit (50% recommended for safety)
- Order flow: Pending → Processing → Shipped → Delivered → Completed
- For live support, users can contact WhatsApp: +923205719979

Help users with:
- How to register and set up their profile
- How to list products (wholesalers) or post RFQs (retailers)
- How the escrow payment system works
- Order status and tracking
- Platform rules and policies
- General marketplace questions

If the user seems frustrated or asks something you can't help with, suggest contacting WhatsApp support at +923205719979.
Keep responses concise and helpful. Use bullet points when listing steps.`;

// ── POST handler ──────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, sessionId, userContext } = body as {
      message: string;
      sessionId: string;
      userContext?: { name?: string; role?: string };
    };

    // Validate required fields
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string.' },
        { status: 400 }
      );
    }

    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json(
        { error: 'Session ID is required and must be a string.' },
        { status: 400 }
      );
    }

    // Sanitize input
    const sanitizedMessage = sanitizeInput(message);

    if (!sanitizedMessage) {
      return NextResponse.json(
        { error: 'Message cannot be empty after sanitization.' },
        { status: 400 }
      );
    }

    // Get or create ZAI instance
    const zai = await getZAI();

    // Build conversation messages
    const sessionHistory = getSessionHistory(sessionId);

    // Build the user message with context if available
    let userContent = sanitizedMessage;
    if (userContext?.name || userContext?.role) {
      const contextParts: string[] = [];
      if (userContext.name) contextParts.push(`Name: ${sanitizeInput(userContext.name)}`);
      if (userContext.role) contextParts.push(`Role: ${sanitizeInput(userContext.role)}`);
      if (contextParts.length > 0 && sessionHistory.length === 0) {
        userContent = `[User context: ${contextParts.join(', ')}] ${sanitizedMessage}`;
      }
    }

    // Add user message to history
    addToHistory(sessionId, { role: 'user', content: userContent });

    // Build messages array for API
    const messages: ConversationMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...sessionHistory,
    ];

    // Call AI API
    const completion = await zai.chat.completions.create({
      messages,
      thinking: { type: 'disabled' },
    });

    const assistantMessage =
      completion.choices?.[0]?.message?.content ||
      "I'm sorry, I couldn't process your request. Please try again or contact our WhatsApp support at +923205719979.";

    // Add assistant response to history
    addToHistory(sessionId, { role: 'assistant', content: assistantMessage });

    return NextResponse.json({
      response: assistantMessage,
      sessionId,
    });
  } catch (error: unknown) {
    console.error('[Chat API] Error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred.';

    return NextResponse.json(
      {
        response:
          "I'm having trouble connecting right now. Please try again in a moment, or reach out to our WhatsApp support at +923205719979 for immediate assistance.",
        sessionId: (await request.json().catch(() => ({}))).sessionId || '',
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
