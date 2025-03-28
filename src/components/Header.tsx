
import React from 'react';
import { Code, Command } from 'lucide-react';
import ApiKeySetup from './ApiKeySetup';
import ModelIndicator from './ModelIndicator';

const Header: React.FC = () => {
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
        <ModelIndicator />
        <ApiKeySetup />
        <div className="glass text-xs px-2 py-1 rounded-md flex items-center">
          <Command size={12} className="mr-1" />
          <span>Q Language</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
