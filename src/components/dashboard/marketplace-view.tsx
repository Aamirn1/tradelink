'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Package,
  ArrowUpDown,
  Tag,
  Layers,
  Hash,
  Image as ImageIcon,
  LogIn,
  X,
} from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CATEGORIES } from '@/types';

// ── Mock data ────────────────────────────────────────────────

const MOCK_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Wireless Bluetooth Earbuds Pro',
    description: 'Premium wireless earbuds with active noise cancellation and 30-hour battery life.',
    category: 'Electronics',
    price: 24.99,
    moq: 100,
    stock: 3200,
    wholesalerName: 'GlobalTech Wholesale',
    createdAt: '2025-03-01',
    popular: 95,
  },
  {
    id: 'prod-2',
    name: 'Organic Cotton T-Shirts',
    description: '100% organic cotton crew neck t-shirts, available in 12 colors.',
    category: 'Clothing & Textiles',
    price: 8.50,
    moq: 200,
    stock: 5400,
    wholesalerName: 'TextileKing Ltd.',
    createdAt: '2025-02-28',
    popular: 88,
  },
  {
    id: 'prod-3',
    name: 'Stainless Steel Water Bottles',
    description: 'Double-wall insulated 750ml water bottles, BPA-free.',
    category: 'Home & Garden',
    price: 5.75,
    moq: 500,
    stock: 8200,
    wholesalerName: 'EcoGoods Inc.',
    createdAt: '2025-02-27',
    popular: 76,
  },
  {
    id: 'prod-4',
    name: 'LED Desk Lamps',
    description: 'Adjustable LED desk lamps with USB charging port and touch dimmer.',
    category: 'Electronics',
    price: 18.00,
    moq: 50,
    stock: 1600,
    wholesalerName: 'GlobalTech Wholesale',
    createdAt: '2025-02-26',
    popular: 82,
  },
  {
    id: 'prod-5',
    name: 'Premium Denim Fabric Roll',
    description: 'High-quality selvage denim fabric, 60 inches wide, per meter.',
    category: 'Clothing & Textiles',
    price: 12.50,
    moq: 300,
    stock: 2400,
    wholesalerName: 'TextileKing Ltd.',
    createdAt: '2025-02-25',
    popular: 64,
  },
  {
    id: 'prod-6',
    name: 'Car Floor Mats Set',
    description: 'Universal fit rubber car floor mats, set of 4, all-weather.',
    category: 'Automotive Parts',
    price: 15.00,
    moq: 100,
    stock: 3200,
    wholesalerName: 'AutoParts Direct',
    createdAt: '2025-02-24',
    popular: 71,
  },
  {
    id: 'prod-7',
    name: 'Organic Green Tea 100-Pack',
    description: 'Premium organic green tea bags, 100 packs per box.',
    category: 'Food & Beverages',
    price: 3.20,
    moq: 1000,
    stock: 15000,
    wholesalerName: 'FreshSource Co.',
    createdAt: '2025-02-23',
    popular: 90,
  },
  {
    id: 'prod-8',
    name: 'Cement Portland 50kg Bag',
    description: 'High-grade Portland cement, 50kg bags, construction grade.',
    category: 'Construction Materials',
    price: 6.80,
    moq: 200,
    stock: 45000,
    wholesalerName: 'BuildRight Supplies',
    createdAt: '2025-02-22',
    popular: 55,
  },
  {
    id: 'prod-9',
    name: 'Yoga Mat Premium 6mm',
    description: 'Non-slip eco-friendly TPE yoga mats, 6mm thickness.',
    category: 'Sports & Outdoors',
    price: 7.90,
    moq: 150,
    stock: 6000,
    wholesalerName: 'EcoGoods Inc.',
    createdAt: '2025-02-21',
    popular: 68,
  },
  {
    id: 'prod-10',
    name: 'Printer A4 Paper 500-Sheet Ream',
    description: 'Multi-purpose white A4 copy paper, 80gsm, 500 sheets per ream.',
    category: 'Stationery & Office',
    price: 2.40,
    moq: 500,
    stock: 25000,
    wholesalerName: 'OfficeWorld Supply',
    createdAt: '2025-02-20',
    popular: 78,
  },
];

type SortOption = 'newest' | 'price-low' | 'price-high' | 'popular';

// ── Animation variants ───────────────────────────────────────

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

// ── Component ────────────────────────────────────────────────

