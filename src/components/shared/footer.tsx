'use client';

import { TrendingUp } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { Separator } from '@/components/ui/separator';
import { TrendingUp } from 'lucide-react';

export function Footer() {
  const { setCurrentView, isAuthenticated } = useAppStore();

  return (
    <footer className="mt-auto border-t border-border/50 glass">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-5 w-5 text-neon-cyan" strokeWidth={2.5} />
              <span className="text-sm font-bold whitespace-nowrap bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
                Bulk Stock Trade
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              The premier B2B wholesale marketplace connecting suppliers and retailers with secure escrow payments.
            </p>
          </div>

          {/* Marketplace */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Marketplace</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setCurrentView('marketplace')}
                  className="text-sm text-muted-foreground hover:text-neon-cyan transition-colors"
                >
                  Browse Products
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('rfq-board')}
                  className="text-sm text-muted-foreground hover:text-neon-cyan transition-colors"
                >
                  Post RFQ
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('marketplace')}
                  className="text-sm text-muted-foreground hover:text-neon-cyan transition-colors"
                >
                  Categories
                </button>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Company</h4>
            <ul className="space-y-2">
              <li>
                <span className="text-sm text-muted-foreground hover:text-neon-cyan transition-colors cursor-pointer">
                  About Us
                </span>
              </li>
              <li>
                <span className="text-sm text-muted-foreground hover:text-neon-cyan transition-colors cursor-pointer">
                  How It Works
                </span>
              </li>
              <li>
                <span className="text-sm text-muted-foreground hover:text-neon-cyan transition-colors cursor-pointer">
                  Contact Support
                </span>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Legal</h4>
            <ul className="space-y-2">
              <li>
                <span className="text-sm text-muted-foreground hover:text-neon-cyan transition-colors cursor-pointer">
                  Terms of Service
                </span>
              </li>
              <li>
                <span className="text-sm text-muted-foreground hover:text-neon-cyan transition-colors cursor-pointer">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="text-sm text-muted-foreground hover:text-neon-cyan transition-colors cursor-pointer">
                  Escrow Policy
                </span>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-6 glow-divider" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Bulk Stock Trade. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground">
              3% Commission on all transactions
            </span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">
              Secure Escrow Payments
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
