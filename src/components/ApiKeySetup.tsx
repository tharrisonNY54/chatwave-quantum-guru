
import React, { useState, useEffect } from 'react';
import { getHuggingFaceApiKey, setHuggingFaceApiKey, getHuggingFaceModel, setHuggingFaceModel } from '../lib/huggingfaceApi';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { toast } from 'sonner';

const ApiKeySetup: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');
  const [isKeySet, setIsKeySet] = useState(false);
  const [open, setOpen] = useState(false);

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

  const handleSave = () => {
    if (apiKey && !apiKey.includes('•')) {
      setHuggingFaceApiKey(apiKey);
      setIsKeySet(true);
      toast.success('API key saved successfully');
    }
    
    if (model) {
      setHuggingFaceModel(model);
      toast.success('Model updated successfully');
    }
    
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <span>{isKeySet ? 'Change AI Model' : 'Setup AI Model'}</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hugging Face API Setup</DialogTitle>
          <DialogDescription>
            Enter your Hugging Face API key to connect to your preferred model. This will be stored locally in your browser.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
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
            <p className="text-xs text-muted-foreground">
              Get your API key from <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noreferrer" className="underline">Hugging Face tokens page</a>
            </p>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="model" className="text-sm font-medium">
              Model ID
            </label>
            <Input
              id="model"
              placeholder="mistralai/Mistral-7B-Instruct-v0.2"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Enter the model ID (e.g., mistralai/Mistral-7B-Instruct-v0.2)
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeySetup;
