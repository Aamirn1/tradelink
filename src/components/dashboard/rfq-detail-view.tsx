'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  CalendarDays,
  Layers,
  DollarSign,
  Clock,
  FileText,
  Send,
  User,
  Truck,
  MessageSquare,
  Quote as QuoteIcon,
  CheckCircle2,
} from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { RFQStatus } from '@/types';

// ── Mock data ────────────────────────────────────────────────

const MOCK_RFQ = {
  id: 'rfq-1',
  title: 'Bluetooth Speakers Bulk Order',
  description:
    'Looking for a reliable supplier of Bluetooth speakers with waterproof rating IPX7. Must include USB-C charging and 20+ hour battery life. Packaging should support custom branding with our company logo. We need consistent quality as this is for our premium product line. Samples required before bulk order confirmation. Delivery should be in 3 batches over 2 months.',
  category: 'Electronics',
  quantity: 2000,
  unit: 'pcs',
  deadline: '2025-03-15',
  budget: 15000,
  status: 'OPEN' as RFQStatus,
  retailerName: 'TechMart Inc.',
  retailerId: 'ret-1',
  createdAt: '2025-03-01',
};

const MOCK_QUOTES = [
  {
    id: 'quote-1',
    wholesalerName: 'GlobalTech Wholesale',
    price: 7.20,
    quantity: 2000,
    deliveryTime: '2-3 weeks',
    description: 'We can supply IPX7 waterproof Bluetooth speakers with USB-C and 24-hour battery. Custom branding available at no extra cost. Sample units can be shipped within 3 days.',
    status: 'PENDING' as const,
    createdAt: '2025-03-02',
  },
  {
    id: 'quote-2',
    wholesalerName: 'SoundWave Electronics',
    price: 6.80,
    quantity: 2000,
    deliveryTime: '3-4 weeks',
    description: 'Premium waterproof speakers with IPX7 rating, USB-C charging, and 22-hour battery life. We include a 1-year warranty. Custom packaging available for $0.50 extra per unit.',
    status: 'PENDING' as const,
    createdAt: '2025-03-03',
  },
  {
    id: 'quote-3',
    wholesalerName: 'AudioMax Supply',
    price: 8.50,
    quantity: 2000,
    deliveryTime: '1-2 weeks',
    description: 'Fast delivery option available. IPX7 certified speakers with premium drivers, USB-C, and 26-hour battery. Full custom branding included. Quality guarantee with free replacement for defective units.',
    status: 'PENDING' as const,
    createdAt: '2025-03-03',
  },
  {
    id: 'quote-4',
    wholesalerName: 'MegaSound Wholesale',
    price: 5.90,
    quantity: 2500,
    deliveryTime: '4-5 weeks',
    description: 'Competitive pricing for 2500+ units. IPX7 waterproof, USB-C, 20-hour battery. Custom logo printing available. Delivery in batches can be arranged.',
    status: 'ACCEPTED' as const,
    createdAt: '2025-03-04',
  },
  {
    id: 'quote-5',
    wholesalerName: 'Pacific Audio Co.',
    price: 7.50,
    quantity: 2000,
    deliveryTime: '3 weeks',
    description: 'High-quality speakers with IPX7 rating. USB-C fast charging and 22-hour playback. Branded packaging included. We can deliver in 2 batches as requested.',
    status: 'REJECTED' as const,
    createdAt: '2025-03-05',
  },
];

// ── Animation variants ───────────────────────────────────────

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

// ── Quote status badge ───────────────────────────────────────

function QuoteStatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'ACCEPTED':
      return (
        <Badge className="bg-green-500/15 text-green-400 border-green-500/30 text-[10px]">
          <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" /> ACCEPTED
        </Badge>
      );
    case 'REJECTED':
      return (
        <Badge className="bg-red-500/15 text-red-400 border-red-500/30 text-[10px]">
          REJECTED
        </Badge>
      );
    default:
      return (
        <Badge className="bg-yellow-500/15 text-yellow-400 border-yellow-500/30 text-[10px]">
          <Clock className="h-2.5 w-2.5 mr-0.5" /> PENDING
        </Badge>
      );
  }
}

