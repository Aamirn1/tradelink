'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useAppStore } from '@/store/app-store';
import { Store, ShoppingCart, Eye, EyeOff, Loader2, TrendingUp } from 'lucide-react';
import type { UserRole } from '@/types';

export function AuthModal() {
  const {
    showAuthModal,
    setShowAuthModal,
    authModalTab,
    setAuthModalTab,
    setUser,
    setCurrentView,
  } = useAppStore();

  // ── Login state ──
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // ── Register state ──
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('WHOLESALER');
  const [regBusinessName, setRegBusinessName] = useState('');
  const [regBusinessType, setRegBusinessType] = useState('');
  const [regCity, setRegCity] = useState('');
  const [regAgreeTerms, setRegAgreeTerms] = useState(false);
  const [regError, setRegError] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // ── Helpers ──
  const resetLogin = () => {
    setLoginEmail('');
    setLoginPassword('');
    setLoginError('');
    setLoginLoading(false);
    setShowLoginPassword(false);
  };

  const resetRegister = () => {
    setRegName('');
    setRegEmail('');
    setRegPhone('');
    setRegPassword('');
    setRegConfirmPassword('');
    setRegRole('WHOLESALER');
    setRegBusinessName('');
    setRegBusinessType('');
    setRegCity('');
    setRegAgreeTerms(false);
    setRegError('');
    setRegLoading(false);
    setShowRegPassword(false);
    setShowRegConfirmPassword(false);
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setShowAuthModal(false);
      resetLogin();
      resetRegister();
    }
  };

  // ── Login submit ──
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail.trim()) {
      setLoginError('Email is required');
      return;
    }
    if (!loginPassword.trim()) {
      setLoginError('Password is required');
      return;
    }

    setLoginLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        setLoginError(data.error || 'Login failed');
        return;
      }

      setUser(data.user);
      setShowAuthModal(false);
      resetLogin();

      // Navigate based on role
      const role = data.user?.role;
      if (role === 'ADMIN') {
        setCurrentView('admin');
      } else if (role === 'WHOLESALER') {
        setCurrentView('dashboard');
      } else {
        setCurrentView('marketplace');
      }
    } catch {
      setLoginError('Network error. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  // ── Register submit ──
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regName.trim()) {
      setRegError('Full name is required');
      return;
    }
    if (!regEmail.trim()) {
      setRegError('Email is required');
      return;
    }
    if (!regPhone.trim()) {
      setRegError('Phone number is required');
      return;
    }
    if (!regPassword.trim()) {
      setRegError('Password is required');
      return;
    }
    if (regPassword.length < 6) {
      setRegError('Password must be at least 6 characters');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError('Passwords do not match');
      return;
    }
    if (!regBusinessName.trim()) {
      setRegError('Business name is required');
      return;
    }
    if (!regAgreeTerms) {
      setRegError('You must agree to the Terms of Service');
      return;
    }

    setRegLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          phone: regPhone,
          password: regPassword,
          role: regRole,
          businessName: regBusinessName,
          businessType: regBusinessType,
          city: regCity,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setRegError(data.error || 'Registration failed');
        return;
      }

      setUser(data.user);
      setShowAuthModal(false);
      resetRegister();

      // Navigate based on role
      if (regRole === 'WHOLESALER') {
        setCurrentView('dashboard');
      } else {
        setCurrentView('marketplace');
      }
    } catch {
      setRegError('Network error. Please try again.');
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <Dialog open={showAuthModal} onOpenChange={handleClose}>
      <DialogContent
        className="bg-[#0d0d24]/95 backdrop-blur-xl max-h-[90vh] overflow-y-auto custom-scrollbar sm:max-w-md md:max-w-lg border-neon-cyan/20 shadow-2xl shadow-neon-cyan/5"
        showCloseButton
      >
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-2xl font-bold text-center">
            <div className="flex items-center justify-center gap-1.5">
              <TrendingUp className="h-6 w-6 text-neon-cyan" strokeWidth={2.5} />
              <span className="text-sm font-bold whitespace-nowrap bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
                B2B Market Grid
              </span>
            </div>
          </DialogTitle>
          <p className="text-sm text-muted-foreground text-center">
            B2B Wholesale Marketplace
          </p>
        </DialogHeader>

        {/* ─── Login / Register Tabs ─── */}
        <Tabs
          value={authModalTab}
          onValueChange={(val) => setAuthModalTab(val as 'login' | 'register')}
          className="w-full"
        >
          <TabsList className="w-full bg-[#0a0a20] border border-border/60 rounded-lg h-11 p-1">
            <TabsTrigger
              value="login"
              className="flex-1 rounded-md data-[state=active]:gradient-cyan-purple-strong data-[state=active]:text-white data-[state=active]:shadow-lg font-medium transition-all"
            >
              Sign In
            </TabsTrigger>
            <TabsTrigger
              value="register"
              className="flex-1 rounded-md data-[state=active]:gradient-cyan-purple-strong data-[state=active]:text-white data-[state=active]:shadow-lg font-medium transition-all"
            >
              Create Account
            </TabsTrigger>
          </TabsList>

          {/* ─── Login Tab ─── */}
          <TabsContent value="login" className="mt-4">
            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <div className="rounded-md bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400">
                  {loginError}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-sm text-muted-foreground">
                  Email Address
                </Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="you@company.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="bg-[#0a0a20] border-border/60 focus:border-neon-cyan focus:ring-neon-cyan/20 h-11"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="login-password" className="text-sm text-muted-foreground">
                    Password
                  </Label>
                  <button
                    type="button"
                    className="text-xs text-neon-cyan/70 hover:text-neon-cyan transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showLoginPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="bg-[#0a0a20] border-border/60 focus:border-neon-cyan focus:ring-neon-cyan/20 h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-neon-cyan transition-colors"
                  >
                    {showLoginPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loginLoading}
                className="w-full glow-button gradient-cyan-purple-strong text-white font-semibold h-11 rounded-lg"
              >
                {loginLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </TabsContent>

          {/* ─── Register Tab ─── */}
          <TabsContent value="register" className="mt-4">
            <form onSubmit={handleRegister} className="space-y-4">
              {regError && (
                <div className="rounded-md bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400">
                  {regError}
                </div>
              )}

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="reg-name" className="text-sm text-muted-foreground">
                  Full Name
                </Label>
                <Input
                  id="reg-name"
                  type="text"
                  placeholder="John Doe"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="bg-[#0a0a20] border-border/60 focus:border-neon-cyan focus:ring-neon-cyan/20 h-11"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="reg-email" className="text-sm text-muted-foreground">
                  Email Address
                </Label>
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="you@company.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="bg-[#0a0a20] border-border/60 focus:border-neon-cyan focus:ring-neon-cyan/20 h-11"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="reg-phone" className="text-sm text-muted-foreground">
                  Phone Number
                </Label>
                <Input
                  id="reg-phone"
                  type="tel"
                  placeholder="+92 300 1234567"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="bg-[#0a0a20] border-border/60 focus:border-neon-cyan focus:ring-neon-cyan/20 h-11"
                />
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-password" className="text-sm text-muted-foreground">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="reg-password"
                      type={showRegPassword ? 'text' : 'password'}
                      placeholder="Min. 6 characters"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="bg-[#0a0a20] border-border/60 focus:border-neon-cyan focus:ring-neon-cyan/20 h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-neon-cyan transition-colors"
                    >
                      {showRegPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-confirm-password" className="text-sm text-muted-foreground">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="reg-confirm-password"
                      type={showRegConfirmPassword ? 'text' : 'password'}
                      placeholder="Re-enter password"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      className="bg-[#0a0a20] border-border/60 focus:border-neon-cyan focus:ring-neon-cyan/20 h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-neon-cyan transition-colors"
                    >
                      {showRegConfirmPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-3">
                <Label className="text-sm text-muted-foreground">I am a...</Label>
                <RadioGroup
                  value={regRole}
                  onValueChange={(val) => setRegRole(val as UserRole)}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                >
                  {/* Wholesaler option */}
                  <label
                    className={`relative flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-all duration-200 ${
                      regRole === 'WHOLESALER'
                        ? 'border-neon-cyan/50 neon-glow-cyan bg-neon-cyan/5'
                        : 'border-border/60 bg-[#0a0a20] hover:border-neon-cyan/20'
                    }`}
                  >
                    <RadioGroupItem
                      value="WHOLESALER"
                      className="mt-0.5 border-neon-cyan/50 data-[state=checked]:bg-neon-cyan data-[state=checked]:border-neon-cyan"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Store
                          className={`size-5 ${
                            regRole === 'WHOLESALER' ? 'text-neon-cyan' : 'text-muted-foreground'
                          }`}
                        />
                        <span
                          className={`font-semibold text-sm ${
                            regRole === 'WHOLESALER' ? 'text-neon-cyan' : 'text-foreground'
                          }`}
                        >
                          Wholesaler
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        List products, manage inventory, and sell to retailers
                      </p>
                    </div>
                  </label>

                  {/* Retailer option */}
                  <label
                    className={`relative flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-all duration-200 ${
                      regRole === 'RETAILER'
                        ? 'border-neon-purple/50 neon-glow-purple bg-neon-purple/5'
                        : 'border-border/60 bg-[#0a0a20] hover:border-neon-purple/20'
                    }`}
                  >
                    <RadioGroupItem
                      value="RETAILER"
                      className="mt-0.5 border-neon-purple/50 data-[state=checked]:bg-neon-purple data-[state=checked]:border-neon-purple"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <ShoppingCart
                          className={`size-5 ${
                            regRole === 'RETAILER' ? 'text-neon-purple' : 'text-muted-foreground'
                          }`}
                        />
                        <span
                          className={`font-semibold text-sm ${
                            regRole === 'RETAILER' ? 'text-neon-purple' : 'text-foreground'
                          }`}
                        >
                          Retailer
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Browse products, request quotes, and place wholesale orders
                      </p>
                    </div>
                  </label>
                </RadioGroup>
              </div>

              {/* Business Name */}
              <div className="space-y-2">
                <Label htmlFor="reg-business-name" className="text-sm text-muted-foreground">
                  Business Name <span className="text-neon-cyan">*</span>
                </Label>
                <Input
                  id="reg-business-name"
                  type="text"
                  placeholder="Your Company Name"
                  value={regBusinessName}
                  onChange={(e) => setRegBusinessName(e.target.value)}
                  className="bg-[#0a0a20] border-border/60 focus:border-neon-purple focus:ring-neon-purple/20 h-11"
                />
              </div>

              {/* Business Type & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-business-type" className="text-sm text-muted-foreground">
                    Business Type
                  </Label>
                  <Input
                    id="reg-business-type"
                    type="text"
                    placeholder="e.g. Electronics, Textiles"
                    value={regBusinessType}
                    onChange={(e) => setRegBusinessType(e.target.value)}
                    className="bg-[#0a0a20] border-border/60 focus:border-neon-purple focus:ring-neon-purple/20 h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-city" className="text-sm text-muted-foreground">
                    City
                  </Label>
                  <Input
                    id="reg-city"
                    type="text"
                    placeholder="e.g. Lahore, Karachi"
                    value={regCity}
                    onChange={(e) => setRegCity(e.target.value)}
                    className="bg-[#0a0a20] border-border/60 focus:border-neon-purple focus:ring-neon-purple/20 h-11"
                  />
                </div>
              </div>

              {/* Terms checkbox */}
              <div className="flex items-start gap-3 pt-1">
                <Checkbox
                  id="reg-terms"
                  checked={regAgreeTerms}
                  onCheckedChange={(checked) => setRegAgreeTerms(checked === true)}
                  className="mt-0.5 border-border/50 data-[state=checked]:bg-neon-cyan data-[state=checked]:border-neon-cyan"
                />
                <label
                  htmlFor="reg-terms"
                  className="text-xs text-muted-foreground leading-relaxed cursor-pointer"
                >
                  I agree to the{' '}
                  <span className="text-neon-cyan hover:underline cursor-pointer">
                    Terms of Service
                  </span>{' '}
                  and{' '}
                  <span className="text-neon-cyan hover:underline cursor-pointer">
                    Privacy Policy
                  </span>
                </label>
              </div>

              {/* Create Account Button */}
              <Button
                type="submit"
                disabled={regLoading}
                className="w-full glow-button gradient-cyan-purple-strong text-white font-semibold h-11 rounded-lg"
              >
                {regLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
