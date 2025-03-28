import React, { useState, useEffect } from 'react';
import { getHuggingFaceApiKey, setHuggingFaceApiKey } from '../lib/huggingfaceApi';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { toast } from 'sonner';
import { Bot, RefreshCw, WifiOff } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface ApiKeySetupProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const ApiKeySetup: React.FC<ApiKeySetupProps> = ({ open = false, onOpenChange }) => {
  const [apiKey, setApiKey] = useState('');
  const [isKeySet, setIsKeySet] = useState(false);
  const [localOpen, setLocalOpen] = useState(open);
  const [activeTab, setActiveTab] = useState('api');
  const [testingConnection, setTestingConnection] = useState(false);
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline'>('online');

  // Monitor network state
  useEffect(() => {
    const handleOnline = () => setNetworkStatus('online');
    const handleOffline = () => setNetworkStatus('offline');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

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
    setIsKeySet(!!savedKey);

    if (savedKey) {
      setApiKey('•'.repeat(savedKey.length));
    }
  }, []);

  const testConnection = async () => {
    setTestingConnection(true);

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

      const model = 'Qwen/Qwen2.5-Omni-7B';

      const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKeyToUse}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: 'Hello, are you working? This is a test message.',
        }),
      });

      if (response.ok) {
        toast.success(`Connection successful! Model "${model}" is working.`);
        localStorage.setItem('hf_connection_status', 'connected');
        localStorage.removeItem('hf_last_error');
      } else {
        const error = await response.text();
        localStorage.setItem('hf_connection_status', 'failed');
        localStorage.setItem('hf_last_error', error.slice(0, 150));

        if (response.status === 401) toast.error('Invalid API Key.');
        else if (response.status === 404) toast.error(`Model not found: ${model}`);
        else if (response.status === 422) toast.error(`Input format not supported by model.`);
        else toast.error(`Error ${response.status}: ${error}`);
      }
    } catch (err: any) {
      console.error('Test connection error:', err);
      toast.error('Test connection failed: ' + err.message);
      localStorage.setItem('hf_connection_status', 'failed');
      localStorage.setItem('hf_last_error', err.message || 'Unknown error');
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

    testConnection();
    handleOpenChange(false);
  };

  return (
    <Dialog open={localOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Bot size={16} />
          <span>{isKeySet ? 'Change API Key' : 'Setup API Key'}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            AI Setup
            {networkStatus === 'offline' && (
              <span className="text-amber-500 text-xs flex items-center">
                <WifiOff size={12} className="mr-1" />
                Offline
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            Enter your Hugging Face API key to use the locked model: <strong>Qwen/Qwen2.5-Omni-7B</strong>.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="api">API Key</TabsTrigger>
          </TabsList>

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
                  if (apiKey.includes('•')) {
                    setApiKey(e.target.value.replace(/•/g, ''));
                  } else {
                    setApiKey(e.target.value);
                  }
                }}
              />
              <div className="text-xs text-muted-foreground space-y-1">
                <p>
                  Get your API key from{' '}
                  <a
                    href="https://huggingface.co/settings/tokens"
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                  >
                    Hugging Face tokens page
                  </a>
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="pt-2 pb-4">
          <Button
            variant="outline"
            size="sm"
            className="w-full flex items-center justify-center gap-2"
            onClick={testConnection}
            disabled={testingConnection || (!apiKey && !isKeySet) || networkStatus === 'offline'}
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!apiKey && !isKeySet}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeySetup;
