'use client';

import { useAppStore } from '@/store/app-store';
import { Header } from '@/components/shared/header';
import { BottomNav } from '@/components/shared/bottom-nav';
import { AuthModal } from '@/components/auth/auth-modal';
import { LandingPage } from '@/components/landing/landing-page';
import { WholesalerDashboard } from '@/components/dashboard/wholesaler-dashboard';
import { RetailerDashboard } from '@/components/dashboard/retailer-dashboard';
import { AdminDashboard } from '@/components/dashboard/admin-dashboard';
import { MarketplaceView } from '@/components/dashboard/marketplace-view';
import { RfqBoardView } from '@/components/dashboard/rfq-board-view';
import { ProductDetailView } from '@/components/dashboard/product-detail-view';
import { RfqDetailView } from '@/components/dashboard/rfq-detail-view';
import { OrdersView } from '@/components/dashboard/orders-view';
import { OrderDetailView } from '@/components/dashboard/order-detail-view';
import { ChatView } from '@/components/chat/chat-view';
import { ProfileView } from '@/components/dashboard/profile-view';
import { AIChatWidget } from '@/components/chat/ai-chat-widget';
import { AnimatePresence, motion } from 'framer-motion';

function ViewRouter() {
  const { currentView, user, isAuthenticated } = useAppStore();

  // If not authenticated, only show landing, marketplace, and rfq-board
  if (!isAuthenticated) {
    switch (currentView) {
      case 'marketplace':
        return <MarketplaceView />;
      case 'rfq-board':
        return <RfqBoardView />;
      case 'profile':
        return <LandingPage />;
      case 'landing':
      default:
        return <LandingPage />;
    }
  }

  // Authenticated views
  switch (currentView) {
    case 'dashboard':
      if (user?.role === 'WHOLESALER') return <WholesalerDashboard />;
      if (user?.role === 'RETAILER') return <RetailerDashboard />;
      if (user?.role === 'ADMIN') return <AdminDashboard />;
      return <RetailerDashboard />;

    case 'admin':
      return <AdminDashboard />;

    case 'marketplace':
      return <MarketplaceView />;

    case 'rfq-board':
      return <RfqBoardView />;

    case 'product-detail':
      return <ProductDetailView />;

    case 'rfq-detail':
      return <RfqDetailView />;

    case 'orders':
      return <OrdersView />;

    case 'order-detail':
      return <OrderDetailView />;

    case 'chat':
      return <ChatView />;

    case 'profile':
      return <ProfileView />;

    case 'landing':
    default:
      if (user?.role === 'WHOLESALER') return <WholesalerDashboard />;
      if (user?.role === 'RETAILER') return <RetailerDashboard />;
      if (user?.role === 'ADMIN') return <AdminDashboard />;
      return <LandingPage />;
  }
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background relative">
      <Header />
      <AuthModal />
      <main className="flex-1 pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={useAppStore.getState().currentView}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <ViewRouter />
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomNav />
      <AIChatWidget />
    </div>
  );
}
