'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  DollarSign, 
  Calendar, 
  User, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  GraduationCap, 
  Trophy,
  Send,
  AlertTriangle,
  Wallet
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminApplicationDetailPage() {
  const { user, loading, initialized } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [application, setApplication] = useState(null);
  const [loadingApplication, setLoadingApplication] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    if (initialized && (!user || user.role !== 'admin')) {
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
      const response = await apiClient.getAdminApplicationDetails(params.id);
      if (response.error) {
        toast.error('Failed to load application details');
        router.push('/admin/applications');
      } else {
        // Backend returns the application object directly, not wrapped in 'application' property
        setApplication(response.data);
        setAdminNotes(response.data?.admin_notes || '');
      }
    } catch (error) {
      toast.error('Failed to load application details');
      router.push('/admin/applications');
    } finally {
      setLoadingApplication(false);
    }
  };

  const handleApprove = async () => {
    setProcessing(true);
    try {
      const response = await apiClient.approveApplication(params.id, { 
        approved_amount: application.scholarship_amount_requested,
        admin_notes: adminNotes 
      });
      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success('Application approved successfully!');
        setShowApproveDialog(false);
        fetchApplicationDetails(); // Refresh data
      }
    } catch (error) {
      toast.error('Failed to approve application');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    setProcessing(true);
    try {
      const response = await apiClient.rejectApplication(params.id, { admin_notes: adminNotes });
      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success('Application rejected');
        setShowRejectDialog(false);
        fetchApplicationDetails(); // Refresh data
      }
    } catch (error) {
      toast.error('Failed to reject application');
    } finally {
      setProcessing(false);
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

  if (!user || user.role !== 'admin') {
    return null;
  }

  if (loadingApplication) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Application Not Found</h1>
            <Button onClick={() => router.push('/admin/applications')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Applications
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/admin/applications')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Applications
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">Application Review</h1>
              <p className="text-gray-600">Review and make decision on scholarship application</p>
            </div>
            <div className="flex gap-2">
              {application.status === 'pending' && (
                <>
                  <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                    <DialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Reject Application</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to reject this scholarship application? This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="reject-notes">Rejection Reason (optional)</Label>
                          <Textarea
                            id="reject-notes"
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            placeholder="Provide feedback to the student about why their application was rejected..."
                            className="min-h-20"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                          Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleReject} disabled={processing}>
                          {processing ? 'Rejecting...' : 'Reject Application'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Approve Application</DialogTitle>
                        <DialogDescription>
                          Approve this scholarship application and initiate fund transfer to the student's wallet.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Alert variant="info">
                          <Trophy className="h-4 w-4" />
                          <AlertTitle>Smart Contract Scholarship Award</AlertTitle>
                          <AlertDescription>
                            <div className="space-y-2">
                              <div>
                                Amount: <strong>${parseInt(application.scholarship_amount_requested || 0).toLocaleString()}</strong>
                              </div>
                              <div>
                                <span className="text-sm text-gray-600">Payment will be processed via Smart Contract to:</span>
                                <br />
                                <code className="text-xs bg-gray-100 px-2 py-1 rounded break-all">
                                  {application.student_wallet || 'No wallet address available'}
                                </code>
                              </div>
                              <div className="text-sm text-blue-600">
                                ✓ Recorded on-chain with full transparency and tracking
                              </div>
                              <div className="text-sm text-green-600">
                                ✓ Automatic student profile updates and scholarship history
                              </div>
                            </div>
                          </AlertDescription>
                        </Alert>
                        <div>
                          <Label htmlFor="approve-notes">Approval Notes (optional)</Label>
                          <Textarea
                            id="approve-notes"
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            placeholder="Add any notes or congratulations for the student..."
                            className="min-h-20"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleApprove} disabled={processing}>
                          {processing ? 'Approving...' : 'Approve & Transfer Funds'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {/* Status and Overview */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Application Status</CardTitle>
                    <CardDescription>
                      Application ID: {application.id} • Submitted {new Date(application.applied_at).toLocaleDateString()}
                    </CardDescription>
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
                    <GraduationCap className="h-4 w-4 text-purple-600" />
                    <span>GPA: {application.gpa}</span>
                  </div>
                </div>
                
                {application.admin_notes && (
                  <Alert variant={application.status === 'approved' ? 'success' : application.status === 'rejected' ? 'destructive' : 'info'} className="mt-4">
                    <AlertTitle>Admin Notes</AlertTitle>
                    <AlertDescription>{application.admin_notes}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Student Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Student Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Full Name</Label>
                      <p className="text-gray-900">{application.student_name || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Email</Label>
                      <p className="text-gray-900">{application.email || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                        <Wallet className="h-4 w-4" />
                        Stellar Wallet Address
                      </Label>
                      <p className="text-gray-900 font-mono text-sm bg-gray-50 p-2 rounded break-all">
                        {application.student_wallet || 'Not provided'}
                      </p>
                      {application.student_wallet && (
                        <p className="text-xs text-green-600 mt-1">✓ Payment will be sent here</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Phone</Label>
                      <p className="text-gray-900">{application.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Age</Label>
                      <p className="text-gray-900">{application.age || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Institution</Label>
                      <p className="text-gray-900">{application.institution || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Field of Study</Label>
                      <p className="text-gray-900">{application.field_of_study || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Academic Level</Label>
                      <p className="text-gray-900">{application.academic_level || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">GPA</Label>
                      <p className="text-gray-900">{application.gpa || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Application Date</Label>
                      <p className="text-gray-900">
                        {application.applied_at ? new Date(application.applied_at).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Financial Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Financial Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Amount Requested</Label>
                    <p className="text-2xl font-bold text-green-600">
                      ${(application.scholarship_amount_requested && !isNaN(application.scholarship_amount_requested)) 
                        ? Number(application.scholarship_amount_requested).toLocaleString() 
                        : '0'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Annual Income</Label>
                    <p className="text-lg font-semibold text-gray-700">
                      ${(application.annual_income && !isNaN(application.annual_income)) 
                        ? Number(application.annual_income).toLocaleString() 
                        : '0'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Essay & Application Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Application Essay & Details
                </CardTitle>
                <CardDescription>
                  Combined essay including personal statement, achievements, and activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg">
                  {application.essay ? (
                    <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                      {application.essay}
                    </p>
                  ) : (
                    <p className="text-gray-500 italic">No essay content available</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Transaction Information (if approved) */}
            {application.status === 'approved' && application.stellar_transaction_hash && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-green-600" />
                    Smart Contract Scholarship Transfer
                  </CardTitle>
                  <CardDescription>Blockchain scholarship disbursement via smart contract</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Transaction Hash</Label>
                      <p className="text-gray-900 font-mono text-sm break-all bg-gray-50 p-2 rounded">
                        {application.stellar_transaction_hash}
                      </p>
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
                      <AlertTitle>Transfer Completed</AlertTitle>
                      <AlertDescription>
                        Scholarship funds have been successfully transferred to the student's Stellar wallet.
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}