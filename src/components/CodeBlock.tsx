
import React, { useEffect, useRef } from 'react';
import { ClipboardCopy } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'q' }) => {
  const codeRef = useRef<HTMLPreElement>(null);
  
  useEffect(() => {
    // In a real implementation, you would use a syntax highlighting library like Prism.js or highlight.js
    // For this prototype, we'll use a simplified highlighting approach
    if (codeRef.current) {
      const keywords = ['operation', 'function', 'using', 'let', 'return', 'if', 'else', 'for', 'while', 'repeat'];
      const types = ['Qubit', 'Result', 'Int', 'Double', 'Bool', 'String'];
      const functions = ['H', 'X', 'Y', 'Z', 'CNOT', 'M', 'Reset'];
      
      let formattedCode = code;
      
      // Highlight keywords
      keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'g');
        formattedCode = formattedCode.replace(regex, `<span class="text-qbit-superposition">${keyword}</span>`);
      });
      
      // Highlight types
      types.forEach(type => {
        const regex = new RegExp(`\\b${type}\\b`, 'g');
        formattedCode = formattedCode.replace(regex, `<span class="text-qbit-zero">${type}</span>`);
      });
      
      // Highlight functions
      functions.forEach(func => {
        const regex = new RegExp(`\\b${func}\\b`, 'g');
        formattedCode = formattedCode.replace(regex, `<span class="text-quantum-light">${func}</span>`);
      });
      
      // Highlight string literals
      formattedCode = formattedCode.replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, '<span class="text-qbit-one">$&</span>');
      
      // Highlight comments
      formattedCode = formattedCode.replace(/\/\/.*$/gm, '<span class="text-gray-400">$&</span>');
      
      codeRef.current.innerHTML = formattedCode;
    }
  }, [code]);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    // In a real implementation, you would show a toast notification here
  };
  
  return (
    <div className="my-4 rounded-lg overflow-hidden glass">
      <div className="flex justify-between items-center px-4 py-2 border-b border-white/10 bg-black/20">
        <span className="text-xs font-mono text-quantum-light/80">{language.toUpperCase()}</span>
        <button 
          onClick={copyToClipboard}
          className="p-1 rounded hover:bg-white/10 transition-colors"
          aria-label="Copy code to clipboard"
        >
          <ClipboardCopy size={14} className="text-quantum-light/80 hover:text-quantum-light" />
        </button>
      </div>
      <pre 
        ref={codeRef} 
        className="p-4 text-sm font-mono overflow-x-auto bg-black/30"
      >
        {code}
      </pre>
    </div>
  );
};

export default CodeBlock;
