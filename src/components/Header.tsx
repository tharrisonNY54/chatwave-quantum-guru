import React from 'react';
import { Sparkles } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between py-2 px-4 border-b border-white/10">
      <div className="flex items-center gap-2">
        <Sparkles className="text-purple-400 h-5 w-5" />
        <h1 className="text-lg font-bold text-white tracking-wide">QuantumGuru</h1>
      </div>

      <div className="text-xs text-gray-400 hidden sm:block">
        AI Assistant for the Q Programming Language
      </div>
    </header>
  );
};

export default Header;
