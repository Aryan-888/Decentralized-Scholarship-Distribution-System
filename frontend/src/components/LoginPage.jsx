'use client';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Shield, Wallet, CheckCircle } from 'lucide-react';

export function LoginPage() {
  const { login, loading } = useAuth();

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Scholarship DApp</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="min-h-screen flex items-center justify-center px-4 pt-20">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side - Information */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Decentralized Scholarship Platform
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Apply for scholarships, track applications, and receive funds directly to your cryptocurrency wallet with complete transparency.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Easy Application Process</h3>
                  <p className="text-gray-600">Submit scholarship applications with just a few clicks</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                  <Wallet className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Direct Crypto Payments</h3>
                  <p className="text-gray-600">Receive scholarship funds directly to your Stellar wallet</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                  <Shield className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Blockchain Security</h3>
                  <p className="text-gray-600">All transactions secured by Stellar blockchain technology</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Demo Mode:</span> This is a demonstration version with mock data. 
                All features are functional for testing and showcase purposes.
              </p>
            </div>
          </div>

          {/* Right Side - Login Card */}
          <div className="flex justify-center lg:justify-end">
            <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <GraduationCap className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">Welcome Back</CardTitle>
                <CardDescription className="text-gray-600">
                  Sign in to access your scholarship portal
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700 mb-3">Get access to:</p>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center justify-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Scholarship application system</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Application tracking dashboard</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Stellar wallet integration</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={login}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3"
                  size="lg"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span>Continue with Google</span>
                    </div>
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-xs text-gray-500 leading-relaxed">
                    By signing in, you agree to our terms of service and privacy policy.
                    <br />
                    <span className="inline-flex items-center mt-1">
                      <Shield className="h-3 w-3 mr-1" />
                      Secured by Firebase & Stellar Blockchain
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/50 backdrop-blur border-t">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              © 2025 Scholarship DApp. Powered by Stellar Blockchain.
            </p>
            <div className="flex space-x-4 text-sm text-gray-600">
              <span>Demo Version</span>
              <span>•</span>
              <span>Mock Data</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}