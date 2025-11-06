'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Settings,
  Users,
  DollarSign,
  LogOut,
  Bell,
  Wallet,
  Mail
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const adminNavItems = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    name: 'Applications',
    href: '/admin/applications',
    icon: FileText,
  },
  {
    name: 'Statistics',
    href: '/admin/statistics',
    icon: BarChart3,
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { isConnected, publicKey, connect, disconnect, isLoading } = useWallet();
  const [backgroundElements, setBackgroundElements] = useState([]);

  useEffect(() => {
    // Generate background elements only on client side to avoid hydration mismatch
    const generateSeededRandom = (seed) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    const elements = [...Array(10)].map((_, i) => ({
      background: `linear-gradient(135deg, #7B68EE ${Math.round(generateSeededRandom(i) * 50)}%, #4169E1 100%)`,
      width: `${Math.round(generateSeededRandom(i + 10) * 150 + 50)}px`,
      height: `${Math.round(generateSeededRandom(i + 20) * 150 + 50)}px`,
      left: `${Math.round(generateSeededRandom(i + 30) * 100)}%`,
      top: `${Math.round(generateSeededRandom(i + 40) * 100)}%`,
      animationDelay: `${Math.round(generateSeededRandom(i + 50) * 5)}s`,
      animationDuration: `${Math.round(generateSeededRandom(i + 60) * 10 + 10)}s`,
    }));
    setBackgroundElements(elements);
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-purple-50 to-blue-100 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        {backgroundElements.map((style, i) => (
          <div
            key={i}
            className="absolute rounded-full mix-blend-multiply animate-float"
            style={style}
          />
        ))}
      </div>

      {/* Layout container */}
      <div className="relative flex flex-col min-h-screen">
        {/* Top navigation */}
        <div className="flex items-center justify-between h-20 px-6 bg-white/95 backdrop-blur-sm border-b border-white/20 shadow-lg shrink-0">
          <div className="flex items-center space-x-4 shrink-0">
            <div>
              <h2 className="text-xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Admin Panel
              </h2>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {adminNavItems.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/admin' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105",
                    isActive
                      ? "bg-linear-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/80"
                  )}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Right side - User info, wallet, and logout */}
          <div className="flex items-center space-x-4 shrink-0">
            {/* Wallet Connection */}
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <Button
                  onClick={disconnect}
                  variant="outline"
                  size="sm"
                  className="bg-green-50 hover:bg-green-100 border-green-200 text-green-700 hover:text-green-800"
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  <span className="hidden lg:inline">
                    {publicKey ? `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}` : 'Connected'}
                  </span>
                </Button>
              ) : (
                <Button
                  onClick={connect}
                  disabled={isLoading}
                  size="sm"
                  className="bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  <span className="hidden lg:inline">
                    {isLoading ? 'Connecting...' : 'Connect Wallet'}
                  </span>
                  <span className="lg:hidden">
                    {isLoading ? '...' : 'Connect'}
                  </span>
                </Button>
              )}
            </div>

            <div className="hidden lg:flex items-center space-x-3">
              <div className="text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  <span className="font-medium text-gray-900">{user?.email || 'admin@example.com'}</span>
                </div>
                <div className="text-xs text-gray-500">
                  Welcome back, <span className="font-medium">{user?.displayName || 'Admin'}</span>
                </div>
              </div>
              <div className="w-10 h-10 bg-linear-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-medium text-sm">
                  {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'A'}
                </span>
              </div>
            </div>

            <Button
              onClick={logout}
              variant="outline"
              size="sm"
              className="bg-white/80 hover:bg-white border-white/30 text-gray-700 hover:text-gray-900 shadow-sm"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden bg-white/95 backdrop-blur-sm border-b border-white/20 px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            {/* Mobile Wallet Connection */}
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <Button
                  onClick={disconnect}
                  variant="outline"
                  size="sm"
                  className="bg-green-50 hover:bg-green-100 border-green-200 text-green-700 hover:text-green-800 text-xs"
                >
                  <Wallet className="h-3 w-3 mr-1" />
                  {publicKey ? `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}` : 'Connected'}
                </Button>
              ) : (
                <Button
                  onClick={connect}
                  disabled={isLoading}
                  size="sm"
                  className="bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg text-xs"
                >
                  <Wallet className="h-3 w-3 mr-1" />
                  {isLoading ? 'Connecting...' : 'Connect Wallet'}
                </Button>
              )}
            </div>

            {/* Mobile User Info */}
            <div className="text-xs text-gray-600 text-center">
              <div className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                <span className="font-medium">{user?.email || 'admin@example.com'}</span>
              </div>
            </div>
          </div>

          <nav className="flex items-center justify-center space-x-1 overflow-x-auto">
            {adminNavItems.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/admin' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap",
                    isActive
                      ? "bg-linear-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/80"
                  )}
                >
                  <item.icon className="mr-1 h-3 w-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}