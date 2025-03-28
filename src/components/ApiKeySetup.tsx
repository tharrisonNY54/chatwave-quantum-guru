
import React, { useState, useEffect } from 'react';
import { getHuggingFaceApiKey, setHuggingFaceApiKey, getHuggingFaceModel, setHuggingFaceModel } from '../lib/huggingfaceApi';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { toast } from 'sonner';
import { Bot, AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface ApiKeySetupProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const ModelSuggestion = ({ name, description, modelId, onClick }: { name: string, description: string, modelId: string, onClick: (id: string) => void }) => (
  <div 
    className="p-3 border rounded-md hover:bg-secondary/20 cursor-pointer transition-colors"
    onClick={() => onClick(modelId)}
  >
    <div className="flex items-center justify-between">
      <h3 className="font-medium text-sm">{name}</h3>
      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onClick(modelId); }}>
        Select
      </Button>
    </div>
    <p className="text-xs text-muted-foreground mt-1">{description}</p>
    <p className="text-xs mt-2 font-mono bg-background/50 p-1 rounded">{modelId}</p>
  </div>
);

const ApiKeySetup: React.FC<ApiKeySetupProps> = ({ open = false, onOpenChange }) => {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');
  const [isKeySet, setIsKeySet] = useState(false);
  const [localOpen, setLocalOpen] = useState(open);
  const [activeTab, setActiveTab] = useState('model');
  const [testingConnection, setTestingConnection] = useState(false);
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline'>('online');

  // Check network status
  useEffect(() => {
    const handleOnline = () => setNetworkStatus('online');
    const handleOffline = () => setNetworkStatus('offline');
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Initial check
    setNetworkStatus(navigator.onLine ? 'online' : 'offline');
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (onOpenChange) {
      setLocalOpen(open);
    }
  }, [open, onOpenChange]);

  const handleOpenChange = (value: boolean) => {
    setLocalOpen(value);
    if (onOpenChange) {
      onOpenChange(value);
    }
  };

  useEffect(() => {
    const savedKey = getHuggingFaceApiKey();
    const savedModel = getHuggingFaceModel();
    
    setIsKeySet(!!savedKey);
    setModel(savedModel);
    
    // Mask the API key for display
    if (savedKey) {
      setApiKey('•'.repeat(savedKey.length));
    }
  }, []);

  const testConnection = async () => {
    setTestingConnection(true);
    
    // Check network status first
    if (networkStatus === 'offline') {
      toast.error('Network is offline. Please check your internet connection.');
      localStorage.setItem('hf_connection_status', 'failed');
      localStorage.setItem('hf_last_error', 'Network is offline');
      setTestingConnection(false);
      return;
    }
    
    try {
      const apiKeyToUse = apiKey.includes('•') ? getHuggingFaceApiKey() : apiKey;
      
      if (!apiKeyToUse) {
        toast.error('API key is not set. Please enter a valid Hugging Face API key.');
        setTestingConnection(false);
        return;
      }
      
      // Make a simple request to validate the API key and model
      const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKeyToUse}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          inputs: {
            messages: [
              {
                role: 'user',
                content: 'Hello, are you working?'
              }
            ]
          },
          parameters: {
            max_new_tokens: 10,
            temperature: 0.7,
          }
        }),
      });
      
      if (response.ok) {
        toast.success('Connection successful! Your model is working.');
        localStorage.setItem('hf_connection_status', 'connected');
        localStorage.removeItem('hf_last_error');
      } else {
        const error = await response.text();
        localStorage.setItem('hf_connection_status', 'failed');
        localStorage.setItem('hf_last_error', `Error ${response.status}: ${error.substring(0, 100)}`);
        
        if (response.status === 401) {
          toast.error('Invalid API Key. Please check your Hugging Face API key.');
        } else if (response.status === 403) {
          toast.error('API Key error: Your API key does not have sufficient permissions.');
        } else if (response.status === 404) {
          toast.error(`Model not found: ${model}. Please check the model name.`);
        } else {
          toast.error(`API error: ${response.status}. Please try a different model.`);
        }
      }
    } catch (error) {
      console.error('Connection test error:', error);
      localStorage.setItem('hf_connection_status', 'failed');
      localStorage.setItem('hf_last_error', `Failed to fetch: Network error or CORS issue. Please check your internet connection.`);
      toast.error('Connection test failed: Network error. Please check your internet connection and make sure your browser allows cross-origin requests.');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSave = () => {
    if (apiKey && !apiKey.includes('•')) {
      setHuggingFaceApiKey(apiKey);
      setIsKeySet(true);
      toast.success('API key saved successfully');
    }
    
    if (model) {
      setHuggingFaceModel(model);
      toast.success('Model updated successfully');
    } else {
      toast.error('Please select a model');
      return;
    }
    
    // Automatically test the connection after saving
    testConnection();
    
    handleOpenChange(false);
  };

  const selectModel = (modelId: string) => {
    setModel(modelId);
  };

  return (
    <Dialog open={localOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Bot size={16} />
          <span>{isKeySet ? 'Change AI Model' : 'Setup AI Model'}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            AI Model Setup
            {networkStatus === 'offline' && (
              <span className="text-amber-500 text-xs flex items-center">
                <WifiOff size={12} className="mr-1" />
                Offline
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            Enter your Hugging Face API key and select a model to enhance your chat experience.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="model">Select Model</TabsTrigger>
            <TabsTrigger value="api">API Key</TabsTrigger>
          </TabsList>
          
          <TabsContent value="model" className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="model" className="text-sm font-medium flex items-center gap-1">
                Model ID
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-5 w-5 p-0"
                  onClick={() => setActiveTab('api')}
                >
                  <AlertCircle size={12} className="text-yellow-500" />
                </Button>
              </label>
              <Input
                id="model"
                placeholder="e.g., mistralai/Mistral-7B-Instruct-v0.2"
                value={model}
                onChange={(e) => setModel(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                {!isKeySet && (
                  <span className="text-amber-500">You need to set an API key first in the API Key tab.</span>
                )}
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Recommended Models</h3>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                <ModelSuggestion 
                  name="Mistral 7B Instruct" 
                  description="A powerful and efficient instruction-following model."
                  modelId="mistralai/Mistral-7B-Instruct-v0.2"
                  onClick={selectModel}
                />
                <ModelSuggestion 
                  name="Falcon 7B Instruct" 
                  description="TII's efficient and high-quality instruction-tuned model."
                  modelId="tiiuae/falcon-7b-instruct"
                  onClick={selectModel}
                />
                <ModelSuggestion 
                  name="Zephyr 7B Beta" 
                  description="A highly capable and fine-tuned instruction model."
                  modelId="HuggingFaceH4/zephyr-7b-beta"
                  onClick={selectModel}
                />
                <ModelSuggestion 
                  name="Phi-2" 
                  description="Microsoft's compact but powerful instructional model."
                  modelId="microsoft/phi-2"
                  onClick={selectModel}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="api" className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="api-key" className="text-sm font-medium">
                API Key
              </label>
              <Input
                id="api-key"
                placeholder="hf_..."
                value={apiKey}
                onChange={(e) => {
                  // If the user is modifying a masked key, clear it first
                  if (apiKey.includes('•')) {
                    setApiKey(e.target.value.replace(/•/g, ''));
                  } else {
                    setApiKey(e.target.value);
                  }
                }}
              />
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Get your API key from <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noreferrer" className="underline">Hugging Face tokens page</a></p>
                <p className="text-amber-500">Make sure your API key has proper permissions to use the Hugging Face Inference API.</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="pt-2 pb-4">
          <div className="space-y-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full flex items-center justify-center gap-2"
              onClick={testConnection}
              disabled={testingConnection || (!apiKey && !isKeySet) || !model || networkStatus === 'offline'}
            >
              {testingConnection ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Testing connection...</span>
                </>
              ) : (
                <>
                  <Bot size={14} />
                  <span>Test Connection</span>
                </>
              )}
            </Button>
            
            {networkStatus === 'offline' && (
              <p className="text-xs text-amber-500 flex items-center justify-center">
                <WifiOff size={12} className="mr-1" />
                Network appears to be offline. Check your internet connection.
              </p>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={(!apiKey && !isKeySet) || !model}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeySetup;
