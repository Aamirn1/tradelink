'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  DollarSign,
  ArrowRight,
  Lock,
  Unlock,
  CreditCard,
  Search,
} from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
} from '@/types';
import type { OrderStatus, PaymentType, Order } from '@/types';

// ── Order status flow ──────────────────────────────────────

const ORDER_FLOW: OrderStatus[] = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED'];

function getStatusStep(status: OrderStatus): number {
  if (status === 'DISPUTED') return 2;
  if (status === 'CANCELLED') return -1;
  return ORDER_FLOW.indexOf(status);
}

// ── Mock data ──────────────────────────────────────────────

const MOCK_ORDERS: (Order & { counterpartyName: string; itemCount: number })[] = [
  {
    id: 'ord-1',
    orderNumber: 'TL-2025-0401',
    status: 'PENDING',
    totalAmount: 4320,
    depositAmount: 2160,
    depositPercent: 50,
    lockedAmount: 2160,
    releasedAmount: 0,
    commissionRate: 0.03,
    commissionAmount: 129.6,
    paymentType: 'PARTIAL',
    notes: 'Rush order — please expedite processing',
    buyerId: 'ret-1',
    sellerId: 'ws-1',
    counterpartyName: 'GlobalTech Wholesale',
    itemCount: 3,
    createdAt: '2025-03-01T10:30:00Z',
    updatedAt: '2025-03-01T10:30:00Z',
  },
  {
    id: 'ord-2',
    orderNumber: 'TL-2025-0402',
    status: 'PROCESSING',
    totalAmount: 1890,
    depositAmount: 945,
    depositPercent: 50,
    lockedAmount: 945,
    releasedAmount: 0,
    commissionRate: 0.03,
    commissionAmount: 56.7,
    paymentType: 'PARTIAL',
    notes: null,
    buyerId: 'ret-2',
    sellerId: 'ws-1',
    counterpartyName: 'TextileKing Ltd.',
    itemCount: 1,
    createdAt: '2025-02-28T14:15:00Z',
    updatedAt: '2025-03-01T09:00:00Z',
  },
  {
    id: 'ord-3',
    orderNumber: 'TL-2025-0403',
    status: 'SHIPPED',
    totalAmount: 6150,
    depositAmount: 3075,
    depositPercent: 50,
    lockedAmount: 3075,
    releasedAmount: 0,
    commissionRate: 0.03,
    commissionAmount: 184.5,
    paymentType: 'PARTIAL',
    notes: 'Tracking: SF1234567890',
    buyerId: 'ret-1',
    sellerId: 'ws-2',
    counterpartyName: 'AutoParts Direct',
    itemCount: 5,
    createdAt: '2025-02-25T08:00:00Z',
    updatedAt: '2025-02-28T16:45:00Z',
  },
  {
    id: 'ord-4',
    orderNumber: 'TL-2025-0404',
    status: 'DELIVERED',
    totalAmount: 2340,
    depositAmount: 2340,
    depositPercent: 100,
    lockedAmount: 0,
    releasedAmount: 2340,
    commissionRate: 0.03,
    commissionAmount: 70.2,
    paymentType: 'FULL',
    notes: null,
    buyerId: 'ret-3',
    sellerId: 'ws-1',
    counterpartyName: 'EcoGoods Inc.',
    itemCount: 2,
    createdAt: '2025-02-20T11:00:00Z',
    updatedAt: '2025-03-01T10:00:00Z',
  },
  {
    id: 'ord-5',
    orderNumber: 'TL-2025-0405',
    status: 'COMPLETED',
    totalAmount: 9800,
    depositAmount: 9800,
    depositPercent: 100,
    lockedAmount: 0,
    releasedAmount: 9800,
    commissionRate: 0.03,
    commissionAmount: 294,
    paymentType: 'FULL',
    notes: 'Repeat customer — VIP terms',
    buyerId: 'ret-1',
    sellerId: 'ws-3',
    counterpartyName: 'FreshSource Co.',
    itemCount: 8,
    createdAt: '2025-02-10T09:30:00Z',
    updatedAt: '2025-02-27T14:20:00Z',
  },
  {
    id: 'ord-6',
    orderNumber: 'TL-2025-0406',
    status: 'DISPUTED',
    totalAmount: 3500,
    depositAmount: 1750,
    depositPercent: 50,
    lockedAmount: 1750,
    releasedAmount: 0,
    commissionRate: 0.03,
    commissionAmount: 105,
    paymentType: 'PARTIAL',
    notes: 'Buyer claims items received are not as described',
    buyerId: 'ret-4',
    sellerId: 'ws-1',
    counterpartyName: 'UrbanStyle Ltd.',
    itemCount: 4,
    createdAt: '2025-02-18T16:00:00Z',
    updatedAt: '2025-03-02T08:30:00Z',
  },
  {
    id: 'ord-7',
    orderNumber: 'TL-2025-0407',
    status: 'PENDING',
    totalAmount: 720,
    depositAmount: 720,
    depositPercent: 100,
    lockedAmount: 720,
    releasedAmount: 0,
    commissionRate: 0.03,
    commissionAmount: 21.6,
    paymentType: 'FULL',
    notes: null,
    buyerId: 'ret-2',
    sellerId: 'ws-2',
    counterpartyName: 'FreshSource Co.',
    itemCount: 1,
    createdAt: '2025-03-02T07:45:00Z',
    updatedAt: '2025-03-02T07:45:00Z',
  },
  {
    id: 'ord-8',
    orderNumber: 'TL-2025-0408',
    status: 'SHIPPED',
    totalAmount: 12400,
    depositAmount: 6200,
    depositPercent: 50,
    lockedAmount: 6200,
    releasedAmount: 0,
    commissionRate: 0.03,
    commissionAmount: 372,
    paymentType: 'PARTIAL',
    notes: 'Partial shipment — 3 of 5 items shipped',
    buyerId: 'ret-3',
    sellerId: 'ws-1',
    counterpartyName: 'GlobalTech Wholesale',
    itemCount: 5,
    createdAt: '2025-02-22T13:20:00Z',
    updatedAt: '2025-03-01T11:15:00Z',
  },
];

