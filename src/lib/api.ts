
import { Message } from './types';

// This is a mock API for the frontend implementation
// In a real application, this would connect to your backend
export const sendMessageToAPI = async (content: string): Promise<Message> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  // Mock response based on the query
  let response = "I'm sorry, I don't have information about that specific topic in Q language yet.";
  
  if (content.toLowerCase().includes('hello') || content.toLowerCase().includes('hi')) {
    response = "Hello! I'm QuantumGuru, your AI assistant for learning about Q, the quantum computing programming language. How can I help you today?";
  } else if (content.toLowerCase().includes('what is q')) {
    response = "Q is a quantum computing programming language designed for expressing quantum algorithms. It's part of Microsoft's Quantum Development Kit and allows you to write programs for quantum computers in a high-level, familiar way. Q is specifically designed to help developers write quantum programs without needing to understand all the complex physics behind quantum computing.";
  } else if (content.toLowerCase().includes('qubit') || content.toLowerCase().includes('qubits')) {
    response = "In Q language, qubits are the fundamental units of quantum information. Unlike classical bits that can be either 0 or 1, qubits can exist in a superposition of states. In Q, you can allocate qubits using the `using` statement, and perform operations on them using various quantum gates like X, H (Hadamard), CNOT, and others.\n\n```q\noperation SimpleQubitExample() : Result {\n    using (qubit = Qubit()) {\n        H(qubit);  // Apply Hadamard gate to create superposition\n        let result = M(qubit);  // Measure the qubit\n        Reset(qubit);  // Reset qubit to |0⟩ state\n        return result;\n    }\n}\n```";
  } else if (content.toLowerCase().includes('superposition')) {
    response = "Superposition is a fundamental quantum property where qubits can exist in multiple states simultaneously. In Q language, you can create a superposition using the Hadamard (H) gate. Here's a simple example:\n\n```q\noperation CreateSuperposition() : Result {\n    using (q = Qubit()) {\n        // Initially q is in |0⟩ state\n        H(q);  // Now q is in superposition (|0⟩ + |1⟩)/√2\n        let result = M(q);  // Measure collapses the superposition\n        Reset(q);\n        return result;\n    }\n}\n```";
  } else if (content.toLowerCase().includes('entanglement')) {
    response = "Quantum entanglement is a phenomenon where qubits become correlated in such a way that the quantum state of each particle cannot be described independently. In Q, you can create entangled qubits using operations like CNOT. Here's an example:\n\n```q\noperation CreateEntangledPair() : (Result, Result) {\n    using ((q1, q2) = (Qubit(), Qubit())) {\n        H(q1);        // Put q1 in superposition\n        CNOT(q1, q2); // Entangle q1 and q2\n        \n        // Measure both qubits\n        let result1 = M(q1);\n        let result2 = M(q2);\n        \n        // Reset qubits\n        Reset(q1);\n        Reset(q2);\n        \n        return (result1, result2);\n        // Results will be correlated: either both Zero or both One\n    }\n}\n```";
  }
  
  return {
    id: Math.random().toString(36).substring(2, 9),
    content: response,
    role: 'assistant',
    timestamp: new Date(),
  };
};
