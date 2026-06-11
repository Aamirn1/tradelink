'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  ArrowLeft,
  AlertTriangle,
  Shield,
  Phone,
  Mail,
  Search,
  MessageSquare,
} from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

// ── Types ──────────────────────────────────────────────────

interface ChatConversation {
  id: string;
  name: string;
  initials: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  orderId: string | null;
}

interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  timestamp: string;
  isFlagged: boolean;
  flagReason: string | null;
}

// ── Mock data ──────────────────────────────────────────────

const CURRENT_USER_ID = 'me';

const CONVERSATIONS: ChatConversation[] = [
  {
    id: 'conv-1',
    name: 'GlobalTech Wholesale',
    initials: 'GT',
    lastMessage: 'We can ship the earbuds by Friday.',
    time: '2m ago',
    unread: 2,
    online: true,
    orderId: 'TL-2025-0401',
  },
  {
    id: 'conv-2',
    name: 'TextileKing Ltd.',
    initials: 'TK',
    lastMessage: 'The fabric samples are on the way.',
    time: '1h ago',
    unread: 0,
    online: true,
    orderId: 'TL-2025-0402',
  },
  {
    id: 'conv-3',
    name: 'AutoParts Direct',
    initials: 'AP',
    lastMessage: 'Tracking updated: SF1234567890',
    time: '3h ago',
    unread: 1,
    online: false,
    orderId: 'TL-2025-0403',
  },
  {
    id: 'conv-4',
    name: 'FreshSource Co.',
    initials: 'FS',
    lastMessage: 'Thanks for confirming the order!',
    time: 'Yesterday',
    unread: 0,
    online: false,
    orderId: 'TL-2025-0405',
  },
  {
    id: 'conv-5',
    name: 'EcoGoods Inc.',
    initials: 'EG',
    lastMessage: 'Let me check the stock levels.',
    time: '2 days ago',
    unread: 0,
    online: true,
    orderId: null,
  },
];

const MESSAGES_BY_CONV: Record<string, ChatMessage[]> = {
  'conv-1': [
    { id: 'm1', content: 'Hi! I wanted to check on the bulk order for wireless earbuds.', senderId: 'me', timestamp: '2025-03-04T10:00:00Z', isFlagged: false, flagReason: null },
    { id: 'm2', content: 'Hello! Yes, we have 500 units ready to ship. Would you like to proceed?', senderId: 'conv-1', timestamp: '2025-03-04T10:05:00Z', isFlagged: false, flagReason: null },
    { id: 'm3', content: 'Can you call me on my personal number?', senderId: 'conv-1', timestamp: '2025-03-04T10:08:00Z', isFlagged: true, flagReason: 'Contact information sharing detected' },
    { id: 'm4', content: 'Yes, let\'s proceed with 500 units. What\'s the lead time?', senderId: 'me', timestamp: '2025-03-04T10:10:00Z', isFlagged: false, flagReason: null },
    { id: 'm5', content: 'We can ship the earbuds by Friday.', senderId: 'conv-1', timestamp: '2025-03-04T10:15:00Z', isFlagged: false, flagReason: null },
  ],
  'conv-2': [
    { id: 'm6', content: 'Do you have organic cotton in stock?', senderId: 'me', timestamp: '2025-03-03T14:00:00Z', isFlagged: false, flagReason: null },
    { id: 'm7', content: 'Yes, we have several varieties. What\'s your required quantity?', senderId: 'conv-2', timestamp: '2025-03-03T14:10:00Z', isFlagged: false, flagReason: null },
    { id: 'm8', content: 'Around 5000 meters. Can you send samples first?', senderId: 'me', timestamp: '2025-03-03T14:15:00Z', isFlagged: false, flagReason: null },
    { id: 'm9', content: 'The fabric samples are on the way.', senderId: 'conv-2', timestamp: '2025-03-04T09:00:00Z', isFlagged: false, flagReason: null },
  ],
  'conv-3': [
    { id: 'm10', content: 'When will the automotive parts be delivered?', senderId: 'me', timestamp: '2025-03-02T11:00:00Z', isFlagged: false, flagReason: null },
    { id: 'm11', content: 'Your order has been shipped! Let me share the tracking details.', senderId: 'conv-3', timestamp: '2025-03-02T12:00:00Z', isFlagged: false, flagReason: null },
    { id: 'm12', content: 'Here is my email: parts@autoparts.com for future orders', senderId: 'conv-3', timestamp: '2025-03-02T12:05:00Z', isFlagged: true, flagReason: 'Contact information sharing detected' },
    { id: 'm13', content: 'Tracking updated: SF1234567890', senderId: 'conv-3', timestamp: '2025-03-03T16:00:00Z', isFlagged: false, flagReason: null },
  ],
  'conv-4': [
    { id: 'm14', content: 'The fresh produce order has been completed. Everything arrived in great condition!', senderId: 'me', timestamp: '2025-03-01T15:00:00Z', isFlagged: false, flagReason: null },
    { id: 'm15', content: 'Thanks for confirming the order!', senderId: 'conv-4', timestamp: '2025-03-01T15:30:00Z', isFlagged: false, flagReason: null },
  ],
  'conv-5': [
    { id: 'm16', content: 'Do you carry eco-friendly garden lights?', senderId: 'me', timestamp: '2025-03-01T09:00:00Z', isFlagged: false, flagReason: null },
    { id: 'm17', content: 'We do! Let me check the stock levels.', senderId: 'conv-5', timestamp: '2025-03-01T09:30:00Z', isFlagged: false, flagReason: null },
  ],
};

// ── Animation ──────────────────────────────────────────────

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

// ── Component ──────────────────────────────────────────────

