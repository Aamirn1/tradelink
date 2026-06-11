'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  PlusCircle,
  FileText,
  CalendarDays,
  Layers,
  DollarSign,
  MessageSquare,
  Clock,
  Quote,
  X,
  Send,
} from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { CATEGORIES } from '@/types';
import type { RFQStatus } from '@/types';

// ── Mock data ────────────────────────────────────────────────

const MOCK_RFQS = [
  {
    id: 'rfq-1',
    title: 'Bluetooth Speakers Bulk Order',
    description: 'Looking for a reliable supplier of Bluetooth speakers with waterproof rating IPX7. Must include USB-C charging and 20+ hour battery life. Packaging should support custom branding.',
    category: 'Electronics',
    quantity: 2000,
    unit: 'pcs',
    deadline: '2025-03-15',
    budget: 15000,
    status: 'OPEN' as RFQStatus,
    quotesCount: 5,
    retailerName: 'TechMart Inc.',
    retailerId: 'ret-1',
    createdAt: '2025-03-01',
  },
  {
    id: 'rfq-2',
    title: 'Organic Cotton Fabric',
    description: 'Need GOTS certified organic cotton fabric in various colors. Minimum 150 GSM, suitable for t-shirts and casual wear. Looking for per-meter pricing with volume discounts.',
    category: 'Clothing & Textiles',
    quantity: 5000,
    unit: 'meters',
    deadline: '2025-03-10',
    budget: 25000,
    status: 'OPEN' as RFQStatus,
    quotesCount: 3,
    retailerName: 'UrbanStyle Ltd.',
    retailerId: 'ret-2',
    createdAt: '2025-02-28',
  },
  {
    id: 'rfq-3',
    title: 'Industrial LED Panels',
    description: 'High-brightness LED panels for warehouse lighting, 200W equivalent. Must include mounting hardware and 5-year warranty. DLC qualified preferred.',
    category: 'Electronics',
    quantity: 500,
    unit: 'units',
    deadline: '2025-03-20',
    budget: 35000,
    status: 'OPEN' as RFQStatus,
    quotesCount: 7,
    retailerName: 'BrightSpaces Co.',
    retailerId: 'ret-3',
    createdAt: '2025-02-27',
  },
  {
    id: 'rfq-4',
    title: 'Reusable Shopping Bags',
    description: 'Custom printed reusable shopping bags, non-woven polypropylene. Full-color printing on both sides. Must support 15+ kg weight capacity.',
    category: 'Home & Garden',
    quantity: 10000,
    unit: 'pcs',
    deadline: '2025-04-01',
    budget: 8000,
    status: 'OPEN' as RFQStatus,
    quotesCount: 2,
    retailerName: 'GreenRetail Corp.',
    retailerId: 'ret-4',
    createdAt: '2025-02-26',
  },
  {
    id: 'rfq-5',
    title: 'Premium Coffee Beans',
    description: 'Arabica coffee beans, medium roast, 1kg vacuum-sealed bags. Looking for single-origin Colombian or Ethiopian. Must include organic certification.',
    category: 'Food & Beverages',
    quantity: 3000,
    unit: 'kg',
    deadline: '2025-03-25',
    budget: 45000,
    status: 'CLOSED' as RFQStatus,
    quotesCount: 8,
    retailerName: 'CafePrime LLC',
    retailerId: 'ret-5',
    createdAt: '2025-02-20',
  },
  {
    id: 'rfq-6',
    title: 'Steel Rebar 12mm',
    description: 'Standard steel rebar 12mm diameter, 12m length. Must comply with ASTM A615 Grade 60. Rust-resistant coating preferred.',
    category: 'Construction Materials',
    quantity: 50000,
    unit: 'pcs',
    deadline: '2025-04-10',
    budget: 120000,
    status: 'OPEN' as RFQStatus,
    quotesCount: 4,
    retailerName: 'BuildRight Supplies',
    retailerId: 'ret-6',
    createdAt: '2025-02-25',
  },
  {
    id: 'rfq-7',
    title: 'Car Brake Pads Set',
    description: 'Ceramic brake pads for passenger vehicles, full set (front + rear). Must include hardware kit. DOT certified.',
    category: 'Automotive Parts',
    quantity: 1500,
    unit: 'sets',
    deadline: '2025-03-30',
    budget: 22000,
    status: 'OPEN' as RFQStatus,
    quotesCount: 3,
    retailerName: 'AutoParts Hub',
    retailerId: 'ret-7',
    createdAt: '2025-02-24',
  },
  {
    id: 'rfq-8',
    title: 'Yoga Mats Custom Brand',
    description: 'Eco-friendly TPE yoga mats, 6mm thickness with custom logo printing. Non-slip surface, carrying strap included.',
    category: 'Sports & Outdoors',
    quantity: 800,
    unit: 'pcs',
    deadline: '2025-03-18',
    budget: 6000,
    status: 'CLOSED' as RFQStatus,
    quotesCount: 6,
    retailerName: 'FitLife Stores',
    retailerId: 'ret-8',
    createdAt: '2025-02-18',
  },
];

