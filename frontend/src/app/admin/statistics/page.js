'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Award, 
  Clock, 
  CheckCircle,
  XCircle,
  BarChart3,
  PieChart,
  Download,
  Calendar,
  Filter
} from 'lucide-react';

export default function AdminStatistics() {
  const { user } = useAuth();
  const [statistics, setStatistics] = useState(null);
  const [applications, setApplications] = useState([]);
  const [timeframe, setTimeframe] = useState('all'); // all, month, quarter, year
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchStatistics();
      fetchApplications();
    }
  }, [user, timeframe]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from admin dashboard endpoint
      const dashboardResponse = await apiClient.getAdminDashboard();
      const appsResponse = await apiClient.getAllApplications();
      
      if (dashboardResponse.data && !dashboardResponse.error) {
        // Calculate statistics from real data
        const apps = Array.isArray(appsResponse.data) ? appsResponse.data : [];
        const stats = dashboardResponse.data.statistics || {};
        
        // Calculate additional statistics from applications
        const departmentCount = {};
        const gpaRanges = { '9.0-10.0': 0, '8.0-8.9': 0, '7.0-7.9': 0, '6.0-6.9': 0 };
        const monthlyData = {};
        
        if (apps.length > 0) {
          apps.forEach(app => {
            // Department distribution
            const dept = app.course || app.field_of_study || 'Other';
            departmentCount[dept] = (departmentCount[dept] || 0) + 1;
            
            // GPA distribution
            const gpa = parseFloat(app.gpa || 0);
            if (gpa >= 9.0) gpaRanges['9.0-10.0']++;
            else if (gpa >= 8.0) gpaRanges['8.0-8.9']++;
            else if (gpa >= 7.0) gpaRanges['7.0-7.9']++;
            else if (gpa >= 6.0) gpaRanges['6.0-6.9']++;
            
            // Monthly applications
            if (app.applied_at || app.created_at) {
              const date = new Date(app.applied_at || app.created_at);
              const monthKey = date.toLocaleString('default', { month: 'short' });
              if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = { month: monthKey, applications: 0, approved: 0 };
              }
              monthlyData[monthKey].applications++;
              if (app.status === 'approved') monthlyData[monthKey].approved++;
            }
          });
        }
        
        // Convert to arrays
        const departmentDistribution = Object.entries(departmentCount)
          .map(([department, count]) => ({
            department,
            count,
            percentage: apps.length > 0 ? ((count / apps.length) * 100).toFixed(1) : 0
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
        
        const gpaDistribution = Object.entries(gpaRanges)
          .map(([range, count]) => ({
            range,
            count,
            percentage: apps.length > 0 ? ((count / apps.length) * 100).toFixed(1) : 0
          }));
        
        const monthlyApplications = Object.values(monthlyData).slice(-6);
        
        setStatistics({
          overview: {
            totalApplications: stats.total_applications || apps.length,
            pendingApplications: stats.pending_applications || apps.filter(a => a.status === 'pending').length,
            approvedApplications: stats.approved_applications || apps.filter(a => a.status === 'approved').length,
            rejectedApplications: stats.rejected_applications || apps.filter(a => a.status === 'rejected').length,
            totalFundsDistributed: stats.total_disbursed || 0,
            averageScholarshipAmount: stats.total_disbursed && stats.approved_applications 
              ? Math.round(stats.total_disbursed / stats.approved_applications) 
              : 0,
            totalStudents: stats.total_students_helped || stats.approved_applications || 0,
            applicationSuccessRate: stats.total_applications 
              ? ((stats.approved_applications / stats.total_applications) * 100).toFixed(1)
              : 0
          },
          trends: {
            monthlyApplications,
            departmentDistribution,
            gpaDistribution
          },
          recentActivity: apps.slice(0, 5).map(app => ({
            type: app.status,
            student: app.student_name || app.full_name || 'Unknown',
            amount: app.scholarship_amount_requested || 0,
            date: app.applied_at || app.created_at || new Date().toISOString()
          }))
        });
        
        toast.success('Statistics loaded successfully with real data', {
          duration: 3000,
          icon: '📊',
        });
      } else {
        // Fallback to mock data if API fails
        console.warn('Using mock data:', dashboardResponse.error);
        setStatistics(generateMockStatistics());
        
        toast('Using demo data for statistics', {
          duration: 4000,
          icon: '⚙️',
          style: {
            background: '#EBF8FF',
            color: '#2563EB',
            border: '1px solid #3B82F6'
          }
        });
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setStatistics(generateMockStatistics());
      
      toast('Using demo data for statistics', {
        duration: 4000,
        icon: '⚙️',
        style: {
          background: '#EBF8FF',
          color: '#2563EB',
          border: '1px solid #3B82F6'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await apiClient.getAllApplications();
      setApplications(response.data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setApplications([]);
    }
  };

  const generateMockStatistics = () => ({
    overview: {
      totalApplications: 156,
      pendingApplications: 23,
      approvedApplications: 89,
      rejectedApplications: 44,
      totalFundsDistributed: 45000,
      averageScholarshipAmount: 2500,
      totalStudents: 89,
      applicationSuccessRate: 57.1
    },
    trends: {
      monthlyApplications: [
        { month: 'Jan', applications: 12, approved: 8 },
        { month: 'Feb', applications: 18, approved: 11 },
        { month: 'Mar', applications: 25, approved: 14 },
        { month: 'Apr', applications: 31, approved: 18 },
        { month: 'May', applications: 28, approved: 16 },
        { month: 'Jun', applications: 42, approved: 22 }
      ],
      departmentDistribution: [
        { department: 'Computer Science', count: 45, percentage: 28.8 },
        { department: 'Engineering', count: 38, percentage: 24.4 },
        { department: 'Business', count: 32, percentage: 20.5 },
        { department: 'Medicine', count: 24, percentage: 15.4 },
        { department: 'Arts', count: 17, percentage: 10.9 }
      ],
      gpaDistribution: [
        { range: '9.0-10.0', count: 34, percentage: 21.8 },
        { range: '8.0-8.9', count: 52, percentage: 33.3 },
        { range: '7.0-7.9', count: 45, percentage: 28.8 },
        { range: '6.0-6.9', count: 25, percentage: 16.1 }
      ]
    },
    recentActivity: [
      { type: 'approval', student: 'John Doe', amount: 3000, date: '2024-01-15' },
      { type: 'application', student: 'Jane Smith', amount: 2500, date: '2024-01-14' },
      { type: 'rejection', student: 'Mike Johnson', amount: 2000, date: '2024-01-14' },
      { type: 'approval', student: 'Sarah Wilson', amount: 3500, date: '2024-01-13' }
    ]
  });

  const exportData = async (format = 'csv') => {
    try {
      const response = await apiClient.exportStatistics(format, timeframe);
      // Create download link
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `scholarship_statistics_${timeframe}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="mb-6">
        <XCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const stats = {
    totalApplications: 0,
    totalFundsDistributed: 0,
    averageScholarshipAmount: 0,
    applicationSuccessRate: 0,
    approvedApplications: 0,
    pendingApplications: 0,
    rejectedApplications: 0,
    ...statistics?.overview
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Statistics & Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive overview of scholarship program performance</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportData('csv')}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Time</option>
            <option value="year">This Year</option>
            <option value="quarter">This Quarter</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalApplications}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Funds Distributed</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalFundsDistributed.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              ${stats.averageScholarshipAmount} avg per award
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.applicationSuccessRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.approvedApplications} of {stats.totalApplications} approved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApplications}</div>
            <p className="text-xs text-muted-foreground">
              Require admin attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              Application Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Badge className="bg-green-100 text-green-800 mr-2">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Approved
                  </Badge>
                </div>
                <span className="font-medium">{stats.approvedApplications}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Badge className="bg-yellow-100 text-yellow-800 mr-2">
                    <Clock className="h-3 w-3 mr-1" />
                    Pending
                  </Badge>
                </div>
                <span className="font-medium">{stats.pendingApplications}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Badge className="bg-red-100 text-red-800 mr-2">
                    <XCircle className="h-3 w-3 mr-1" />
                    Rejected
                  </Badge>
                </div>
                <span className="font-medium">{stats.rejectedApplications}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Department Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(statistics?.trends?.departmentDistribution || []).map((dept, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{dept.department}</span>
                      <span className="text-sm text-gray-500">{dept.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${dept.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Monthly Application Trends
          </CardTitle>
          <CardDescription>
            Application submissions and approval rates over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {(statistics?.trends?.monthlyApplications || []).map((month, index) => (
              <div key={index} className="text-center p-3 border rounded-lg">
                <div className="text-sm font-medium text-gray-500">{month.month}</div>
                <div className="text-lg font-bold text-blue-600">{month.applications}</div>
                <div className="text-xs text-green-600">{month.approved} approved</div>
                <div className="text-xs text-gray-500">
                  {((month.approved / month.applications) * 100).toFixed(0)}% rate
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest scholarship application actions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(statistics?.recentActivity || []).map((activity, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Badge 
                      className={
                        activity.type === 'approved' || activity.type === 'approval' ? 'bg-green-100 text-green-800' :
                        activity.type === 'rejected' || activity.type === 'rejection' ? 'bg-red-100 text-red-800' :
                        activity.type === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }
                    >
                      {(activity.type === 'approved' || activity.type === 'approval') && <CheckCircle className="h-3 w-3 mr-1" />}
                      {(activity.type === 'rejected' || activity.type === 'rejection') && <XCircle className="h-3 w-3 mr-1" />}
                      {activity.type === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                      {activity.type === 'application' && <Users className="h-3 w-3 mr-1" />}
                      {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{activity.student}</TableCell>
                  <TableCell>${(activity.amount || 0).toLocaleString()}</TableCell>
                  <TableCell>{new Date(activity.date).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* GPA Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>GPA Distribution</CardTitle>
          <CardDescription>Academic performance breakdown of applicants</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(statistics?.trends?.gpaDistribution || []).map((gpa, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">GPA {gpa.range}</span>
                    <span className="text-sm text-gray-500">{gpa.count} students ({gpa.percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full" 
                      style={{ width: `${gpa.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}