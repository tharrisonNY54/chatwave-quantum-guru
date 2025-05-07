import React, { useEffect, useState } from 'react';
import { ClipboardCopy } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'q' }) => {
  const [highlightedCode, setHighlightedCode] = useState<string>(code);

  useEffect(() => {
    let formatted = code
      .replace(/&/g, '&amp;')  // Escape first
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  
    // Highlight string literals first
    formatted = formatted.replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, '<span class="text-qbit-one">$&</span>');
  
    // Highlight comments next
    formatted = formatted.replace(/\/\/.*$/gm, '<span class="text-gray-400">$&</span>');
  
    // Now highlight keywords, types, and functions
    const keywords = ['operation', 'function', 'using', 'let', 'return', 'if', 'else', 'for', 'while', 'repeat'];
    const types = ['Qubit', 'Result', 'Int', 'Double', 'Bool', 'String'];
    const functions = ['H', 'X', 'Y', 'Z', 'CNOT', 'M', 'Reset', 'BitwiseXor'];
  
    keywords.forEach(kw => {
      const regex = new RegExp(`\\b${kw}\\b`, 'g');
      formatted = formatted.replace(regex, `<span class="text-qbit-superposition">${kw}</span>`);
    });
  
    types.forEach(t => {
      const regex = new RegExp(`\\b${t}\\b`, 'g');
      formatted = formatted.replace(regex, `<span class="text-qbit-zero">${t}</span>`);
    });
  
    functions.forEach(fn => {
      const regex = new RegExp(`\\b${fn}\\b`, 'g');
      formatted = formatted.replace(regex, `<span class="text-quantum-light">${fn}</span>`);
    });
  
    setHighlightedCode(formatted);
  }, [code]);  

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
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
      <pre className="p-4 text-sm font-mono overflow-x-auto bg-black/30">
        <code
          className="block"
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
      </pre>
    </div>
  );
};

export default CodeBlock;
