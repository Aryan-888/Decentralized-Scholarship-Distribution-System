'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { User, Wallet, Mail, Save, Edit3, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, loading, initialized, updateProfile } = useAuth();
  const { walletInfo, connect, isConnected } = useWallet();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [formData, setFormData] = useState({
    display_name: '',
    bio: '',
    university: '',
    major: '',
    year_of_study: '',
    expected_graduation: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    if (initialized && (!user || user.role !== 'student')) {
      router.push('/');
    }
  }, [user, initialized, router]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const response = await apiClient.getStudentProfile();
      if (response.error) {
        toast.error('Failed to load profile');
      } else {
        const profileData = response.data?.profile || {};
        setProfile(profileData);
        setFormData({
          display_name: profileData.display_name || user?.display_name || '',
          bio: profileData.bio || '',
          university: profileData.university || '',
          major: profileData.major || '',
          year_of_study: profileData.year_of_study || '',
          expected_graduation: profileData.expected_graduation || '',
          phone: profileData.phone || '',
          address: profileData.address || ''
        });
      }
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await apiClient.updateStudentProfile(formData);
      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success('Profile updated successfully!');
        setProfile(response.data?.profile);
        setEditing(false);
        
        // Update auth context if display name changed
        if (formData.display_name !== user?.display_name) {
          updateProfile({ display_name: formData.display_name });
        }
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      display_name: profile?.display_name || user?.display_name || '',
      bio: profile?.bio || '',
      university: profile?.university || '',
      major: profile?.major || '',
      year_of_study: profile?.year_of_study || '',
      expected_graduation: profile?.expected_graduation || '',
      phone: profile?.phone || '',
      address: profile?.address || ''
    });
    setEditing(false);
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
          <div className="inline-block px-4 py-2 bg-purple-600 text-white rounded-full text-sm font-medium shadow-lg mb-6">
            👤 Profile Settings
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            My Profile
          </h1>

          <p className="text-xl text-gray-700 max-w-2xl mx-auto mb-8">
            Manage your personal information, wallet connections, and academic details.
          </p>

          {!editing && (
            <Button onClick={() => setEditing(true)} className="bg-purple-600 hover:bg-purple-700 shadow-lg hover:shadow-xl px-8 py-3 flex items-center gap-2">
              <Edit3 className="h-5 w-5" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-8">
            {/* Account Information */}
            <div className="group relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-transparent hover:-translate-y-2">
              <div className="absolute inset-0 bg-linear-to-br from-blue-500 to-blue-600 opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity" />

              <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="inline-flex p-3 rounded-xl bg-linear-to-br from-blue-500 to-blue-600 shadow-lg">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Account Information</h3>
                    <p className="text-gray-600">Your basic account details</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <Label className="text-sm font-semibold text-blue-800 mb-2 block">Email Address</Label>
                    <div className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-blue-600" />
                      <span className="text-gray-900 font-medium">{user.email}</span>
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <Label className="text-sm font-semibold text-blue-800 mb-2 block">Account Role</Label>
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-600" />
                      <span className="text-gray-900 font-medium capitalize">{user.role}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Wallet Information */}
            <div className="group relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-transparent hover:-translate-y-2">
              <div className="absolute inset-0 bg-linear-to-br from-green-500 to-green-600 opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity" />

              <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="inline-flex p-3 rounded-xl bg-linear-to-br from-green-500 to-green-600 shadow-lg">
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Stellar Wallet</h3>
                    <p className="text-gray-600">Connect your Stellar wallet to receive scholarship payments</p>
                  </div>
                </div>

                {isConnected && walletInfo ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Connected
                      </Badge>
                    </div>
                    <div className="p-4 bg-green-50 rounded-xl">
                      <Label className="text-sm font-semibold text-green-800 mb-2 block">Wallet Address</Label>
                      <p className="text-gray-900 font-mono text-sm break-all">
                        {walletInfo.publicKey}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-yellow-800 mb-1">Wallet Not Connected</h4>
                          <p className="text-yellow-700 text-sm">
                            You need to connect a Stellar wallet to receive scholarship payments. Install Freighter wallet and connect it.
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button onClick={connect} className="w-full bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl">
                      Connect Wallet
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Personal Information */}
            <div className="group relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-transparent hover:-translate-y-2">
              <div className="absolute inset-0 bg-linear-to-br from-purple-500 to-purple-600 opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity" />

              <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="inline-flex p-3 rounded-xl bg-linear-to-br from-purple-500 to-purple-600 shadow-lg">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Personal Information</h3>
                    <p className="text-gray-600">Your personal details and academic information</p>
                  </div>
                </div>

                {loadingProfile ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="display_name">Display Name</Label>
                        {editing ? (
                          <Input
                            id="display_name"
                            name="display_name"
                            value={formData.display_name}
                            onChange={handleInputChange}
                            placeholder="Your full name"
                          />
                        ) : (
                          <p className="text-gray-900 mt-1">{profile?.display_name || user?.display_name || 'Not set'}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        {editing ? (
                          <Input
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="Your phone number"
                          />
                        ) : (
                          <p className="text-gray-900 mt-1">{profile?.phone || 'Not set'}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      {editing ? (
                        <Textarea
                          id="bio"
                          name="bio"
                          value={formData.bio}
                          onChange={handleInputChange}
                          placeholder="Tell us about yourself..."
                          className="min-h-20"
                        />
                      ) : (
                        <p className="text-gray-900 mt-1 whitespace-pre-wrap">{profile?.bio || 'No bio added yet'}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="university">University/Institution</Label>
                        {editing ? (
                          <Input
                            id="university"
                            name="university"
                            value={formData.university}
                            onChange={handleInputChange}
                            placeholder="Your university"
                          />
                        ) : (
                          <p className="text-gray-900 mt-1">{profile?.university || 'Not set'}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="major">Major/Field of Study</Label>
                        {editing ? (
                          <Input
                            id="major"
                            name="major"
                            value={formData.major}
                            onChange={handleInputChange}
                            placeholder="Your major"
                          />
                        ) : (
                          <p className="text-gray-900 mt-1">{profile?.major || 'Not set'}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="year_of_study">Year of Study</Label>
                        {editing ? (
                          <Input
                            id="year_of_study"
                            name="year_of_study"
                            value={formData.year_of_study}
                            onChange={handleInputChange}
                            placeholder="e.g., 2nd Year, Junior"
                          />
                        ) : (
                          <p className="text-gray-900 mt-1">{profile?.year_of_study || 'Not set'}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="expected_graduation">Expected Graduation</Label>
                        {editing ? (
                          <Input
                            id="expected_graduation"
                            name="expected_graduation"
                            type="date"
                            value={formData.expected_graduation}
                            onChange={handleInputChange}
                          />
                        ) : (
                          <p className="text-gray-900 mt-1">
                            {profile?.expected_graduation ? new Date(profile.expected_graduation).toLocaleDateString() : 'Not set'}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address">Address</Label>
                      {editing ? (
                        <Textarea
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          placeholder="Your address"
                          className="min-h-20"
                        />
                      ) : (
                        <p className="text-gray-900 mt-1 whitespace-pre-wrap">{profile?.address || 'Not set'}</p>
                      )}
                    </div>

                    {editing && (
                      <div className="flex gap-2 pt-4">
                        <Button onClick={handleSave} disabled={saving}>
                          {saving ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Save Changes
                            </>
                          )}
                        </Button>
                        <Button variant="outline" onClick={handleCancel} disabled={saving}>
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
        </div>
    </div>
  );
}