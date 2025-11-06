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
  Eye,
  DollarSign
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
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="inline-block px-4 py-2 bg-green-600 text-white rounded-full text-sm font-medium shadow-lg mb-6">
            💰 Wallet Management
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Wallet Management
          </h1>

          <p className="text-xl text-gray-700 max-w-2xl mx-auto mb-8">
            Manage your Stellar wallet, view transactions, and track scholarship payments.
          </p>
        </div>
      </div>

      {/* Connection Status */}
      <div className="group relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-transparent hover:-translate-y-2">
        <div className="absolute inset-0 bg-linear-to-br from-green-500 to-green-600 opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="inline-flex p-3 rounded-xl bg-linear-to-br from-green-500 to-green-600 shadow-lg">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Wallet Connection</h3>
              <p className="text-gray-600">Connect your Freighter wallet to receive scholarship payments</p>
            </div>
          </div>
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
        </div>
      </div>

      {/* Account Details */}
      {isConnected && hasAccount && (
        <div className="group relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-transparent hover:-translate-y-2">
          <div className="absolute inset-0 bg-linear-to-br from-blue-500 to-blue-600 opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity" />

          <div className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="inline-flex p-3 rounded-xl bg-linear-to-br from-blue-500 to-blue-600 shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Account Details</h3>
                <p className="text-gray-600">Your Stellar account information</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-blue-50 rounded-xl border border-blue-200">
                <div className="text-3xl font-bold text-blue-600 mb-2">{accountInfo?.subentryCount || 0}</div>
                <div className="text-sm font-medium text-blue-800">Subentries</div>
              </div>
              <div className="text-center p-6 bg-green-50 rounded-xl border border-green-200">
                <div className="text-3xl font-bold text-green-600 mb-2">{accountInfo?.thresholds?.low_threshold || 0}</div>
                <div className="text-sm font-medium text-green-800">Low Threshold</div>
              </div>
              <div className="text-center p-6 bg-purple-50 rounded-xl border border-purple-200">
                <div className="text-3xl font-bold text-purple-600 mb-2">{accountInfo?.sequence || 0}</div>
                <div className="text-sm font-medium text-purple-800">Sequence Number</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {isConnected && hasAccount && (
        <div className="group relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-transparent hover:-translate-y-2">
          <div className="absolute inset-0 bg-linear-to-br from-yellow-500 to-orange-500 opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity" />

          <div className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="inline-flex p-3 rounded-xl bg-linear-to-br from-yellow-500 to-orange-500 shadow-lg">
                <Send className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Quick Actions</h3>
                <p className="text-gray-600">Manage your wallet and transactions</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Button
                onClick={() => setSendModalOpen(true)}
                className="h-24 flex flex-col items-center justify-center bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl"
              >
                <Send className="h-6 w-6 mb-2" />
                <span className="font-semibold">Send Payment</span>
              </Button>
              <Button
                variant="outline"
                onClick={loadTransactionHistory}
                disabled={loadingTransactions}
                className="h-24 flex flex-col items-center justify-center border-purple-600 text-purple-600 hover:bg-purple-50 shadow-lg hover:shadow-xl"
              >
                <History className="h-6 w-6 mb-2" />
                <span className="font-semibold">Refresh History</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open(`https://stellar.expert/explorer/testnet/account/${publicKey}`, '_blank')}
                className="h-24 flex flex-col items-center justify-center border-green-600 text-green-600 hover:bg-green-50 shadow-lg hover:shadow-xl"
              >
                <ExternalLink className="h-6 w-6 mb-2" />
                <span className="font-semibold">View on Explorer</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Recent Applications */}
      <div className="group relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-transparent hover:-translate-y-2">
        <div className="absolute inset-0 bg-linear-to-br from-purple-500 to-pink-500 opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity" />

        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="inline-flex p-3 rounded-xl bg-linear-to-br from-purple-500 to-pink-500 shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Recent Applications</h3>
                <p className="text-gray-600">Your latest scholarship applications</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchRecentApplications}
                disabled={loadingApplications}
                className="flex items-center gap-2 hover:bg-purple-50"
              >
                <RefreshCw className={`h-4 w-4 ${loadingApplications ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = '/student/applications'}
                className="flex items-center gap-2 border-purple-600 text-purple-600 hover:bg-purple-50"
              >
                <Eye className="h-4 w-4" />
                View All
              </Button>
            </div>
          </div>

          {loadingApplications ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2 text-purple-600" />
              <span className="text-gray-600">Loading applications...</span>
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600 mb-4">No applications yet</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = '/student/applications'}
                className="border-purple-600 text-purple-600 hover:bg-purple-50"
              >
                Submit Your First Application
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((application, index) => (
                <div
                  key={application.id || index}
                  className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 hover:border-purple-200 transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {application.title || `Application #${application.id}`}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {application.description || 'Scholarship application'}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          ${application.amount || application.scholarship_amount_requested || 'N/A'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {application.date_applied || application.applied_at || 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(application.status)}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.location.href = `/student/applications/${application.id}`}
                        className="hover:bg-purple-50"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Transaction History */}
      {isConnected && (
        <div className="group relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-transparent hover:-translate-y-2">
          <div className="absolute inset-0 bg-linear-to-br from-green-500 to-teal-500 opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity" />

          <div className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="inline-flex p-3 rounded-xl bg-linear-to-br from-green-500 to-teal-500 shadow-lg">
                <History className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Transaction History</h3>
                <p className="text-gray-600">Recent transactions on your account</p>
              </div>
            </div>

            {loadingTransactions ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin mr-2 text-green-600" />
                <span className="text-gray-600">Loading transactions...</span>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8">
                <History className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-600">No transactions found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-200">
                      <TableHead className="text-gray-700 font-semibold">Hash</TableHead>
                      <TableHead className="text-gray-700 font-semibold">Date</TableHead>
                      <TableHead className="text-gray-700 font-semibold">Fee</TableHead>
                      <TableHead className="text-gray-700 font-semibold">Operations</TableHead>
                      <TableHead className="text-gray-700 font-semibold">Memo</TableHead>
                      <TableHead className="text-gray-700 font-semibold"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow key={tx.id} className="border-gray-200 hover:bg-gray-50">
                        <TableCell>
                          <code className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                            {tx.hash.substring(0, 8)}...
                          </code>
                        </TableCell>
                        <TableCell className="text-gray-700">
                          {new Date(tx.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-gray-700">
                          {(parseInt(tx.fee_charged) / 10000000).toFixed(7)} XLM
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-green-600 text-green-600">
                            {tx.operation_count} ops
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-700">
                          {tx.memo || '-'}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openStellarExplorer(tx.hash)}
                            className="border-green-600 text-green-600 hover:bg-green-50"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Send Payment Modal */}
      {sendModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="group relative bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100">
            <div className="absolute inset-0 bg-linear-to-br from-blue-500 to-purple-500 opacity-5 rounded-2xl" />

            <div className="relative">
              <div className="text-center mb-6">
                <div className="inline-flex p-3 rounded-xl bg-linear-to-br from-blue-500 to-purple-500 shadow-lg mb-4">
                  <Send className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Send Payment</h3>
                <p className="text-gray-600">Send XLM to another Stellar address</p>
              </div>

              <form onSubmit={handleSendPayment} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Recipient Address
                  </label>
                  <input
                    type="text"
                    value={sendForm.recipient}
                    onChange={(e) => setSendForm(prev => ({ ...prev, recipient: e.target.value }))}
                    placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <Wallet className="h-4 w-4" />
                    Available: {formatBalance()} XLM
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Memo (Optional)
                  </label>
                  <input
                    type="text"
                    value={sendForm.memo}
                    onChange={(e) => setSendForm(prev => ({ ...prev, memo: e.target.value }))}
                    placeholder="Payment description"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    maxLength={28}
                  />
                </div>

                <div className="flex space-x-3 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSendModalOpen(false)}
                    className="flex-1 h-12 border-gray-300 hover:bg-gray-50"
                    disabled={sending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={sending}
                    className="flex-1 h-12 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                  >
                    {sending ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Send Payment
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}