// ── RFQ status badge ─────────────────────────────────────────

function RfqStatusBadge({ status }: { status: RFQStatus }) {
  if (status === 'OPEN') {
    return (
      <Badge className="bg-green-500/15 text-green-400 border-green-500/30 text-xs">
        <Clock className="h-3 w-3 mr-1" /> OPEN
      </Badge>
    );
  }
  if (status === 'CLOSED') {
    return (
      <Badge variant="secondary" className="text-xs">
        CLOSED
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-xs">
      {status}
    </Badge>
  );
}

// ── Component ────────────────────────────────────────────────

export function RfqDetailView() {
  const { user, isAuthenticated, selectedRfqId, setSelectedRfqId, setAuthModalTab } = useAppStore();
  const isWholesaler = user?.role === 'WHOLESALER';

  const rfq = MOCK_RFQ; // Always use mock data

  const [quotePrice, setQuotePrice] = useState('');
  const [quoteQuantity, setQuoteQuantity] = useState('');
  const [quoteDeliveryTime, setQuoteDeliveryTime] = useState('');
  const [quoteDescription, setQuoteDescription] = useState('');
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);

  const handleSubmitQuote = () => {
    setQuoteSubmitted(true);
    setTimeout(() => {
      setQuoteSubmitted(false);
      setShowQuoteForm(false);
      setQuotePrice('');
      setQuoteQuantity('');
      setQuoteDeliveryTime('');
      setQuoteDescription('');
    }, 1500);
  };

  const handleBack = () => {
    setSelectedRfqId(null);
  };

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-6 p-4 md:p-6 custom-scrollbar"
    >
      {/* ── Back Button ─────────────────────────────────── */}
      <motion.div variants={fadeIn}>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="text-muted-foreground hover:text-foreground -ml-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back to RFQ Board
        </Button>
      </motion.div>

      {/* ── RFQ Header ──────────────────────────────────── */}
      <motion.div variants={fadeIn}>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-bold leading-tight">
                {rfq.title}
              </h1>
              <RfqStatusBadge status={rfq.status} />
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {rfq.category}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Posted by {rfq.retailerName} on {rfq.createdAt}
              </span>
            </div>
          </div>
          {isWholesaler && rfq.status === 'OPEN' && (
            <Button
              onClick={() => setShowQuoteForm(!showQuoteForm)}
              className="glow-button gradient-cyan-purple-strong text-primary-foreground border-0 font-semibold shrink-0"
            >
              <Send className="h-4 w-4" /> Submit Quote
            </Button>
          )}
          {!isAuthenticated && (
            <Button
              onClick={() => setAuthModalTab('register')}
              variant="outline"
              className="neon-border-purple hover:neon-glow-purple transition-all shrink-0"
            >
              Sign in to Quote
            </Button>
          )}
        </div>
      </motion.div>

      {/* ── Description ─────────────────────────────────── */}
      <motion.div variants={fadeIn}>
        <Card className="glass border-0">
          <CardHeader>
            <CardTitle className="neon-text-cyan text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" /> Description
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {rfq.description}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Requirements ────────────────────────────────── */}
      <motion.div variants={fadeIn}>
        <Card className="glass border-0">
          <CardHeader>
            <CardTitle className="neon-text-purple text-lg">Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface text-neon-cyan">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Quantity</p>
                  <p className="font-semibold text-sm">{rfq.quantity.toLocaleString()} {rfq.unit}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface text-neon-orange">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Deadline</p>
                  <p className="font-semibold text-sm">{rfq.deadline}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface text-neon-green">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Budget</p>
                  <p className="font-semibold text-sm">${rfq.budget?.toLocaleString() ?? 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface text-neon-purple">
                  <QuoteIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Quotes</p>
                  <p className="font-semibold text-sm">{MOCK_QUOTES.length} received</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Submit Quote Form ───────────────────────────── */}
      {isWholesaler && showQuoteForm && rfq.status === 'OPEN' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="glass border-0 neon-border-purple">
            <CardHeader>
              <CardTitle className="neon-text-purple text-lg flex items-center gap-2">
                <Send className="h-5 w-5" /> Submit Your Quote
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {quoteSubmitted ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <CheckCircle2 className="h-12 w-12 text-neon-green mb-3" />
                  <p className="font-semibold">Quote Submitted Successfully!</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    The retailer will review your quote and get back to you.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="q-price" className="text-sm">Price per Unit ($)</Label>
                      <Input
                        id="q-price"
                        type="number"
                        placeholder="e.g. 7.50"
                        value={quotePrice}
                        onChange={(e) => setQuotePrice(e.target.value)}
                        className="bg-input/30 border-border/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="q-qty" className="text-sm">Quantity</Label>
                      <Input
                        id="q-qty"
                        type="number"
                        placeholder="e.g. 2000"
                        value={quoteQuantity}
                        onChange={(e) => setQuoteQuantity(e.target.value)}
                        className="bg-input/30 border-border/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="q-delivery" className="text-sm">Delivery Time</Label>
                      <Input
                        id="q-delivery"
                        placeholder="e.g. 2-3 weeks"
                        value={quoteDeliveryTime}
                        onChange={(e) => setQuoteDeliveryTime(e.target.value)}
                        className="bg-input/30 border-border/50"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="q-desc" className="text-sm">Description</Label>
                    <Textarea
                      id="q-desc"
                      placeholder="Describe your offer, product specs, warranty, etc."
                      value={quoteDescription}
                      onChange={(e) => setQuoteDescription(e.target.value)}
                      className="bg-input/30 border-border/50 min-h-20"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => setShowQuoteForm(false)}
                      className="text-muted-foreground"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmitQuote}
                      className="glow-button gradient-cyan-purple-strong text-primary-foreground border-0 font-semibold"
                      disabled={!quotePrice || !quoteQuantity || !quoteDeliveryTime}
                    >
                      <Send className="h-4 w-4" /> Submit Quote
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ── Quotes Section ──────────────────────────────── */}
      <motion.div variants={fadeIn}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold neon-text-cyan flex items-center gap-2">
            <MessageSquare className="h-5 w-5" /> Quotes Received
          </h2>
          <Badge variant="outline" className="text-xs">
            {MOCK_QUOTES.length} quotes
          </Badge>
        </div>

        <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-1">
          {MOCK_QUOTES.map((quote) => (
            <motion.div
              key={quote.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card
                className={cn(
                  'glass border-0 transition-all duration-300',
                  quote.status === 'ACCEPTED' && 'neon-border-cyan',
                  quote.status === 'REJECTED' && 'opacity-60'
                )}
              >
                <CardContent className="p-4 space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface text-neon-purple">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{quote.wholesalerName}</p>
                        <p className="text-[10px] text-muted-foreground">{quote.createdAt}</p>
                      </div>
                    </div>
                    <QuoteStatusBadge status={quote.status} />
                  </div>

                  {/* Quote details */}
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="h-3 w-3 text-neon-cyan shrink-0" />
                      <span className="text-muted-foreground">Price:</span>
                      <span className="neon-text-cyan font-semibold">${quote.price.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Layers className="h-3 w-3 text-neon-green shrink-0" />
                      <span className="text-muted-foreground">Qty:</span>
                      <span className="font-semibold">{quote.quantity.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Truck className="h-3 w-3 text-neon-orange shrink-0" />
                      <span className="text-muted-foreground">Delivery:</span>
                      <span className="font-semibold">{quote.deliveryTime}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {quote.description}
                  </p>

                  {/* Total */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-muted-foreground">Total Quote Value</span>
                    <span className="text-sm font-bold neon-text-cyan">
                      ${(quote.price * quote.quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
