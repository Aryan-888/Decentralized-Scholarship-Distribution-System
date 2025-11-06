'use client';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-linear-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Manage scholarship applications, monitor system performance, and oversee student success
        </p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-linear-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {loadingDashboard ? '...' : dashboardData?.statistics?.total_applications || 0}
                </p>
                <p className="text-xs text-gray-500">
                  {loadingDashboard ? '' : (dashboardData?.statistics?.pending_applications || 0) + ' pending review'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-linear-to-r from-green-500 to-teal-600 rounded-xl shadow-lg">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold bg-linear-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                  {loadingDashboard ? '...' : dashboardData?.statistics?.approved_applications || 0}
                </p>
                <p className="text-xs text-gray-500">
                  {loadingDashboard ? '' : (((dashboardData?.statistics?.approved_applications || 0) / Math.max(dashboardData?.statistics?.total_applications || 1, 1) * 100).toFixed(1)) + '% approval rate'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-linear-to-r from-purple-500 to-pink-600 rounded-xl shadow-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {loadingDashboard ? '...' : dashboardData?.statistics?.total_students_helped || 0}
                </p>
                <p className="text-xs text-gray-500">Registered users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-linear-to-r from-yellow-500 to-orange-600 rounded-xl shadow-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Distributed</p>
                <p className="text-2xl font-bold bg-linear-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                  {loadingDashboard ? '...' : '$' + (dashboardData?.statistics?.total_disbursed || 0).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">In scholarships</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 bg-white/80 backdrop-blur-sm cursor-pointer" onClick={() => router.push('/admin/applications')}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-gray-800">
              <Eye className="h-5 w-5 text-blue-600" />
              Review Applications
            </CardTitle>
            <CardDescription>Manage and review scholarship applications</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button className="w-full bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg">
              View All
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 bg-white/80 backdrop-blur-sm cursor-pointer" onClick={() => router.push('/admin/statistics')}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-gray-800">
              <TrendingUp className="h-5 w-5 text-green-600" />
              View Statistics
            </CardTitle>
            <CardDescription>Analyze system performance and trends</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button className="w-full bg-linear-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white shadow-lg">
              Analytics
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 bg-white/80 backdrop-blur-sm cursor-pointer" onClick={() => router.push('/admin/settings')}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-gray-800">
              <Settings className="h-5 w-5 text-purple-600" />
              System Settings
            </CardTitle>
            <CardDescription>Configure application parameters</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button className="w-full bg-linear-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg">
              Configure
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 bg-white/80 backdrop-blur-sm cursor-pointer" onClick={() => router.push('/admin/students')}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-gray-800">
              <UserCheck className="h-5 w-5 text-teal-600" />
              Manage Students
            </CardTitle>
            <CardDescription>Oversee student accounts and data</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button className="w-full bg-linear-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white shadow-lg">
              Student List
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}