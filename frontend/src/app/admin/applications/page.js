'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useRouter } from 'next/navigation';
import {
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Eye,
  User,
  DollarSign,
  Calendar,
  ArrowLeft,
  FileText,
  GraduationCap
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminApplicationsPage() {
  const { user, loading, initialized } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (initialized && (!user || user.role !== 'admin')) {
      router.push('/');
    }
  }, [user, initialized, router]);

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  useEffect(() => {
    filterApplications();
  }, [applications, searchTerm, statusFilter]);

  const fetchApplications = async () => {
    setLoadingApplications(true);
    
    const response = await apiClient.getAdminApplications();
    
    if (response.error) {
      console.warn('Using demo data:', response.error);
      setApplications(getMockApplications());
      toast('Demo mode: Managing sample applications', {
        duration: 3000,
        icon: '📝',
        style: {
          background: '#EBF8FF',
          color: '#2563EB',
          border: '1px solid #3B82F6'
        }
      });
    } else {
      setApplications(response.data?.applications || []);
      console.log('Admin applications loaded successfully');
    }
    
    setLoadingApplications(false);
  };

  const getMockApplications = () => [
    {
      id: 1,
      student_name: 'John Doe',
      email: 'john@example.com',
      university: 'State University',
      major: 'Computer Science',
      year_of_study: '3rd Year',
      gpa: 8.2,
      scholarship_amount_requested: 2500,
      status: 'pending',
      applied_at: '2024-11-20',
      essay: 'I am passionate about technology and innovation...'
    },
    {
      id: 2,
      student_name: 'Jane Smith',
      email: 'jane@example.com',
      university: 'Tech Institute',
      major: 'Engineering',
      year_of_study: '4th Year',
      gpa: 9.1,
      scholarship_amount_requested: 3000,
      status: 'approved',
      applied_at: '2024-11-19',
      essay: 'My goal is to contribute to sustainable technology...'
    },
    {
      id: 3,
      student_name: 'Mike Johnson',
      email: 'mike@example.com',
      university: 'Community College',
      major: 'Business',
      year_of_study: '2nd Year',
      gpa: 7.6,
      scholarship_amount_requested: 1500,
      status: 'pending',
      applied_at: '2024-11-18',
      essay: 'I aim to start my own business to help my community...'
    },
    {
      id: 4,
      student_name: 'Sarah Wilson',
      email: 'sarah@example.com',
      university: 'Medical College',
      major: 'Pre-Med',
      year_of_study: '3rd Year',
      gpa: 9.5,
      scholarship_amount_requested: 4000,
      status: 'approved',
      applied_at: '2024-11-17',
      essay: 'I want to become a doctor to serve underserved communities...'
    },
    {
      id: 5,
      student_name: 'Alex Chen',
      email: 'alex@example.com',
      university: 'Arts Academy',
      major: 'Fine Arts',
      year_of_study: '1st Year',
      gpa: 6.8,
      scholarship_amount_requested: 2000,
      status: 'rejected',
      applied_at: '2024-11-16',
      essay: 'Art is my passion and I want to share it with the world...'
    }
  ];

  const filterApplications = () => {
    let filtered = applications;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.university?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.major?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    setFilteredApplications(filtered);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
      case 'disbursed':
        return <Badge variant="success" className="flex items-center gap-1"><CheckCircle className="h-3 w-3" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="h-3 w-3" />Rejected</Badge>;
      case 'pending':
        return <Badge variant="warning" className="flex items-center gap-1"><Clock className="h-3 w-3" />Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusCounts = () => {
    const counts = {
      all: applications.length,
      pending: applications.filter(app => app.status === 'pending').length,
      approved: applications.filter(app => app.status === 'approved' || app.status === 'disbursed').length,
      rejected: applications.filter(app => app.status === 'rejected').length,
    };
    return counts;
  };

  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  const statusCounts = getStatusCounts();

  return (
    <div>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/admin')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Scholarship Applications</h1>
              <p className="text-gray-600">Review and manage student scholarship applications</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-gray-900">{statusCounts.all}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-yellow-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Approved</p>
                    <p className="text-2xl font-bold text-green-600">{statusCounts.approved}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <XCircle className="h-8 w-8 text-red-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Rejected</p>
                    <p className="text-2xl font-bold text-red-600">{statusCounts.rejected}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search by name, university, major, or student ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-full sm:w-48">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Applications Table */}
          <Card>
            <CardHeader>
              <CardTitle>Applications ({filteredApplications.length})</CardTitle>
              <CardDescription>
                {statusFilter === 'all' ? 'All scholarship applications' : `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} applications`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingApplications ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredApplications.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {applications.length === 0 ? 'No Applications Yet' : 'No Applications Found'}
                  </h3>
                  <p className="text-gray-600">
                    {applications.length === 0 
                      ? 'Applications will appear here when students submit them.' 
                      : 'Try adjusting your search or filter criteria.'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>University</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Applied</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApplications.map((application) => (
                        <TableRow key={application.id} className="hover:bg-gray-50">
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <User className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{application.student_name}</p>
                                <p className="text-sm text-gray-500">Email: {application.email}</p>
                                <p className="text-sm text-gray-500">GPA: {application.gpa}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-gray-900">{application.university}</p>
                              <p className="text-sm text-gray-500 flex items-center gap-1">
                                <GraduationCap className="h-3 w-3" />
                                {application.major}
                              </p>
                              <p className="text-sm text-gray-500">{application.year_of_study}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4 text-green-600" />
                              <span className="font-medium">${parseInt(application.scholarship_amount_requested || 0).toLocaleString()}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Calendar className="h-3 w-3" />
                              {new Date(application.applied_at).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(application.status)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/admin/applications/${application.id}`)}
                              className="flex items-center gap-1"
                            >
                              <Eye className="h-3 w-3" />
                              Review
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}