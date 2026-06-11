'use client';

import { motion } from 'framer-motion';
import {
  Shield,
  Users,
  Warehouse,
  ShoppingBag,
  Receipt,
  AlertTriangle,
  Ban,
  PauseCircle,
  Activity,
  Clock,
  UserPlus,
  FileText,
  Package,
  CreditCard,
  Gavel,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
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
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart';

// ── Mock data ────────────────────────────────────────────────

const stats = [
  { label: 'Total Users', value: '1,247', icon: Users, color: 'text-neon-cyan' },
  { label: 'Wholesalers', value: '342', icon: Warehouse, color: 'text-neon-purple' },
  { label: 'Retailers', value: '905', icon: ShoppingBag, color: 'text-neon-orange' },
  { label: 'Total Orders', value: '3,891', icon: Receipt, color: 'text-neon-green' },
  { label: 'Platform Revenue', value: '$24,580', icon: CreditCard, color: 'text-neon-cyan' },
  { label: 'Active Disputes', value: '8', icon: AlertTriangle, color: 'text-neon-pink' },
];

const revenueData = [
  { month: 'Sep', revenue: 12400 },
  { month: 'Oct', revenue: 18200 },
  { month: 'Nov', revenue: 15800 },
  { month: 'Dec', revenue: 22400 },
  { month: 'Jan', revenue: 19800 },
  { month: 'Feb', revenue: 24580 },
];

const categoryData = [
  { category: 'Electronics', orders: 890 },
  { category: 'Clothing', orders: 720 },
  { category: 'Food', orders: 540 },
  { category: 'Construction', orders: 410 },
  { category: 'Automotive', orders: 380 },
  { category: 'Home', orders: 310 },
];

const userDistribution = [
  { role: 'Wholesalers', count: 342 },
  { role: 'Retailers', count: 905 },
];

const recentActivity = [
  { id: '1', action: 'New wholesaler registered', user: 'TechSupply Co.', time: '2 min ago', icon: UserPlus, color: 'text-neon-green' },
  { id: '2', action: 'Order #ORD-2048 disputed', user: 'FreshFoods LLC', time: '15 min ago', icon: Gavel, color: 'text-neon-pink' },
  { id: '3', action: 'New RFQ posted', user: 'UrbanStyle Ltd.', time: '1 hr ago', icon: FileText, color: 'text-neon-cyan' },
  { id: '4', action: 'Product listing approved', user: 'GlobalTech Wholesale', time: '2 hrs ago', icon: Package, color: 'text-neon-purple' },
  { id: '5', action: 'Payment processed', user: 'AutoParts Hub', time: '3 hrs ago', icon: CreditCard, color: 'text-neon-orange' },
  { id: '6', action: 'User account suspended', user: 'BadActor99', time: '5 hrs ago', icon: Ban, color: 'text-neon-pink' },
];

const users = [
  { id: '1', name: 'John Smith', email: 'john@techsupply.com', role: 'WHOLESALER' as const, status: 'active' },
  { id: '2', name: 'Sarah Chen', email: 'sarah@greenleaf.co', role: 'RETAILER' as const, status: 'active' },
  { id: '3', name: 'Mike Johnson', email: 'mike@urbanstyle.com', role: 'WHOLESALER' as const, status: 'suspended' },
  { id: '4', name: 'Lisa Wang', email: 'lisa@freshfoods.com', role: 'RETAILER' as const, status: 'active' },
  { id: '5', name: 'Tom Brown', email: 'tom@badactor.com', role: 'RETAILER' as const, status: 'banned' },
  { id: '6', name: 'Amy Davis', email: 'amy@ecogoods.com', role: 'WHOLESALER' as const, status: 'active' },
];

// ── Chart configs ────────────────────────────────────────────

const revenueChartConfig = {
  revenue: {
    label: 'Revenue',
    color: '#00fff2',
  },
} satisfies ChartConfig;

const categoryChartConfig = {
  orders: {
    label: 'Orders',
    color: '#b44aff',
  },
} satisfies ChartConfig;

const pieChartConfig = {
  Wholesalers: {
    label: 'Wholesalers',
    color: '#b44aff',
  },
  Retailers: {
    label: 'Retailers',
    color: '#00fff2',
  },
} satisfies ChartConfig;

const PIE_COLORS = ['#b44aff', '#00fff2'];

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

export function AdminDashboard() {
  const { setCurrentView } = useAppStore();

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 p-4 md:p-6 custom-scrollbar"
    >
      {/* ── Admin Banner ────────────────────────────────── */}
      <motion.div variants={item}>
        <Card className="glass overflow-hidden border-0">
          <div className="gradient-cyan-purple-strong p-6 md:p-8 flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary-foreground/20">
              <Shield className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-primary-foreground">
                Admin Control Center
              </h1>
              <p className="mt-1 text-primary-foreground/80 text-sm md:text-base">
                Monitor platform health, manage users, and oversee operations.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* ── Stats Row ───────────────────────────────────── */}
      <motion.div
        variants={container}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
      >
        {stats.map((stat) => (
          <motion.div key={stat.label} variants={item}>
            <Card
              className={cn(
                'glass border-0 transition-all duration-300',
                'hover:neon-border-cyan hover:scale-[1.02]'
              )}
            >
              <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg bg-surface',
                    stat.color
                  )}
                >
                  <stat.icon className="h-5 w-5" />
                </div>
                <p className={cn('text-lg md:text-xl font-bold neon-text-cyan', stat.color)}>
                  {stat.value}
                </p>
                <p className="text-muted-foreground text-[11px] md:text-xs leading-tight">
                  {stat.label}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Charts Section ──────────────────────────────── */}
      <motion.div variants={item}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Revenue Trend Line Chart */}
          <Card className="glass border-0 lg:col-span-2">
            <CardHeader>
              <CardTitle className="neon-text-cyan text-lg">Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={revenueChartConfig} className="h-[260px] w-full">
                <LineChart data={revenueData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,255,242,0.08)" />
                  <XAxis
                    dataKey="month"
                    stroke="rgba(0,255,242,0.4)"
                    tick={{ fill: 'rgba(0,255,242,0.6)', fontSize: 12 }}
                  />
                  <YAxis
                    stroke="rgba(0,255,242,0.4)"
                    tick={{ fill: 'rgba(0,255,242,0.6)', fontSize: 12 }}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#00fff2"
                    strokeWidth={2.5}
                    dot={{ fill: '#00fff2', r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: '#00fff2', stroke: '#b44aff', strokeWidth: 2 }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* User Distribution Pie Chart */}
          <Card className="glass border-0">
            <CardHeader>
              <CardTitle className="neon-text-purple text-lg">User Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={pieChartConfig} className="h-[260px] w-full">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={userDistribution}
                    dataKey="count"
                    nameKey="role"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={45}
                    strokeWidth={2}
                    stroke="rgba(18,18,40,0.8)"
                  >
                    {userDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartLegend content={<ChartLegendContent />} />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Orders by Category Bar Chart */}
      <motion.div variants={item}>
        <Card className="glass border-0">
          <CardHeader>
            <CardTitle className="neon-text-cyan text-lg">Orders by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={categoryChartConfig} className="h-[240px] w-full">
              <BarChart data={categoryData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(180,74,255,0.08)" />
                <XAxis
                  dataKey="category"
                  stroke="rgba(180,74,255,0.4)"
                  tick={{ fill: 'rgba(180,74,255,0.6)', fontSize: 11 }}
                />
                <YAxis
                  stroke="rgba(180,74,255,0.4)"
                  tick={{ fill: 'rgba(180,74,255,0.6)', fontSize: 12 }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="orders"
                  fill="#b44aff"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Recent Activity & User Management ────────────── */}
      <motion.div variants={item}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Recent Activity */}
          <Card className="glass border-0">
            <CardHeader>
              <CardTitle className="neon-text-purple text-lg flex items-center gap-2">
                <Activity className="h-5 w-5" /> Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-80 overflow-y-auto custom-scrollbar space-y-1">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 rounded-lg p-3 hover:bg-surface-hover transition-colors"
                  >
                    <div
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface',
                        activity.color
                      )}
                    >
                      <activity.icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{activity.action}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="truncate">{activity.user}</span>
                        <span className="flex items-center gap-1 shrink-0">
                          <Clock className="h-3 w-3" /> {activity.time}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* User Management */}
          <Card className="glass border-0">
            <CardHeader>
              <CardTitle className="neon-text-cyan text-lg flex items-center gap-2">
                <Users className="h-5 w-5" /> User Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-80 overflow-y-auto custom-scrollbar">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/40 hover:bg-transparent">
                      <TableHead className="text-muted-foreground">Name</TableHead>
                      <TableHead className="text-muted-foreground hidden sm:table-cell">Email</TableHead>
                      <TableHead className="text-muted-foreground">Role</TableHead>
                      <TableHead className="text-muted-foreground">Status</TableHead>
                      <TableHead className="text-muted-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id} className="border-border/20">
                        <TableCell className="text-sm font-medium">{u.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground hidden sm:table-cell">
                          {u.email}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-xs',
                              u.role === 'WHOLESALER'
                                ? 'text-neon-purple border-neon-purple/30'
                                : 'text-neon-cyan border-neon-cyan/30'
                            )}
                          >
                            {u.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-xs',
                              u.status === 'active' && 'text-neon-green border-neon-green/30',
                              u.status === 'suspended' && 'text-neon-orange border-neon-orange/30',
                              u.status === 'banned' && 'text-neon-pink border-neon-pink/30'
                            )}
                          >
                            {u.status.charAt(0).toUpperCase() + u.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {u.status !== 'suspended' && u.status !== 'banned' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-neon-orange hover:text-neon-orange/80 hover:bg-neon-orange/10"
                                title="Suspend"
                              >
                                <PauseCircle className="h-4 w-4" />
                              </Button>
                            )}
                            {u.status !== 'banned' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-neon-pink hover:text-neon-pink/80 hover:bg-neon-pink/10"
                                title="Ban"
                              >
                                <Ban className="h-4 w-4" />
                              </Button>
                            )}
                            {u.status === 'banned' && (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );
}
