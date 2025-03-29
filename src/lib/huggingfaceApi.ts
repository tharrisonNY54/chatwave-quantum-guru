import { Message } from './types';
import { toast } from 'sonner';

// You can customize this if needed
const LOCAL_LLAMA_API = 'http://localhost:8000/v1/completions';

export const sendPromptToHuggingFace = async (
  prompt: string,
  conversationHistory: Message[]
): Promise<string> => {
  // Construct a simple prompt for the local model
  let textPrompt = "You are QuantumGuru, an AI assistant that teaches Q#, the quantum computing programming language.\n\n";
  conversationHistory.forEach((msg) => {
    textPrompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
  });
  textPrompt += `User: ${prompt}\nAssistant:`;

  try {
    const response = await fetch(LOCAL_LLAMA_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: textPrompt,
        max_tokens: 512,
        temperature: 0.7,
        stop: ["User:", "Assistant:"]
      })
    });

    const raw = await response.text();

    if (!response.ok) {
      console.error(`Local LLaMA API Error [${response.status}]:`, raw);
      toast.error('Local LLaMA server error.');
      throw new Error(`Local API error: ${response.status}`);
    }

    const data = JSON.parse(raw);

    if (data.choices && data.choices.length > 0) {
      return data.choices[0].text.trim();
    }

    return '⚠️ No response from model.';
  } catch (err: any) {
    console.error('Failed to call local LLaMA API:', err);
    toast.error('Failed to call local LLaMA API.');
    throw err;
  }
};
