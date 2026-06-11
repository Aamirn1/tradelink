'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';
import { useAppStore } from '@/store/app-store';
import { CATEGORIES } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Shield,
  FileText,
  Percent,
  CheckCircle,
  Cpu,
  Shirt,
  UtensilsCrossed,
  HardHat,
  Car,
  Home,
  Heart,
  Dumbbell,
  PenTool,
  Sprout,
  Wrench,
  FlaskConical,
  ArrowRight,
  Sparkles,
  Zap,
  Lock,
  Users,
  Package,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';

/* ────────────────────────── Animation Helpers ────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: (i: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

function AnimatedSection({
  children,
  className = '',
  variants = fadeUp,
  index = 0,
}: {
  children: React.ReactNode;
  className?: string;
  variants?: typeof fadeUp;
  index?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) controls.start('visible');
  }, [isInView, controls]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={variants}
      custom={index}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ────────────────────────── Counter Animation ────────────────────────── */

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const stepTime = Math.max(Math.floor(duration / target), 16);
    const timer = setInterval(() => {
      start += Math.ceil(target / (duration / stepTime));
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ────────────────────────── Category Icons Map ────────────────────────── */

const categoryIcons: Record<string, LucideIcon> = {
  'Electronics': Cpu,
  'Clothing & Textiles': Shirt,
  'Food & Beverages': UtensilsCrossed,
  'Construction Materials': HardHat,
  'Automotive Parts': Car,
  'Home & Garden': Home,
  'Health & Beauty': Heart,
  'Sports & Outdoors': Dumbbell,
  'Stationery & Office': PenTool,
  'Agriculture': Sprout,
  'Machinery & Equipment': Wrench,
  'Chemicals': FlaskConical,
};

/* ────────────────────────── Floating Particles ────────────────────────── */

function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 4 + 2,
            height: Math.random() * 4 + 2,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background:
              i % 2 === 0
                ? 'rgba(0, 255, 242, 0.25)'
                : 'rgba(180, 74, 255, 0.25)',
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, Math.random() * 10 - 5, 0],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: Math.random() * 4 + 3,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
}

/* ────────────────────────── Hero 3D Shapes ────────────────────────── */

