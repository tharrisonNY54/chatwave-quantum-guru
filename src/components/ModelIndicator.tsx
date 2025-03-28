import React, { useState, useEffect } from 'react';
import { getHuggingFaceApiKey } from '../lib/huggingfaceApi';
import { Bot, AlertCircle, WifiOff, AlertOctagon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

const ModelIndicator: React.FC = () => {
  const [modelInfo, setModelInfo] = useState({
    isUsingHF: false,
    modelName: 'mistralai/Mistral-7B-Instruct-v0.2',
    isConnected: false,
    lastError: '',
    isNetworkOffline: false,
  });

  useEffect(() => {
    const checkModelInfo = () => {
      const apiKey = getHuggingFaceApiKey();
      const connectionStatus = localStorage.getItem('hf_connection_status');
      const lastError = localStorage.getItem('hf_last_error') || '';

      setModelInfo({
        isUsingHF: !!apiKey,
        modelName: 'Qwen/Qwen2.5-Omni-7B',
        isConnected: connectionStatus === 'connected',
        lastError,
        isNetworkOffline: !navigator.onLine,
      });
    };

    checkModelInfo();

    const handleOnline = () => {
      setModelInfo(prev => ({ ...prev, isNetworkOffline: false }));
    };

    const handleOffline = () => {
      setModelInfo(prev => ({ ...prev, isNetworkOffline: true }));
    };

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

  const getShortModelName = () => {
    const parts = modelInfo.modelName.split('/');
    return parts[parts.length - 1];
  };

  if (!modelInfo.isUsingHF) {
    return null;
  }

  let indicatorClass = 'bg-primary/10';
  let Icon = Bot;
  let textColorClass = '';

  if (modelInfo.isNetworkOffline) {
    indicatorClass = 'bg-red-500/20';
    Icon = WifiOff;
    textColorClass = 'text-red-500';
  } else if (!modelInfo.isConnected) {
    indicatorClass = 'bg-amber-500/20';
    Icon = modelInfo.lastError.includes('Format error') || modelInfo.lastError.includes('422')
      ? AlertOctagon
      : AlertCircle;
    textColorClass = 'text-amber-500';
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`glass text-xs px-2 py-1 rounded-md flex items-center gap-1 ${indicatorClass}`}>
            <Icon size={12} className={textColorClass} />
            <span className={`max-w-24 truncate ${textColorClass}`}>{getShortModelName()}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          {modelInfo.isNetworkOffline ? (
            <div className="space-y-1">
              <p className="text-red-500">Network is offline</p>
              <p className="text-xs">Check your internet connection.</p>
            </div>
          ) : modelInfo.isConnected ? (
            <p>Using model: {modelInfo.modelName}</p>
          ) : (
            <div className="space-y-1">
              <p>Model not connected: {modelInfo.modelName}</p>
              {modelInfo.lastError && (
                <p className="text-amber-500 text-xs">{modelInfo.lastError}</p>
              )}
              <p className="text-xs">Click AI settings to troubleshoot.</p>
              {modelInfo.lastError?.includes('Failed to fetch') && (
                <p className="text-xs mt-1">
                  "Failed to fetch" usually means a network issue or CORS problem.
                </p>
              )}
              {modelInfo.lastError?.includes('422') && (
                <p className="text-xs mt-1">
                  Error 422 means this model doesn't support the input format used.
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
