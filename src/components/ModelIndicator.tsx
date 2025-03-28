
import React, { useState, useEffect } from 'react';
import { getHuggingFaceApiKey, getHuggingFaceModel } from '../lib/huggingfaceApi';
import { Bot } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

const ModelIndicator: React.FC = () => {
  const [modelInfo, setModelInfo] = useState({
    isUsingHF: false,
    modelName: '',
  });

  useEffect(() => {
    const checkModelInfo = () => {
      const apiKey = getHuggingFaceApiKey();
      const model = getHuggingFaceModel();
      
      setModelInfo({
        isUsingHF: !!apiKey,
        modelName: model,
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
          <div className="glass text-xs px-2 py-1 rounded-md flex items-center gap-1 bg-primary/10">
            <Bot size={12} />
            <span className="max-w-24 truncate">{getShortModelName()}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Using model: {modelInfo.modelName}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ModelIndicator;
