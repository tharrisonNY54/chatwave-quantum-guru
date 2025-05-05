
import React, { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import Chat from '@/components/Chat';
import ChatSidebar from '@/components/ChatSidebar';
import { MessageSquare, Atom } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ParticleBackground from '@/components/ParticleBackground';

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
    <div className="min-h-screen flex flex-col text-white relative overflow-hidden">
      <ParticleBackground />
      
      {/* Quantum glow effects */}
      <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-quantum/5 blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-40 left-10 w-80 h-80 rounded-full bg-quantum-light/5 blur-[120px] pointer-events-none z-0" />

      {/* Main Layout */}
      <div className="relative flex flex-1 overflow-hidden z-10">
        <ChatSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="container max-w-4xl mx-auto flex flex-col flex-1 p-4">
          <Header />

          <div className="glass mt-4 rounded-xl flex-1 flex flex-col overflow-hidden relative shadow-[0_10px_50px_rgba(94,53,177,0.15)]">
            {/* Sidebar Toggle Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="absolute top-3 left-3 z-10 hover:bg-quantum/20"
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
