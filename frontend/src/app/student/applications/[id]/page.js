'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, DollarSign, Calendar, User, FileText, CheckCircle, XCircle, Clock, GraduationCap, Trophy, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ApplicationDetailPage() {
  const { user, loading, initialized } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [application, setApplication] = useState(null);
  const [loadingApplication, setLoadingApplication] = useState(true);

  useEffect(() => {
    if (initialized && (!user || user.role !== 'student')) {
      router.push('/');
    }
  }, [user, initialized, router]);

  useEffect(() => {
    if (user && params.id) {
      fetchApplicationDetails();
    }
  }, [user, params.id]);

  const fetchApplicationDetails = async () => {
    try {
      const response = await apiClient.getApplicationDetails(params.id);
      if (response.error) {
        toast.error('Failed to load application details');
        router.push('/student/applications');
      } else {
        // Backend returns the application object directly, not wrapped in 'application' property
        setApplication(response.data);
      }
    } catch (error) {
      toast.error('Failed to load application details');
      router.push('/student/applications');
    } finally {
      setLoadingApplication(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success" className="flex items-center gap-1"><CheckCircle className="h-3 w-3" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="h-3 w-3" />Rejected</Badge>;
      case 'pending':
        return <Badge variant="warning" className="flex items-center gap-1"><Clock className="h-3 w-3" />Pending Review</Badge>;
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

  if (loadingApplication) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Application Not Found</h1>
          <Button onClick={() => router.push('/student/applications')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Applications
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/student/applications')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Applications
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Application Details</h1>
              <p className="text-gray-600">Submitted {new Date(application.applied_at).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Application Status</CardTitle>
                    <CardDescription>Current status of your scholarship application</CardDescription>
                  </div>
                  {getStatusBadge(application.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span>Amount: ${parseInt(application.scholarship_amount_requested || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span>Applied: {new Date(application.applied_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-purple-600" />
                    <span>Application ID: {application.id}</span>
                  </div>
                </div>
                
                {application.admin_notes && (
                  <Alert variant={application.status === 'approved' ? 'success' : application.status === 'rejected' ? 'destructive' : 'info'} className="mt-4">
                    <AlertTitle>Admin Review Notes</AlertTitle>
                    <AlertDescription>{application.admin_notes}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Full Name</Label>
                    <p className="text-gray-900">{application.student_name || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Email</Label>
                    <p className="text-gray-900">{application.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">University/Institution</Label>
                    <p className="text-gray-900">{application.university || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Major/Field of Study</Label>
                    <p className="text-gray-900">{application.major || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Year of Study</Label>
                    <p className="text-gray-900">{application.year_of_study || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">GPA</Label>
                    <p className="text-gray-900">
                      {(application.gpa && !isNaN(application.gpa)) ? Number(application.gpa).toFixed(2) : 'Not provided'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Need */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Financial Need
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Amount Requested</Label>
                  <p className="text-gray-900 text-lg font-semibold">
                    ${(application.scholarship_amount_requested && !isNaN(application.scholarship_amount_requested)) 
                      ? Number(application.scholarship_amount_requested).toLocaleString() 
                      : '0'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Annual Income</Label>
                  <p className="text-gray-900">
                    ${(application.annual_income && !isNaN(application.annual_income)) 
                      ? Number(application.annual_income).toLocaleString() 
                      : '0'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Essay/Personal Statement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Essay & Personal Statement
                </CardTitle>
              </CardHeader>
              <CardContent>
                {application.essay ? (
                  <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{application.essay}</p>
                ) : (
                  <p className="text-gray-500 italic">No essay content available</p>
                )}
              </CardContent>
            </Card>

            {/* Transaction Information (if approved) */}
            {application.status === 'approved' && application.stellar_transaction_hash && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-green-600" />
                    Scholarship Award
                  </CardTitle>
                  <CardDescription>Your scholarship has been approved and funds have been transferred</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Transaction Hash</Label>
                      <p className="text-gray-900 font-mono text-sm break-all">{application.stellar_transaction_hash}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Amount Transferred</Label>
                      <p className="text-lg font-semibold text-green-600">
                        ${(application.scholarship_amount_requested && !isNaN(application.scholarship_amount_requested)) 
                          ? Number(application.scholarship_amount_requested).toLocaleString() 
                          : '0'}
                      </p>
                    </div>
                    <Alert variant="success">
                      <CheckCircle className="h-4 w-4" />
                      <AlertTitle>Congratulations!</AlertTitle>
                      <AlertDescription>
                        Your scholarship application has been approved and the funds have been transferred to your connected wallet.
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>
            )}
        </div>
    </div>
  );
}