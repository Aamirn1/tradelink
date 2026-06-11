'use client';

import { motion } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  AlertTriangle,
  Lock,
  Unlock,
  DollarSign,
  CreditCard,
  CalendarDays,
  MessageSquare,
  Shield,
} from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/types';
import type { OrderStatus, OrderItem, Payment } from '@/types';

// ── Mock order detail data ─────────────────────────────────

const ORDER_FLOW: OrderStatus[] = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED'];

const MOCK_ITEMS: OrderItem[] = [
  { id: 'item-1', productId: 'p-1', productName: 'Wireless Bluetooth Earbuds', quantity: 100, unitPrice: 24.99, totalPrice: 2499, orderId: 'ord-3' },
  { id: 'item-2', productId: 'p-2', productName: 'USB-C Charging Cable (6ft)', quantity: 200, unitPrice: 3.50, totalPrice: 700, orderId: 'ord-3' },
  { id: 'item-3', productId: 'p-3', productName: 'Portable Power Bank 10000mAh', quantity: 50, unitPrice: 29.00, totalPrice: 1450, orderId: 'ord-3' },
  { id: 'item-4', productId: 'p-4', productName: 'Screen Protector Tempered Glass', quantity: 300, unitPrice: 1.50, totalPrice: 450, orderId: 'ord-3' },
  { id: 'item-5', productId: 'p-5', productName: 'Phone Stand Adjustable', quantity: 80, unitPrice: 13.13, totalPrice: 1050.4, orderId: 'ord-3' },
];

const MOCK_PAYMENTS: Payment[] = [
  { id: 'pay-1', amount: 3075, type: 'DEPOSIT', status: 'COMPLETED', method: 'Bank Transfer', transactionRef: 'TXN-20250225-A1B2', userId: 'ret-1', orderId: 'ord-3', createdAt: '2025-02-25T08:30:00Z' },
  { id: 'pay-2', amount: 3075, type: 'REMAINING', status: 'PENDING', method: 'Escrow', transactionRef: null, userId: 'ret-1', orderId: 'ord-3', createdAt: '2025-02-25T08:30:00Z' },
];

const MOCK_DETAIL = {
  id: 'ord-3',
  orderNumber: 'TL-2025-0403',
  status: 'SHIPPED' as OrderStatus,
  totalAmount: 6149.4,
  depositAmount: 3075,
  depositPercent: 50,
  lockedAmount: 3075,
  releasedAmount: 0,
  commissionRate: 0.03,
  commissionAmount: 184.48,
  paymentType: 'PARTIAL' as const,
  notes: 'Tracking: SF1234567890 — Estimated delivery Mar 5',
  buyerId: 'ret-1',
  sellerId: 'ws-2',
  counterpartyName: 'AutoParts Direct',
  createdAt: '2025-02-25T08:00:00Z',
  updatedAt: '2025-02-28T16:45:00Z',
};

// ── Badge helpers ──────────────────────────────────────────

function statusBadgeColor(status: OrderStatus): string {
  const map: Record<OrderStatus, string> = {
    PENDING: 'border-yellow-500/50 text-yellow-400 bg-yellow-500/10',
    PROCESSING: 'border-blue-500/50 text-blue-400 bg-blue-500/10',
    SHIPPED: 'border-purple-500/50 text-purple-400 bg-purple-500/10',
    DELIVERED: 'border-green-500/50 text-green-400 bg-green-500/10',
    DISPUTED: 'border-red-500/50 text-red-400 bg-red-500/10',
    CANCELLED: 'border-gray-500/50 text-gray-400 bg-gray-500/10',
    COMPLETED: 'border-neon-cyan/50 text-neon-cyan bg-neon-cyan/10',
  };
  return map[status];
}

// ── Animation ──────────────────────────────────────────────

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

// ── Component ──────────────────────────────────────────────

