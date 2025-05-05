
import React, { useState, FormEvent, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void>;
  isLoading: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, isLoading }) => {
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isLoading) return;
    
    const content = message;
    setMessage('');
    
    await onSendMessage(content);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Adjust textarea height based on content
  const handleInput = () => {
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="glass-input rounded-xl overflow-hidden flex items-end relative">
        <Sparkles className="absolute left-3 top-3 h-4 w-4 text-quantum-light/50" />
        <textarea
          ref={inputRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder="Ask about the Q quantum language..."
          className="w-full resize-none bg-transparent outline-none border-0 py-3 pl-9 pr-4 max-h-32 min-h-[52px]"
          rows={1}
          disabled={isLoading}
        />
        <button
          type="submit"
          className={`h-10 w-10 flex items-center justify-center m-1 p-1 rounded-lg transition-colors ${
            message.trim() && !isLoading
              ? 'bg-quantum hover:bg-quantum-dark text-white'
              : 'bg-secondary/50 text-muted-foreground'
          }`}
          disabled={!message.trim() || isLoading}
          aria-label="Send message"
        >
          <Send size={18} />
        </button>
      </div>
    </form>
  );
};

export default MessageInput;
