'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  FileText, 
  User,
  Wallet,
  Menu,
  X,
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-25 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 flex flex-col",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <h1 className="text-xl font-bold text-gray-900">Student Portal</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="mt-6 px-3 flex-1 overflow-y-auto">
          <div className="space-y-2">
            {studentNavItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/student' && pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                  {item.name === 'Applications' && (
                    <Badge className="ml-auto bg-blue-100 text-blue-800">3</Badge>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User info and logout */}
        <div className="p-4 border-t mt-auto">
          <div className="flex items-center mb-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{user?.displayName || 'Student'}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
          <Button
            onClick={logout}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top navigation - spans full width of remaining space */}
        <div className="flex items-center justify-between h-16 px-4 bg-white border-b lg:px-6 shrink-0">
          <div className="flex items-center space-x-4 shrink-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-700 lg:hidden"
            >
              <Menu size={24} />
            </button>
            <div className="text-sm font-medium text-gray-900 lg:hidden">
              Student Portal
            </div>
          </div>
          
          <div className="flex items-center space-x-4 shrink-0">
            <Button variant="ghost" size="sm">
              <Bell className="h-5 w-5" />
            </Button>
            <div className="text-sm text-gray-600 whitespace-nowrap">
              Welcome, {user?.displayName || 'Student'}
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}