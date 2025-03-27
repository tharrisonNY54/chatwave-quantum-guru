
import React from 'react';
import { Message as MessageType } from '../lib/types';
import CodeBlock from './CodeBlock';

interface MessageProps {
  message: MessageType;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const isUserMessage = message.role === 'user';
  
  // Format the timestamp
  const formattedTime = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(message.timestamp);
  
  // Process message content to identify code blocks
  const renderContent = () => {
    if (!message.content.includes('```')) {
      return <p>{message.content}</p>;
    }
    
    const parts = message.content.split(/```(\w*)\n([\s\S]*?)```/g);
    const result: JSX.Element[] = [];
    
    for (let i = 0; i < parts.length; i++) {
      if (i % 3 === 0) {
        if (parts[i]) {
          result.push(<p key={`text-${i}`}>{parts[i]}</p>);
        }
      } else if (i % 3 === 1) {
        // This is the language identifier, skip it
      } else {
        // This is the code content
        const language = parts[i - 1] || 'q';
        result.push(<CodeBlock key={`code-${i}`} code={parts[i]} language={language} />);
      }
    }
    
    return <>{result}</>;
  };
  
  return (
    <div
      className={`flex ${isUserMessage ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div
        className={`max-w-3xl ${isUserMessage ? 'user-message' : 'ai-message'}`}
      >
        <div className="mb-1">
          {renderContent()}
        </div>
        <div className="text-xs text-right mt-1 opacity-50">
          {formattedTime}
        </div>
      </div>
    </div>
  );
};

export default Message;
