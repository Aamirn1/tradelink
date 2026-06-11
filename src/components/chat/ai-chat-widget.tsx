'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore } from '@/store/app-store';
import { cn } from '@/lib/utils';

// ── Types ──────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isError?: boolean;
}

// ── Quick actions ──────────────────────────────────────────────

const QUICK_ACTIONS = [
  'How does escrow work?',
  'How to post an RFQ?',
  'Pricing & fees',
  'Contact support',
] as const;

// ── UUID generator ─────────────────────────────────────────────

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

// ── Component ──────────────────────────────────────────────────

export function AIChatWidget() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [showQuickActions, setShowQuickActions] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { user, isAuthenticated, aiChatOpen, setAiChatOpen } = useAppStore();

  // Generate sessionId on mount
  useEffect(() => {
    setSessionId(generateId());
  }, []);

  // Add welcome message when chat opens for the first time
  useEffect(() => {
    if (aiChatOpen && messages.length === 0) {
      const welcomeMsg: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: "Hi! 👋 I'm your Bulk Stock Trade assistant. How can I help you today?",
        timestamp: new Date(),
      };
      setMessages([welcomeMsg]);
    }
  }, [aiChatOpen, messages.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input when chat opens
  useEffect(() => {
    if (aiChatOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [aiChatOpen]);

  // ── Send message to API ────────────────────────────────────
  const sendMessage = useCallback(
    async (messageText: string) => {
      if (!messageText.trim() || isLoading) return;

      const sanitizedText = messageText.trim();
      setInput('');
      setShowQuickActions(false);
      setIsLoading(true);

      // Add user message
      const userMsg: ChatMessage = {
        id: generateId(),
        role: 'user',
        content: sanitizedText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);

      try {
        const userContext: { name?: string; role?: string } = {};
        if (isAuthenticated && user) {
          if (user.name) userContext.name = user.name;
          if (user.role) userContext.role = user.role;
        }

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: sanitizedText,
            sessionId,
            userContext: Object.keys(userContext).length > 0 ? userContext : undefined,
          }),
        });

        const data = await response.json();

        if (!response.ok && !data.response) {
          throw new Error(data.error || 'Failed to get response');
        }

        const botMsg: ChatMessage = {
          id: generateId(),
          role: 'assistant',
          content: data.response || "I'm sorry, I couldn't process your request.",
          timestamp: new Date(),
          isError: !response.ok,
        };
        setMessages((prev) => [...prev, botMsg]);
      } catch (error) {
        console.error('Chat error:', error);
        const errorMsg: ChatMessage = {
          id: generateId(),
          role: 'assistant',
          content:
            "I'm having trouble connecting right now. Please try again or contact our WhatsApp support at +923205719979.",
          timestamp: new Date(),
          isError: true,
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    },
    [isLoading, isAuthenticated, user, sessionId]
  );

  // ── Handle quick action click ──────────────────────────────
  const handleQuickAction = (action: string) => {
    if (action === 'Contact support') {
      const botMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content:
          'You can reach our live support team on WhatsApp at **+923205719979**. They are available to help with any issues that need immediate attention.',
        timestamp: new Date(),
      };
      setShowQuickActions(false);
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: 'user',
          content: action,
          timestamp: new Date(),
        },
        botMsg,
      ]);
      return;
    }
    sendMessage(action);
  };

  // ── Handle form submit ─────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  // ── Handle key down ────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // ── Retry last failed message ──────────────────────────────
  const handleRetry = () => {
    // Find the last user message
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      // Remove the last error message
      setMessages((prev) => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg?.isError) {
          return prev.slice(0, -1);
        }
        return prev;
      });
      sendMessage(lastUserMsg.content);
    }
  };

  // ── Format timestamp ───────────────────────────────────────
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <>
      {/* ── Chat Panel ─────────────────────────────────────── */}
      <AnimatePresence>
        {aiChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={cn(
              'fixed z-50 glass rounded-2xl overflow-hidden flex flex-col',
              'shadow-2xl shadow-neon-cyan/10',
              // Desktop: fixed panel
              'bottom-4 right-4 left-4 sm:left-auto sm:right-6 sm:bottom-6 w-auto sm:w-[380px] max-h-[520px]',
              // Mobile: full width at bottom
              'max-sm:bottom-0 max-sm:right-0 max-sm:left-0 max-sm:w-full max-sm:max-h-[70vh] max-sm:rounded-b-none max-sm:rounded-t-2xl'
            )}
          >
            {/* ── Header ─────────────────────────────────── */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 bg-surface/80">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg gradient-cyan-purple-strong flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-sm font-bold gradient-cyan-purple bg-clip-text text-transparent bg-gradient-to-r from-neon-cyan to-neon-purple">
                    Bulk Stock Trade Assistant
                  </h3>
                  <p className="text-[10px] text-muted-foreground">
                    AI-powered support
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-surface-hover"
                onClick={() => setAiChatOpen(false)}
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* ── Messages Area ──────────────────────────── */}
            <ScrollArea className="flex-1 max-h-[360px] max-sm:max-h-[45vh]">
              <div className="p-4 space-y-3">
                <AnimatePresence initial={false}>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        'flex gap-2',
                        msg.role === 'user' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      {/* Bot avatar */}
                      {msg.role === 'assistant' && (
                        <div className="shrink-0 h-7 w-7 rounded-lg gradient-cyan-purple flex items-center justify-center mt-0.5">
                          <span className="text-[9px] font-bold text-primary-foreground">
                            TL
                          </span>
                        </div>
                      )}

                      {/* Message bubble */}
                      <div
                        className={cn(
                          'max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                          msg.role === 'user'
                            ? 'gradient-cyan-purple-strong text-primary-foreground rounded-br-md'
                            : msg.isError
                              ? 'bg-red-500/10 border border-red-500/20 text-red-300 rounded-bl-md'
                              : 'bg-surface/80 border-l-2 border-neon-cyan/40 text-foreground rounded-bl-md'
                        )}
                      >
                        <p className="whitespace-pre-wrap break-words">
                          {msg.content}
                        </p>
                        <p
                          className={cn(
                            'text-[10px] mt-1.5',
                            msg.role === 'user'
                              ? 'text-primary-foreground/50'
                              : 'text-muted-foreground/50'
                          )}
                        >
                          {formatTime(msg.timestamp)}
                        </p>
                      </div>

                      {/* User avatar */}
                      {msg.role === 'user' && (
                        <div className="shrink-0 h-7 w-7 rounded-lg bg-surface flex items-center justify-center mt-0.5">
                          <User className="h-3.5 w-3.5 text-neon-purple" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* ── Typing indicator ──────────────────────── */}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-2 justify-start"
                  >
                    <div className="shrink-0 h-7 w-7 rounded-lg gradient-cyan-purple flex items-center justify-center mt-0.5">
                      <span className="text-[9px] font-bold text-primary-foreground">
                        TL
                      </span>
                    </div>
                    <div className="bg-surface/80 border-l-2 border-neon-cyan/40 rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-neon-cyan/60 animate-bounce [animation-delay:0ms]" />
                        <span className="h-2 w-2 rounded-full bg-neon-cyan/60 animate-bounce [animation-delay:150ms]" />
                        <span className="h-2 w-2 rounded-full bg-neon-cyan/60 animate-bounce [animation-delay:300ms]" />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── Retry button for errors ───────────────── */}
                {messages.length > 0 &&
                  messages[messages.length - 1].isError &&
                  !isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-center"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRetry}
                        className="text-xs border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10 hover:text-neon-cyan"
                      >
                        <Loader2 className="h-3 w-3 mr-1.5" />
                        Retry
                      </Button>
                    </motion.div>
                  )}

                {/* ── Quick Actions ─────────────────────────── */}
                {showQuickActions && messages.length <= 1 && !isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-wrap gap-2 pt-1"
                  >
                    {QUICK_ACTIONS.map((action) => (
                      <button
                        key={action}
                        onClick={() => handleQuickAction(action)}
                        className="text-xs px-3 py-1.5 rounded-full border border-neon-cyan/20 bg-neon-cyan/5 text-neon-cyan hover:bg-neon-cyan/15 hover:border-neon-cyan/40 transition-all duration-200 cursor-pointer"
                      >
                        {action}
                      </button>
                    ))}
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* ── Input Area ─────────────────────────────── */}
            <div className="px-4 py-3 border-t border-border/30 bg-surface/60">
              <form
                onSubmit={handleSubmit}
                className="flex items-center gap-2"
              >
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything..."
                  disabled={isLoading}
                  className="flex-1 h-9 text-sm bg-background border-border/50 focus:border-neon-cyan focus:ring-neon-cyan/20 placeholder:text-muted-foreground/50"
                />
                <Button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="h-9 w-9 p-0 glow-button gradient-cyan-purple-strong text-primary-foreground border-0 shrink-0"
                  size="icon"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
              <p className="text-[9px] text-muted-foreground/40 mt-1.5 text-center">
                AI may produce inaccurate info. WhatsApp: +923205719979
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
