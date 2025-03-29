import React, { useState, useRef, useEffect } from 'react';
import { Message as MessageType } from '@/lib/types';
import Message from './Message';
import MessageInput from './MessageInput';
import { sendPromptToHuggingFace } from '@/lib/huggingfaceApi';
import { toast } from 'sonner';

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<MessageType[]>([
    {
      id: 'welcome',
      content: "Hello! I'm QuantumGuru, your AI assistant for learning about Q#, the quantum programming language by Microsoft. How can I help you today?",
      role: 'assistant',
      timestamp: new Date(),
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleInitialPrompt = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        sendMessage(customEvent.detail);
      }
    };

    window.addEventListener('send-initial-prompt', handleInitialPrompt);
    return () => {
      window.removeEventListener('send-initial-prompt', handleInitialPrompt);
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (content: string) => {
    const userMessage: MessageType = {
      id: `user-${Date.now()}`,
      content,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const responseText = await sendPromptToHuggingFace(content, messages.filter(msg => msg.id !== 'welcome'));

      const aiMessage: MessageType = {
        id: `assistant-${Date.now()}`,
        content: responseText,
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          content: "There was an error processing your request. Please try again later.",
          role: 'assistant',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <Message key={message.id} message={message} />
        ))}

        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="ai-message">
              <div className="flex items-center space-x-2">
                <div className="dot-flashing"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-white/10">
        <MessageInput onSendMessage={sendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default Chat;
