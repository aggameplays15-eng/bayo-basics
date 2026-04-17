"use client";

import { useState } from 'react';
import { toast } from 'sonner';
import { Product } from '../types';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Bonjour ! Je suis Bayo, votre expert mode chez Bayo Basics. Comment puis-je sublimer votre style aujourd'hui ?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (content: string, products: Product[]) => {
    const newMessages: Message[] = [...messages, { role: 'user', content }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:3001/api/chat/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: content,
          products: products
        })
      });

      const data = await response.json();
      
      if (data.message) {
        setMessages([...newMessages, { role: 'assistant', content: data.message }]);
      } else {
        throw new Error("Erreur API");
      }
    } catch (error) {
      console.error(error);
      toast.error("Bayo est momentanément indisponible.");
      setMessages([...newMessages, { role: 'assistant', content: "Je m'excuse, j'ai une petite difficulté technique. Pouvez-vous me redemander cela dans un instant ?" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{ role: 'assistant', content: "Chat réinitialisé. Comment puis-je vous aider à nouveau ?" }]);
  };

  return { messages, sendMessage, isLoading, clearChat };
};