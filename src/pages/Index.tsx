
import React from 'react';
import Header from '@/components/Header';
import Chat from '@/components/Chat';
import ParticleBackground from '@/components/ParticleBackground';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <ParticleBackground />
      
      <div className="container max-w-4xl mx-auto flex flex-col flex-1 p-4">
        <Header />
        
        <div className="glass mt-4 rounded-xl flex-1 flex flex-col overflow-hidden">
          <Chat />
        </div>
        
        <footer className="mt-4 text-center text-xs text-muted-foreground">
          <p>QuantumGuru AI Assistant &copy; {new Date().getFullYear()}</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
