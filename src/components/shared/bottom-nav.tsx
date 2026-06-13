'use client';

import { useAppStore } from '@/store/app-store';
import { cn } from '@/lib/utils';
import {
  Home,
  Store,
  ShoppingCart,
  User,
} from 'lucide-react';
import type { AppView } from '@/types';

type BottomTab = {
  id: string;
  label: string;
  icon: typeof Home;
  view: AppView;
};

const TABS: BottomTab[] = [
  { id: 'home', label: 'Home', icon: Home, view: 'landing' },
  { id: 'wholesalers', label: 'Wholesalers', icon: Store, view: 'marketplace' },
  { id: 'retailers', label: 'Retailers', icon: ShoppingCart, view: 'rfq-board' },
  { id: 'profile', label: 'Profile', icon: User, view: 'profile' },
];

function getActiveTabId(currentView: AppView, isAuthenticated: boolean): string {
  // Map current view to its parent tab
  switch (currentView) {
    case 'landing':
    case 'dashboard':
    case 'admin':
      return 'home';
    case 'marketplace':
    case 'product-detail':
      return 'wholesalers';
    case 'rfq-board':
    case 'rfq-detail':
      return 'retailers';
    case 'profile':
      return 'profile';
    case 'orders':
    case 'order-detail':
    case 'chat':
      // These secondary views — keep the last active tab
      // Default to home for orders/chat
      return 'home';
    default:
      return 'home';
  }
}

export function BottomNav() {
  const { currentView, setCurrentView, isAuthenticated, user, setAuthModalTab, setSelectedProductId, setSelectedRfqId, setSelectedOrderId } = useAppStore();

  const activeTabId = getActiveTabId(currentView, isAuthenticated);

  const handleTabClick = (tab: BottomTab) => {
    // If profile tab and not authenticated, open auth modal
    if (tab.id === 'profile' && !isAuthenticated) {
      setAuthModalTab('login');
      return;
    }

    // Clear any detail selections when switching tabs
    setSelectedProductId(null);
    setSelectedRfqId(null);
    setSelectedOrderId(null);

    // Navigate to the appropriate view
    if (tab.id === 'home') {
      setCurrentView(isAuthenticated ? 'dashboard' : 'landing');
    } else {
      setCurrentView(tab.view);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0d0d24]/95 backdrop-blur-xl border-t border-border/50 safe-area-bottom">
      {/* Active indicator bar */}
      <div className="relative">
        <div
          className="absolute top-0 h-[2px] transition-all duration-300 ease-out gradient-cyan-purple-strong"
          style={{
            width: `${100 / TABS.length}%`,
            left: `${(TABS.findIndex((t) => t.id === activeTabId) / TABS.length) * 100}%`,
          }}
        />
      </div>

      <div className="flex items-center justify-around h-16 max-w-2xl mx-auto px-2">
        {TABS.map((tab) => {
          const isActive = tab.id === activeTabId;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              className={cn(
                'flex flex-col items-center justify-center gap-1 flex-1 py-1 relative transition-all duration-200',
                isActive
                  ? 'text-neon-cyan'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {/* Icon container with background */}
              <div className={cn(
                'relative flex items-center justify-center h-9 w-9 rounded-xl transition-all duration-200',
                isActive
                  ? 'bg-neon-cyan/20 shadow-[0_0_16px_rgba(0,255,242,0.25)]'
                  : 'bg-white/10 hover:bg-white/15'
              )}>
                <Icon
                  className={cn(
                    'h-4.5 w-4.5 transition-all duration-200',
                    isActive && 'drop-shadow-[0_0_6px_rgba(0,255,242,0.5)]'
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />

                {/* Notification badge for profile tab */}
                {tab.id === 'profile' && isAuthenticated && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-neon-pink text-[7px] flex items-center justify-center text-white font-bold ring-1 ring-background">
                    3
                  </span>
                )}
              </div>

              <span
                className={cn(
                  'text-[10px] font-medium transition-all duration-200',
                  isActive && 'font-semibold'
                )}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
