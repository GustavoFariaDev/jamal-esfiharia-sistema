import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBanner, setShowBanner] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowBanner(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showBanner) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-600 text-white py-3 px-4 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
        <WifiOff className="w-5 h-5" />
        <p className="font-medium">
          Sem conexão com a internet. Verifique sua conexão e tente novamente.
        </p>
      </div>
    </div>
  );
};

export default NetworkStatus;

