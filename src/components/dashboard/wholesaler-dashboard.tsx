'use client';

import { motion } from 'framer-motion';
import {
  Package,
  ListChecks,
  Clock,
  DollarSign,
  Plus,
  FileText,
  MessageSquare,
  Tag,
  Layers,
  Image as ImageIcon,
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
  { label: 'Total Products', value: '128', icon: Package, color: 'text-neon-cyan' },
  { label: 'Active Listings', value: '96', icon: ListChecks, color: 'text-neon-purple' },
  { label: 'Pending Orders', value: '14', icon: Clock, color: 'text-neon-orange' },
  { label: 'Total Revenue', value: '$48,250', icon: DollarSign, color: 'text-neon-green' },
];

const recentOrders = [
  { id: 'ORD-1024', buyer: 'TechMart Inc.', amount: '$2,450', status: 'PROCESSING' as OrderStatus, date: '2025-03-01' },
  { id: 'ORD-1023', buyer: 'GreenLeaf Co.', amount: '$890', status: 'PENDING' as OrderStatus, date: '2025-02-28' },
  { id: 'ORD-1022', buyer: 'UrbanStyle Ltd.', amount: '$3,120', status: 'SHIPPED' as OrderStatus, date: '2025-02-27' },
  { id: 'ORD-1021', buyer: 'FreshFoods LLC', amount: '$1,560', status: 'COMPLETED' as OrderStatus, date: '2025-02-26' },
  { id: 'ORD-1020', buyer: 'AutoParts Hub', amount: '$4,780', status: 'DELIVERED' as OrderStatus, date: '2025-02-25' },
];

const products = [
  { id: '1', name: 'Wireless Bluetooth Earbuds', price: 24.99, stock: 3200, moq: 100, category: 'Electronics' },
  { id: '2', name: 'Organic Cotton T-Shirts', price: 8.50, stock: 5400, moq: 200, category: 'Clothing & Textiles' },
  { id: '3', name: 'Stainless Steel Water Bottles', price: 5.75, stock: 8200, moq: 500, category: 'Home & Garden' },
  { id: '4', name: 'LED Desk Lamps', price: 18.00, stock: 1600, moq: 50, category: 'Electronics' },
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

export function WholesalerDashboard() {
  const { user, setCurrentView, setSelectedProductId } = useAppStore();
  const userName = user?.name ?? 'Wholesaler';

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
              Here&apos;s what&apos;s happening with your wholesale business today.
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
            onClick={() => setCurrentView('marketplace')}
            className="glow-button gradient-cyan-purple-strong text-primary-foreground border-0 font-semibold"
          >
            <Plus className="h-4 w-4" /> Add Product
          </Button>
          <Button
            onClick={() => setCurrentView('rfq-board')}
            variant="outline"
            className="neon-border-cyan hover:neon-glow-cyan transition-all"
          >
            <FileText className="h-4 w-4" /> View RFQs
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
                    <TableHead className="text-muted-foreground">Buyer</TableHead>
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
                      onClick={() => {
                        setSelectedProductId(null);
                        setCurrentView('orders');
                      }}
                    >
                      <TableCell className="font-mono text-neon-cyan text-sm">
                        {order.id}
                      </TableCell>
                      <TableCell className="text-sm">{order.buyer}</TableCell>
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

      {/* ── Products Grid ───────────────────────────────── */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold neon-text-purple">Your Products</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentView('marketplace')}
            className="text-neon-cyan hover:text-neon-cyan/80"
          >
            View All →
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map((product) => (
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
                      <Layers className="h-3 w-3" /> {product.stock.toLocaleString()} in stock
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Tag className="h-3 w-3" />
                    <span>MOQ: {product.moq} units</span>
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
