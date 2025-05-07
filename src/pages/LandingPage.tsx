
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, Bot, Shuffle, Atom } from 'lucide-react';
import ParticleBackground from '@/components/ParticleBackground';

const exampleQuestions = [
    "How do you declare a qubit in Q#?",
    "What is the syntax for a quantum operation in Q#?",
    "How does measurement work in Q#?",
    "Can you explain entanglement using Q# code?",
    "How do I define a function in Q#?",
    "What namespaces do I need to import in Q#?",
    "How does the Controlled modifier work in Q#?",
    "What are intrinsic operations in Q#?",
    "Can I simulate a Q# program locally?",
    "What's the difference between Q# and Q?"
];  

const getRandomQuestion = () => {
  const index = Math.floor(Math.random() * exampleQuestions.length);
  return exampleQuestions[index];
};

const LandingPage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const navigate = useNavigate();

  const handleStartChat = () => {
    if (prompt.trim()) {
      sessionStorage.setItem('initialPrompt', prompt.trim());
    }
    navigate('/chat');
  };

  const handleRandomPrompt = () => {
    const random = getRandomQuestion();
    setPrompt(random);
  };

  return (
    <div className="min-h-screen  text-white flex items-center justify-center relative overflow-hidden">
      <ParticleBackground />
      
      {/* Centered glow */}
      <div className="absolute w-[600px] h-[600px] rounded-full bg-quantum/5 blur-[100px] pointer-events-none z-0" />

      <div className="z-10 text-center p-8 rounded-2xl backdrop-blur-md bg-black/30 border border-white/10 shadow-[0_10px_50px_rgba(94,53,177,0.25)] space-y-6 max-w-md w-full animate-fade-in">
        <div className="flex justify-center items-center mb-2">
          <Atom className="h-10 w-10 text-quantum-light animate-pulse-slow mr-3" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-quantum-light bg-clip-text text-transparent">
          EntangleAI
          </h1>
        </div>

        <p className="text-sm text-purple-200/80">
          Ask anything about quantum computing or the Q# programming language.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleStartChat();
          }}
          className="flex flex-col gap-4"
        >
          <div className="relative">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask your first quantum question..."
              className="w-full text-white placeholder:text-purple-300/60 bg-white/5 border border-quantum/30 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-quantum/50 focus:border-quantum/50 transition-all duration-300 shadow-md animate-quantum-pulse"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-quantum/5 to-transparent rounded-xl pointer-events-none" />
          </div>

          <div className="flex flex-col gap-2">
            <Button type="submit" className="bg-quantum hover:bg-quantum-dark transition-colors">
              <Bot className="mr-2 h-4 w-4" />
              Start New Chat
            </Button>

            <Button 
              variant="secondary" 
              type="button" 
              onClick={handleRandomPrompt}
              className="bg-secondary/50 hover:bg-secondary text-white"
            >
              <Shuffle className="mr-2 h-4 w-4" />
              Generate a Q Question
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LandingPage;
