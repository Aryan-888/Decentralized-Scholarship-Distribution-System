'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  FileText, 
  User,
  Wallet,
  LogOut,
  Bell
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const studentNavItems = [
  {
    name: 'Dashboard',
    href: '/student',
    icon: LayoutDashboard,
  },
  {
    name: 'Applications',
    href: '/student/applications',
    icon: FileText,
  },
  {
    name: 'Wallet',
    href: '/student/wallet',
    icon: Wallet,
  },
  {
    name: 'Profile',
    href: '/student/profile',
    icon: User,
  },
];

export default function StudentLayout({ children }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
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
                Student Portal
              </h2>
              <p className="text-sm text-gray-600">Manage your scholarship applications</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6">
            {studentNavItems.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/student' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-blue-100 text-blue-700 shadow-md"
                      : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                  )}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  <span>{item.name}</span>
                  {item.name === 'Applications' && (
                    <Badge className="ml-2 bg-blue-100 text-blue-700 border-blue-200">
                      3
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center space-x-4 shrink-0">
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-600 hover:bg-blue-50">
              <Bell className="h-5 w-5" />
            </Button>
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-900">
                Welcome back, {user?.displayName || 'Student'}
              </div>
              <div className="text-xs text-gray-500">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
            <Button
              onClick={logout}
              variant="outline"
              size="sm"
              className="border-gray-300 text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden bg-white/95 backdrop-blur-sm border-b border-white/20 px-4 py-3">
          <nav className="flex items-center justify-between overflow-x-auto">
            {studentNavItems.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/student' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 min-w-0 shrink-0",
                    isActive
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                  )}
                >
                  <item.icon className="h-4 w-4 mb-1" />
                  <span className="truncate">{item.name}</span>
                  {item.name === 'Applications' && (
                    <Badge className="mt-1 bg-blue-100 text-blue-700 border-blue-200 text-xs px-1 py-0">
                      3
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto relative">
          {children}
        </main>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0) rotate(0deg);
          }
          33% {
            transform: translateY(-15px) translateX(10px) rotate(120deg);
          }
          66% {
            transform: translateY(10px) translateX(-10px) rotate(240deg);
          }
        }
        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </div>
  );
}