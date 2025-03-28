
import React, { useState, useEffect } from 'react';
import { getHuggingFaceApiKey, getHuggingFaceModel } from '../lib/huggingfaceApi';
import { Bot, AlertCircle, WifiOff } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

const ModelIndicator: React.FC = () => {
  const [modelInfo, setModelInfo] = useState({
    isUsingHF: false,
    modelName: '',
    isConnected: false,
    lastError: '',
    isNetworkOffline: false
  });

  useEffect(() => {
    const checkModelInfo = () => {
      const apiKey = getHuggingFaceApiKey();
      const model = getHuggingFaceModel();
      
      // Check if model connection was previously verified
      const connectionStatus = localStorage.getItem('hf_connection_status');
      const lastError = localStorage.getItem('hf_last_error') || '';
      
      setModelInfo({
        isUsingHF: !!apiKey,
        modelName: model,
        isConnected: connectionStatus === 'connected',
        lastError,
        isNetworkOffline: !navigator.onLine
      });
    };

    checkModelInfo();
    
    // Check when online/offline status changes
    const handleOnline = () => {
      setModelInfo(prev => ({ ...prev, isNetworkOffline: false }));
    };
    
    const handleOffline = () => {
      setModelInfo(prev => ({ ...prev, isNetworkOffline: true }));
    };
    
    // Check when window gets focus or storage changes
    const handleFocus = () => checkModelInfo();
    const handleStorageChange = () => checkModelInfo();
    
    window.addEventListener('focus', handleFocus);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Format model name for display
  const getShortModelName = () => {
    const parts = modelInfo.modelName.split('/');
    return parts[parts.length - 1];
  };

  if (!modelInfo.isUsingHF) {
    return null;
  }

  // Determine indicator color and icon
  let indicatorClass = 'bg-primary/10';
  let Icon = Bot;
  
  if (modelInfo.isNetworkOffline) {
    indicatorClass = 'bg-red-500/20';
    Icon = WifiOff;
  } else if (!modelInfo.isConnected) {
    indicatorClass = 'bg-amber-500/20';
    Icon = AlertCircle;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`glass text-xs px-2 py-1 rounded-md flex items-center gap-1 ${indicatorClass}`}>
            <Icon size={12} className={!modelInfo.isConnected || modelInfo.isNetworkOffline ? "text-amber-500" : ""} />
            <span className="max-w-24 truncate">{getShortModelName()}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          {modelInfo.isNetworkOffline ? (
            <div className="space-y-1">
              <p className="text-red-500">Network is offline</p>
              <p className="text-xs">Your device appears to be disconnected from the internet. Please check your connection.</p>
            </div>
          ) : modelInfo.isConnected ? (
            <p>Using model: {modelInfo.modelName}</p>
          ) : (
            <div className="space-y-1">
              <p>Model not connected: {modelInfo.modelName}</p>
              {modelInfo.lastError && (
                <p className="text-amber-500 text-xs">{modelInfo.lastError}</p>
              )}
              <p className="text-xs">Click to open settings and troubleshoot.</p>
              {modelInfo.lastError?.includes('Failed to fetch') && (
                <p className="text-xs mt-1">
                  "Failed to fetch" usually indicates a network issue or CORS restriction. 
                  Check your internet connection and try a different browser.
                </p>
              )}
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ModelIndicator;
