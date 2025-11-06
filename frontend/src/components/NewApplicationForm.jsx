'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, DollarSign, GraduationCap, BookOpen, Users, Heart, AlertCircle, CheckCircle2 } from 'lucide-react';
import { FreighterWallet } from '@/lib/wallet';
import toast from 'react-hot-toast';

const NewApplicationForm = ({ onSuccess, onCancel }) => {
  const { user, updateWallet } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [validationErrors, setValidationErrors] = useState({});

  const [formData, setFormData] = useState({
    // Personal Information
    full_name: '',
    student_id: '',
    university: '',
    major: '',
    year_of_study: '',
    gpa: '',

    // Financial Information
    financial_need_amount: '',
    financial_need_description: '',

    // Academic Information
    academic_achievements: '',
    extracurricular_activities: '',

    // Personal Statement
    personal_statement: '',

    // Supporting Documents (future feature)
    supporting_documents: []
  });

  // Pre-fill form with user data
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        full_name: user.display_name || user.name || user.displayName || '',
      }));
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateStep = (step) => {
    const errors = {};

    switch (step) {
      case 1: // Personal Information
        if (!formData.full_name.trim()) errors.full_name = 'Full name is required';
        if (!formData.student_id.trim()) errors.student_id = 'Student ID is required';
        if (!formData.university.trim()) errors.university = 'University is required';
        if (!formData.major.trim()) errors.major = 'Major is required';
        if (!formData.year_of_study.trim()) errors.year_of_study = 'Year of study is required';
        if (!formData.gpa || isNaN(formData.gpa) || formData.gpa < 0 || formData.gpa > 10) {
          errors.gpa = 'Please enter a valid GPA between 0 and 10';
        }
        break;

      case 2: // Financial Information
        if (!formData.financial_need_amount || isNaN(formData.financial_need_amount) || formData.financial_need_amount <= 0) {
          errors.financial_need_amount = 'Please enter a valid amount greater than 0';
        }
        if (!formData.financial_need_description.trim() || formData.financial_need_description.length < 30) {
          errors.financial_need_description = 'Please provide at least 30 characters describing your financial need';
        }
        break;

      case 3: // Academic Information
        if (!formData.academic_achievements.trim()) {
          errors.academic_achievements = 'Academic achievements are required';
        }
        break;

      case 4: // Personal Statement
        if (!formData.personal_statement.trim() || formData.personal_statement.length < 50) {
          errors.personal_statement = 'Please provide at least 50 characters in your personal statement';
        }
        break;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all steps
    for (let step = 1; step <= 4; step++) {
      if (!validateStep(step)) {
        setCurrentStep(step);
        return;
      }
    }

    setSubmitting(true);

    try {
      // Ensure student has a wallet configured before submitting
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
          await updateWallet(walletAddress);
        } catch (err) {
          console.warn('Failed to sync wallet to profile:', err);
          toast('Wallet is connected locally but failed to save to profile. Submission will continue.', { duration: 4000 });
        }
      }

      // Map frontend form fields to backend expected payload
      const essayText = [
        formData.personal_statement,
        formData.financial_need_description,
        formData.academic_achievements ? `Academic Achievements: ${formData.academic_achievements}` : '',
        formData.extracurricular_activities ? `Extracurricular Activities: ${formData.extracurricular_activities}` : ''
      ].filter(text => text && text.trim().length > 0).join('\n\n');

      const payload = {
        student_wallet: walletAddress,
        student_name: formData.full_name || user?.display_name || user?.name || user?.displayName || '',
        email: user?.email || user?.user_email || '',
        university: formData.university,
        gpa: formData.gpa,
        major: formData.major,
        year_of_study: formData.year_of_study,
        annual_income: 0,
        scholarship_amount_requested: formData.financial_need_amount || 0,
        essay: essayText,
        academic_achievements: formData.academic_achievements,
        extracurricular_activities: formData.extracurricular_activities,
        student_id: formData.student_id || ''
      };

      const response = await apiClient.submitApplication(payload);
      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success('Application submitted successfully!');
        onSuccess && onSuccess();
      }
    } catch (error) {
      toast.error('Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { id: 1, title: 'Personal Info', icon: Users, description: 'Basic information' },
    { id: 2, title: 'Financial Need', icon: DollarSign, description: 'Financial requirements' },
    { id: 3, title: 'Academic Profile', icon: GraduationCap, description: 'Academic achievements' },
    { id: 4, title: 'Personal Statement', icon: Heart, description: 'Your story' }
  ];

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
            step.id < currentStep
              ? 'bg-green-500 border-green-500 text-white'
              : step.id === currentStep
              ? 'bg-blue-500 border-blue-500 text-white'
              : 'border-gray-300 text-gray-400'
          }`}>
            {step.id < currentStep ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <step.icon className="w-5 h-5" />
            )}
          </div>
          {index < steps.length - 1 && (
            <div className={`w-12 h-0.5 mx-2 transition-all duration-300 ${
              step.id < currentStep ? 'bg-green-500' : 'bg-gray-300'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Please provide your basic personal and academic information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className={validationErrors.full_name ? 'border-red-500' : ''}
                  />
                  {validationErrors.full_name && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.full_name}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student_id">Student ID *</Label>
                  <Input
                    id="student_id"
                    name="student_id"
                    value={formData.student_id}
                    onChange={handleInputChange}
                    placeholder="Enter your student ID"
                    className={validationErrors.student_id ? 'border-red-500' : ''}
                  />
                  {validationErrors.student_id && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.student_id}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="university">University/Institution *</Label>
                  <Input
                    id="university"
                    name="university"
                    value={formData.university}
                    onChange={handleInputChange}
                    placeholder="Enter your university name"
                    className={validationErrors.university ? 'border-red-500' : ''}
                  />
                  {validationErrors.university && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.university}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="major">Major/Field of Study *</Label>
                  <Input
                    id="major"
                    name="major"
                    value={formData.major}
                    onChange={handleInputChange}
                    placeholder="Enter your major"
                    className={validationErrors.major ? 'border-red-500' : ''}
                  />
                  {validationErrors.major && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.major}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year_of_study">Year of Study *</Label>
                  <Input
                    id="year_of_study"
                    name="year_of_study"
                    value={formData.year_of_study}
                    onChange={handleInputChange}
                    placeholder="e.g., 2nd Year, Junior, etc."
                    className={validationErrors.year_of_study ? 'border-red-500' : ''}
                  />
                  {validationErrors.year_of_study && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.year_of_study}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gpa">GPA *</Label>
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
                    className={validationErrors.gpa ? 'border-red-500' : ''}
                  />
                  {validationErrors.gpa && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.gpa}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                Financial Need
              </CardTitle>
              <CardDescription>
                Tell us about your financial situation and how much support you need
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="financial_need_amount">Financial Need Amount (USD) *</Label>
                <Input
                  id="financial_need_amount"
                  name="financial_need_amount"
                  type="number"
                  min="0"
                  value={formData.financial_need_amount}
                  onChange={handleInputChange}
                  placeholder="Enter amount needed (e.g., 2500)"
                  className={validationErrors.financial_need_amount ? 'border-red-500' : ''}
                />
                {validationErrors.financial_need_amount && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {validationErrors.financial_need_amount}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="financial_need_description">Financial Need Description *</Label>
                <Textarea
                  id="financial_need_description"
                  name="financial_need_description"
                  value={formData.financial_need_description}
                  onChange={handleInputChange}
                  placeholder="Describe your financial circumstances and why you need this scholarship. Explain how this funding will help you continue your education."
                  className={`min-h-32 ${validationErrors.financial_need_description ? 'border-red-500' : ''}`}
                  minLength={30}
                />
                <div className="flex justify-between items-center">
                  {validationErrors.financial_need_description && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.financial_need_description}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 ml-auto">
                    {formData.financial_need_description.length}/30 characters minimum
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-purple-600" />
                Academic Profile
              </CardTitle>
              <CardDescription>
                Share your academic achievements and extracurricular involvement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="academic_achievements">Academic Achievements *</Label>
                <Textarea
                  id="academic_achievements"
                  name="academic_achievements"
                  value={formData.academic_achievements}
                  onChange={handleInputChange}
                  placeholder="List your academic achievements, awards, honors, scholarships received, research projects, publications, etc."
                  className={`min-h-32 ${validationErrors.academic_achievements ? 'border-red-500' : ''}`}
                />
                {validationErrors.academic_achievements && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {validationErrors.academic_achievements}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="extracurricular_activities">Extracurricular Activities</Label>
                <Textarea
                  id="extracurricular_activities"
                  name="extracurricular_activities"
                  value={formData.extracurricular_activities}
                  onChange={handleInputChange}
                  placeholder="Describe your extracurricular activities, volunteer work, leadership roles, clubs, sports, community service, etc. (Optional)"
                  className="min-h-24"
                />
                <p className="text-xs text-gray-500">
                  This field is optional but helps strengthen your application
                </p>
              </div>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-600" />
                Personal Statement
              </CardTitle>
              <CardDescription>
                Share your personal story and aspirations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="personal_statement">Personal Statement *</Label>
                <Textarea
                  id="personal_statement"
                  name="personal_statement"
                  value={formData.personal_statement}
                  onChange={handleInputChange}
                  placeholder="Write a personal statement explaining your educational goals, career aspirations, challenges you've overcome, and why you deserve this scholarship. What motivates you to pursue your field of study?"
                  className={`min-h-40 ${validationErrors.personal_statement ? 'border-red-500' : ''}`}
                  minLength={50}
                />
                <div className="flex justify-between items-center">
                  {validationErrors.personal_statement && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.personal_statement}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 ml-auto">
                    {formData.personal_statement.length}/50 characters minimum
                  </p>
                </div>
              </div>

              <Alert>
                <Upload className="h-4 w-4" />
                <AlertTitle>Document Upload</AlertTitle>
                <AlertDescription>
                  Supporting documents (transcripts, recommendation letters, etc.) can be uploaded after submitting this application through your profile.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">New Scholarship Application</h2>
        <p className="text-gray-600">Complete all steps to submit your scholarship application</p>
      </div>

      {renderStepIndicator()}

      <form onSubmit={handleSubmit} className="space-y-6">
        {renderStepContent()}

        <div className="flex justify-between items-center pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={currentStep === 1 ? onCancel : prevStep}
            disabled={submitting}
          >
            {currentStep === 1 ? 'Cancel' : 'Previous'}
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              Step {currentStep} of {steps.length}
            </span>
          </div>

          {currentStep < 4 ? (
            <Button
              type="button"
              onClick={nextStep}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Next Step
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={submitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default NewApplicationForm;