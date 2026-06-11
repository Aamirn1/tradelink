'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User as UserIcon,
  Mail,
  Phone,
  Building2,
  MapPin,
  Shield,
  CheckCircle2,
  Lock,
  Trash2,
  Save,
  Eye,
  EyeOff,
  Camera,
  Tag,
  Briefcase,
} from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CATEGORIES } from '@/types';

// ── Animation ──────────────────────────────────────────────

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

// ── Component ──────────────────────────────────────────────

export function ProfileView() {
  const { user } = useAppStore();

  // Form state
  const [name, setName] = useState(user?.name ?? '');
  const [email] = useState(user?.email ?? '');
  const [phone] = useState(user?.phone ?? '');
  const [businessName, setBusinessName] = useState(user?.businessName ?? '');
  const [businessType, setBusinessType] = useState(user?.businessType ?? '');
  const [category, setCategory] = useState(user?.category ?? '');
  const [city, setCity] = useState(user?.city ?? '');
  const [address, setAddress] = useState(user?.address ?? '');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Delete dialog
  const [deleteConfirm, setDeleteConfirm] = useState('');

  const roleLabel = user?.role === 'WHOLESALER' ? 'Wholesaler' : user?.role === 'RETAILER' ? 'Retailer' : 'Admin';
  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? 'U';

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 p-4 md:p-6 custom-scrollbar max-w-4xl mx-auto"
    >
      {/* ── Profile Header ────────────────────────────── */}
      <motion.div variants={item}>
        <Card className="glass border-0 overflow-hidden">
          <div className="gradient-cyan-purple p-6 md:p-8 flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group">
              <div className="h-24 w-24 rounded-full gradient-cyan-purple-strong flex items-center justify-center text-3xl font-bold text-primary-foreground ring-4 ring-neon-cyan/20">
                {initials}
              </div>
              <button className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-bold text-primary-foreground">{user?.name}</h1>
              <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
                <Badge className="gradient-cyan-purple-strong text-primary-foreground border-0 text-xs">
                  <Briefcase className="h-3 w-3 mr-1" /> {roleLabel}
                </Badge>
                {user?.isVerified && (
                  <Badge className="border-neon-green/50 text-neon-green bg-neon-green/10 text-xs">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Verified
                  </Badge>
                )}
              </div>
              <p className="text-primary-foreground/70 text-sm mt-1">{user?.email}</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* ── Personal Info ──────────────────────────────── */}
      <motion.div variants={item}>
        <Card className="glass border-0">
          <CardHeader>
            <CardTitle className="neon-text-cyan text-lg flex items-center gap-2">
              <UserIcon className="h-5 w-5" /> Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm text-muted-foreground">
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-surface border-border/50 focus:border-neon-cyan focus:ring-neon-cyan/20"
                />
              </div>

              {/* Email (read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm text-muted-foreground">
                  Email Address
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    value={email}
                    readOnly
                    className="bg-surface/50 border-border/30 pr-20 text-muted-foreground"
                  />
                  <Badge className="absolute right-2 top-1/2 -translate-y-1/2 border-neon-green/50 text-neon-green bg-neon-green/10 text-[10px]">
                    <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" /> Verified
                  </Badge>
                </div>
              </div>

              {/* Phone (read-only) */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm text-muted-foreground">
                  Phone Number
                </Label>
                <div className="relative">
                  <Input
                    id="phone"
                    value={phone || 'Not set'}
                    readOnly
                    className="bg-surface/50 border-border/30 pr-20 text-muted-foreground"
                  />
                  {phone && (
                    <Badge className="absolute right-2 top-1/2 -translate-y-1/2 border-neon-green/50 text-neon-green bg-neon-green/10 text-[10px]">
                      <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" /> Verified
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Business Info ──────────────────────────────── */}
      <motion.div variants={item}>
        <Card className="glass border-0">
          <CardHeader>
            <CardTitle className="neon-text-purple text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5" /> Business Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Business Name */}
              <div className="space-y-2">
                <Label htmlFor="businessName" className="text-sm text-muted-foreground">
                  Business Name
                </Label>
                <Input
                  id="businessName"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="bg-surface border-border/50 focus:border-neon-cyan focus:ring-neon-cyan/20"
                />
              </div>

              {/* Business Type */}
              <div className="space-y-2">
                <Label htmlFor="businessType" className="text-sm text-muted-foreground">
                  Business Type
                </Label>
                <Select value={businessType} onValueChange={setBusinessType}>
                  <SelectTrigger className="bg-surface border-border/50 focus:border-neon-cyan focus:ring-neon-cyan/20">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border/50">
                    <SelectItem value="LLC">LLC</SelectItem>
                    <SelectItem value="Corporation">Corporation</SelectItem>
                    <SelectItem value="Sole Proprietorship">Sole Proprietorship</SelectItem>
                    <SelectItem value="Partnership">Partnership</SelectItem>
                    <SelectItem value="Cooperative">Cooperative</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm text-muted-foreground">
                  Category
                </Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="bg-surface border-border/50 focus:border-neon-cyan focus:ring-neon-cyan/20">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border/50">
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* City */}
              <div className="space-y-2">
                <Label htmlFor="city" className="text-sm text-muted-foreground">
                  City
                </Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="bg-surface border-border/50 focus:border-neon-cyan focus:ring-neon-cyan/20"
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm text-muted-foreground">
                Address
              </Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="bg-surface border-border/50 focus:border-neon-cyan focus:ring-neon-cyan/20"
              />
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-2">
              <Button className="glow-button gradient-cyan-purple-strong text-primary-foreground border-0 font-semibold">
                <Save className="h-4 w-4 mr-2" /> Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Change Password ────────────────────────────── */}
      <motion.div variants={item}>
        <Card className="glass border-0">
          <CardHeader>
            <CardTitle className="neon-text-cyan text-lg flex items-center gap-2">
              <Lock className="h-5 w-5" /> Change Password
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Current Password */}
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-sm text-muted-foreground">
                  Current Password
                </Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="bg-surface border-border/50 focus:border-neon-cyan focus:ring-neon-cyan/20 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm text-muted-foreground">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-surface border-border/50 focus:border-neon-cyan focus:ring-neon-cyan/20 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm text-muted-foreground">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-surface border-border/50 focus:border-neon-cyan focus:ring-neon-cyan/20"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                className="neon-border-cyan hover:neon-glow-cyan font-semibold"
              >
                <Lock className="h-4 w-4 mr-2" /> Update Password
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Danger Zone ────────────────────────────────── */}
      <motion.div variants={item}>
        <Card className="glass border-0 border-l-4 border-l-red-500">
          <CardHeader>
            <CardTitle className="text-red-400 text-lg flex items-center gap-2">
              <Trash2 className="h-5 w-5" /> Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Once you delete your account, there is no going back. All your data, orders, and
              conversations will be permanently removed.
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10 font-semibold"
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Delete Account
                </Button>
              </DialogTrigger>
              <DialogContent className="glass border-border/50">
                <DialogHeader>
                  <DialogTitle className="text-red-400 flex items-center gap-2">
                    <Trash2 className="h-5 w-5" /> Delete Account
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    This action cannot be undone. This will permanently delete your account and
                    remove all your data from our servers.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 py-4">
                  <p className="text-sm text-muted-foreground">
                    Please type <span className="font-mono font-bold text-red-400">DELETE</span> to
                    confirm:
                  </p>
                  <Input
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    placeholder='Type "DELETE" to confirm'
                    className="bg-surface border-border/50 focus:border-red-500 focus:ring-red-500/20"
                  />
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    className="border-border/50"
                    onClick={() => setDeleteConfirm('')}
                  >
                    Cancel
                  </Button>
                  <Button
                    disabled={deleteConfirm !== 'DELETE'}
                    className="bg-red-600 hover:bg-red-700 text-white border-0 font-semibold"
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Permanently Delete Account
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
