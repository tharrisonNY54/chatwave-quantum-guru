
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
  
  // Format the conversation history for the model
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
    console.log('Sending to Hugging Face model:', model);
    console.log('Message format:', JSON.stringify(messages, null, 2));
    
    // First, try the chat completion format (for newer models)
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

    if (!chatResponse.ok) {
      console.error('Chat format failed with status:', chatResponse.status);
      const errorText = await chatResponse.text();
      console.error('Error response:', errorText);
      
      // Record connection failure
      localStorage.setItem('hf_connection_status', 'failed');
      localStorage.setItem('hf_last_error', `Chat format error: ${chatResponse.status}`);
      
      // If chat completion fails, try text generation format (for older models)
      if (chatResponse.status === 403) {
        toast.error('API Key error: Your API key does not have sufficient permissions. Please check your Hugging Face account.');
        throw new Error(`API Key error: Insufficient permissions (403)`);
      }
      
      console.log('Trying text format as fallback');
      const textResponse = await fetch(`${HF_INFERENCE_API}${model}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          inputs: `${conversationHistory.map(msg => `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}`).join('\n')}\nHuman: ${prompt}\nAssistant:`,
          parameters: {
            max_new_tokens: 1024,
            temperature: 0.7,
            top_p: 0.95,
            do_sample: true
          }
        }),
      });

      if (!textResponse.ok) {
        const errorText = await textResponse.text();
        console.error('Text format failed:', errorText);
        
        localStorage.setItem('hf_connection_status', 'failed');
        localStorage.setItem('hf_last_error', `Text format error: ${textResponse.status} - ${errorText.substring(0, 100)}`);
        
        if (textResponse.status === 401) {
          toast.error('Invalid API Key. Please check your Hugging Face API key.');
        } else if (textResponse.status === 404) {
          toast.error(`Model not found: ${model}. Please check the model name.`);
        } else {
          toast.error(`API error: ${textResponse.status}. Please try a different model.`);
        }
        
        throw new Error(`API error: ${textResponse.status}`);
      }

      const data = await textResponse.json();
      localStorage.setItem('hf_connection_status', 'connected');
      localStorage.removeItem('hf_last_error');
      return data[0]?.generated_text || 'No response generated. Please try a different model.';
    }

    const data = await chatResponse.json();
    console.log('HF response:', data);
    
    localStorage.setItem('hf_connection_status', 'connected');
    localStorage.removeItem('hf_last_error');
    
    // Different models return responses in different formats
    if (data.generated_text) {
      return data.generated_text;
    } else if (Array.isArray(data) && data[0]?.generated_text) {
      return data[0].generated_text;
    } else if (data.outputs) {
      return data.outputs;
    } else if (data.error) {
      localStorage.setItem('hf_connection_status', 'failed');
      localStorage.setItem('hf_last_error', data.error);
      toast.error(`Hugging Face error: ${data.error}`);
      throw new Error(data.error);
    } else if (Array.isArray(data) && data[0]?.message?.content) {
      return data[0].message.content;
    } else if (data?.message?.content) {
      return data.message.content;
    } else {
      // Last resort, serialize the response
      console.log('Using serialized response format');
      return JSON.stringify(data);
    }
  } catch (error) {
    console.error('Error querying Hugging Face:', error);
    localStorage.setItem('hf_connection_status', 'failed');
    localStorage.setItem('hf_last_error', error.message || 'Unknown error');
    throw new Error(`Failed to get response from Hugging Face: ${error.message}`);
  }
};
