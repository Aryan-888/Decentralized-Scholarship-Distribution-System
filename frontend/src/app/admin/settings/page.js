'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { 
  Settings,
  Save,
  RefreshCw,
  Shield,
  Globe,
  Mail,
  Wallet,
  Database,
  AlertTriangle,
  Check,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    general: {
      applicationDeadline: '',
      maxScholarshipAmount: 5000,
      minGpaRequirement: 7.0,
      autoApprovalThreshold: 8.5,
      applicationFee: 0,
      enableApplications: true,
      requireWalletConnection: true,
      allowMultipleApplications: false
    },
    email: {
      smtpHost: '',
      smtpPort: 587,
      smtpUsername: '',
      smtpPassword: '',
      fromEmail: '',
      fromName: 'Scholarship Program',
      enableEmailNotifications: true
    },
    blockchain: {
      stellarNetwork: 'testnet',
      contractAddress: '',
      masterWalletAddress: '',
      gasLimit: 100000,
      enableBlockchainPayments: true,
      autoDistributeApprovedFunds: false
    },
    security: {
      enableTwoFactor: false,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      enableAuditLog: true,
      requireStrongPasswords: true
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testingBlockchain, setTestingBlockchain] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getSystemSettings();
      if (response.data) {
        setSettings(prev => ({ ...prev, ...response.data }));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      await apiClient.updateSystemSettings(settings);
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const testEmailConnection = async () => {
    try {
      setTestingEmail(true);
      await apiClient.testEmailConfiguration(settings.email);
      toast.success('Email configuration test successful');
    } catch (error) {
      console.error('Email test failed:', error);
      toast.error('Email configuration test failed');
    } finally {
      setTestingEmail(false);
    }
  };

  const testBlockchainConnection = async () => {
    try {
      setTestingBlockchain(true);
      await apiClient.testBlockchainConfiguration(settings.blockchain);
      toast.success('Blockchain configuration test successful');
    } catch (error) {
      console.error('Blockchain test failed:', error);
      toast.error('Blockchain configuration test failed');
    } finally {
      setTestingBlockchain(false);
    }
  };

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading system settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600 mt-1">Configure system-wide settings and preferences</p>
        </div>
        <Button 
          onClick={saveSettings}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {saving ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Settings
        </Button>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            General Settings
          </CardTitle>
          <CardDescription>
            Basic configuration for the scholarship application system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="applicationDeadline">Application Deadline</Label>
              <Input
                id="applicationDeadline"
                type="date"
                value={settings.general.applicationDeadline}
                onChange={(e) => updateSetting('general', 'applicationDeadline', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxScholarshipAmount">Maximum Scholarship Amount ($)</Label>
              <Input
                id="maxScholarshipAmount"
                type="number"
                value={settings.general.maxScholarshipAmount}
                onChange={(e) => updateSetting('general', 'maxScholarshipAmount', parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minGpaRequirement">Minimum GPA Requirement</Label>
              <Input
                id="minGpaRequirement"
                type="number"
                step="0.1"
                min="0"
                max="10.0"
                value={settings.general.minGpaRequirement}
                onChange={(e) => updateSetting('general', 'minGpaRequirement', parseFloat(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="autoApprovalThreshold">Auto-Approval GPA Threshold</Label>
              <Input
                id="autoApprovalThreshold"
                type="number"
                step="0.1"
                min="0"
                max="10.0"
                value={settings.general.autoApprovalThreshold}
                onChange={(e) => updateSetting('general', 'autoApprovalThreshold', parseFloat(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enableApplications">Enable Applications</Label>
                <p className="text-sm text-gray-500">Allow new scholarship applications</p>
              </div>
              <Switch
                id="enableApplications"
                checked={settings.general.enableApplications}
                onCheckedChange={(checked) => updateSetting('general', 'enableApplications', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="requireWalletConnection">Require Wallet Connection</Label>
                <p className="text-sm text-gray-500">Require students to connect a Stellar wallet</p>
              </div>
              <Switch
                id="requireWalletConnection"
                checked={settings.general.requireWalletConnection}
                onCheckedChange={(checked) => updateSetting('general', 'requireWalletConnection', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="allowMultipleApplications">Allow Multiple Applications</Label>
                <p className="text-sm text-gray-500">Allow students to submit multiple applications</p>
              </div>
              <Switch
                id="allowMultipleApplications"
                checked={settings.general.allowMultipleApplications}
                onCheckedChange={(checked) => updateSetting('general', 'allowMultipleApplications', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="h-5 w-5 mr-2" />
            Email Configuration
          </CardTitle>
          <CardDescription>
            Configure SMTP settings for email notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtpHost">SMTP Host</Label>
              <Input
                id="smtpHost"
                value={settings.email.smtpHost}
                placeholder="smtp.gmail.com"
                onChange={(e) => updateSetting('email', 'smtpHost', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtpPort">SMTP Port</Label>
              <Input
                id="smtpPort"
                type="number"
                value={settings.email.smtpPort}
                onChange={(e) => updateSetting('email', 'smtpPort', parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtpUsername">SMTP Username</Label>
              <Input
                id="smtpUsername"
                value={settings.email.smtpUsername}
                onChange={(e) => updateSetting('email', 'smtpUsername', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtpPassword">SMTP Password</Label>
              <Input
                id="smtpPassword"
                type="password"
                value={settings.email.smtpPassword}
                onChange={(e) => updateSetting('email', 'smtpPassword', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fromEmail">From Email</Label>
              <Input
                id="fromEmail"
                type="email"
                value={settings.email.fromEmail}
                placeholder="noreply@scholarships.com"
                onChange={(e) => updateSetting('email', 'fromEmail', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fromName">From Name</Label>
              <Input
                id="fromName"
                value={settings.email.fromName}
                onChange={(e) => updateSetting('email', 'fromName', e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <Label htmlFor="enableEmailNotifications">Enable Email Notifications</Label>
              <p className="text-sm text-gray-500">Send email notifications for application status changes</p>
            </div>
            <Switch
              id="enableEmailNotifications"
              checked={settings.email.enableEmailNotifications}
              onCheckedChange={(checked) => updateSetting('email', 'enableEmailNotifications', checked)}
            />
          </div>

          <div className="pt-4">
            <Button
              onClick={testEmailConnection}
              disabled={testingEmail}
              variant="outline"
            >
              {testingEmail ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Mail className="h-4 w-4 mr-2" />
              )}
              Test Email Configuration
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Blockchain Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wallet className="h-5 w-5 mr-2" />
            Blockchain Configuration
          </CardTitle>
          <CardDescription>
            Configure Stellar blockchain settings for payments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stellarNetwork">Stellar Network</Label>
              <select
                id="stellarNetwork"
                value={settings.blockchain.stellarNetwork}
                onChange={(e) => updateSetting('blockchain', 'stellarNetwork', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="testnet">Testnet</option>
                <option value="mainnet">Mainnet</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gasLimit">Gas Limit</Label>
              <Input
                id="gasLimit"
                type="number"
                value={settings.blockchain.gasLimit}
                onChange={(e) => updateSetting('blockchain', 'gasLimit', parseInt(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contractAddress">Smart Contract Address</Label>
            <Input
              id="contractAddress"
              value={settings.blockchain.contractAddress}
              placeholder="GCXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
              onChange={(e) => updateSetting('blockchain', 'contractAddress', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="masterWalletAddress">Master Wallet Address</Label>
            <Input
              id="masterWalletAddress"
              value={settings.blockchain.masterWalletAddress}
              placeholder="GCXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
              onChange={(e) => updateSetting('blockchain', 'masterWalletAddress', e.target.value)}
            />
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enableBlockchainPayments">Enable Blockchain Payments</Label>
                <p className="text-sm text-gray-500">Use Stellar blockchain for scholarship distributions</p>
              </div>
              <Switch
                id="enableBlockchainPayments"
                checked={settings.blockchain.enableBlockchainPayments}
                onCheckedChange={(checked) => updateSetting('blockchain', 'enableBlockchainPayments', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="autoDistributeApprovedFunds">Auto-Distribute Approved Funds</Label>
                <p className="text-sm text-gray-500">Automatically send funds when applications are approved</p>
              </div>
              <Switch
                id="autoDistributeApprovedFunds"
                checked={settings.blockchain.autoDistributeApprovedFunds}
                onCheckedChange={(checked) => updateSetting('blockchain', 'autoDistributeApprovedFunds', checked)}
              />
            </div>
          </div>

          <div className="pt-4">
            <Button
              onClick={testBlockchainConnection}
              disabled={testingBlockchain}
              variant="outline"
            >
              {testingBlockchain ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Wallet className="h-4 w-4 mr-2" />
              )}
              Test Blockchain Configuration
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Security Settings
          </CardTitle>
          <CardDescription>
            Configure security and authentication options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={settings.security.sessionTimeout}
                onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
              <Input
                id="maxLoginAttempts"
                type="number"
                value={settings.security.maxLoginAttempts}
                onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enableTwoFactor">Enable Two-Factor Authentication</Label>
                <p className="text-sm text-gray-500">Require 2FA for admin accounts</p>
              </div>
              <Switch
                id="enableTwoFactor"
                checked={settings.security.enableTwoFactor}
                onCheckedChange={(checked) => updateSetting('security', 'enableTwoFactor', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enableAuditLog">Enable Audit Logging</Label>
                <p className="text-sm text-gray-500">Log all admin actions for security auditing</p>
              </div>
              <Switch
                id="enableAuditLog"
                checked={settings.security.enableAuditLog}
                onCheckedChange={(checked) => updateSetting('security', 'enableAuditLog', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="requireStrongPasswords">Require Strong Passwords</Label>
                <p className="text-sm text-gray-500">Enforce strong password requirements</p>
              </div>
              <Switch
                id="requireStrongPasswords"
                checked={settings.security.requireStrongPasswords}
                onCheckedChange={(checked) => updateSetting('security', 'requireStrongPasswords', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2" />
            System Status
          </CardTitle>
          <CardDescription>
            Current system health and service status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="text-sm font-medium">Database</p>
                <p className="text-xs text-gray-500">Connection status</p>
              </div>
              <Badge className="bg-green-100 text-green-800">
                <Check className="h-3 w-3 mr-1" />
                Online
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="text-sm font-medium">Email Service</p>
                <p className="text-xs text-gray-500">SMTP connectivity</p>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Warning
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="text-sm font-medium">Blockchain</p>
                <p className="text-xs text-gray-500">Stellar network</p>
              </div>
              <Badge className="bg-green-100 text-green-800">
                <Check className="h-3 w-3 mr-1" />
                Connected
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}