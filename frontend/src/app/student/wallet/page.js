'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useWallet } from '@/hooks/useWallet';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { 
  Wallet, 
  Copy, 
  ExternalLink, 
  RefreshCw, 
  Check,
  AlertCircle,
  TrendingUp,
  Send,
  History,
  Download,
  FileText,
  Eye
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function StudentWallet() {
  const { 
    isConnected, 
    publicKey, 
    balance, 
    isLoading, 
    error, 
    accountInfo, 
    connect, 
    disconnect, 
    refreshAccountInfo,
    sendPayment,
    getTransactionHistory,
    formatBalance,
    validateAddress,
    shortPublicKey,
    hasAccount
  } = useWallet();
  
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [applications, setApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [sendForm, setSendForm] = useState({
    recipient: '',
    amount: '',
    memo: ''
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (isConnected && publicKey) {
      loadTransactionHistory();
    }
  }, [isConnected, publicKey]);

  useEffect(() => {
    if (user) {
      fetchRecentApplications();
    }
  }, [user]);

  const fetchRecentApplications = async () => {
    setLoadingApplications(true);
    try {
      const response = await apiClient.getStudentApplications();
      
      if (response.error) {
        // Use mock data if backend is not available
        setApplications(getMockApplications());
      } else {
        // Get the 3 most recent applications
        const recentApps = (response.data?.applications || []).slice(0, 3);
        setApplications(recentApps);
      }
    } catch (error) {
      console.error('Failed to load applications:', error);
      setApplications(getMockApplications());
    } finally {
      setLoadingApplications(false);
    }
  };

  const getMockApplications = () => [
    {
      id: 1,
      title: 'Academic Excellence Scholarship',
      amount: 2500,
      status: 'approved',
      date_applied: '2024-11-15',
      description: 'Merit-based scholarship for outstanding academic performance'
    },
    {
      id: 2,
      title: 'STEM Innovation Grant',
      amount: 1500,
      status: 'pending',
      date_applied: '2024-11-20',
      description: 'Support for students pursuing STEM fields'
    }
  ];

  const loadTransactionHistory = async () => {
    setLoadingTransactions(true);
    try {
      const history = await getTransactionHistory(10);
      setTransactions(history);
    } catch (error) {
      console.error('Failed to load transaction history:', error);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
      case 'disbursed':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
  };

  const handleSendPayment = async (e) => {
    e.preventDefault();
    
    if (!validateAddress(sendForm.recipient)) {
      toast.error('Invalid recipient address');
      return;
    }

    if (parseFloat(sendForm.amount) <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    if (parseFloat(sendForm.amount) > parseFloat(balance)) {
      toast.error('Insufficient balance');
      return;
    }

    setSending(true);
    try {
      await sendPayment({
        destinationId: sendForm.recipient,
        amount: sendForm.amount,
        memo: sendForm.memo
      });
      
      setSendForm({ recipient: '', amount: '', memo: '' });
      setSendModalOpen(false);
      loadTransactionHistory();
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setSending(false);
    }
  };

  const openStellarExplorer = (hash) => {
    const network = 'testnet'; // Or get from config
    const url = network === 'testnet' 
      ? `https://stellar.expert/explorer/testnet/tx/${hash}`
      : `https://stellar.expert/explorer/public/tx/${hash}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Wallet Management</h1>
        <p className="text-gray-600 mt-1">Manage your Stellar wallet and transactions</p>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wallet className="h-5 w-5 mr-2" />
            Wallet Connection
          </CardTitle>
          <CardDescription>
            Connect your Freighter wallet to receive scholarship payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isConnected ? (
            <div className="text-center py-6">
              <Wallet className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Wallet Connected</h3>
              <p className="text-gray-600 mb-4">
                Connect your Freighter wallet to manage your funds and receive scholarship payments
              </p>
              <Button onClick={connect} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Wallet className="h-4 w-4 mr-2" />
                )}
                Connect Wallet
              </Button>
              {error && (
                <Alert className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge className="bg-green-100 text-green-800">
                  <Check className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
                <Button variant="outline" size="sm" onClick={disconnect}>
                  Disconnect
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Public Key</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <code className="flex-1 px-3 py-2 bg-gray-100 rounded text-sm font-mono">
                      {shortPublicKey}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(publicKey)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Balance</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-2xl font-bold text-blue-600">
                      {formatBalance()} XLM
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => refreshAccountInfo()}
                      disabled={isLoading}
                    >
                      <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </div>
              </div>

              {!hasAccount && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Your account is not yet funded on the Stellar network. 
                    You'll need at least 1 XLM to activate your account.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Details */}
      {isConnected && hasAccount && (
        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{accountInfo?.subentryCount || 0}</div>
                <div className="text-sm text-gray-600">Subentries</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">{accountInfo?.thresholds?.low_threshold || 0}</div>
                <div className="text-sm text-gray-600">Low Threshold</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{accountInfo?.sequence || 0}</div>
                <div className="text-sm text-gray-600">Sequence Number</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      {isConnected && hasAccount && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={() => setSendModalOpen(true)}
                className="h-20 flex flex-col items-center justify-center"
              >
                <Send className="h-6 w-6 mb-2" />
                Send Payment
              </Button>
              <Button
                variant="outline"
                onClick={loadTransactionHistory}
                disabled={loadingTransactions}
                className="h-20 flex flex-col items-center justify-center"
              >
                <History className="h-6 w-6 mb-2" />
                Refresh History
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open(`https://stellar.expert/explorer/testnet/account/${publicKey}`, '_blank')}
                className="h-20 flex flex-col items-center justify-center"
              >
                <ExternalLink className="h-6 w-6 mb-2" />
                View on Explorer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Applications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Recent Applications
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchRecentApplications}
                disabled={loadingApplications}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loadingApplications ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = '/student/applications'}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                View All
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Your latest scholarship applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingApplications ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              Loading applications...
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No applications yet</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = '/student/applications'}
                className="mt-2"
              >
                Submit Your First Application
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((application, index) => (
                <div
                  key={application.id || index}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {application.title || `Application #${application.id}`}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {application.description || 'Scholarship application'}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>Amount: ${application.amount || application.scholarship_amount_requested || 'N/A'}</span>
                        <span>Applied: {application.date_applied || application.applied_at || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(application.status)}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.location.href = `/student/applications/${application.id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction History */}
      {isConnected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <History className="h-5 w-5 mr-2" />
              Transaction History
            </CardTitle>
            <CardDescription>
              Recent transactions on your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingTransactions ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                Loading transactions...
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No transactions found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hash</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Fee</TableHead>
                    <TableHead>Operations</TableHead>
                    <TableHead>Memo</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>
                        <code className="text-sm">
                          {tx.hash.substring(0, 8)}...
                        </code>
                      </TableCell>
                      <TableCell>
                        {new Date(tx.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {(parseInt(tx.fee_charged) / 10000000).toFixed(7)} XLM
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {tx.operation_count} ops
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {tx.memo || '-'}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openStellarExplorer(tx.hash)}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Send Payment Modal */}
      {sendModalOpen && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md bg-white text-black">
            <CardHeader>
              <CardTitle>Send Payment</CardTitle>
              <CardDescription>
                Send XLM to another Stellar address
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendPayment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recipient Address
                  </label>
                  <input
                    type="text"
                    value={sendForm.recipient}
                    onChange={(e) => setSendForm(prev => ({ ...prev, recipient: e.target.value }))}
                    placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (XLM)
                  </label>
                  <input
                    type="number"
                    step="0.0000001"
                    min="0.0000001"
                    max={balance}
                    value={sendForm.amount}
                    onChange={(e) => setSendForm(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="0.0000000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Available: {formatBalance()} XLM
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Memo (Optional)
                  </label>
                  <input
                    type="text"
                    value={sendForm.memo}
                    onChange={(e) => setSendForm(prev => ({ ...prev, memo: e.target.value }))}
                    placeholder="Payment description"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    maxLength={28}
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSendModalOpen(false)}
                    className="flex-1"
                    disabled={sending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={sending}
                    className="flex-1"
                  >
                    {sending ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Send
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}