export function MarketplaceView() {
  const { isAuthenticated, setSelectedProductId, setAuthModalTab } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const filteredProducts = useMemo(() => {
    let products = [...MOCK_PRODUCTS];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.wholesalerName.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory) {
      products = products.filter((p) => p.category === selectedCategory);
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'price-low':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'popular':
        products.sort((a, b) => b.popular - a.popular);
        break;
    }

    return products;
  }, [searchQuery, selectedCategory, sortBy]);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 p-4 md:p-6 custom-scrollbar"
    >
      {/* ── Header ──────────────────────────────────────── */}
      <motion.div variants={item}>
        <h1 className="text-2xl md:text-3xl font-bold">
          <span className="neon-text-cyan">Marketplace</span>
        </h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Browse wholesale products from verified suppliers
        </p>
      </motion.div>

      {/* ── Sign-in Banner ──────────────────────────────── */}
      {!isAuthenticated && (
        <motion.div variants={item}>
          <Card className="glass border-0 neon-border-cyan">
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface text-neon-cyan">
                  <LogIn className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Sign in to place orders</p>
                  <p className="text-xs text-muted-foreground">
                    Create an account or log in to start ordering from wholesalers
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setAuthModalTab('login')}
                className="glow-button gradient-cyan-purple-strong text-primary-foreground border-0 font-semibold shrink-0"
                size="sm"
              >
                Sign In
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ── Search Bar ──────────────────────────────────── */}
      <motion.div variants={item}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products, suppliers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              'pl-10 pr-10 h-11 glass border-0',
              'focus-visible:neon-glow-cyan focus-visible:ring-1 focus-visible:ring-neon-cyan/50',
              'placeholder:text-muted-foreground/60'
            )}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </motion.div>

      {/* ── Category Filter Pills ───────────────────────── */}
      <motion.div variants={item}>
        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
          <button
            onClick={() => setSelectedCategory(null)}
            className={cn(
              'shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-200',
              !selectedCategory
                ? 'gradient-cyan-purple-strong text-primary-foreground shadow-sm'
                : 'glass border-0 text-muted-foreground hover:text-foreground hover:neon-border-cyan'
            )}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              className={cn(
                'shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-200 whitespace-nowrap',
                selectedCategory === cat
                  ? 'gradient-cyan-purple-strong text-primary-foreground shadow-sm'
                  : 'glass border-0 text-muted-foreground hover:text-foreground hover:neon-border-cyan'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Sort + Results Count ────────────────────────── */}
      <motion.div variants={item} className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          <span className="text-foreground font-semibold">{filteredProducts.length}</span>{' '}
          product{filteredProducts.length !== 1 ? 's' : ''} found
        </p>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
          <SelectTrigger className="w-[180px] glass border-0 text-sm">
            <ArrowUpDown className="h-3.5 w-3.5 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="glass border-border/50">
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="popular">Most Popular</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* ── Product Grid ────────────────────────────────── */}
      {filteredProducts.length > 0 ? (
        <motion.div
          variants={container}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {filteredProducts.map((product) => (
            <motion.div key={product.id} variants={item}>
              <Card className="card-3d glass border-0 overflow-hidden h-full flex flex-col">
                {/* Image placeholder */}
                <div className="relative h-40 gradient-cyan-purple flex items-center justify-center shrink-0">
                  <Package className="h-12 w-12 text-primary-foreground/30" />
                  <Badge
                    className="absolute top-2 right-2 text-[10px]"
                    variant="secondary"
                  >
                    {product.category}
                  </Badge>
                </div>

                <CardContent className="p-4 flex flex-col flex-1 gap-2">
                  <h3 className="font-semibold text-sm line-clamp-2 leading-snug">
                    {product.name}
                  </h3>

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
                    <span className="flex items-center gap-1 truncate ml-2">
                      <Hash className="h-3 w-3 shrink-0" />
                      <span className="truncate">{product.wholesalerName}</span>
                    </span>
                  </div>

                  <div className="mt-auto pt-2">
                    <Button
                      onClick={() => setSelectedProductId(product.id)}
                      className="w-full glow-button gradient-cyan-purple-strong text-primary-foreground border-0 font-semibold text-xs h-8"
                      size="sm"
                    >
                      View Details
                    </Button>
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
              <ImageIcon className="h-12 w-12 text-muted-foreground/40 mb-3" />
              <p className="font-semibold text-sm">No products found</p>
              <p className="text-xs text-muted-foreground mt-1">
                Try adjusting your search or filter criteria
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