// ── Animation variants ───────────────────────────────────────

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

// ── RFQ Form type ────────────────────────────────────────────

interface RfqFormData {
  title: string;
  description: string;
  category: string;
  quantity: string;
  unit: string;
  deadline: string;
  budget: string;
}

const initialForm: RfqFormData = {
  title: '',
  description: '',
  category: '',
  quantity: '',
  unit: 'pcs',
  deadline: '',
  budget: '',
};

// ── Component ────────────────────────────────────────────────

export function RfqBoardView() {
  const { user, isAuthenticated, setSelectedRfqId, setAuthModalTab } = useAppStore();
  const isWholesaler = user?.role === 'WHOLESALER';
  const isRetailer = user?.role === 'RETAILER';

  const [activeTab, setActiveTab] = useState<'open' | 'my'>('open');
  const [showPostDialog, setShowPostDialog] = useState(false);
  const [form, setForm] = useState<RfqFormData>(initialForm);

  const displayedRfqs = activeTab === 'open'
    ? MOCK_RFQS.filter((r) => r.status === 'OPEN')
    : MOCK_RFQS.filter((r) => r.retailerId === 'ret-1'); // mock "my rfqs"

  const statusBadge = (status: RFQStatus) => {
    if (status === 'OPEN') {
      return (
        <Badge className="bg-green-500/15 text-green-400 border-green-500/30 text-[10px]">
          <Clock className="h-2.5 w-2.5 mr-0.5" /> OPEN
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="text-[10px]">
        CLOSED
      </Badge>
    );
  };

  const handlePostRfq = () => {
    // In production this would call an API
    setShowPostDialog(false);
    setForm(initialForm);
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 p-4 md:p-6 custom-scrollbar"
    >
      {/* ── Header + Actions ────────────────────────────── */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            <span className="neon-text-purple">RFQ Board</span>
          </h1>
          <p className="mt-1 text-muted-foreground text-sm">
            Browse and respond to wholesale sourcing requests
          </p>
        </div>
        {isRetailer && (
          <Button
            onClick={() => setShowPostDialog(true)}
            className="glow-button gradient-cyan-purple-strong text-primary-foreground border-0 font-semibold shrink-0"
          >
            <PlusCircle className="h-4 w-4" /> Post New RFQ
          </Button>
        )}
        {!isAuthenticated && (
          <Button
            onClick={() => setAuthModalTab('register')}
            variant="outline"
            className="neon-border-purple hover:neon-glow-purple transition-all shrink-0"
          >
            <PlusCircle className="h-4 w-4" /> Post New RFQ
          </Button>
        )}
      </motion.div>

      {/* ── Tab Toggle ──────────────────────────────────── */}
      <motion.div variants={item}>
        <div className="flex gap-1 p-1 glass rounded-lg w-fit border-0">
          <button
            onClick={() => setActiveTab('open')}
            className={cn(
              'px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200',
              activeTab === 'open'
                ? 'gradient-cyan-purple-strong text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Open RFQs
          </button>
          {isAuthenticated && (
            <button
              onClick={() => setActiveTab('my')}
              className={cn(
                'px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200',
                activeTab === 'my'
                  ? 'gradient-cyan-purple-strong text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              My RFQs
            </button>
          )}
        </div>
      </motion.div>

      {/* ── RFQ Cards ───────────────────────────────────── */}
      {displayedRfqs.length > 0 ? (
        <motion.div
          variants={container}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
        >
          {displayedRfqs.map((rfq) => (
            <motion.div key={rfq.id} variants={item}>
              <Card
                className={cn(
                  'card-3d glass border-0 cursor-pointer overflow-hidden h-full flex flex-col',
                  'hover:neon-border-purple transition-all duration-300'
                )}
                onClick={() => setSelectedRfqId(rfq.id)}
              >
                <CardContent className="p-4 md:p-5 flex flex-col flex-1 gap-3">
                  {/* Title + Status */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-sm leading-snug line-clamp-2">
                      {rfq.title}
                    </h3>
                    {statusBadge(rfq.status)}
                  </div>

                  {/* Description preview */}
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {rfq.description}
                  </p>

                  {/* Category */}
                  <Badge variant="secondary" className="text-[10px] w-fit">
                    {rfq.category}
                  </Badge>

                  {/* Details grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Layers className="h-3 w-3 text-neon-cyan shrink-0" />
                      <span>{rfq.quantity.toLocaleString()} {rfq.unit}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="h-3 w-3 text-neon-orange shrink-0" />
                      <span>{rfq.deadline}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="h-3 w-3 text-neon-green shrink-0" />
                      <span>${rfq.budget?.toLocaleString() ?? 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Quote className="h-3 w-3 text-neon-purple shrink-0" />
                      <span className="text-neon-purple font-semibold">{rfq.quotesCount}</span>
                      <span>quotes</span>
                    </div>
                  </div>

                  {/* Retailer + Actions */}
                  <div className="mt-auto pt-2 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <FileText className="h-3 w-3" /> {rfq.retailerName}
                    </span>
                    {isWholesaler && rfq.status === 'OPEN' && (
                      <Button
                        size="sm"
                        className="glow-button gradient-cyan-purple-strong text-primary-foreground border-0 font-semibold text-xs h-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRfqId(rfq.id);
                        }}
                      >
                        <Send className="h-3 w-3" /> Quote
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div variants={item}>
          <Card className="glass border-0">
            <CardContent className="p-8 flex flex-col items-center justify-center text-center">
              <FileText className="h-12 w-12 text-muted-foreground/40 mb-3" />
              <p className="font-semibold text-sm">No RFQs found</p>
              <p className="text-xs text-muted-foreground mt-1">
                {activeTab === 'my'
                  ? 'You haven\'t posted any RFQs yet'
                  : 'No open RFQs at the moment'}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ── Post New RFQ Dialog ─────────────────────────── */}
      <Dialog open={showPostDialog} onOpenChange={setShowPostDialog}>
        <DialogContent className="glass border-border/50 max-h-[90vh] overflow-y-auto custom-scrollbar sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="neon-text-purple">Post New RFQ</DialogTitle>
            <DialogDescription>
              Describe what you need and let wholesalers compete for your business.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="rfq-title" className="text-sm">Title</Label>
              <Input
                id="rfq-title"
                placeholder="e.g. Bluetooth Speakers Bulk Order"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="bg-input/30 border-border/50"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="rfq-desc" className="text-sm">Description</Label>
              <Textarea
                id="rfq-desc"
                placeholder="Describe your requirements in detail..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="bg-input/30 border-border/50 min-h-20"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label className="text-sm">Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger className="w-full bg-input/30 border-border/50">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="glass border-border/50">
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quantity + Unit */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="rfq-qty" className="text-sm">Quantity</Label>
                <Input
                  id="rfq-qty"
                  type="number"
                  placeholder="e.g. 2000"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  className="bg-input/30 border-border/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Unit</Label>
                <Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v })}>
                  <SelectTrigger className="w-full bg-input/30 border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass border-border/50">
                    <SelectItem value="pcs">Pieces (pcs)</SelectItem>
                    <SelectItem value="units">Units</SelectItem>
                    <SelectItem value="meters">Meters</SelectItem>
                    <SelectItem value="kg">Kilograms (kg)</SelectItem>
                    <SelectItem value="tons">Tons</SelectItem>
                    <SelectItem value="sets">Sets</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Deadline + Budget */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="rfq-deadline" className="text-sm">Deadline</Label>
                <Input
                  id="rfq-deadline"
                  type="date"
                  value={form.deadline}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                  className="bg-input/30 border-border/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rfq-budget" className="text-sm">Budget (USD)</Label>
                <Input
                  id="rfq-budget"
                  type="number"
                  placeholder="e.g. 15000"
                  value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: e.target.value })}
                  className="bg-input/30 border-border/50"
                />
              </div>
            </div>
          </div>

          <Separator className="bg-border/30" />

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowPostDialog(false)}
              className="text-muted-foreground"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePostRfq}
              className="glow-button gradient-cyan-purple-strong text-primary-foreground border-0 font-semibold"
              disabled={!form.title || !form.category || !form.quantity}
            >
              <PlusCircle className="h-4 w-4" /> Post RFQ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
