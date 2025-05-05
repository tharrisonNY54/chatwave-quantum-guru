
import React from 'react';
import { Atom } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between py-3 px-4 border-b border-white/10">
      <div className="flex items-center gap-2">
        <Atom className="text-quantum-light h-5 w-5 animate-pulse-slow" />
        <h1 className="text-lg font-bold text-white tracking-wide bg-gradient-to-r from-white via-purple-200 to-quantum-light bg-clip-text text-transparent">
          QuantumGuru
        </h1>
      </div>

      <div className="text-xs text-gray-400 hidden sm:block">
        AI Assistant for the Q Programming Language
      </div>
    </header>
  );
};

export default Header;
