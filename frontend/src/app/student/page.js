'use client';

import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { FileText, User, DollarSign, Trophy, ArrowRight, Plus, Eye, RefreshCw, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StudentDashboard() {
  const { user, loading, initialized } = useAuth();
  const { isConnected, connect } = useWallet();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  const getMockDashboardData = () => ({
    total_applications: 3,
    approved_applications: 1,
    pending_applications: 1,
    rejected_applications: 1,
    total_awarded: 5000,
    recent_applications: [
      {
        id: 1,
        title: 'Academic Excellence Scholarship',
        amount: 5000,
        status: 'approved',
        date_applied: '2024-11-15',
        description: 'Merit-based scholarship for academic achievement',
        created_at: '2024-11-15T10:00:00Z',
        financial_need_amount: '5000'
      },
      {
        id: 2,
        title: 'STEM Innovation Grant',
        amount: 3000,
        status: 'pending',
        date_applied: '2024-11-12',
        description: 'Supporting students in STEM fields',
        created_at: '2024-11-12T14:30:00Z',
        financial_need_amount: '3000'
      },
      {
        id: 3,
        title: 'Community Service Award',
        amount: 1000,
        status: 'rejected',
        date_applied: '2024-11-10',
        description: 'Recognition for community involvement and service',
        created_at: '2024-11-10T09:15:00Z',
        financial_need_amount: '1000'
      }
    ]
  });

  useEffect(() => {
    if (initialized && (!user || user.role !== 'student')) {
      router.push('/');
    }
  }, [user, initialized, router]);

  // Fallback timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loadingDashboard && user) {
        console.warn('Dashboard loading timeout - using demo data');
        setDashboardData(getMockDashboardData());
        setLoadingDashboard(false);
      }
    }, 10000); // 10 seconds timeout

    return () => clearTimeout(timeout);
  }, [loadingDashboard, user]);

  const fetchDashboardData = async () => {
    if (!user) return; // Don't fetch if no user
    
    setLoadingDashboard(true);
    
    try {
      const response = await apiClient.getStudentDashboard();
      
      if (response.error) {
        console.warn('Using demo data:', response.error);
        setDashboardData(getMockDashboardData());
        // Show info message instead of error for demo mode
        toast('Using demo data - full backend features may be limited', {
          duration: 3000,
          icon: '💻',
          style: {
            background: '#EBF8FF',
            color: '#2563EB',
            border: '1px solid #3B82F6'
          }
        });
      } else {
        console.log('Student dashboard data received:', response.data);
        setDashboardData(response.data);
        
        // Check if wallet setup is required
        if (response.data?.wallet_setup_required) {
          toast('Wallet setup required to access full features', {
            duration: 4000,
            icon: '🔗',
            style: {
              background: '#FEF3C7',
              color: '#92400E',
              border: '1px solid #F59E0B'
            }
          });
        }
        console.log('Dashboard data loaded successfully');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDashboardData(getMockDashboardData());
      toast.error('Failed to load dashboard data');
    } finally {
      setLoadingDashboard(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  // Auto-refresh dashboard data every 30 seconds to catch updates
  useEffect(() => {
    if (user) {
      const interval = setInterval(() => {
        fetchDashboardData();
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [user]);

  const handleRefresh = () => {
    toast.success('Refreshing dashboard...');
    fetchDashboardData();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || user.role !== 'student') {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-purple-50 to-blue-100 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full mix-blend-multiply animate-float"
            style={{
              background: `linear-gradient(135deg, #7B68EE ${Math.random() * 50}%, #4169E1 100%)`,
              width: `${Math.random() * 200 + 50}px`,
              height: `${Math.random() * 200 + 50}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 10}s`,
            }}
          />
        ))}
      </div>

      <div className="relative space-y-6 p-6">
      {/* Welcome Section */}
      <div className="text-center py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="inline-block px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium shadow-lg mb-8">
            🎓 Student Dashboard
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Welcome back,<br />
            <span className="bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {user.display_name || user.email}!
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-700 max-w-2xl mx-auto mb-8">
            Track your scholarship applications and manage your educational journey with blockchain transparency.
          </p>

          <div className="flex justify-center">
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              size="lg"
              disabled={loadingDashboard}
              className="flex items-center gap-2 px-6 py-3 border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              <RefreshCw className={`h-5 w-5 ${loadingDashboard ? 'animate-spin' : ''}`} />
              {loadingDashboard ? 'Refreshing...' : 'Refresh Dashboard'}
            </Button>
          </div>
        </div>
      </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="group relative bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-transparent hover:-translate-y-2">
              <div className="absolute inset-0 bg-linear-to-br from-blue-500 to-blue-600 opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity" />

              <div className="flex items-center">
                <div className="inline-flex p-3 rounded-xl bg-linear-to-br from-blue-500 to-blue-600 mb-4 shadow-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-600 truncate">Total Applications</p>
                <p className="text-3xl font-bold text-gray-900">
                  {loadingDashboard ? '...' : dashboardData?.total_applications || 0}
                </p>
              </div>
            </div>

            <div className="group relative bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-transparent hover:-translate-y-2">
              <div className="absolute inset-0 bg-linear-to-br from-green-500 to-green-600 opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity" />

              <div className="flex items-center">
                <div className="inline-flex p-3 rounded-xl bg-linear-to-br from-green-500 to-green-600 mb-4 shadow-lg">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-600 truncate">Approved</p>
                <p className="text-3xl font-bold text-green-600">
                  {loadingDashboard ? '...' : dashboardData?.approved_applications || 0}
                </p>
              </div>
            </div>

            <div className="group relative bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-transparent hover:-translate-y-2">
              <div className="absolute inset-0 bg-linear-to-br from-yellow-500 to-orange-500 opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity" />

              <div className="flex items-center">
                <div className="inline-flex p-3 rounded-xl bg-linear-to-br from-yellow-500 to-orange-500 mb-4 shadow-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-600 truncate">Total Awarded</p>
                <p className="text-3xl font-bold text-gray-900">
                  {loadingDashboard ? '...' : `$${(dashboardData?.total_awarded || 0).toLocaleString()}`}
                </p>
              </div>
            </div>

            <div className="group relative bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-transparent hover:-translate-y-2">
              <div className="absolute inset-0 bg-linear-to-br from-purple-500 to-purple-600 opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity" />

              <div className="flex items-center">
                <div className="inline-flex p-3 rounded-xl bg-linear-to-br from-purple-500 to-purple-600 mb-4 shadow-lg">
                  <User className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-600 truncate">Profile</p>
                <p className="text-lg font-semibold text-gray-900">
                  {user.wallet_address ? 'Complete' : 'Incomplete'}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="group relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-transparent hover:-translate-y-2 cursor-pointer"
                 onClick={() => router.push('/student/applications')}>
              <div className="absolute inset-0 bg-linear-to-br from-green-500 to-green-600 opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity" />

              <div className="inline-flex p-4 rounded-xl bg-linear-to-br from-green-500 to-green-600 mb-6 shadow-lg">
                <Plus className="w-8 h-8 text-white" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Apply for Scholarship
              </h3>

              <p className="text-green-600 font-semibold mb-4">
                Submit a new scholarship application
              </p>

              <p className="text-gray-600 leading-relaxed mb-6">
                Start your journey towards educational funding with our streamlined application process.
              </p>

              <Button className="w-full bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl"
                      onClick={(e) => { e.stopPropagation(); router.push('/student/applications'); }}>
                Start Application
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>

            <div className="group relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-transparent hover:-translate-y-2 cursor-pointer"
                 onClick={() => router.push('/student/applications')}>
              <div className="absolute inset-0 bg-linear-to-br from-blue-500 to-blue-600 opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity" />

              <div className="inline-flex p-4 rounded-xl bg-linear-to-br from-blue-500 to-blue-600 mb-6 shadow-lg">
                <Eye className="w-8 h-8 text-white" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                View Applications
              </h3>

              <p className="text-blue-600 font-semibold mb-4">
                Track your application status
              </p>

              <p className="text-gray-600 leading-relaxed mb-6">
                Monitor the progress of your scholarship applications with real-time updates.
              </p>

              <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 shadow-lg hover:shadow-xl"
                      onClick={(e) => { e.stopPropagation(); router.push('/student/applications'); }}>
                View All Applications
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>

            <div className="group relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-transparent hover:-translate-y-2 cursor-pointer"
                 onClick={() => router.push('/student/profile')}>
              <div className="absolute inset-0 bg-linear-to-br from-purple-500 to-purple-600 opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity" />

              <div className="inline-flex p-4 rounded-xl bg-linear-to-br from-purple-500 to-purple-600 mb-6 shadow-lg">
                <User className="w-8 h-8 text-white" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Update Profile
              </h3>

              <p className="text-purple-600 font-semibold mb-4">
                Manage your profile information
              </p>

              <p className="text-gray-600 leading-relaxed mb-6">
                Keep your profile up to date to ensure smooth application processing.
              </p>

              <Button variant="outline" className="w-full border-purple-600 text-purple-600 hover:bg-purple-50 shadow-lg hover:shadow-xl"
                      onClick={(e) => { e.stopPropagation(); router.push('/student/profile'); }}>
                Edit Profile
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>

            <div className="group relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-transparent hover:-translate-y-2 cursor-pointer"
                 onClick={() => router.push('/student/wallet')}>
              <div className="absolute inset-0 bg-linear-to-br from-green-500 to-teal-500 opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity" />

              <div className="inline-flex p-4 rounded-xl bg-linear-to-br from-green-500 to-teal-500 mb-6 shadow-lg">
                <Wallet className="w-8 h-8 text-white" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {isConnected ? 'Manage Wallet' : 'Connect Wallet'}
              </h3>

              <p className="text-green-600 font-semibold mb-4">
                {isConnected ? 'View wallet and transactions' : 'Connect your Stellar wallet'}
              </p>

              <p className="text-gray-600 leading-relaxed mb-6">
                {isConnected 
                  ? 'Monitor your wallet balance and transaction history.' 
                  : 'Connect your Freighter wallet to receive scholarship payments.'
                }
              </p>

              <Button 
                className={`w-full shadow-lg hover:shadow-xl ${isConnected ? 'bg-green-600 hover:bg-green-700' : 'bg-green-600 hover:bg-green-700'}`}
                onClick={(e) => { 
                  e.stopPropagation(); 
                  if (!isConnected) {
                    connect();
                  } else {
                    router.push('/student/wallet');
                  }
                }}
              >
                {isConnected ? 'View Wallet' : 'Connect Wallet'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Recent Applications */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  Recent Applications
                </h2>
                <p className="text-xl text-gray-600">
                  Your latest scholarship applications
                </p>
              </div>
              <Button variant="outline" size="lg" onClick={() => router.push('/student/applications')}
                      className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 shadow-lg hover:shadow-xl">
                View All
              </Button>
            </div>

            {loadingDashboard ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : dashboardData?.recent_applications?.length > 0 ? (
              <div className="space-y-6">
                {dashboardData.recent_applications.map((application) => (
                  <div
                    key={application.id}
                    className="group relative bg-gray-50 p-6 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200 hover:border-blue-200"
                    onClick={() => router.push(`/student/applications/${application.id}`)}
                  >
                    <div className="absolute inset-0 bg-linear-to-r from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity" />

                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-blue-100 rounded-lg shrink-0 group-hover:bg-blue-200 transition-colors">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            Scholarship Application
                          </p>
                          <p className="text-sm text-gray-500">
                            Applied {new Date(application.applied_at || application.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-bold text-gray-900">
                            ${parseInt(application.scholarship_amount_requested || application.financial_need_amount || 0).toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500">Amount requested</p>
                        </div>
                        {getStatusBadge(application.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="p-6 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <FileText className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No Applications Yet</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Start by submitting your first scholarship application to begin your journey towards educational funding.
                </p>
                <Button onClick={() => router.push('/student/applications')}
                        className="bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl px-8 py-3">
                  Submit Application
                </Button>
              </div>
            )}
          </div>
    </div>

    <style>{`
      @keyframes float {
        0%, 100% {
          transform: translateY(0) translateX(0) rotate(0deg);
        }
        33% {
          transform: translateY(-20px) translateX(15px) rotate(120deg);
        }
        66% {
          transform: translateY(15px) translateX(-15px) rotate(240deg);
        }
      }
      .animate-float {
        animation: float linear infinite;
      }
    `}</style>
    </div>
  );
}