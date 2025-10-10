import { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";

export const useGemini = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateContent = async (prompt, model = "gemini-2.0-flash-exp") => {
    setIsLoading(true);
    setError(null);

    try {
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
      const geminiModel = genAI.getGenerativeModel({ model });

      const result = await geminiModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      setIsLoading(false);
      return text;
    } catch (err) {
      console.error("Gemini AI Error:", err);
      setError(err.message || "Failed to generate content");
      setIsLoading(false);
      return null;
    }
  };

  const generateChat = async (messages, model = "gemini-2.0-flash-exp") => {
    setIsLoading(true);
    setError(null);

    try {
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
      const geminiModel = genAI.getGenerativeModel({ model });

      const chat = geminiModel.startChat({
        history: messages.slice(0, -1).map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        })),
      });

      const lastMessage = messages[messages.length - 1];
      const result = await chat.sendMessage(lastMessage.content);
      const response = await result.response;
      const text = response.text();

      setIsLoading(false);
      return text;
    } catch (err) {
      console.error("Gemini Chat Error:", err);
      setError(err.message || "Failed to generate chat response");
      setIsLoading(false);
      return null;
    }
  };

  const generateStreamContent = async (prompt, onChunk, model = "gemini-2.0-flash-exp") => {
    setIsLoading(true);
    setError(null);

    try {
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
      const geminiModel = genAI.getGenerativeModel({ model });

      const result = await geminiModel.generateContentStream(prompt);

      let fullText = '';
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullText += chunkText;
        if (onChunk) onChunk(chunkText, fullText);
      }

      setIsLoading(false);
      return fullText;
    } catch (err) {
      console.error("Gemini Stream Error:", err);
      setError(err.message || "Failed to generate stream content");
      setIsLoading(false);
      return null;
    }
  };

  return {
    generateContent,
    generateChat,
    generateStreamContent,
    isLoading,
    error,
  };
};
