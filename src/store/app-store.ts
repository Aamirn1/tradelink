import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AppView, UserRole } from '@/types';

interface AppState {
  // Navigation
  currentView: AppView;
  setCurrentView: (view: AppView) => void;

  // Auth
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;

  // Theme
  theme: 'dark' | 'light';
  toggleTheme: () => void;

  // Modals
  showAuthModal: boolean;
  authModalTab: 'login' | 'register';
  setShowAuthModal: (show: boolean) => void;
  setAuthModalTab: (tab: 'login' | 'register') => void;

  // Detail views
  selectedProductId: string | null;
  selectedRfqId: string | null;
  selectedOrderId: string | null;
  setSelectedProductId: (id: string | null) => void;
  setSelectedRfqId: (id: string | null) => void;
  setSelectedOrderId: (id: string | null) => void;

  // Mobile nav
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;

  // AI Chat
  aiChatOpen: boolean;
  setAiChatOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Navigation
      currentView: 'landing',
      setCurrentView: (view) => set({ currentView: view, mobileNavOpen: false }),

      // Auth
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      logout: () => set({ user: null, isAuthenticated: false, currentView: 'landing' }),

      // Theme
      theme: 'dark',
      toggleTheme: () =>
        set((state) => {
          const newTheme = state.theme === 'dark' ? 'light' : 'dark';
          if (typeof document !== 'undefined') {
            document.documentElement.classList.remove('dark', 'light');
            document.documentElement.classList.add(newTheme);
          }
          return { theme: newTheme };
        }),

      // Modals
      showAuthModal: false,
      authModalTab: 'login',
      setShowAuthModal: (show) => set({ showAuthModal: show }),
      setAuthModalTab: (tab) => set({ authModalTab: tab, showAuthModal: true }),

      // Detail views
      selectedProductId: null,
      selectedRfqId: null,
      selectedOrderId: null,
      setSelectedProductId: (id) => set({ selectedProductId: id, currentView: id ? 'product-detail' : 'marketplace' }),
      setSelectedRfqId: (id) => set({ selectedRfqId: id, currentView: id ? 'rfq-detail' : 'rfq-board' }),
      setSelectedOrderId: (id) => set({ selectedOrderId: id, currentView: id ? 'order-detail' : 'orders' }),

      // Mobile nav
      mobileNavOpen: false,
      setMobileNavOpen: (open) => set({ mobileNavOpen: open }),

      // AI Chat
      aiChatOpen: false,
      setAiChatOpen: (open) => set({ aiChatOpen: open }),
    }),
    {
      name: 'b2bmarketgrid-store',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        currentView: state.currentView,
        theme: state.theme,
      }),
    }
  )
);
