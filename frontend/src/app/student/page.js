'use client';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { FileText, User, DollarSign, Trophy, ArrowRight, Plus, Eye, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StudentDashboard() {
  const { user, loading, initialized } = useAuth();
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
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user.display_name || user.email}!
            </h1>
            <p className="text-gray-600">Here's an overview of your scholarship applications and activity.</p>
          </div>
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            size="sm"
            disabled={loadingDashboard}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loadingDashboard ? 'animate-spin' : ''}`} />
            {loadingDashboard ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg shrink-0">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4 min-w-0">
                    <p className="text-sm font-medium text-gray-600 truncate">Total Applications</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {loadingDashboard ? '...' : dashboardData?.total_applications || 0}
                    </p>
                    {!loadingDashboard && (
                      <p className="text-xs text-gray-400">
                        Debug: {JSON.stringify(dashboardData?.total_applications)}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg shrink-0">
                    <Trophy className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4 min-w-0">
                    <p className="text-sm font-medium text-gray-600 truncate">Approved</p>
                    <p className="text-2xl font-bold text-green-600">
                      {loadingDashboard ? '...' : dashboardData?.approved_applications || 0}
                    </p>
                    {!loadingDashboard && (
                      <p className="text-xs text-gray-400">
                        Debug: {JSON.stringify(dashboardData?.approved_applications)}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-lg shrink-0">
                    <DollarSign className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4 min-w-0">
                    <p className="text-sm font-medium text-gray-600 truncate">Total Awarded</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {loadingDashboard ? '...' : `$${(dashboardData?.total_awarded || 0).toLocaleString()}`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg shrink-0">
                    <User className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4 min-w-0">
                    <p className="text-sm font-medium text-gray-600 truncate">Profile</p>
                    <p className="text-sm text-gray-500">
                      {user.wallet_address ? 'Complete' : 'Incomplete'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white shadow-sm hover:shadow-lg transition-all cursor-pointer group" 
                  onClick={() => router.push('/student/applications')}>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 group-hover:text-green-600 transition-colors">
                  <Plus className="h-5 w-5 text-green-600" />
                  Apply for Scholarship
                </CardTitle>
                <CardDescription>Submit a new scholarship application</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button className="w-full bg-green-600 hover:bg-green-700" 
                        onClick={(e) => { e.stopPropagation(); router.push('/student/applications'); }}>
                  Start Application
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm hover:shadow-lg transition-all cursor-pointer group" 
                  onClick={() => router.push('/student/applications')}>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                  <Eye className="h-5 w-5 text-blue-600" />
                  View Applications
                </CardTitle>
                <CardDescription>Track your application status</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50" 
                        onClick={(e) => { e.stopPropagation(); router.push('/student/applications'); }}>
                  View All Applications
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm hover:shadow-lg transition-all cursor-pointer group" 
                  onClick={() => router.push('/student/profile')}>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 group-hover:text-purple-600 transition-colors">
                  <User className="h-5 w-5 text-purple-600" />
                  Update Profile
                </CardTitle>
                <CardDescription>Manage your profile information</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button variant="outline" className="w-full border-purple-600 text-purple-600 hover:bg-purple-50" 
                        onClick={(e) => { e.stopPropagation(); router.push('/student/profile'); }}>
                  Edit Profile
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Applications */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Recent Applications</CardTitle>
                  <CardDescription>Your latest scholarship applications</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => router.push('/student/applications')}>
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingDashboard ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : dashboardData?.recent_applications?.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.recent_applications.map((application) => (
                    <div
                      key={application.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => router.push(`/student/applications/${application.id}`)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-100 rounded-lg shrink-0">
                          <FileText className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Scholarship Application</p>
                          <p className="text-sm text-gray-500">
                            Applied {new Date(application.applied_at || application.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            ${parseInt(application.scholarship_amount_requested || application.financial_need_amount || 0).toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500">Amount requested</p>
                        </div>
                        {getStatusBadge(application.status)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <FileText className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Yet</h3>
                  <p className="text-gray-600 mb-4">Start by submitting your first scholarship application.</p>
                  <Button onClick={() => router.push('/student/applications')} className="bg-blue-600 hover:bg-blue-700">
                    Submit Application
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
    </div>
  );
}