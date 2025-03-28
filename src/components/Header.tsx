
import React, { useState } from 'react';
import { Code, Command } from 'lucide-react';
import ApiKeySetup from './ApiKeySetup';
import ModelIndicator from './ModelIndicator';

const Header: React.FC = () => {
  const [isApiDialogOpen, setIsApiDialogOpen] = useState(false);
  
  return (
    <header className="glass rounded-xl p-3 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <div className="h-9 w-9 rounded-full quantum-gradient flex items-center justify-center">
          <Code size={20} />
        </div>
        <div>
          <h1 className="font-semibold text-lg">QuantumGuru</h1>
          <p className="text-xs text-muted-foreground">Your quantum computing assistant</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div 
          onClick={() => setIsApiDialogOpen(true)} 
          className="cursor-pointer hover:opacity-80 transition-opacity" 
          aria-label="Configure AI model"
        >
          <ModelIndicator />
        </div>
        <ApiKeySetup open={isApiDialogOpen} onOpenChange={setIsApiDialogOpen} />
        <div className="glass text-xs px-2 py-1 rounded-md flex items-center">
          <Command size={12} className="mr-1" />
          <span>Q Language</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