export function OrderDetailView() {
  const { user, setSelectedOrderId } = useAppStore();
  const isWholesaler = user?.role === 'WHOLESALER';

  const order = MOCK_DETAIL;
  const currentStep = ORDER_FLOW.indexOf(order.status);
  const netPayout = order.releasedAmount - order.commissionAmount;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 p-4 md:p-6 custom-scrollbar"
    >
      {/* ── Back + Header ─────────────────────────────── */}
      <motion.div variants={item}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedOrderId(null)}
          className="text-neon-cyan hover:text-neon-cyan/80 mb-4 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Orders
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-mono neon-text-cyan">
              {order.orderNumber}
            </h1>
            <Badge
              variant="outline"
              className={cn('text-sm', statusBadgeColor(order.status))}
            >
              {ORDER_STATUS_LABELS[order.status]}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            {new Date(order.createdAt).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </div>
        </div>
      </motion.div>

      {/* ── Progress Stepper ──────────────────────────── */}
      <motion.div variants={item}>
        <Card className="glass border-0">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between relative">
              {/* Background line */}
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-border/40" />
              {/* Progress line */}
              <div
                className="absolute top-5 left-0 h-0.5 gradient-cyan-purple-strong transition-all duration-500"
                style={{
                  width: `${Math.max(0, (currentStep / (ORDER_FLOW.length - 1)) * 100)}%`,
                }}
              />

              {ORDER_FLOW.map((step, idx) => {
                const isActive = idx <= currentStep;
                const isCurrent = idx === currentStep;
                const Icon =
                  step === 'PENDING'
                    ? Clock
                    : step === 'PROCESSING'
                    ? Package
                    : step === 'SHIPPED'
                    ? Truck
                    : step === 'DELIVERED'
                    ? CheckCircle2
                    : CheckCircle2;

                return (
                  <div
                    key={step}
                    className="flex flex-col items-center gap-2 relative z-10"
                  >
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300',
                        isCurrent
                          ? 'border-neon-cyan bg-neon-cyan/20 neon-glow-cyan'
                          : isActive
                          ? 'border-neon-cyan bg-neon-cyan/10'
                          : 'border-border bg-surface'
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-4 w-4',
                          isActive ? 'text-neon-cyan' : 'text-muted-foreground'
                        )}
                      />
                    </div>
                    <span
                      className={cn(
                        'text-[10px] md:text-xs font-medium whitespace-nowrap',
                        isCurrent ? 'text-neon-cyan neon-text-cyan' : isActive ? 'text-neon-cyan' : 'text-muted-foreground'
                      )}
                    >
                      {ORDER_STATUS_LABELS[step]}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Two column: Items + Payment ───────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Items Table ──────────────────────────────── */}
        <motion.div variants={item} className="lg:col-span-2">
          <Card className="glass border-0">
            <CardHeader>
              <CardTitle className="neon-text-cyan text-lg flex items-center gap-2">
                <Package className="h-5 w-5" /> Order Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto custom-scrollbar">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/40 hover:bg-transparent">
                      <TableHead className="text-muted-foreground">Product</TableHead>
                      <TableHead className="text-muted-foreground text-right">Qty</TableHead>
                      <TableHead className="text-muted-foreground text-right">Unit Price</TableHead>
                      <TableHead className="text-muted-foreground text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_ITEMS.map((oi) => (
                      <TableRow
                        key={oi.id}
                        className="border-border/20"
                      >
                        <TableCell className="font-medium text-sm">
                          {oi.productName}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {oi.quantity}
                        </TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">
                          ${oi.unitPrice.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-sm font-semibold">
                          ${oi.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Payment Summary ──────────────────────────── */}
        <motion.div variants={item} className="space-y-4">
          <Card className="glass border-0">
            <CardHeader>
              <CardTitle className="neon-text-purple text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5" /> Payment Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Amount</span>
                <span className="font-bold text-neon-cyan">${order.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <Separator className="bg-border/30" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Deposit Paid</span>
                <span className="font-semibold text-neon-purple">${order.depositAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Remaining (Locked)</span>
                <span className="font-semibold text-neon-orange">${order.lockedAmount.toLocaleString()}</span>
              </div>
              <Separator className="bg-border/30" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Commission (3%)</span>
                <span className="font-semibold text-neon-purple">-${order.commissionAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Net Payout</span>
                <span className="font-bold text-neon-green">${Math.max(0, netPayout).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </CardContent>
          </Card>

          {/* ── Escrow Status Card ─────────────────────── */}
          <Card className="glass border-0">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-neon-cyan" /> Escrow Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-neon-orange/5 border border-neon-orange/20">
                <Lock className="h-5 w-5 text-neon-orange shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Locked Amount</p>
                  <p className="text-lg font-bold text-neon-orange">
                    ${order.lockedAmount.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-neon-green/5 border border-neon-green/20">
                <Unlock className="h-5 w-5 text-neon-green shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Released Amount</p>
                  <p className="text-lg font-bold text-neon-green">
                    ${order.releasedAmount.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-neon-purple/5 border border-neon-purple/20">
                <DollarSign className="h-5 w-5 text-neon-purple shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Commission</p>
                  <p className="text-lg font-bold text-neon-purple">
                    ${order.commissionAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Action Buttons ────────────────────────────── */}
      <motion.div variants={item}>
        <Card className="glass border-0">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-wrap items-center gap-3">
              {isWholesaler && order.status === 'PENDING' && (
                <>
                  <Button className="glow-button gradient-cyan-purple-strong text-primary-foreground border-0 font-semibold">
                    <Package className="h-4 w-4 mr-2" /> Mark as Processing
                  </Button>
                  <Button className="glow-button gradient-cyan-purple-strong text-primary-foreground border-0 font-semibold">
                    <Truck className="h-4 w-4 mr-2" /> Mark as Shipped
                  </Button>
                </>
              )}
              {!isWholesaler && order.status === 'SHIPPED' && (
                <>
                  <Button className="glow-button gradient-cyan-purple-strong text-primary-foreground border-0 font-semibold">
                    <CheckCircle2 className="h-4 w-4 mr-2" /> Confirm Delivery
                  </Button>
                  <Button
                    variant="outline"
                    className="border-red-500/50 text-red-400 hover:bg-red-500/10 font-semibold"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" /> Raise Dispute
                  </Button>
                </>
              )}
              {!isWholesaler && order.status === 'PENDING' && (
                <p className="text-sm text-muted-foreground">
                  Waiting for the seller to process your order...
                </p>
              )}
              {order.status === 'COMPLETED' && (
                <p className="text-sm text-neon-green flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> This order has been completed successfully.
                </p>
              )}
              {order.status === 'DISPUTED' && (
                <p className="text-sm text-red-400 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" /> This order is currently under dispute resolution.
                </p>
              )}
              {order.status === 'DELIVERED' && !isWholesaler && (
                <Button className="glow-button gradient-cyan-purple-strong text-primary-foreground border-0 font-semibold">
                  <CheckCircle2 className="h-4 w-4 mr-2" /> Confirm & Complete Order
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Notes + Payment History ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Notes ────────────────────────────────────── */}
        <motion.div variants={item}>
          <Card className="glass border-0 h-full">
            <CardHeader>
              <CardTitle className="neon-text-cyan text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5" /> Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.notes ? (
                <p className="text-sm text-foreground/80 leading-relaxed bg-surface p-4 rounded-lg border border-border/30">
                  {order.notes}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground italic">No notes for this order.</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Payment History Timeline ─────────────────── */}
        <motion.div variants={item}>
          <Card className="glass border-0 h-full">
            <CardHeader>
              <CardTitle className="neon-text-purple text-lg flex items-center gap-2">
                <CreditCard className="h-5 w-5" /> Payment History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {MOCK_PAYMENTS.map((payment, idx) => (
                  <div key={payment.id} className="relative flex gap-4">
                    {/* Timeline line */}
                    {idx < MOCK_PAYMENTS.length - 1 && (
                      <div className="absolute left-[15px] top-10 bottom-0 w-px bg-border/40" />
                    )}
                    {/* Dot */}
                    <div
                      className={cn(
                        'mt-1 h-[30px] w-[30px] shrink-0 rounded-full flex items-center justify-center border-2',
                        payment.status === 'COMPLETED'
                          ? 'border-neon-green bg-neon-green/10'
                          : 'border-neon-orange bg-neon-orange/10'
                      )}
                    >
                      {payment.status === 'COMPLETED' ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-neon-green" />
                      ) : (
                        <Clock className="h-3.5 w-3.5 text-neon-orange" />
                      )}
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium">
                          {payment.type === 'DEPOSIT' ? 'Deposit Payment' : 'Remaining Payment'}
                        </p>
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[10px]',
                            payment.status === 'COMPLETED'
                              ? 'border-neon-green/50 text-neon-green'
                              : 'border-neon-orange/50 text-neon-orange'
                          )}
                        >
                          {payment.status}
                        </Badge>
                      </div>
                      <p className="text-lg font-bold text-neon-cyan">
                        ${payment.amount.toLocaleString()}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <CreditCard className="h-3 w-3" /> {payment.method}
                        </span>
                        {payment.transactionRef && (
                          <span className="font-mono">
                            Ref: {payment.transactionRef}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {new Date(payment.createdAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
