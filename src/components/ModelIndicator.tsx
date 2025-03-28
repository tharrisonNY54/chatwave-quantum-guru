
import React, { useState, useEffect } from 'react';
import { getHuggingFaceApiKey, getHuggingFaceModel } from '../lib/huggingfaceApi';
import { Bot, AlertCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

const ModelIndicator: React.FC = () => {
  const [modelInfo, setModelInfo] = useState({
    isUsingHF: false,
    modelName: '',
    isConnected: false,
    lastError: ''
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
        lastError
      });
    };

    checkModelInfo();
    // Check every time the component is shown
    window.addEventListener('focus', checkModelInfo);
    
    return () => {
      window.removeEventListener('focus', checkModelInfo);
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

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`glass text-xs px-2 py-1 rounded-md flex items-center gap-1 ${modelInfo.isConnected ? 'bg-primary/10' : 'bg-amber-500/20'}`}>
            {modelInfo.isConnected ? (
              <Bot size={12} />
            ) : (
              <AlertCircle size={12} className="text-amber-500" />
            )}
            <span className="max-w-24 truncate">{getShortModelName()}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          {modelInfo.isConnected ? (
            <p>Using model: {modelInfo.modelName}</p>
          ) : (
            <div className="space-y-1">
              <p>Model not connected: {modelInfo.modelName}</p>
              {modelInfo.lastError && (
                <p className="text-amber-500 text-xs">{modelInfo.lastError}</p>
              )}
              <p className="text-xs">Click to open settings and troubleshoot.</p>
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ModelIndicator;
