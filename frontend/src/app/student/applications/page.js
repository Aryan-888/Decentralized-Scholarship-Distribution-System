'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { Upload, DollarSign, Calendar, User, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import { FreighterWallet } from '@/lib/wallet';
import toast from 'react-hot-toast';

export default function ApplicationPage() {
  const { user, loading, initialized, updateWallet } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    student_id: '',
    university: '',
    major: '',
    year_of_study: '',
    gpa: '',
    financial_need_amount: '',
    financial_need_description: '',
    academic_achievements: '',
    extracurricular_activities: '',
    personal_statement: '',
    supporting_documents: []
  });

  useEffect(() => {
    if (initialized && (!user || user.role !== 'student')) {
      router.push('/');
    }
  }, [user, initialized, router]);

  useEffect(() => {
    if (user) {
      fetchApplications();
      // Pre-fill form with user data
      setFormData(prev => ({
        ...prev,
        full_name: user.display_name || user.name || user.displayName || '',
      }));
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Ensure student has a wallet configured before submitting
      // Prefer wallet saved on user profile, but fall back to local Freighter wallet info
      const profileWallet = user?.wallet_address || user?.walletAddress || null;
      let walletAddress = profileWallet;
      if (!walletAddress) {
        try {
          const localInfo = FreighterWallet.getWalletInfo();
          if (localInfo && localInfo.publicKey) {
            walletAddress = localInfo.publicKey;
          }
        } catch (err) {
          // ignore
        }
      }
      if (!walletAddress) {
        toast.error('Please set up your Stellar wallet in your profile before applying');
        setSubmitting(false);
        return;
      }

      // If the user profile doesn't have the wallet saved, auto-sync it to backend
      if (!profileWallet && walletAddress && typeof updateWallet === 'function') {
        try {
          // call updateWallet which updates backend and local state
          await updateWallet(walletAddress);
        } catch (err) {
          // Don't block submission on a failed sync, but warn the user
          console.warn('Failed to sync wallet to profile:', err);
          toast('Wallet is connected locally but failed to save to profile. Submission will continue.', { duration: 4000 });
        }
      }

      // Map frontend form fields to backend expected payload
      // Combine multiple text fields to ensure essay meets 100-character minimum
      const essayText = [
        formData.personal_statement,
        formData.financial_need_description,
        formData.academic_achievements ? `Academic Achievements: ${formData.academic_achievements}` : '',
        formData.extracurricular_activities ? `Extracurricular Activities: ${formData.extracurricular_activities}` : ''
      ].filter(text => text && text.trim().length > 0).join('\n\n');

      // Ensure essay meets minimum length requirement
      if (essayText.length < 100) {
        toast.error('Please provide more detailed information in your application. The combined text should be at least 100 characters.');
        setSubmitting(false);
        return;
      }

      const payload = {
        student_wallet: walletAddress,
        student_name: formData.full_name || user?.display_name || user?.name || user?.displayName || '',
        email: user?.email || user?.user_email || '',
        university: formData.university,
        gpa: formData.gpa,
        major: formData.major,
        year_of_study: formData.year_of_study,
        // Backend expects annual_income and scholarship_amount_requested
        annual_income: 0, // frontend doesn't collect this; set default 0
        scholarship_amount_requested: formData.financial_need_amount || 0,
        // essay combines multiple text fields to meet 100-character requirement
        essay: essayText,
        // include additional optional fields to help admins
        academic_achievements: formData.academic_achievements,
        extracurricular_activities: formData.extracurricular_activities,
        student_id: formData.student_id || ''
      };

      const response = await apiClient.submitApplication(payload);
      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success('Application submitted successfully!');
        setShowApplicationForm(false);
        setFormData({
          full_name: user.display_name || user.name || user.displayName || '',
          student_id: '',
          university: '',
          major: '',
          year_of_study: '',
          gpa: '',
          financial_need_amount: '',
          financial_need_description: '',
          academic_achievements: '',
          extracurricular_activities: '',
          personal_statement: '',
          supporting_documents: []
        });
        fetchApplications();
      }
    } catch (error) {
      toast.error('Failed to submit application');
    } finally {
      setSubmitting(false);
    }
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Scholarship Applications</h1>
          <p className="text-gray-600">Apply for scholarships and track your applications</p>
        </div>
        <Dialog open={showApplicationForm} onOpenChange={setShowApplicationForm}>
          <DialogTrigger asChild>
                <Button size="lg" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  New Application
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Submit Scholarship Application</DialogTitle>
                  <DialogDescription>
                    Fill out the form below to apply for a scholarship. All fields are required.
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="student_id">Student ID</Label>
                      <Input
                        id="student_id"
                        name="student_id"
                        value={formData.student_id}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="university">University/Institution</Label>
                      <Input
                        id="university"
                        name="university"
                        value={formData.university}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="major">Major/Field of Study</Label>
                      <Input
                        id="major"
                        name="major"
                        value={formData.major}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="year_of_study">Year of Study</Label>
                      <Input
                        id="year_of_study"
                        name="year_of_study"
                        value={formData.year_of_study}
                        onChange={handleInputChange}
                        placeholder="e.g., 2nd Year, Junior, etc."
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gpa">GPA</Label>
                      <Input
                        id="gpa"
                        name="gpa"
                        type="number"
                        step="0.01"
                        min="0"
                        max="10.0"
                        value={formData.gpa}
                        onChange={handleInputChange}
                        placeholder="e.g., 8.5 (on 10.0 scale)"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="financial_need_amount">Financial Need Amount (USD)</Label>
                    <Input
                      id="financial_need_amount"
                      name="financial_need_amount"
                      type="number"
                      min="0"
                      value={formData.financial_need_amount}
                      onChange={handleInputChange}
                      placeholder="Enter amount needed"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="financial_need_description">Financial Need Description</Label>
                    <Textarea
                      id="financial_need_description"
                      name="financial_need_description"
                      value={formData.financial_need_description}
                      onChange={handleInputChange}
                      placeholder="Describe your financial circumstances and why you need this scholarship (minimum 30 characters)"
                      className="min-h-24"
                      required
                      minLength={30}
                    />
                    <p className="text-xs text-gray-500">
                      {formData.financial_need_description.length}/30 characters minimum
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="academic_achievements">Academic Achievements</Label>
                    <Textarea
                      id="academic_achievements"
                      name="academic_achievements"
                      value={formData.academic_achievements}
                      onChange={handleInputChange}
                      placeholder="List your academic achievements, awards, honors, etc."
                      className="min-h-24"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="extracurricular_activities">Extracurricular Activities</Label>
                    <Textarea
                      id="extracurricular_activities"
                      name="extracurricular_activities"
                      value={formData.extracurricular_activities}
                      onChange={handleInputChange}
                      placeholder="Describe your extracurricular activities, volunteer work, leadership roles, etc."
                      className="min-h-24"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="personal_statement">Personal Statement</Label>
                    <Textarea
                      id="personal_statement"
                      name="personal_statement"
                      value={formData.personal_statement}
                      onChange={handleInputChange}
                      placeholder="Write a personal statement explaining your goals, aspirations, and why you deserve this scholarship (minimum 50 characters)"
                      className="min-h-32"
                      required
                      minLength={50}
                    />
                    <p className="text-xs text-gray-500">
                      {formData.personal_statement.length}/50 characters minimum
                    </p>
                  </div>

                  <Alert variant="info">
                    <FileText className="h-4 w-4" />
                    <AlertTitle>Document Upload</AlertTitle>
                    <AlertDescription>
                      Supporting documents (transcripts, recommendation letters, etc.) can be uploaded after submitting this application.
                    </AlertDescription>
                  </Alert>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setShowApplicationForm(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? 'Submitting...' : 'Submit Application'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Applications List */}
          <div className="space-y-6">
            {loadingApplications ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : applications.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Yet</h3>
                  <p className="text-gray-600 mb-4">You haven't submitted any scholarship applications yet.</p>
                  <Button onClick={() => setShowApplicationForm(true)}>
                    Submit Your First Application
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {applications.map((application) => (
                  <Card key={application.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            {application.student_name}
                          </CardTitle>
                          <CardDescription>
                            {application.university} • {application.major}
                          </CardDescription>
                        </div>
                        {getStatusBadge(application.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span>${parseInt(application.scholarship_amount_requested || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-blue-600" />
                          <span>Applied {new Date(application.applied_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="h-4 w-4 text-purple-600" />
                          <span>GPA: {application.gpa}</span>
                        </div>
                      </div>
                      
                      {application.admin_notes && (
                        <Alert variant={application.status === 'approved' ? 'success' : application.status === 'rejected' ? 'destructive' : 'info'}>
                          <AlertTitle>Admin Notes</AlertTitle>
                          <AlertDescription>{application.admin_notes}</AlertDescription>
                        </Alert>
                      )}
                      
                      <div className="mt-4">
                        <Button variant="outline" size="sm" onClick={() => router.push(`/student/applications/${application.id}`)}>
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
    </div>
  );
}