export function ChatView() {
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchConv, setSearchConv] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // On mobile, if no conversation selected, show list
  // On desktop, always show both
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const filteredConvs = CONVERSATIONS.filter((c) =>
    c.name.toLowerCase().includes(searchConv.toLowerCase())
  );

  const messages = selectedConv ? MESSAGES_BY_CONV[selectedConv] ?? [] : [];
  const activeConv = CONVERSATIONS.find((c) => c.id === selectedConv);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConv, messages.length]);

  const handleSend = () => {
    if (!messageInput.trim()) return;
    setMessageInput('');
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] overflow-hidden"
    >
      {/* ── Left Sidebar: Conversation List ─────────────── */}
      <motion.div
        variants={item}
        className={cn(
          'w-full md:w-80 lg:w-96 shrink-0 border-r border-border/30 flex flex-col',
          selectedConv ? 'hidden md:flex' : 'flex'
        )}
      >
        {/* Header */}
        <div className="p-4 space-y-3 border-b border-border/30">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold neon-text-cyan flex items-center gap-2">
              <MessageSquare className="h-5 w-5" /> Messages
            </h2>
            <Badge variant="secondary" className="text-[10px]">
              {CONVERSATIONS.reduce((sum, c) => sum + c.unread, 0)} new
            </Badge>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchConv}
              onChange={(e) => setSearchConv(e.target.value)}
              className="pl-9 bg-surface border-border/50 focus:border-neon-cyan focus:ring-neon-cyan/20 h-9 text-sm"
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredConvs.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelectedConv(conv.id)}
              className={cn(
                'w-full flex items-center gap-3 p-4 transition-all duration-200 text-left',
                'hover:bg-surface-hover',
                selectedConv === conv.id && 'bg-surface-hover neon-border-cyan border-l-2'
              )}
            >
              <div className="relative">
                <Avatar className="h-10 w-10 bg-surface">
                  <AvatarFallback className="bg-surface text-neon-cyan text-xs font-bold">
                    {conv.initials}
                  </AvatarFallback>
                </Avatar>
                {conv.online && (
                  <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-neon-green border-2 border-background" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold truncate">{conv.name}</span>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">{conv.time}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground truncate">{conv.lastMessage}</span>
                  {conv.unread > 0 && (
                    <span className="shrink-0 h-5 w-5 rounded-full gradient-cyan-purple-strong flex items-center justify-center text-[10px] font-bold text-primary-foreground">
                      {conv.unread}
                    </span>
                  )}
                </div>
                {conv.orderId && (
                  <span className="text-[10px] text-neon-purple font-mono mt-0.5 inline-block">
                    {conv.orderId}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Main Chat Area ──────────────────────────────── */}
      <motion.div
        variants={item}
        className={cn(
          'flex-1 flex flex-col min-w-0',
          !selectedConv ? 'hidden md:flex' : 'flex'
        )}
      >
        {!selectedConv ? (
          /* ── Empty state ── */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="h-20 w-20 rounded-full gradient-cyan-purple mx-auto flex items-center justify-center">
                <MessageSquare className="h-10 w-10 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold">Select a conversation</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Choose a conversation from the sidebar to start messaging with your trading partners.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* ── Chat Header ─────────────────────────── */}
            <div className="flex items-center gap-3 p-4 border-b border-border/30 bg-surface/50">
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden text-neon-cyan -ml-2"
                onClick={() => setSelectedConv(null)}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Avatar className="h-9 w-9 bg-surface">
                <AvatarFallback className="bg-surface text-neon-cyan text-xs font-bold">
                  {activeConv?.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{activeConv?.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {activeConv?.online ? (
                    <span className="text-neon-green">Online</span>
                  ) : (
                    'Offline'
                  )}
                  {activeConv?.orderId && (
                    <span className="ml-2 font-mono text-neon-purple">#{activeConv.orderId}</span>
                  )}
                </p>
              </div>
            </div>

            {/* ── Warning Banner ──────────────────────── */}
            <div className="px-4 py-2 bg-red-500/10 border-b border-red-500/20">
              <div className="flex items-center gap-2 text-xs text-red-400">
                <Shield className="h-3.5 w-3.5 shrink-0" />
                <span>
                  Sharing contact information is prohibited. Violations will result in account suspension.
                </span>
              </div>
            </div>

            {/* ── Messages ────────────────────────────── */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
              <AnimatePresence>
                {messages.map((msg) => {
                  const isMe = msg.senderId === CURRENT_USER_ID;
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className={cn('flex', isMe ? 'justify-end' : 'justify-start')}
                    >
                      <div
                        className={cn(
                          'max-w-[80%] md:max-w-[60%] rounded-2xl px-4 py-2.5 relative',
                          isMe
                            ? 'gradient-cyan-purple text-primary-foreground rounded-br-md'
                            : 'glass rounded-bl-md'
                        )}
                      >
                        {msg.isFlagged && (
                          <div className="flex items-center gap-1.5 mb-1.5 text-[10px] text-red-400 bg-red-500/10 rounded px-2 py-1">
                            <AlertTriangle className="h-3 w-3 shrink-0" />
                            <span>{msg.flagReason}</span>
                          </div>
                        )}
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                        <p
                          className={cn(
                            'text-[10px] mt-1',
                            isMe
                              ? 'text-primary-foreground/60'
                              : 'text-muted-foreground'
                          )}
                        >
                          {new Date(msg.timestamp).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* ── Message Input ───────────────────────── */}
            <div className="p-4 border-t border-border/30 bg-surface/50">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  className="bg-background border-border/50 focus:border-neon-cyan focus:ring-neon-cyan/20"
                />
                <Button
                  onClick={handleSend}
                  disabled={!messageInput.trim()}
                  className="glow-button gradient-cyan-purple-strong text-primary-foreground border-0 shrink-0"
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
