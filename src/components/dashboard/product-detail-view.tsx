'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Package,
  Tag,
  Layers,
  Hash,
  DollarSign,
  Shield,
  Info,
  ShoppingCart,
  Minus,
  Plus,
  CheckCircle2,
} from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// ── Mock product detail ──────────────────────────────────────

const MOCK_PRODUCT = {
  id: 'prod-1',
  name: 'Wireless Bluetooth Earbuds Pro',
  description:
    'Premium wireless earbuds featuring active noise cancellation (ANC), transparency mode, and an impressive 30-hour total battery life with the included charging case. Equipped with Bluetooth 5.3 for stable connectivity, IPX5 water resistance for workouts, and custom-tuned 12mm dynamic drivers for rich, balanced sound. The ergonomic design ensures a comfortable fit during extended use. Includes USB-C fast charging, touch controls, and multi-device pairing support.',
  category: 'Electronics',
  price: 24.99,
  moq: 100,
  stock: 3200,
  wholesalerName: 'GlobalTech Wholesale',
  wholesalerId: 'ws-1',
  createdAt: '2025-03-01',
  priceTiers: [
    { minQty: 1, maxQty: 10, price: 24.99 },
    { minQty: 11, maxQty: 50, price: 22.50 },
    { minQty: 51, maxQty: null, price: 19.99 },
  ],
};

// ── Animation variants ───────────────────────────────────────

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

// ── Component ────────────────────────────────────────────────

