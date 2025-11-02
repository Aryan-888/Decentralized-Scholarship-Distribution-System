'use client';

import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Code, 
  X, 
  Info
} from 'lucide-react';

export function DevelopmentBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [isDevelopment, setIsDevelopment] = useState(false);

  useEffect(() => {
    // Check if we're in development mode
    setIsDevelopment(process.env.NODE_ENV === 'development');
    
    // Check if user has previously dismissed the banner
    const dismissed = localStorage.getItem('dev-banner-dismissed');
    if (dismissed) {
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('dev-banner-dismissed', 'true');
  };

  if (!isDevelopment || !isVisible) {
    return null;
  }

  return (
    <div className="bg-blue-50 border-b border-blue-200 px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <Code className="h-3 w-3 mr-1" />
            Development Mode
          </Badge>
          <span className="text-sm text-blue-700">
            This is a demo version using mock data. Backend connection is not required.
          </span>
        </div>
        <button
          onClick={handleDismiss}
          className="text-blue-500 hover:text-blue-700 p-1"
          aria-label="Dismiss banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default DevelopmentBanner;