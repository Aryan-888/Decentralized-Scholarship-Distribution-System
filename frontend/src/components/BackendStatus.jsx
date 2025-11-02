'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Wifi, 
  WifiOff, 
  Server, 
  AlertTriangle, 
  CheckCircle,
  RefreshCw 
} from 'lucide-react';
import { apiClient } from '@/lib/api';

export function BackendStatus() {
  const [status, setStatus] = useState('checking'); // checking, connected, disconnected
  const [lastChecked, setLastChecked] = useState(null);

  useEffect(() => {
    checkBackendStatus();
    // Check every 30 seconds
    const interval = setInterval(checkBackendStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkBackendStatus = async () => {
    const response = await apiClient.healthCheck();
    if (response.error) {
      setStatus('disconnected');
    } else {
      setStatus('connected');
    }
    setLastChecked(new Date());
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'connected':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Backend Connected
          </Badge>
        );
      case 'disconnected':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <WifiOff className="h-3 w-3 mr-1" />
            Backend Offline
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
            Checking...
          </Badge>
        );
    }
  };

  if (status === 'connected') {
    return null; // Don't show anything when everything is working
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Alert className="max-w-sm bg-yellow-50 border-yellow-200">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Development Mode</span>
            {getStatusBadge()}
          </div>
          <p className="text-sm">
            Backend server is not running. Using mock data for development.
          </p>
          {lastChecked && (
            <p className="text-xs mt-1 text-yellow-600">
              Last checked: {lastChecked.toLocaleTimeString()}
            </p>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
}

export default BackendStatus;