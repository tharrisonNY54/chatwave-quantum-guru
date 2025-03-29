import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, Bot, Shuffle } from 'lucide-react';

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
    "What’s the difference between Q# and Q?"
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
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-gray-900 text-white flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.05)_0%,_transparent_70%)] pointer-events-none" />

      <div className="z-10 text-center p-8 rounded-2xl backdrop-blur-md bg-black/50 shadow-lg space-y-6 max-w-md w-full animate-fade-in">
        <h1 className="text-4xl font-bold flex justify-center items-center gap-2">
          <Sparkles className="h-7 w-7 text-violet-400" />
          QuantumGuru
        </h1>

        <p className="text-sm text-gray-300">
          Ask anything about quantum computing or the Q# programming language.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleStartChat();
          }}
          className="flex flex-col gap-4"
        >
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask your first quantum question..."
            className="text-white placeholder:text-purple-300 bg-white/5 border border-purple-500/30 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/80 focus:border-purple-500 transition-all duration-300 shadow-md focus:shadow-purple-500/30 animate-glow"
          />

          <div className="flex flex-col gap-2">
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700 transition-colors">
              <Bot className="mr-2 h-4 w-4" />
              Start New Chat
            </Button>

            <Button variant="outline" disabled>
              Load Previous Chat (coming soon)
            </Button>

            <Button variant="secondary" type="button" onClick={handleRandomPrompt}>
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