export function ProductDetailView() {
  const { user, isAuthenticated, selectedProductId, setSelectedProductId, setCurrentView, setAuthModalTab } = useAppStore();
  const isRetailer = user?.role === 'RETAILER';

  const product = MOCK_PRODUCT; // Always use mock data

  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [quantity, setQuantity] = useState(product.moq);
  const [paymentType, setPaymentType] = useState<'FULL' | 'PARTIAL'>('FULL');
  const [depositPercent, setDepositPercent] = useState([30]);

  // Determine the effective price based on quantity
  const effectivePrice = useMemo(() => {
    const tier = product.priceTiers.find(
      (t) => quantity >= t.minQty && (t.maxQty === null || quantity <= t.maxQty)
    );
    return tier?.price ?? product.price;
  }, [quantity, product.priceTiers, product.price]);

  const totalAmount = quantity * effectivePrice;
  const depositAmount = paymentType === 'PARTIAL' ? totalAmount * (depositPercent[0] / 100) : totalAmount;

  const handleBack = () => {
    setSelectedProductId(null);
  };

  const incrementQty = () => setQuantity((prev) => prev + 1);
  const decrementQty = () => setQuantity((prev) => Math.max(product.moq, prev - 1));

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
          <ArrowLeft className="h-4 w-4" /> Back to Marketplace
        </Button>
      </motion.div>

      {/* ── Main Layout ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Image Area */}
        <motion.div variants={fadeIn}>
          <Card className="glass border-0 overflow-hidden">
            <div className="relative h-64 md:h-80 lg:h-96 gradient-cyan-purple flex items-center justify-center">
              <Package className="h-24 w-24 text-primary-foreground/20" />
              <Badge className="absolute top-4 right-4" variant="secondary">
                {product.category}
              </Badge>
            </div>
          </Card>
        </motion.div>

        {/* Right: Product Info */}
        <motion.div variants={fadeIn} className="space-y-5">
          {/* Name + Category */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold leading-tight">
              {product.name}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                {product.category}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Listed on {product.createdAt}
              </span>
            </div>
          </div>

          {/* Price */}
          <div>
            <span className="neon-text-cyan text-3xl md:text-4xl font-bold">
              ${effectivePrice.toFixed(2)}
            </span>
            <span className="text-muted-foreground text-sm ml-2">per unit</span>
          </div>

          {/* Key Details */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="glass border-0">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface text-neon-cyan">
                  <Tag className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">MOQ</p>
                  <p className="font-semibold text-sm">{product.moq} units</p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass border-0">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface text-neon-green">
                  <Layers className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Stock</p>
                  <p className="font-semibold text-sm">{product.stock.toLocaleString()} units</p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass border-0 col-span-2">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface text-neon-purple">
                  <Hash className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Wholesaler</p>
                  <p className="font-semibold text-sm">{product.wholesalerName}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Place Order Button */}
          {isRetailer ? (
            <Button
              onClick={() => setShowOrderDialog(true)}
              className="w-full glow-button gradient-cyan-purple-strong text-primary-foreground border-0 font-semibold h-11"
              size="lg"
            >
              <ShoppingCart className="h-5 w-5" /> Place Order
            </Button>
          ) : !isAuthenticated ? (
            <Button
              onClick={() => setAuthModalTab('register')}
              variant="outline"
              className="w-full neon-border-cyan hover:neon-glow-cyan transition-all h-11"
              size="lg"
            >
              Sign in to Order
            </Button>
          ) : null}
        </motion.div>
      </div>

      {/* ── Description ─────────────────────────────────── */}
      <motion.div variants={fadeIn}>
        <Card className="glass border-0">
          <CardHeader>
            <CardTitle className="neon-text-cyan text-lg">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Pricing Tiers ───────────────────────────────── */}
      <motion.div variants={fadeIn}>
        <Card className="glass border-0">
          <CardHeader>
            <CardTitle className="neon-text-purple text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5" /> Pricing Tiers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-60 overflow-y-auto custom-scrollbar">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/40 hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Quantity Range</TableHead>
                    <TableHead className="text-muted-foreground text-right">Price per Unit</TableHead>
                    <TableHead className="text-muted-foreground text-right">Discount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {product.priceTiers.map((tier, idx) => {
                    const discount =
                      idx === 0
                        ? 0
                        : ((product.priceTiers[0].price - tier.price) / product.priceTiers[0].price) * 100;
                    const rangeLabel =
                      tier.maxQty === null
                        ? `${tier.minQty}+ units`
                        : `${tier.minQty}–${tier.maxQty} units`;
                    return (
                      <TableRow
                        key={idx}
                        className={cn(
                          'border-border/20',
                          quantity >= tier.minQty &&
                            (tier.maxQty === null || quantity <= tier.maxQty)
                            ? 'bg-neon-cyan/5'
                            : ''
                        )}
                      >
                        <TableCell className="text-sm font-medium">{rangeLabel}</TableCell>
                        <TableCell className="text-sm text-right">
                          <span className={cn(idx > 0 && 'neon-text-cyan font-bold')}>
                            ${tier.price.toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-right">
                          {discount > 0 ? (
                            <Badge className="bg-green-500/15 text-green-400 border-green-500/30 text-[10px]">
                              -{discount.toFixed(0)}%
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">Base</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Order Dialog ────────────────────────────────── */}
      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent className="glass border-border/50 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="neon-text-cyan">Place Order</DialogTitle>
            <DialogDescription>
              Order &ldquo;{product.name}&rdquo; from {product.wholesalerName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            {/* Quantity */}
            <div className="space-y-2">
              <Label className="text-sm">Quantity (MOQ: {product.moq})</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 neon-border-cyan"
                  onClick={decrementQty}
                  disabled={quantity <= product.moq}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    if (!isNaN(v) && v >= product.moq) setQuantity(v);
                  }}
                  className="text-center bg-input/30 border-border/50 flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 neon-border-cyan"
                  onClick={incrementQty}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Unit price: <span className="neon-text-cyan font-semibold">${effectivePrice.toFixed(2)}</span>
              </p>
            </div>

            {/* Payment Type */}
            <div className="space-y-2">
              <Label className="text-sm">Payment Type</Label>
              <Select
                value={paymentType}
                onValueChange={(v) => setPaymentType(v as 'FULL' | 'PARTIAL')}
              >
                <SelectTrigger className="w-full bg-input/30 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass border-border/50">
                  <SelectItem value="FULL">Full Payment</SelectItem>
                  <SelectItem value="PARTIAL">Partial Payment (Escrow)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Deposit Slider (if Partial) */}
            {paymentType === 'PARTIAL' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Deposit Percentage</Label>
                  <span className="neon-text-cyan font-bold text-sm">{depositPercent[0]}%</span>
                </div>
                <Slider
                  value={depositPercent}
                  onValueChange={setDepositPercent}
                  min={10}
                  max={90}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>10%</span>
                  <span>90%</span>
                </div>
              </div>
            )}

            <Separator className="bg-border/30" />

            {/* Total Summary */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Unit Price</span>
                <span>${effectivePrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Quantity</span>
                <span>{quantity.toLocaleString()}</span>
              </div>
              <Separator className="bg-border/20" />
              <div className="flex justify-between text-sm font-semibold">
                <span>Total Amount</span>
                <span className="neon-text-cyan">${totalAmount.toFixed(2)}</span>
              </div>
              {paymentType === 'PARTIAL' && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Deposit Now ({depositPercent[0]}%)</span>
                    <span className="neon-text-purple font-semibold">${depositAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Remaining on Delivery</span>
                    <span>${(totalAmount - depositAmount).toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Escrow Disclaimer */}
            {paymentType === 'PARTIAL' && (
              <Card className="glass border-0 bg-neon-purple/5">
                <CardContent className="p-3 flex gap-2">
                  <Shield className="h-4 w-4 text-neon-purple shrink-0 mt-0.5" />
                  <div className="text-[11px] text-muted-foreground leading-relaxed">
                    <span className="text-neon-purple font-semibold">Escrow Protection:</span>{' '}
                    Your deposit will be held in escrow and only released to the seller upon
                    confirmed delivery. This ensures your payment is secure throughout the transaction.
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => setShowOrderDialog(false)}
              className="text-muted-foreground"
            >
              Cancel
            </Button>
            <Button
              onClick={() => setShowOrderDialog(false)}
              className="glow-button gradient-cyan-purple-strong text-primary-foreground border-0 font-semibold"
            >
              <CheckCircle2 className="h-4 w-4" /> Confirm Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
