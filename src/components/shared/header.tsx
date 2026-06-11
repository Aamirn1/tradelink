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
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Menu,
  Moon,
  Sun,
  Package,
  MessageSquare,
  LayoutDashboard,
  LogOut,
  ShoppingCart,
  FileText,
  User,
  Bell,
  Search,
  Shield,
  Store,
  Users,
} from 'lucide-react';
import type { AppView } from '@/types';
import { cn } from '@/lib/utils';

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
    setShowAuthModal,
    mobileNavOpen,
    setMobileNavOpen,
  } = useAppStore();

  const navItems: { label: string; view: AppView; icon: React.ReactNode }[] =
    user?.role === 'WHOLESALER'
      ? [
          { label: 'Dashboard', view: 'dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
          { label: 'Products', view: 'marketplace', icon: <Package className="h-4 w-4" /> },
          { label: 'RFQ Board', view: 'rfq-board', icon: <FileText className="h-4 w-4" /> },
          { label: 'Orders', view: 'orders', icon: <ShoppingCart className="h-4 w-4" /> },
          { label: 'Messages', view: 'chat', icon: <MessageSquare className="h-4 w-4" /> },
        ]
      : user?.role === 'RETAILER'
        ? [
            { label: 'Dashboard', view: 'dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
            { label: 'Marketplace', view: 'marketplace', icon: <Store className="h-4 w-4" /> },
            { label: 'My RFQs', view: 'rfq-board', icon: <FileText className="h-4 w-4" /> },
            { label: 'Orders', view: 'orders', icon: <ShoppingCart className="h-4 w-4" /> },
            { label: 'Messages', view: 'chat', icon: <MessageSquare className="h-4 w-4" /> },
          ]
        : user?.role === 'ADMIN'
          ? [
              { label: 'Admin Panel', view: 'admin', icon: <Shield className="h-4 w-4" /> },
              { label: 'Users', view: 'admin', icon: <Users className="h-4 w-4" /> },
              { label: 'Orders', view: 'orders', icon: <ShoppingCart className="h-4 w-4" /> },
            ]
          : [
              { label: 'Marketplace', view: 'marketplace', icon: <Store className="h-4 w-4" /> },
              { label: 'RFQ Board', view: 'rfq-board', icon: <FileText className="h-4 w-4" /> },
            ];

  const handleNavClick = (view: AppView) => {
    setCurrentView(view);
    setMobileNavOpen(false);
  };

  const handleLoginClick = () => {
    setAuthModalTab('login');
  };

  const handleRegisterClick = () => {
    setAuthModalTab('register');
  };

  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-border/50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <button
          onClick={() => setCurrentView(isAuthenticated ? 'dashboard' : 'landing')}
          className="flex items-center gap-2 group"
        >
          <div className="relative">
            <div className="h-9 w-9 rounded-lg gradient-cyan-purple-strong flex items-center justify-center font-bold text-white text-sm">
              TL
            </div>
            <div className="absolute inset-0 rounded-lg gradient-cyan-purple-strong opacity-0 group-hover:opacity-50 blur-md transition-opacity" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
            Trade Link
          </span>
        </button>

        {/* Desktop Navigation */}
        {isAuthenticated && (
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.label + item.view}
                onClick={() => handleNavClick(item.view)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  currentView === item.view
                    ? 'bg-primary/10 text-primary neon-text-cyan'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
        )}

        {!isAuthenticated && (
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.label + item.view}
                onClick={() => handleNavClick(item.view)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  currentView === item.view
                    ? 'bg-primary/10 text-primary neon-text-cyan'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
        )}

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {isAuthenticated && user ? (
            <>
              {/* Notifications */}
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground hover:text-foreground relative"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-neon-pink text-[8px] flex items-center justify-center text-white font-bold">
                  3
                </span>
              </Button>

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-9 gap-2 px-2">
                    <Avatar className="h-7 w-7 border border-primary/30">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline text-sm font-medium">{user.name}</span>
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
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCurrentView('dashboard')} className="cursor-pointer">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={handleLoginClick}
                className="text-muted-foreground hover:text-foreground"
              >
                Sign In
              </Button>
              <Button
                onClick={handleRegisterClick}
                className="glow-button gradient-cyan-purple-strong text-white font-semibold border-0"
              >
                Get Started
              </Button>
            </div>
          )}

          {/* Mobile menu */}
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 glass p-0">
              <div className="flex flex-col h-full">
                <div className="p-4 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg gradient-cyan-purple-strong flex items-center justify-center font-bold text-white text-xs">
                      TL
                    </div>
                    <span className="text-lg font-bold bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
                      Trade Link
                    </span>
                  </div>
                </div>

                {isAuthenticated && user && (
                  <div className="p-4 border-b border-border/50">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-primary/30">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                          {user.role}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}

                <nav className="flex-1 p-2">
                  {navItems.map((item) => (
                    <button
                      key={item.label + item.view}
                      onClick={() => handleNavClick(item.view)}
                      className={cn(
                        'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                        currentView === item.view
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      )}
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  ))}

                  {isAuthenticated && (
                    <button
                      onClick={() => { setCurrentView('profile'); setMobileNavOpen(false); }}
                      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </button>
                  )}
                </nav>

                {!isAuthenticated && (
                  <div className="p-4 border-t border-border/50 space-y-2">
                    <Button
                      onClick={handleLoginClick}
                      variant="outline"
                      className="w-full border-primary/30 text-primary hover:bg-primary/10"
                    >
                      Sign In
                    </Button>
                    <Button
                      onClick={handleRegisterClick}
                      className="w-full glow-button gradient-cyan-purple-strong text-white font-semibold border-0"
                    >
                      Get Started
                    </Button>
                  </div>
                )}

                {isAuthenticated && (
                  <div className="p-4 border-t border-border/50">
                    <Button
                      onClick={logout}
                      variant="ghost"
                      className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