function HeroShapes() {
  return (
    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[420px] h-[420px] hidden lg:block pointer-events-none">
      {/* Rotating cube */}
      <motion.div
        className="absolute top-8 right-8 w-28 h-28"
        animate={{ rotateY: 360, rotateX: 15 }}
        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        style={{ transformStyle: 'preserve-3d', perspective: 600 }}
      >
        <div className="absolute inset-0 border border-neon-cyan/30 rounded-xl neon-glow-cyan gradient-cyan-purple opacity-60" />
        <div className="absolute inset-2 border border-neon-purple/20 rounded-lg bg-neon-purple/5" />
      </motion.div>

      {/* Floating sphere */}
      <motion.div
        className="absolute bottom-12 right-24 w-24 h-24 rounded-full"
        animate={{ y: [-8, 8, -8], scale: [1, 1.05, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 neon-glow-cyan" />
        <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-neon-purple/10 to-neon-cyan/10 border border-neon-cyan/20" />
      </motion.div>

      {/* Orbiting ring */}
      <motion.div
        className="absolute top-1/2 left-8 w-36 h-36"
        animate={{ rotate: 360 }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
      >
        <div className="w-full h-full rounded-full border-2 border-neon-cyan/20" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-neon-cyan/60 neon-glow-cyan" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 rounded-full bg-neon-purple/60 neon-glow-purple" />
      </motion.div>

      {/* Hexagon accent */}
      <motion.div
        className="absolute top-20 right-44 w-16 h-16"
        animate={{ y: [-5, 5, -5], rotate: [0, 60, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <polygon
            points="50,2 95,25 95,75 50,98 5,75 5,25"
            fill="none"
            stroke="rgba(180,74,255,0.3)"
            strokeWidth="2"
          />
        </svg>
      </motion.div>

      {/* Glowing line accent */}
      <motion.div
        className="absolute bottom-32 left-0 w-32 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(0,255,242,0.5), transparent)',
        }}
        animate={{ scaleX: [0.5, 1, 0.5], opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

/* ────────────────────────── Category Card ────────────────────────── */

function CategoryCard({ cat, index }: { cat: string; index: number }) {
  const Icon = categoryIcons[cat] || Package;
  const isEven = index % 2 === 0;
  const setCurrentView = useAppStore((s) => s.setCurrentView);

  const handleClick = useCallback(() => {
    setCurrentView('marketplace');
  }, [setCurrentView]);

  return (
    <AnimatedSection index={index} variants={scaleIn}>
      <button
        onClick={handleClick}
        className={`glass card-3d rounded-xl p-5 w-full flex flex-col items-center gap-3 group cursor-pointer transition-all duration-300 ${
          isEven
            ? 'neon-border-cyan hover:neon-glow-cyan'
            : 'neon-border-purple hover:neon-glow-purple'
        }`}
      >
        <div
          className={`w-12 h-12 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${
            isEven ? 'bg-neon-cyan/10' : 'bg-neon-purple/10'
          }`}
        >
          <Icon
            className={`h-6 w-6 transition-all duration-300 ${
              isEven ? 'text-neon-cyan' : 'text-neon-purple'
            }`}
            style={{
              filter: undefined, // base state — no filter
            }}
          />
        </div>
        <span className="text-xs sm:text-sm font-medium text-center leading-tight group-hover:text-foreground transition-colors">
          {cat}
        </span>
      </button>
    </AnimatedSection>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   LANDING PAGE
   ════════════════════════════════════════════════════════════════════════ */

export function LandingPage() {
  const setAuthModalTab = useAppStore((s) => s.setAuthModalTab);

  const handleWholesalerCTA = useCallback(() => {
    setAuthModalTab('register');
  }, [setAuthModalTab]);

  const handleRetailerCTA = useCallback(() => {
    setAuthModalTab('register');
  }, [setAuthModalTab]);

  /* ─────────────────────────── HERO ─────────────────────────── */
  const heroSection = (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-dots">
      {/* Animated gradient bg */}
      <div className="absolute inset-0 animated-gradient gradient-cyan-purple opacity-40" />
      {/* Radial glow */}
      <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] rounded-full bg-neon-cyan/5 blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-neon-purple/5 blur-[100px]" />
      <FloatingParticles />
      <HeroShapes />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium glass neon-border-cyan text-neon-cyan mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              B2B Wholesale Reimagined
            </span>
          </motion.div>

          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            Trade Smarter,{' '}
            <span className="bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-cyan bg-clip-text text-transparent animated-gradient neon-text-cyan">
              Trade Secure
            </span>
          </motion.h1>

          <motion.p
            className="text-lg sm:text-xl text-muted-foreground max-w-lg mb-8 leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            The marketplace that connects wholesalers and retailers with
            escrow-protected payments, smart RFQs, and a flat 3% commission.
            Build trust, close deals, grow together.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55 }}
          >
            <Button
              size="lg"
              className="glow-button gradient-cyan-purple-strong text-white font-semibold border-0 text-base px-8 py-6"
              onClick={handleWholesalerCTA}
            >
              Join as Wholesaler
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-neon-purple/40 text-neon-purple hover:bg-neon-purple/10 font-semibold text-base px-8 py-6"
              onClick={handleRetailerCTA}
            >
              Join as Retailer
              <Users className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            className="flex flex-wrap items-center gap-4 sm:gap-6 mt-10 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.75 }}
          >
            <span className="flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-neon-cyan" /> Escrow Protected
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-neon-purple" /> Instant Matching
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-neon-green" /> Verified Sellers
            </span>
          </motion.div>
        </div>
      </div>

      {/* Bottom glow divider */}
      <div className="absolute bottom-0 left-0 right-0 glow-divider" />
    </section>
  );

  /* ─────────────────────────── FEATURES ─────────────────────────── */
  const features = [
    {
      icon: Shield,
      title: 'Secure Escrow Payments',
      description:
        'Funds are safely held in escrow until delivery is confirmed. Trade with confidence knowing your money is protected.',
      glow: 'neon-glow-cyan',
      border: 'neon-border-cyan',
      iconColor: 'text-neon-cyan',
      bgAccent: 'from-neon-cyan/10 to-transparent',
    },
    {
      icon: FileText,
      title: 'RFQ System',
      description:
        'Post your requirements and receive competitive quotes from verified wholesalers. Streamline your sourcing process.',
      glow: 'neon-glow-purple',
      border: 'neon-border-purple',
      iconColor: 'text-neon-purple',
      bgAccent: 'from-neon-purple/10 to-transparent',
    },
    {
      icon: Percent,
      title: '3% Commission',
      description:
        'Low flat fee on all transactions. No hidden costs, no surprises. Keep more of your profits on every deal.',
      glow: 'neon-glow-cyan',
      border: 'neon-border-cyan',
      iconColor: 'text-neon-cyan',
      bgAccent: 'from-neon-cyan/10 to-transparent',
    },
    {
      icon: CheckCircle,
      title: 'Verified Suppliers',
      description:
        'Every wholesaler on Bulk Stock Trade goes through verification. Quality profiles you can trust for reliable partnerships.',
      glow: 'neon-glow-purple',
      border: 'neon-border-purple',
      iconColor: 'text-neon-purple',
      bgAccent: 'from-neon-purple/10 to-transparent',
    },
  ];

  const featuresSection = (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-dots opacity-40" />
      <div className="container mx-auto px-4 relative z-10">
        <AnimatedSection className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium glass neon-border-purple text-neon-purple mb-4">
            <Zap className="h-3.5 w-3.5" /> Why Bulk Stock Trade
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Built for{' '}
            <span className="bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
              Serious Traders
            </span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            Everything you need to trade confidently in one platform
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <AnimatedSection key={f.title} index={i}>
              <div
                className={`glass card-3d rounded-2xl p-6 h-full ${f.border} group cursor-default`}
              >
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 bg-gradient-to-br ${f.bgAccent} ${f.glow} transition-all duration-300 group-hover:scale-110`}
                >
                  <f.icon className={`h-7 w-7 ${f.iconColor}`} />
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-neon-cyan transition-colors">
                  {f.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.description}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );

  /* ─────────────────────────── HOW IT WORKS ─────────────────────────── */
  const steps = [
    {
      num: 1,
      title: 'Register & List',
      description: 'Create your profile and list products or post RFQs to start trading.',
      icon: Users,
      numberColor: 'text-neon-cyan',
      borderColor: 'border-neon-cyan/40',
      bgColor: 'bg-neon-cyan/5',
      iconColor: 'text-neon-cyan',
      glowClass: 'neon-glow-cyan',
    },
    {
      num: 2,
      title: 'Connect & Quote',
      description: 'Browse catalogs, receive quotes, negotiate deals that work for both sides.',
      icon: TrendingUp,
      numberColor: 'text-neon-purple',
      borderColor: 'border-neon-purple/40',
      bgColor: 'bg-neon-purple/5',
      iconColor: 'text-neon-purple',
      glowClass: 'neon-glow-purple',
    },
    {
      num: 3,
      title: 'Trade Secure',
      description: 'Place orders with escrow protection, confirm delivery, and release payments.',
      icon: Lock,
      numberColor: 'text-neon-cyan',
      borderColor: 'border-neon-cyan/40',
      bgColor: 'bg-neon-cyan/5',
      iconColor: 'text-neon-cyan',
      glowClass: 'neon-glow-cyan',
    },
  ];

  const howItWorksSection = (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 glow-divider" />
      <div className="absolute inset-0 gradient-cyan-purple opacity-20" />
      <div className="container mx-auto px-4 relative z-10">
        <AnimatedSection className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium glass neon-border-cyan text-neon-cyan mb-4">
            <ArrowRight className="h-3.5 w-3.5" /> Simple Process
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            How It{' '}
            <span className="bg-gradient-to-r from-neon-purple to-neon-cyan bg-clip-text text-transparent">
              Works
            </span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            Three easy steps to start trading securely
          </p>
        </AnimatedSection>

        <div className="relative max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {steps.map((step, i) => (
              <AnimatedSection key={step.num} index={i}>
                <div className="flex flex-col items-center text-center relative z-10">
                  {/* Number circle */}
                  <div
                    className={`relative w-20 h-20 rounded-full flex items-center justify-center mb-6 glass ${step.glowClass} border-2 ${step.borderColor}`}
                  >
                    <span className={`text-2xl font-bold ${step.numberColor}`}>
                      {step.num}
                    </span>
                    <div
                      className={`absolute inset-0 rounded-full ${step.bgColor} animate-ping opacity-20`}
                    />
                  </div>

                  {/* Step icon */}
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 glass">
                    <step.icon className={`h-5 w-5 ${step.iconColor}`} />
                  </div>

                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-[260px]">
                    {step.description}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>
    </section>
  );

  /* ─────────────────────────── STATS ─────────────────────────── */
  const stats = [
    { value: 1000, suffix: '+', label: 'Active Suppliers', icon: Users, color: 'text-neon-cyan' },
    { value: 5000, suffix: '+', label: 'Products Listed', icon: Package, color: 'text-neon-purple' },
    { value: 2000, suffix: '+', label: 'Orders Completed', icon: TrendingUp, color: 'text-neon-cyan' },
    { value: 99, suffix: '%', label: 'Secure Transactions', icon: Shield, color: 'text-neon-purple' },
  ];

  const statsSection = (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 glow-divider" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="glass rounded-3xl p-8 md:p-12 neon-border-cyan">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {stats.map((s, i) => (
              <AnimatedSection
                key={s.label}
                index={i}
                variants={scaleIn}
                className="flex flex-col items-center text-center"
              >
                <s.icon className={`h-8 w-8 mb-3 ${s.color}`} />
                <span
                  className={`text-3xl sm:text-4xl md:text-5xl font-extrabold ${s.color} neon-text-cyan`}
                >
                  <AnimatedCounter target={s.value} suffix={s.suffix} />
                </span>
                <span className="text-sm text-muted-foreground mt-1">
                  {s.label}
                </span>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>
    </section>
  );

  /* ─────────────────────────── CATEGORIES ─────────────────────────── */
  const categoriesSection = (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 glow-divider" />
      <div className="absolute inset-0 bg-dots opacity-30" />
      <div className="container mx-auto px-4 relative z-10">
        <AnimatedSection className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium glass neon-border-cyan text-neon-cyan mb-4">
            <Package className="h-3.5 w-3.5" /> Browse Categories
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Trade Across{' '}
            <span className="bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
              Industries
            </span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            Explore wholesale opportunities in every major sector
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((cat, i) => (
            <CategoryCard key={cat} cat={cat} index={i} />
          ))}
        </div>
      </div>
    </section>
  );

  /* ─────────────────────────── CTA ─────────────────────────── */
  const ctaSection = (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 glow-divider" />
      <div className="absolute inset-0 gradient-cyan-purple opacity-30" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-neon-cyan/5 blur-[120px]" />

      <div className="container mx-auto px-4 relative z-10">
        <AnimatedSection>
          <div className="glass rounded-3xl p-8 md:p-16 text-center neon-border-cyan relative overflow-hidden">
            {/* Shimmer overlay */}
            <div className="absolute inset-0 shimmer pointer-events-none" />

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                Ready to{' '}
                <span className="bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
                  Trade?
                </span>
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto text-lg mb-8">
                Join thousands of wholesalers and retailers already trading
                securely on Bulk Stock Trade.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="glow-button gradient-cyan-purple-strong text-white font-semibold border-0 text-base px-8 py-6"
                  onClick={handleWholesalerCTA}
                >
                  Join as Wholesaler
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-neon-purple/40 text-neon-purple hover:bg-neon-purple/10 font-semibold text-base px-8 py-6"
                  onClick={handleRetailerCTA}
                >
                  Join as Retailer
                  <Users className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </motion.div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );

  /* ─────────────────────────── RENDER ─────────────────────────── */
  return (
    <main className="relative custom-scrollbar">
      {heroSection}
      {featuresSection}
      {howItWorksSection}
      {statsSection}
      {categoriesSection}
      {ctaSection}
    </main>
  );
}
