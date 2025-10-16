import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const useGemini = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chat, setChat] = useState(null);

  const sendMessage = async (message) => {
    setLoading(true);
    setError(null);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      
      if (!apiKey) {
        throw new Error('API key chưa được cấu hình');
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.5-flash',
      });

      // Simple prompt without complex instructions
      const prompt = `Bạn là trợ lý y tế AI. Hãy tư vấn ngắn gọn về: ${message}\n\nLưu ý: Đây chỉ là tư vấn sơ bộ, bạn nên đặt lịch khám bác sĩ.`;

      let chatSession = chat;
      
      if (!chatSession) {
        chatSession = model.startChat({
          generationConfig: {
            temperature: 0.9,
            topK: 1,
            topP: 1,
            maxOutputTokens: 2048,
          },
          history: [],
        });
        setChat(chatSession);
      }

      // Send message and get response
      const result = await chatSession.sendMessage(prompt);
      
      // Comprehensive response extraction
      let text = '';
      
      // Try multiple ways to extract text
      if (result && result.response) {
        const response = result.response;
        
        // Method 1: Direct text() function
        if (typeof response.text === 'function') {
          try {
            text = response.text();
          } catch (e) {
            console.warn('text() method failed:', e);
          }
        }
        
        // Method 2: candidates array
        if (!text && response.candidates && response.candidates.length > 0) {
          const candidate = response.candidates[0];
          if (candidate.content && candidate.content.parts) {
            text = candidate.content.parts.map(part => part.text || '').join('');
          }
        }
        
        // Method 3: Direct parts
        if (!text && response.parts) {
          text = response.parts.map(part => part.text || '').join('');
        }
      }
      
      // Final check
      if (!text || text.trim() === '') {
        console.error('Empty response structure:', JSON.stringify(result, null, 2));
        
        // Return helpful error message
        text = 'Xin lỗi, tôi không thể trả lời câu hỏi này lúc này. Vui lòng thử lại hoặc đặt câu hỏi khác.';
      }
      
      setLoading(false);
      return text.trim();
      
    } catch (err) {
      console.error('Gemini AI error:', err);
      
      let errorMessage = 'Đã có lỗi xảy ra';
      
      if (err.message?.includes('API key')) {
        errorMessage = 'API key không hợp lệ';
      } else if (err.message?.includes('quota')) {
        errorMessage = 'Đã vượt quá giới hạn API';
      } else if (err.message?.includes('SAFETY')) {
        errorMessage = 'Câu hỏi không phù hợp. Vui lòng hỏi về vấn đề sức khỏe khác';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  };

  const resetChat = () => {
    setChat(null);
  };

  return { sendMessage, loading, error, resetChat };
};
