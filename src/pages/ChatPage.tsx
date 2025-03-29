import React, { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import Chat from '@/components/Chat';
import ChatSidebar from '@/components/ChatSidebar';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ChatPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const hasSentInitialPrompt = useRef(false);

  useEffect(() => {
    const initialPrompt = sessionStorage.getItem('initialPrompt');
    if (initialPrompt && !hasSentInitialPrompt.current) {
      const event = new CustomEvent('send-initial-prompt', { detail: initialPrompt });
      window.dispatchEvent(event);
      hasSentInitialPrompt.current = true;
      sessionStorage.removeItem('initialPrompt');
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-black via-purple-900 to-gray-900 text-white relative overflow-hidden">
      {/* Quantum Glow Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.05)_0%,_transparent_70%)] pointer-events-none z-0" />

      {/* Main Layout */}
      <div className="relative flex flex-1 overflow-hidden z-10">
        <ChatSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="container max-w-4xl mx-auto flex flex-col flex-1 p-4">
          <Header />

          <div className="glass mt-4 rounded-xl flex-1 flex flex-col overflow-hidden relative">
            {/* Sidebar Toggle Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="absolute top-3 left-3 z-10"
            >
              <MessageSquare className="h-5 w-5" />
            </Button>

            <Chat />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
