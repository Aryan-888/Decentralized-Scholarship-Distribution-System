'use client';

import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { 
  Users, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User,
  Calendar,
  ArrowRight,
  Eye,
  UserCheck,
  Settings
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { user, loading, initialized } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  useEffect(() => {
    if (initialized && (!user || user.role !== 'admin')) {
      router.push('/');
    }
  }, [user, initialized, router]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setLoadingDashboard(true);
    
    const response = await apiClient.getAdminDashboard();
    
    if (response.error) {
      console.warn('Using demo data:', response.error);
      setDashboardData(getMockAdminDashboardData());
      toast('Admin demo mode: Showing sample data', {
        duration: 3000,
        icon: '⚙️',
        style: {
          background: '#EBF8FF',
          color: '#2563EB',
          border: '1px solid #3B82F6'
        }
      });
    } else {
      setDashboardData(response.data);
      console.log('Admin dashboard data loaded successfully');
    }
    
    setLoadingDashboard(false);
  };

  const getMockAdminDashboardData = () => ({
    statistics: {
      total_applications: 156,
      pending_applications: 23,
      approved_applications: 89,
      rejected_applications: 44,
      total_disbursed: 287500,
      total_students_helped: 134
    },
    recent_applications: [
      {
        id: 1,
        student_name: 'John Doe',
        email: 'john@example.com',
        scholarship_amount_requested: 2500,
        status: 'pending',
        applied_at: '2024-11-20',
        gpa: 8.2,
        university: 'State University'
      },
      {
        id: 2,
        student_name: 'Jane Smith',
        email: 'jane@example.com',
        scholarship_amount_requested: 3000,
        status: 'approved',
        applied_at: '2024-11-19',
        gpa: 9.1,
        university: 'Tech Institute'
      },
      {
        id: 3,
        student_name: 'Mike Johnson',
        email: 'mike@example.com',
        scholarship_amount_requested: 1500,
        status: 'pending',
        applied_at: '2024-11-18',
        gpa: 7.6,
        university: 'Community College'
      }
    ]
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success" className="flex items-center gap-1"><CheckCircle className="h-3 w-3" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="h-3 w-3" />Rejected</Badge>;
      case 'pending':
        return <Badge variant="warning" className="flex items-center gap-1"><Clock className="h-3 w-3" />Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null; // Will redirect in useEffect
  }

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Manage scholarship applications and system overview</p>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Applications</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {loadingDashboard ? '...' : dashboardData?.statistics?.total_applications || 0}
                    </p>
                    <p className="text-xs text-gray-500">
                      {loadingDashboard ? '' : `${dashboardData?.statistics?.pending_applications || 0} pending review`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Approved</p>
                    <p className="text-2xl font-bold text-green-600">
                      {loadingDashboard ? '...' : dashboardData?.statistics?.approved_applications || 0}
                    </p>
                    <p className="text-xs text-gray-500">
                      {loadingDashboard ? '' : `${((dashboardData?.statistics?.approved_applications || 0) / Math.max(dashboardData?.statistics?.total_applications || 1, 1) * 100).toFixed(1)}% approval rate`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Students</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {loadingDashboard ? '...' : dashboardData?.statistics?.total_students_helped || 0}
                    </p>
                    <p className="text-xs text-gray-500">Registered users</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Distributed</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {loadingDashboard ? '...' : `$${(dashboardData?.statistics?.total_disbursed || 0).toLocaleString()}`}
                    </p>
                    <p className="text-xs text-gray-500">In scholarships</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/admin/applications')}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Eye className="h-4 w-4 text-blue-600" />
                  Review Applications
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Button variant="outline" size="sm" className="w-full">
                  View All
                  <ArrowRight className="h-3 w-3 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/admin/students')}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <UserCheck className="h-4 w-4 text-green-600" />
                  Manage Students
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Button variant="outline" size="sm" className="w-full">
                  Student List
                  <ArrowRight className="h-3 w-3 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/admin/statistics')}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  View Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Button variant="outline" size="sm" className="w-full">
                  Analytics
                  <ArrowRight className="h-3 w-3 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/admin/settings')}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Settings className="h-4 w-4 text-gray-600" />
                  System Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Button variant="outline" size="sm" className="w-full">
                  Configure
                  <ArrowRight className="h-3 w-3 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Applications */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Recent Applications</CardTitle>
                    <CardDescription>Latest scholarship applications requiring review</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => router.push('/admin/applications')}>
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingDashboard ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : dashboardData?.recent_applications?.length > 0 ? (
                  <div className="space-y-3">
                    {dashboardData.recent_applications.slice(0, 5).map((application) => (
                      <div
                        key={application.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => router.push(`/admin/applications/${application.id}`)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="p-1.5 bg-blue-100 rounded-lg">
                            <User className="h-3 w-3 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-sm text-gray-900">{application.student_name}</p>
                            <p className="text-xs text-gray-500">{application.university}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">${parseInt(application.scholarship_amount_requested || 0).toLocaleString()}</span>
                          {getStatusBadge(application.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Recent Applications</h3>
                    <p className="text-gray-600">New applications will appear here when students submit them.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* System Status & Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>System Overview</CardTitle>
                <CardDescription>Key metrics and system status</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingDashboard ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">
                          {((dashboardData?.approved_applications || 0) / Math.max(dashboardData?.total_applications || 1, 1) * 100).toFixed(1)}%
                        </p>
                        <p className="text-sm text-gray-600">Approval Rate</p>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">
                          ${((dashboardData?.total_distributed || 0) / Math.max(dashboardData?.approved_applications || 1, 1)).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">Avg. Award</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3 pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Pending Reviews</span>
                        <Badge variant="warning">{dashboardData?.pending_applications || 0}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Active Students</span>
                        <Badge variant="info">{dashboardData?.active_students || 0}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">This Month's Applications</span>
                        <Badge variant="outline">{dashboardData?.monthly_applications || 0}</Badge>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <Button 
                        className="w-full" 
                        size="sm"
                        onClick={() => router.push('/admin/statistics')}
                      >
                        View Detailed Analytics
                        <TrendingUp className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}