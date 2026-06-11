'use client';

import { motion } from 'framer-motion';
import {
  FileText,
  Clock,
  Wallet,
  Bookmark,
  PlusCircle,
  Store,
  MessageSquare,
  CalendarDays,
  Hash,
  Tag,
  Layers,
  Image as ImageIcon,
  Quote,
} from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/types';
import type { OrderStatus } from '@/types';

// ── Mock data ────────────────────────────────────────────────

const stats = [
  { label: 'Active RFQs', value: '7', icon: FileText, color: 'text-neon-cyan' },
  { label: 'Pending Orders', value: '5', icon: Clock, color: 'text-neon-purple' },
  { label: 'Total Spent', value: '$23,740', icon: Wallet, color: 'text-neon-orange' },
  { label: 'Saved Suppliers', value: '18', icon: Bookmark, color: 'text-neon-green' },
];

const recentOrders = [
  { id: 'ORD-2048', seller: 'GlobalTech Wholesale', amount: '$4,320', status: 'SHIPPED' as OrderStatus, date: '2025-03-01' },
  { id: 'ORD-2047', seller: 'TextileKing Ltd.', amount: '$1,890', status: 'PROCESSING' as OrderStatus, date: '2025-02-28' },
  { id: 'ORD-2046', seller: 'FreshSource Co.', amount: '$720', status: 'PENDING' as OrderStatus, date: '2025-02-27' },
  { id: 'ORD-2045', seller: 'AutoParts Direct', amount: '$6,150', status: 'DELIVERED' as OrderStatus, date: '2025-02-26' },
  { id: 'ORD-2044', seller: 'EcoGoods Inc.', amount: '$2,340', status: 'COMPLETED' as OrderStatus, date: '2025-02-25' },
];

const activeRfqs = [
  { id: '1', title: 'Bluetooth Speakers Bulk Order', category: 'Electronics', quantity: 2000, unit: 'pcs', deadline: '2025-03-15', quotes: 5 },
  { id: '2', title: 'Organic Cotton Fabric', category: 'Clothing & Textiles', quantity: 5000, unit: 'meters', deadline: '2025-03-10', quotes: 3 },
  { id: '3', title: 'Industrial LED Panels', category: 'Electronics', quantity: 500, unit: 'units', deadline: '2025-03-20', quotes: 7 },
  { id: '4', title: 'Reusable Shopping Bags', category: 'Home & Garden', quantity: 10000, unit: 'pcs', deadline: '2025-04-01', quotes: 2 },
];

const recommendedProducts = [
  { id: '10', name: 'Smart Home Hub', price: 42.00, moq: 50, seller: 'GlobalTech Wholesale', category: 'Electronics', stock: 1200 },
  { id: '11', name: 'Premium Denim Fabric', price: 12.50, moq: 300, seller: 'TextileKing Ltd.', category: 'Clothing & Textiles', stock: 8500 },
  { id: '12', name: 'Solar Garden Lights', price: 8.99, moq: 200, seller: 'EcoGoods Inc.', category: 'Home & Garden', stock: 6000 },
  { id: '13', name: 'Car Floor Mats Set', price: 15.00, moq: 100, seller: 'AutoParts Direct', category: 'Automotive Parts', stock: 3200 },
];

// ── Animation variants ───────────────────────────────────────

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

// ── Component ────────────────────────────────────────────────

