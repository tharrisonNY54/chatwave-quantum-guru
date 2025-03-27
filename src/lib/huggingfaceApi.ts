
import { Message } from './types';

// Default endpoint for Hugging Face Inference API
const HF_INFERENCE_API = 'https://api-inference.huggingface.co/models/';

// Initialize with a default model, but this can be configured
let currentModel = 'mistralai/Mistral-7B-Instruct-v0.2';
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

export const setHuggingFaceModel = (model: string) => {
  currentModel = model;
  localStorage.setItem('hf_model', model);
};

export const getHuggingFaceModel = () => {
  if (!currentModel || currentModel === 'mistralai/Mistral-7B-Instruct-v0.2') {
    const savedModel = localStorage.getItem('hf_model');
    if (savedModel) {
      currentModel = savedModel;
    }
  }
  return currentModel;
};

export const sendPromptToHuggingFace = async (
  prompt: string,
  conversationHistory: Message[]
): Promise<string> => {
  const apiKey = getHuggingFaceApiKey();
  if (!apiKey) {
    throw new Error('Hugging Face API key is not set');
  }

  const model = getHuggingFaceModel();
  
  // Format the conversation history for the model
  // Most models expect a specific format for the conversation
  const messages = [
    {
      role: 'system',
      content: 'You are QuantumGuru, an AI assistant specialized in explaining Q, the quantum computing programming language. Provide concise, accurate responses about quantum computing concepts, Q syntax, and quantum algorithms.'
    }
  ];
  
  // Add conversation history
  conversationHistory.forEach(msg => {
    messages.push({
      role: msg.role,
      content: msg.content
    });
  });
  
  // Add the current prompt
  messages.push({
    role: 'user',
    content: prompt
  });

  try {
    const response = await fetch(`${HF_INFERENCE_API}${model}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        inputs: {
          messages
        },
        parameters: {
          max_new_tokens: 1024,
          temperature: 0.7,
          top_p: 0.95,
          do_sample: true
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Hugging Face API error:', errorText);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Different models return responses in different formats
    // This handles the most common format
    if (data.generated_text) {
      return data.generated_text;
    } else if (Array.isArray(data) && data[0]?.generated_text) {
      return data[0].generated_text;
    } else if (data.outputs) {
      return data.outputs;
    } else if (data.error) {
      throw new Error(data.error);
    } else {
      // If response has different format for chat models
      return data[0]?.message?.content || JSON.stringify(data);
    }
  } catch (error) {
    console.error('Error querying Hugging Face:', error);
    throw new Error(`Failed to get response from Hugging Face: ${error.message}`);
  }
};
