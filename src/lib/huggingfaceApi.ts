
import { Message } from './types';
import { toast } from 'sonner';

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
    localStorage.setItem('hf_connection_status', 'failed');
    localStorage.setItem('hf_last_error', 'API key not set');
    toast.error('Hugging Face API key is not set. Please set it in the AI Model settings.');
    throw new Error('Hugging Face API key is not set');
  }

  const model = getHuggingFaceModel();
  
  // Format the system prompt and history for text generation
  let textPrompt = "You are QuantumGuru, an AI assistant specialized in explaining Q, the quantum computing programming language. Provide concise, accurate responses about quantum computing concepts, Q syntax, and quantum algorithms.\n\n";
  
  // Add conversation history
  conversationHistory.forEach(msg => {
    textPrompt += `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}\n`;
  });
  
  // Add the current prompt
  textPrompt += `Human: ${prompt}\nAssistant:`;
  
  // Format for chat completion models
  const messages = [
    {
      role: 'system',
      content: 'You are QuantumGuru, an AI assistant specialized in explaining Q, the quantum computing programming language. Provide concise, accurate responses about quantum computing concepts, Q syntax, and quantum algorithms.'
    }
  ];
  
  // Add conversation history for chat format
  conversationHistory.forEach(msg => {
    messages.push({
      role: msg.role,
      content: msg.content
    });
  });
  
  // Add the current prompt for chat format
  messages.push({
    role: 'user',
    content: prompt
  });

  try {
    console.log('Sending to Hugging Face model:', model);
    
    // Try multiple formats, starting with the most common text input format
    // 1. Simple text input format (works with most models)
    try {
      const textResponse = await fetch(`${HF_INFERENCE_API}${model}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          inputs: textPrompt,
          parameters: {
            max_new_tokens: 1024,
            temperature: 0.7,
            top_p: 0.95,
            do_sample: true
          }
        }),
      });

      if (textResponse.ok) {
        const data = await textResponse.json();
        localStorage.setItem('hf_connection_status', 'connected');
        localStorage.removeItem('hf_last_error');
        
        if (Array.isArray(data) && data[0]?.generated_text) {
          // Extract just the assistant's response
          const fullText = data[0].generated_text;
          // Try to extract just the assistant's reply by finding the last "Assistant:" in the text
          const assistantPrefixIndex = fullText.lastIndexOf('Assistant:');
          if (assistantPrefixIndex !== -1) {
            return fullText.substring(assistantPrefixIndex + 'Assistant:'.length).trim();
          }
          return fullText;
        } else if (data.generated_text) {
          return data.generated_text;
        }
        
        // If we can't parse it in a known format, return the raw response
        return JSON.stringify(data);
      }
      
      // If that format didn't work, continue to the next format
      console.log('Text format failed, trying chat format:', textResponse.status);
    } catch (error) {
      console.error('Error with text format:', error);
    }
    
    // 2. Try OpenAI-like chat format
    try {
      const chatResponse = await fetch(`${HF_INFERENCE_API}${model}`, {
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

      if (chatResponse.ok) {
        const data = await chatResponse.json();
        localStorage.setItem('hf_connection_status', 'connected');
        localStorage.removeItem('hf_last_error');
        
        if (data.generated_text) {
          return data.generated_text;
        } else if (Array.isArray(data) && data[0]?.generated_text) {
          return data[0].generated_text;
        } else if (data.outputs) {
          return data.outputs;
        } else if (Array.isArray(data) && data[0]?.message?.content) {
          return data[0].message.content;
        } else if (data?.message?.content) {
          return data.message.content;
        }
        
        // If we can't parse it in a known format, return the raw response
        return JSON.stringify(data);
      }
      
      // If that format didn't work, try one more format
      console.log('Chat format failed, trying array format:', chatResponse.status);
    } catch (error) {
      console.error('Error with chat format:', error);
    }
    
    // 3. Try array of messages format
    try {
      const arrayResponse = await fetch(`${HF_INFERENCE_API}${model}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          inputs: messages,
          parameters: {
            max_new_tokens: 1024,
            temperature: 0.7,
            top_p: 0.95,
            do_sample: true
          }
        }),
      });

      if (arrayResponse.ok) {
        const data = await arrayResponse.json();
        localStorage.setItem('hf_connection_status', 'connected');
        localStorage.removeItem('hf_last_error');
        
        if (typeof data === 'string') {
          return data;
        } else if (Array.isArray(data)) {
          return data[data.length - 1]?.content || JSON.stringify(data);
        }
        
        // If we can't parse it in a known format, return the raw response
        return JSON.stringify(data);
      }
      
      // All formats failed, report the error
      const errorText = await arrayResponse.text();
      localStorage.setItem('hf_connection_status', 'failed');
      localStorage.setItem('hf_last_error', `Format error: ${arrayResponse.status} - ${errorText.substring(0, 100)}`);
      
      if (arrayResponse.status === 401) {
        toast.error('Invalid API Key. Please check your Hugging Face API key.');
      } else if (arrayResponse.status === 404) {
        toast.error(`Model not found: ${model}. Please check the model name.`);
      } else if (arrayResponse.status === 422) {
        toast.error(`This model doesn't support any of our input formats. Please try a different model.`);
      } else {
        toast.error(`API error: ${arrayResponse.status}. Please try a different model.`);
      }
      
      throw new Error(`API error: ${arrayResponse.status}`);
    } catch (error) {
      console.error('Error with array format:', error);
      localStorage.setItem('hf_connection_status', 'failed');
      localStorage.setItem('hf_last_error', `Error: ${error.message}`);
      throw error;
    }
  } catch (error) {
    console.error('Error querying Hugging Face:', error);
    localStorage.setItem('hf_connection_status', 'failed');
    localStorage.setItem('hf_last_error', error.message || 'Unknown error');
    throw new Error(`Failed to get response from Hugging Face: ${error.message}`);
  }
};