export function RetailerDashboard() {
  const { user, setCurrentView, setSelectedProductId, setSelectedRfqId } = useAppStore();
  const userName = user?.name ?? 'Retailer';

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 p-4 md:p-6 custom-scrollbar"
    >
      {/* ── Welcome Banner ──────────────────────────────── */}
      <motion.div variants={item}>
        <Card className="glass overflow-hidden border-0">
          <div className="gradient-cyan-purple-strong p-6 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold text-primary-foreground">
              Welcome back, <span className="drop-shadow-lg">{userName}</span> 👋
            </h1>
            <p className="mt-1 text-primary-foreground/80 text-sm md:text-base">
              Find the best wholesale deals and manage your sourcing pipeline.
            </p>
          </div>
        </Card>
      </motion.div>

      {/* ── Stats Row ───────────────────────────────────── */}
      <motion.div
        variants={container}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((stat) => (
          <motion.div key={stat.label} variants={item}>
            <Card
              className={cn(
                'glass border-0 transition-all duration-300',
                'hover:neon-border-cyan hover:scale-[1.02]'
              )}
            >
              <CardContent className="p-4 md:p-6 flex items-center gap-4">
                <div
                  className={cn(
                    'flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-surface',
                    stat.color
                  )}
                >
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-muted-foreground text-xs md:text-sm truncate">
                    {stat.label}
                  </p>
                  <p className={cn('text-xl md:text-2xl font-bold neon-text-cyan', stat.color)}>
                    {stat.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Quick Actions ───────────────────────────────── */}
      <motion.div variants={item}>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => setCurrentView('rfq-board')}
            className="glow-button gradient-cyan-purple-strong text-primary-foreground border-0 font-semibold"
          >
            <PlusCircle className="h-4 w-4" /> Post RFQ
          </Button>
          <Button
            onClick={() => setCurrentView('marketplace')}
            variant="outline"
            className="neon-border-cyan hover:neon-glow-cyan transition-all"
          >
            <Store className="h-4 w-4" /> Browse Marketplace
          </Button>
          <Button
            onClick={() => setCurrentView('chat')}
            variant="outline"
            className="neon-border-purple hover:neon-glow-purple transition-all"
          >
            <MessageSquare className="h-4 w-4" /> Messages
          </Button>
        </div>
      </motion.div>

      {/* ── Recent Orders ───────────────────────────────── */}
      <motion.div variants={item}>
        <Card className="glass border-0">
          <CardHeader>
            <CardTitle className="neon-text-cyan text-lg">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-80 overflow-y-auto custom-scrollbar">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/40 hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Order #</TableHead>
                    <TableHead className="text-muted-foreground">Seller</TableHead>
                    <TableHead className="text-muted-foreground">Amount</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground hidden sm:table-cell">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow
                      key={order.id}
                      className="border-border/20 cursor-pointer hover:bg-surface-hover"
                      onClick={() => setCurrentView('orders')}
                    >
                      <TableCell className="font-mono text-neon-cyan text-sm">
                        {order.id}
                      </TableCell>
                      <TableCell className="text-sm">{order.seller}</TableCell>
                      <TableCell className="font-semibold text-sm">{order.amount}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-xs',
                            ORDER_STATUS_COLORS[order.status]
                          )}
                        >
                          {ORDER_STATUS_LABELS[order.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm hidden sm:table-cell">
                        {order.date}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Active RFQs ─────────────────────────────────── */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold neon-text-purple">Active RFQs</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentView('rfq-board')}
            className="text-neon-cyan hover:text-neon-cyan/80"
          >
            View All →
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeRfqs.map((rfq) => (
            <motion.div key={rfq.id} variants={item}>
              <Card
                className={cn(
                  'card-3d glass border-0 cursor-pointer transition-all duration-300',
                  'hover:neon-border-purple'
                )}
                onClick={() => setSelectedRfqId(rfq.id)}
              >
                <CardContent className="p-4 md:p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-sm">{rfq.title}</h3>
                    <Badge variant="secondary" className="text-[10px] shrink-0">
                      {rfq.category}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Layers className="h-3 w-3 text-neon-cyan" />
                      <span>{rfq.quantity.toLocaleString()} {rfq.unit}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="h-3 w-3 text-neon-orange" />
                      <span>{rfq.deadline}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <Quote className="h-3 w-3 text-neon-purple" />
                    <span className="text-neon-purple font-semibold">{rfq.quotes} quotes</span>
                    <span className="text-muted-foreground">received</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Recommended Products ────────────────────────── */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold neon-text-cyan">Recommended Products</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentView('marketplace')}
            className="text-neon-cyan hover:text-neon-cyan/80"
          >
            Browse All →
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recommendedProducts.map((product) => (
            <motion.div key={product.id} variants={item}>
              <Card
                className={cn(
                  'card-3d glass border-0 cursor-pointer overflow-hidden'
                )}
                onClick={() => setSelectedProductId(product.id)}
              >
                {/* Image placeholder */}
                <div className="relative h-36 gradient-cyan-purple flex items-center justify-center">
                  <ImageIcon className="h-10 w-10 text-primary-foreground/40" />
                  <Badge
                    className="absolute top-2 right-2 text-[10px]"
                    variant="secondary"
                  >
                    {product.category}
                  </Badge>
                </div>

                <CardContent className="p-4 space-y-2">
                  <h3 className="font-semibold text-sm truncate">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="neon-text-cyan text-lg font-bold">
                      ${product.price.toFixed(2)}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Layers className="h-3 w-3" /> {product.stock.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Tag className="h-3 w-3" /> MOQ: {product.moq}
                    </span>
                    <span className="flex items-center gap-1">
                      <Hash className="h-3 w-3" /> {product.seller}
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
