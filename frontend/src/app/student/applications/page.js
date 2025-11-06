'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { Upload, DollarSign, Calendar, User, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import NewApplicationForm from '@/components/NewApplicationForm';

export default function ApplicationPage() {
  const { user, loading, initialized } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  useEffect(() => {
    if (initialized && (!user || user.role !== 'student')) {
      router.push('/');
    }
  }, [user, initialized, router]);

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    setLoadingApplications(true);
    
    const response = await apiClient.getStudentApplications();
    
    if (response.error) {
      console.warn('Using demo data:', response.error);
      setApplications(getMockApplications());
      toast('Demo mode: Showing sample applications', {
        duration: 3000,
        icon: '📋',
        style: {
          background: '#EBF8FF',
          color: '#2563EB',
          border: '1px solid #3B82F6'
        }
      });
    } else {
      setApplications(response.data?.applications || []);
      console.log('Applications loaded successfully');
    }
    
    setLoadingApplications(false);
  };

  const getMockApplications = () => [
    {
      id: 1,
      title: 'Academic Excellence Scholarship',
      amount: 2500,
      status: 'approved',
      date_applied: '2024-11-15',
      description: 'Merit-based scholarship for outstanding academic performance',
      feedback: 'Congratulations! Your academic achievements are impressive.'
    },
    {
      id: 2,
      title: 'STEM Innovation Grant',
      amount: 1500,
      status: 'pending',
      date_applied: '2024-11-20',
      description: 'Support for students pursuing STEM fields',
      feedback: null
    },
    {
      id: 3,
      title: 'Community Service Award',
      amount: 1000,
      status: 'rejected',
      date_applied: '2024-11-10',
      description: 'Recognition for community involvement and service',
      feedback: 'While your community service is commendable, we had many qualified applicants this cycle.'
    }
  ];

  const handleApplicationSuccess = () => {
    setShowApplicationForm(false);
    fetchApplications();
  };

  const handleApplicationCancel = () => {
    setShowApplicationForm(false);
  };

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

  if (!user || user.role !== 'student') {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="inline-block px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium shadow-lg mb-6">
            📝 Applications
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {showApplicationForm ? 'New Scholarship Application' : 'Scholarship Applications'}
          </h1>

          <p className="text-xl text-gray-700 max-w-2xl mx-auto mb-8">
            {showApplicationForm
              ? 'Complete the form below to submit your scholarship application.'
              : 'Apply for scholarships and track your application status with our transparent blockchain-powered system.'
            }
          </p>

          {!showApplicationForm && (
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl px-8 py-3 flex items-center gap-2"
              onClick={() => setShowApplicationForm(true)}
            >
              <FileText className="h-5 w-5" />
              New Application
            </Button>
          )}

          {showApplicationForm && (
            <Button
              variant="outline"
              size="lg"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 flex items-center gap-2"
              onClick={() => setShowApplicationForm(false)}
            >
              ← Back to Applications
            </Button>
          )}
          </div>

          {/* Content Section */}
          {showApplicationForm ? (
            <NewApplicationForm
              onSuccess={handleApplicationSuccess}
              onCancel={handleApplicationCancel}
            />
          ) : (
            <>
              {/* Applications List */}
              <div className="space-y-6">
            {loadingApplications ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : applications.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                <div className="p-6 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <FileText className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No Applications Yet</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  You haven't submitted any scholarship applications yet. Start your journey towards educational funding.
                </p>
                <Button onClick={() => setShowApplicationForm(true)} className="bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl px-8 py-3">
                  Submit Your First Application
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {applications.map((application) => (
                  <div key={application.id} className="group relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-transparent hover:-translate-y-2">
                    <div className="absolute inset-0 bg-linear-to-br from-blue-500 to-purple-600 opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity" />

                    <div className="relative">
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-blue-100 rounded-lg">
                            <User className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{application.student_name}</h3>
                            <p className="text-gray-600">{application.university} • {application.major}</p>
                          </div>
                        </div>
                        {getStatusBadge(application.status)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <DollarSign className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Requested Amount</p>
                            <p className="text-lg font-bold text-gray-900">${parseInt(application.scholarship_amount_requested || 0).toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Calendar className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Applied Date</p>
                            <p className="text-lg font-bold text-gray-900">{new Date(application.applied_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <FileText className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">GPA</p>
                            <p className="text-lg font-bold text-gray-900">{application.gpa}</p>
                          </div>
                        </div>
                      </div>
                      
                      {application.admin_notes && (
                        <div className={`p-4 rounded-xl mb-6 ${
                          application.status === 'approved' 
                            ? 'bg-green-50 border border-green-200' 
                            : application.status === 'rejected' 
                            ? 'bg-red-50 border border-red-200' 
                            : 'bg-blue-50 border border-blue-200'
                        }`}>
                          <h4 className={`font-semibold mb-2 ${
                            application.status === 'approved' 
                              ? 'text-green-800' 
                              : application.status === 'rejected' 
                              ? 'text-red-800' 
                              : 'text-blue-800'
                          }`}>
                            Admin Notes
                          </h4>
                          <p className={`text-sm ${
                            application.status === 'approved' 
                              ? 'text-green-700' 
                              : application.status === 'rejected' 
                              ? 'text-red-700' 
                              : 'text-blue-700'
                          }`}>
                            {application.admin_notes}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex justify-end">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => router.push(`/student/applications/${application.id}`)}
                          className="border-blue-600 text-blue-600 hover:bg-blue-50"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          </>
          )}
        </div>
      </div>
  );
}