
import React, { useState, useRef, useEffect } from 'react';
import { Message as MessageType } from '../lib/types';
import Message from './Message';
import MessageInput from './MessageInput';
import { sendMessageToAPI } from '../lib/api';
import { sendPromptToHuggingFace, getHuggingFaceApiKey } from '../lib/huggingfaceApi';
import { toast } from 'sonner';

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<MessageType[]>([
    {
      id: 'welcome',
      content: "Hello! I'm QuantumGuru, your AI assistant for learning about Q, the quantum computing programming language. How can I help you today?",
      role: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [usingHuggingFace, setUsingHuggingFace] = useState(false);

  useEffect(() => {
    scrollToBottom();
    // Check if Hugging Face API key is set
    const apiKey = getHuggingFaceApiKey();
    setUsingHuggingFace(!!apiKey);
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (content: string) => {
    // Add user message
    const userMessage: MessageType = {
      id: `user-${Date.now()}`,
      content,
      role: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      let response: MessageType;
      
      if (usingHuggingFace) {
        // Use Hugging Face API
        try {
          const hfResponse = await sendPromptToHuggingFace(content, messages);
          response = {
            id: `assistant-${Date.now()}`,
            content: hfResponse,
            role: 'assistant',
            timestamp: new Date(),
          };
        } catch (error) {
          console.error('Error with Hugging Face API:', error);
          toast.error(`Hugging Face API error: ${error.message}`);
          // Fall back to mock API if Hugging Face fails
          response = await sendMessageToAPI(content);
        }
      } else {
        // Use mock API as fallback
        response = await sendMessageToAPI(content);
      }
      
      // Add AI response
      setMessages(prev => [...prev, response]);
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message
      setMessages(prev => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          content: "I'm sorry, there was an error processing your request. Please try again later.",
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
