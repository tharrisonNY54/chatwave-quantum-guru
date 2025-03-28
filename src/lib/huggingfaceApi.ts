
import { Message } from './types';
import { toast } from 'sonner';

// Default endpoint for Hugging Face Inference API
const HF_INFERENCE_API = 'https://api-inference.huggingface.co/models/';

// Initialize with a default model, but this can be configured
const currentModel = 'mistralai/Mistral-7B-Instruct-v0.2';

let apiKey = '';

export const setHuggingFaceApiKey = (key: string) => {
  apiKey = key;
  // Store API key in localStorage for persistence
  localStorage.setItem('hf_api_key', key);
};

export const getHuggingFaceApiKey = () => {
  // Try to get from memory first, then localStorage
  if (!apiKey) {
    apiKey = localStorage.getItem('hf_api_key') || '';
  }
  return apiKey;
};

// export const setHuggingFaceModel = (model: string) => {
//   currentModel = model;
//   localStorage.setItem('hf_model', model);
// };

// export const getHuggingFaceModel = () => {
//   if (!currentModel || currentModel === 'mistralai/Mistral-7B-Instruct-v0.2') {
//     const savedModel = localStorage.getItem('hf_model');
//     if (savedModel) {
//       currentModel = savedModel;
//     }
//   }
//   return currentModel;
// };

export const sendPromptToHuggingFace = async (
  prompt: string,
  conversationHistory: Message[]
): Promise<string> => {
  const apiKey = getHuggingFaceApiKey();
  if (!apiKey) {
    localStorage.setItem('hf_connection_status', 'failed');
    localStorage.setItem('hf_last_error', 'API key not set');
    toast.error('Hugging Face API key is not set. Please set it in the AI Model settings.');
    throw new Error('Hugging Face API key is not set');
  }

  const model = currentModel;

  // Construct a simple text prompt with system message and conversation history
  let textPrompt = 
  "You are QuantumGuru, an expert AI assistant that only answers questions related to:\n" +
  "- quantum computing\n" +
  "- quantum programming\n" +
  "- the Q programming language\n" +
  "- quantum gates, circuits, algorithms, and quantum math\n\n" +
  "If the user asks about anything else (sports, politics, personal advice, etc.), respond only with:\n" +
  "\"I'm here only to help with quantum computing and Q programming. Please ask me something about those topics.\"\n\n";

  conversationHistory.forEach((msg) => {
    textPrompt += `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}\n`;
  });

  textPrompt += `Human: ${prompt}\nAssistant:`;

  try {
    const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: textPrompt,
        parameters: {
          max_new_tokens: 1024,
          temperature: 0.7,
          top_p: 0.95,
          do_sample: true,
        },
      }),
    });

    const raw = await response.text();

    if (!response.ok) {
      console.error(`HF API Error [${response.status}]:`, raw);
      localStorage.setItem('hf_connection_status', 'failed');
      localStorage.setItem('hf_last_error', raw.slice(0, 150));

      if (response.status === 401) {
        toast.error('Invalid API Key.');
      } else if (response.status === 404) {
        toast.error(`Model not found: ${model}`);
      } else if (response.status === 422) {
        toast.error(`Model input format not supported.`);
      } else {
        toast.error(`Unexpected Hugging Face API error.`);
      }

      throw new Error(`Hugging Face API error: ${response.status}`);
    }

    localStorage.setItem('hf_connection_status', 'connected');
    localStorage.removeItem('hf_last_error');

    const data = JSON.parse(raw);

    // Handle standard return shapes
    if (Array.isArray(data) && data[0]?.generated_text) {
      const full = data[0].generated_text;
      const aiIndex = full.lastIndexOf('Assistant:');
      return aiIndex !== -1 ? full.slice(aiIndex + 10).trim() : full.trim();
    } else if (data.generated_text) {
      return data.generated_text.trim();
    }

    // If unrecognized format, return raw
    return JSON.stringify(data);
  } catch (err: any) {
    console.error('Failed to call Hugging Face API:', err);
    toast.error('Failed to call Hugging Face API.');
    throw err;
  }
};

