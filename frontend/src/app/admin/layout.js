'use client';

import { useState } from 'react';
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
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 bg-white">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {adminNavItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/admin' && pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group",
                    isActive
                      ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className={cn(
                    "mr-3 h-5 w-5 transition-colors",
                    isActive ? "text-blue-700" : "text-gray-400 group-hover:text-gray-600"
                  )} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Profile Section */}
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'A'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.displayName || 'Admin User'}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <Button
              onClick={logout}
              variant="outline"
              size="sm"
              className="w-full justify-center text-gray-600 hover:text-gray-900 border-gray-300"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md lg:hidden"
            >
              <Menu size={20} />
            </button>
            
            <div className="hidden sm:block">
              <h2 className="text-lg font-semibold text-gray-900">
                {adminNavItems.find(item => 
                  pathname === item.href || 
                  (item.href !== '/admin' && pathname.startsWith(item.href))
                )?.name || 'Dashboard'}
              </h2>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="hidden md:block text-sm text-gray-500">
              Welcome back, <span className="font-medium text-gray-700">{user?.displayName || 'Admin'}</span>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-medium text-sm">
                {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'A'}
              </span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}