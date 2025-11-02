'use client';

import { useState, useEffect, useCallback } from 'react';
import { FreighterWallet, StellarUtils } from '@/lib/wallet';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

export function useWallet() {
  const [isConnected, setIsConnected] = useState(false);
  const [publicKey, setPublicKey] = useState(null);
  const [balance, setBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [accountInfo, setAccountInfo] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const { updateWallet } = useAuth();

  // Check if wallet is already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const walletInfo = FreighterWallet.getWalletInfo();
        if (walletInfo?.isConnected && walletInfo?.publicKey) {
          setIsConnected(true);
          setPublicKey(walletInfo.publicKey);
          setBalance(walletInfo.balance || '0');
          
          // Refresh account info
          await refreshAccountInfo(walletInfo.publicKey);
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    };

    checkConnection();
  }, []);

  const refreshAccountInfo = useCallback(async (pubKey = null) => {
    const keyToUse = pubKey || publicKey;
    if (!keyToUse) return;

    try {
      const info = await FreighterWallet.getAccountInfo(keyToUse);
      setAccountInfo(info);
      if (info) {
        setBalance(info.balance);
        // Update stored wallet info
        const walletInfo = FreighterWallet.getWalletInfo();
        if (walletInfo) {
          FreighterWallet.saveWalletInfo({
            ...walletInfo,
            balance: info.balance,
            accountExists: true
          });
        }
      }
    } catch (error) {
      console.error('Error refreshing account info:', error);
    }
  }, [publicKey]);

  const connect = useCallback(async () => {
    if (connecting) return;

    setConnecting(true);
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if Freighter is available
      const isAvailable = await FreighterWallet.isAvailable();
      if (!isAvailable) {
        const errorMsg = 'Freighter wallet is not installed. Please install it from https://freighter.app/';
        toast.error(errorMsg);
        setError(errorMsg);
        return;
      }

      const walletInfo = await FreighterWallet.connect();
      setIsConnected(walletInfo.isConnected);
      setPublicKey(walletInfo.publicKey);
      setBalance(walletInfo.balance || '0');
      
      // Get fresh account info
      await refreshAccountInfo(walletInfo.publicKey);
      
      // Update user profile with wallet address
      await updateWallet(walletInfo.publicKey);
      
      toast.success('Wallet connected successfully!');
      return walletInfo;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      const errorMsg = error.message || 'Failed to connect wallet';
      setError(errorMsg);
      toast.error(errorMsg);
      throw error;
    } finally {
      setIsLoading(false);
      setConnecting(false);
    }
  }, [connecting, refreshAccountInfo, updateWallet]);

  const disconnect = useCallback(async () => {
    try {
      await FreighterWallet.disconnect();
      setIsConnected(false);
      setPublicKey(null);
      setBalance('0');
      setAccountInfo(null);
      setError(null);
      toast.success('Wallet disconnected');
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      const errorMsg = 'Failed to disconnect wallet';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  }, []);

  const sendPayment = useCallback(async ({ 
    destinationId, 
    amount, 
    memo = '', 
    assetCode = 'XLM',
    assetIssuer = null 
  }) => {
    if (!isConnected) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await FreighterWallet.sendPayment({
        destinationId,
        amount,
        memo,
        assetCode,
        assetIssuer
      });

      // Refresh account info after successful payment
      await refreshAccountInfo();
      
      toast.success(`Payment sent successfully! Hash: ${result.hash.substring(0, 8)}...`);
      return result;
    } catch (error) {
      console.error('Payment failed:', error);
      const errorMsg = error.message || 'Payment failed';
      setError(errorMsg);
      toast.error(errorMsg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, refreshAccountInfo]);

  const getTransactionHistory = useCallback(async (limit = 10) => {
    if (!publicKey) return [];

    try {
      return await FreighterWallet.getTransactionHistory(publicKey, 'testnet', limit);
    } catch (error) {
      console.error('Failed to get transaction history:', error);
      return [];
    }
  }, [publicKey]);

  const getPublicKey = useCallback(async () => {
    try {
      return await FreighterWallet.getPublicKey();
    } catch (error) {
      console.error('Failed to get public key:', error);
      return null;
    }
  }, []);

  const signTransaction = useCallback(async (xdr, networkPassphrase) => {
    try {
      return await FreighterWallet.signTransaction(xdr, networkPassphrase);
    } catch (error) {
      console.error('Failed to sign transaction:', error);
      throw error;
    }
  }, []);

  const isWalletAvailable = useCallback(async () => {
    return await FreighterWallet.isAvailable();
  }, []);

  // Utility functions
  const formatBalance = useCallback((bal = balance) => {
    return StellarUtils.formatAmount(bal);
  }, [balance]);

  const validateAddress = useCallback((address) => {
    return StellarUtils.isValidAddress(address);
  }, []);

  return {
    // Connection state
    isConnected,
    publicKey,
    balance,
    isLoading,
    error,
    accountInfo,
    connecting,

    // Connection methods
    connect,
    disconnect,
    refreshAccountInfo,

    // Transaction methods
    sendPayment,
    getTransactionHistory,
    getPublicKey,
    signTransaction,

    // Utility methods
    isWalletAvailable,
    formatBalance,
    validateAddress,

    // Computed values
    hasAccount: !!accountInfo,
    formattedBalance: formatBalance(),
    shortPublicKey: publicKey ? `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}` : null,
    
    // Legacy compatibility
    walletInfo: isConnected ? { publicKey, isConnected, balance } : null
  };
}