'use client';

import { useAppStore } from '@/store/app-store';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Moon,
  Sun,
  LogOut,
  Bell,
  Shield,
  TrendingUp,
} from 'lucide-react';

export function Header() {
  const {
    user,
    isAuthenticated,
    currentView,
    setCurrentView,
    logout,
    theme,
    toggleTheme,
    setAuthModalTab,
  } = useAppStore();

  const handleLoginClick = () => {
    setAuthModalTab('login');
  };

  const handleRegisterClick = () => {
    setAuthModalTab('register');
  };

  // Determine page title based on current view
  const getPageTitle = () => {
    switch (currentView) {
      case 'landing': return '';
      case 'dashboard': return '';
      case 'marketplace': return 'Wholesalers';
      case 'rfq-board': return 'Retailers';
      case 'profile': return 'Profile';
      case 'orders': return 'Orders';
      case 'order-detail': return 'Order Details';
      case 'chat': return 'Messages';
      case 'product-detail': return 'Product';
      case 'rfq-detail': return 'RFQ Details';
      case 'admin': return 'Admin';
      default: return '';
    }
  };

  const pageTitle = getPageTitle();

  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-border/50">
      <div className="flex h-14 items-center justify-between px-4 max-w-2xl mx-auto">
        {/* Left: Logo or page title */}
        <div className="flex items-center gap-2">
          {currentView === 'landing' || currentView === 'dashboard' ? (
            <button
              onClick={() => setCurrentView(isAuthenticated ? 'dashboard' : 'landing')}
              className="flex items-center gap-1.5 group"
            >
              <TrendingUp className="h-7 w-7 text-neon-cyan group-hover:drop-shadow-[0_0_8px_rgba(0,255,242,0.6)] transition-all duration-300" strokeWidth={2.5} />
              <span className="text-lg font-bold bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
                Bulk Stock Trade
              </span>
            </button>
          ) : (
            <h2 className="text-base font-semibold text-foreground">{pageTitle}</h2>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {isAuthenticated && user ? (
            <>
              {/* Notifications */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground relative"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-neon-pink text-[8px] flex items-center justify-center text-white font-bold">
                  3
                </span>
              </Button>

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <Avatar className="h-7 w-7 border border-primary/30">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 glass">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    <Badge variant="outline" className="mt-1 text-[10px] border-primary/30 text-primary">
                      {user.role}
                    </Badge>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setCurrentView('profile')} className="cursor-pointer">
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCurrentView('dashboard')} className="cursor-pointer">
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCurrentView('orders')} className="cursor-pointer">
                    Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCurrentView('chat')} className="cursor-pointer">
                    Messages
                  </DropdownMenuItem>
                  {user.role === 'ADMIN' && (
                    <DropdownMenuItem onClick={() => setCurrentView('admin')} className="cursor-pointer">
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLoginClick}
                className="text-xs text-muted-foreground hover:text-foreground h-8 px-3"
              >
                Sign In
              </Button>
              <Button
                size="sm"
                onClick={handleRegisterClick}
                className="glow-button gradient-cyan-purple-strong text-white font-semibold border-0 h-8 px-3 text-xs"
              >
                Get Started
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
