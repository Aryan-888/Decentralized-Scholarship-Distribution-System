'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, LogOut, User, Shield } from 'lucide-react';

export function Navbar() {
  const { user, logout, loading } = useAuth();
  const { walletInfo, connect, disconnect, connecting, isConnected } = useWallet();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleWalletAction = async () => {
    if (isConnected) {
      await disconnect();
    } else {
      await connect();
    }
  };

  if (loading) {
    return (
      <nav className="border-b bg-background">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="text-xl font-bold">Scholarship DApp</div>
            <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="border-b bg-white shadow-sm sticky top-0 z-50 w-full">
      <div className="container mx-auto px-4 py-3 max-w-full">
        <div className="flex flex-row items-center justify-between w-full min-h-10">
          <div className="flex flex-row items-center space-x-4 shrink-0">
            <div className="text-xl font-bold text-blue-600 whitespace-nowrap">🎓 Scholarship DApp</div>
            {user && (
              <div className="hidden md:flex flex-row items-center space-x-2 text-sm text-gray-600">
                {user.role === 'admin' && <Shield className="h-4 w-4" />}
                <span className="capitalize font-medium whitespace-nowrap">{user.role}</span>
              </div>
            )}
          </div>

          <div className="flex flex-row items-center space-x-2 sm:space-x-4 shrink-0">
            {user && (
              <>
                {/* Wallet Connection Button */}
                <Button
                  variant={isConnected ? "secondary" : "outline"}
                  size="sm"
                  onClick={handleWalletAction}
                  disabled={connecting}
                  className="flex flex-row items-center space-x-1 sm:space-x-2 whitespace-nowrap text-xs sm:text-sm"
                >
                  <Wallet className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                  <span className="hidden sm:inline">
                    {connecting ? 'Connecting...' : 
                     isConnected ? `${walletInfo?.publicKey?.slice(0, 4)}...${walletInfo?.publicKey?.slice(-3)}` : 
                     'Connect'}
                  </span>
                  <span className="sm:hidden">
                    {connecting ? '...' : isConnected ? '●' : 'W'}
                  </span>
                </Button>

                {/* User Menu */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex flex-row items-center space-x-1 sm:space-x-2 hover:bg-gray-100 whitespace-nowrap text-xs sm:text-sm"
                  >
                    <User className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                    <span className="hidden lg:inline truncate max-w-24 xl:max-w-32">{user.email}</span>
                    <span className="hidden sm:inline lg:hidden">User</span>
                  </Button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 z-50 min-w-64">
                      <Card className="shadow-lg border">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Account</CardTitle>
                          <CardDescription className="text-xs">
                            {user.email}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-0">
                          <div className="text-xs text-gray-600">
                            Role: <span className="capitalize font-medium">{user.role}</span>
                          </div>
                          {user.wallet_address && (
                            <div className="text-xs text-gray-600">
                              Wallet: {user.wallet_address.slice(0, 10)}...{user.wallet_address.slice(-6)}
                            </div>
                          )}
                          <div className="pt-2 border-t">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={logout}
                              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <LogOut className="h-4 w-4 mr-2" />
                              Sign Out
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-10"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </nav>
  );
}