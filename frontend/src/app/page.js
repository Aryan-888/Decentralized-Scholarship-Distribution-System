'use client';

import { useAuth } from '@/hooks/useAuth';
import { LoginPage } from '@/components/LoginPage';
import { Navbar } from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { user, loading, initialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (initialized && user) {
      // Redirect based on user role
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/student');
      }
    }
  }, [user, initialized, router]);

  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  // Show loading while redirecting
  return (
    <div>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Redirecting to your dashboard...</p>
        </div>
      </div>
    </div>
  );
}