// ── Badge color helper ─────────────────────────────────────

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

function paymentBadgeColor(pt: PaymentType): string {
  return pt === 'FULL'
    ? 'border-neon-green/50 text-neon-green bg-neon-green/10'
    : 'border-neon-orange/50 text-neon-orange bg-neon-orange/10';
}

// ── Animation variants ─────────────────────────────────────

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

// ── Filter tabs ────────────────────────────────────────────

type FilterKey = 'ALL' | 'PENDING' | 'SHIPPED' | 'COMPLETED' | 'DISPUTED';

const FILTER_TABS: { key: FilterKey; label: string }[] = [
  { key: 'ALL', label: 'All Orders' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'SHIPPED', label: 'Shipped' },
  { key: 'COMPLETED', label: 'Completed' },
  { key: 'DISPUTED', label: 'Disputed' },
];

// ── Component ──────────────────────────────────────────────

export function OrdersView() {
  const { user, setSelectedOrderId } = useAppStore();
  const [activeFilter, setActiveFilter] = useState<FilterKey>('ALL');
  const [search, setSearch] = useState('');

  const isWholesaler = user?.role === 'WHOLESALER';

  const filtered = MOCK_ORDERS.filter((o) => {
    if (activeFilter !== 'ALL' && o.status !== activeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.counterpartyName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 p-4 md:p-6 custom-scrollbar"
    >
      {/* ── Header ────────────────────────────────────── */}
      <motion.div variants={item}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold neon-text-cyan">Orders</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage and track your wholesale orders
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-surface border-border/50 focus:border-neon-cyan focus:ring-neon-cyan/20"
            />
          </div>
        </div>
      </motion.div>

      {/* ── Filter Tabs ───────────────────────────────── */}
      <motion.div variants={item}>
        <Tabs
          value={activeFilter}
          onValueChange={(v) => setActiveFilter(v as FilterKey)}
        >
          <TabsList className="bg-surface border border-border/50 h-auto flex-wrap gap-1 p-1">
            {FILTER_TABS.map((tab) => {
              const count =
                tab.key === 'ALL'
                  ? MOCK_ORDERS.length
                  : MOCK_ORDERS.filter((o) => o.status === tab.key).length;
              return (
                <TabsTrigger
                  key={tab.key}
                  value={tab.key}
                  className="data-[state=active]:gradient-cyan-purple-strong data-[state=active]:text-primary-foreground text-xs sm:text-sm px-3"
                >
                  {tab.label}
                  <span className="ml-1.5 text-[10px] opacity-70">({count})</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </motion.div>

      {/* ── Order Cards ───────────────────────────────── */}
      <motion.div variants={container} className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16"
            >
              <Package className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
              <p className="text-muted-foreground">No orders found</p>
            </motion.div>
          ) : (
            filtered.map((order) => {
              const step = getStatusStep(order.status);
              const progressPct =
                step < 0 ? 0 : Math.round((step / (ORDER_FLOW.length - 1)) * 100);

              return (
                <motion.div
                  key={order.id}
                  variants={item}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                >
                  <Card
                    className={cn(
                      'glass border-0 cursor-pointer transition-all duration-300',
                      'hover:neon-border-cyan hover:scale-[1.005]'
                    )}
                    onClick={() => setSelectedOrderId(order.id)}
                  >
                    <CardContent className="p-4 md:p-6 space-y-4">
                      {/* ─ Top row: order #, status, date ─ */}
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-neon-cyan font-semibold text-sm md:text-base">
                            {order.orderNumber}
                          </span>
                          <Badge
                            variant="outline"
                            className={cn('text-xs', statusBadgeColor(order.status))}
                          >
                            {ORDER_STATUS_LABELS[order.status]}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={cn('text-xs', paymentBadgeColor(order.paymentType))}
                          >
                            <CreditCard className="h-3 w-3 mr-1" />
                            {order.paymentType === 'FULL' ? 'Full Payment' : 'Partial (Escrow)'}
                          </Badge>
                        </div>
                        <span className="text-muted-foreground text-xs">
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>

                      {/* ─ Amount & counterparty row ─ */}
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-6">
                          <div>
                            <p className="text-xs text-muted-foreground">Total Amount</p>
                            <p className="text-lg font-bold neon-text-cyan">
                              ${order.totalAmount.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Deposit</p>
                            <p className="text-sm font-semibold text-neon-purple">
                              ${order.depositAmount.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            {isWholesaler ? 'Buyer' : 'Seller'}
                          </p>
                          <p className="text-sm font-medium">{order.counterpartyName}</p>
                          <p className="text-xs text-muted-foreground">
                            {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}
                          </p>
                        </div>
                      </div>

                      {/* ─ Progress bar ─ */}
                      {order.status !== 'CANCELLED' && (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                            {ORDER_FLOW.map((s, i) => (
                              <span
                                key={s}
                                className={cn(
                                  i <= step
                                    ? 'text-neon-cyan font-semibold'
                                    : ''
                                )}
                              >
                                {ORDER_STATUS_LABELS[s]}
                              </span>
                            ))}
                          </div>
                          <div className="relative">
                            <Progress
                              value={progressPct}
                              className="h-2 bg-surface [&>[data-slot=indicator]]:gradient-cyan-purple-strong"
                            />
                          </div>
                        </div>
                      )}

                      {/* ─ Escrow status ─ */}
                      {order.lockedAmount > 0 && (
                        <div className="flex items-center gap-4 p-3 rounded-lg bg-neon-orange/5 border border-neon-orange/20">
                          <Lock className="h-4 w-4 text-neon-orange shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground">Escrow Locked</p>
                            <p className="text-sm font-semibold text-neon-orange">
                              ${order.lockedAmount.toLocaleString()}
                            </p>
                          </div>
                          {order.releasedAmount > 0 && (
                            <div className="flex items-center gap-1.5">
                              <Unlock className="h-4 w-4 text-neon-green shrink-0" />
                              <div>
                                <p className="text-xs text-muted-foreground">Released</p>
                                <p className="text-sm font-semibold text-neon-green">
                                  ${order.releasedAmount.toLocaleString()}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      {order.lockedAmount === 0 && order.releasedAmount > 0 && (
                        <div className="flex items-center gap-4 p-3 rounded-lg bg-neon-green/5 border border-neon-green/20">
                          <Unlock className="h-4 w-4 text-neon-green shrink-0" />
                          <div>
                            <p className="text-xs text-muted-foreground">Escrow Fully Released</p>
                            <p className="text-sm font-semibold text-neon-green">
                              ${order.releasedAmount.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* ─ Action buttons ─ */}
                      <div className="flex items-center gap-2 pt-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-neon-cyan hover:text-neon-cyan/80 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrderId(order.id);
                          }}
                        >
                          View Details <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>

                        {/* Wholesaler actions */}
                        {isWholesaler && order.status === 'PENDING' && (
                          <Button
                            size="sm"
                            className="glow-button gradient-cyan-purple-strong text-primary-foreground border-0 text-xs"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Truck className="h-3 w-3 mr-1" /> Mark as Shipped
                          </Button>
                        )}

                        {/* Retailer actions */}
                        {!isWholesaler && order.status === 'SHIPPED' && (
                          <>
                            <Button
                              size="sm"
                              className="glow-button gradient-cyan-purple-strong text-primary-foreground border-0 text-xs"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1" /> Confirm Delivery
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-500/50 text-red-400 hover:bg-red-500/10 text-xs"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <AlertTriangle className="h-3 w-3 mr-1" /> Dispute
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
