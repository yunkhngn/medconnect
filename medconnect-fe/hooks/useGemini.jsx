import { useState, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Rate limiting: track last request time
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 30000; // Minimum 30 seconds between requests to avoid rate limit
let rateLimitCooldown = 0; // Cooldown period after rate limit (in ms)
const RATE_LIMIT_COOLDOWN_MS = 300000; // 5 minutes (300 seconds) cooldown after rate limit
const COOLDOWN_STORAGE_KEY = 'chatbot_rate_limit_cooldown';

// Load cooldown from localStorage on module load
if (typeof window !== 'undefined') {
  try {
    const saved = localStorage.getItem(COOLDOWN_STORAGE_KEY);
    if (saved) {
      const savedTime = parseInt(saved, 10);
      if (savedTime > Date.now()) {
        rateLimitCooldown = savedTime;
        console.log(`[useGemini] Loaded cooldown from storage until ${new Date(rateLimitCooldown).toLocaleTimeString()}`);
      } else {
        localStorage.removeItem(COOLDOWN_STORAGE_KEY);
      }
    }
  } catch (e) {
    console.warn('[useGemini] Failed to load cooldown from storage:', e);
  }
}

export const useGemini = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const chatRef = useRef(null);

  const sendMessage = async (message) => {
    // Check rate limit cooldown - STRICT: block all requests during cooldown
    const now = Date.now();
    if (rateLimitCooldown > now) {
      const waitSeconds = Math.ceil((rateLimitCooldown - now) / 1000);
      const waitMinutes = Math.floor(waitSeconds / 60);
      const waitSecs = waitSeconds % 60;
      const waitTime = waitMinutes > 0 ? `${waitMinutes} phút ${waitSecs} giây` : `${waitSeconds} giây`;
      console.warn(`[useGemini] Request blocked: still in cooldown. Wait ${waitTime} (${waitSeconds}s remaining)`);
      throw new Error(`Đã vượt quá giới hạn API. Vui lòng đợi ${waitTime} trước khi thử lại.`);
    }

    // Check minimum interval between requests - STRICT: wait if too soon
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      const waitMs = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      console.log(`[useGemini] Waiting ${waitMs}ms before request (minimum interval: ${MIN_REQUEST_INTERVAL}ms)`);
      await new Promise(resolve => setTimeout(resolve, waitMs));
    }

    setLoading(true);
    setError(null);
    lastRequestTime = Date.now();

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
      const prompt = `Bạn là trợ lý y tế AI của MedConnect. Hãy tư vấn ngắn gọn về: ${message}\n\nLưu ý: Đây chỉ là tư vấn sơ bộ, bạn nên đặt lịch khám bác sĩ.`;

      let chatSession = chatRef.current;
      
      // Start new chat if doesn't exist
      if (!chatSession) {
        chatSession = model.startChat({
          history: [],
        });
        chatRef.current = chatSession;
      }

      const result = await chatSession.sendMessage(prompt);
      const response = await result.response;
      const text = response.text();

      setLoading(false);
      return text || 'Xin lỗi, tôi không thể trả lời câu hỏi này.';

    } catch (err) {
      console.error('Chatbot API error:', err);
      
      let errorMessage = 'Đã có lỗi xảy ra';
      
      if (err.message?.includes('QUOTA_EXCEEDED') || err.message?.includes('429') || err.message?.includes('quota')) {
        // Set cooldown period: 5 minutes (300 seconds) to be very safe
        rateLimitCooldown = Date.now() + RATE_LIMIT_COOLDOWN_MS;
        // Persist to localStorage
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(COOLDOWN_STORAGE_KEY, rateLimitCooldown.toString());
          } catch (e) {
            console.warn('[useGemini] Failed to save cooldown to storage:', e);
          }
        }
        console.error(`[useGemini] Rate limit error caught! Setting cooldown until ${new Date(rateLimitCooldown).toLocaleTimeString()}`);
        errorMessage = 'Đã vượt quá giới hạn API. Vui lòng đợi 5 phút trước khi thử lại.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  };

  const resetChat = () => {
    // Reset chat session and cooldown
    chatRef.current = null;
    rateLimitCooldown = 0;
    lastRequestTime = 0;
    // Clear from localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(COOLDOWN_STORAGE_KEY);
      } catch (e) {
        console.warn('[useGemini] Failed to clear cooldown from storage:', e);
      }
    }
  };

  // Get remaining cooldown time in seconds - check both memory and localStorage
  const getCooldownTime = () => {
    const now = Date.now();
    let cooldown = rateLimitCooldown;
    
    // Also check localStorage for consistency
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(COOLDOWN_STORAGE_KEY);
        if (saved) {
          const savedTime = parseInt(saved, 10);
          if (savedTime > now && savedTime > cooldown) {
            cooldown = savedTime;
            rateLimitCooldown = savedTime; // Sync memory
          } else if (savedTime <= now) {
            localStorage.removeItem(COOLDOWN_STORAGE_KEY);
          }
        }
      } catch (e) {
        // Ignore storage errors
      }
    }
    
    if (cooldown > now) {
      return Math.ceil((cooldown - now) / 1000);
    }
    return 0;
  };

  // Check if in cooldown - check both memory and localStorage
  const isInCooldown = () => {
    const now = Date.now();
    if (rateLimitCooldown > now) {
      return true;
    }
    
    // Also check localStorage for consistency
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(COOLDOWN_STORAGE_KEY);
        if (saved) {
          const savedTime = parseInt(saved, 10);
          if (savedTime > now) {
            rateLimitCooldown = savedTime; // Sync memory
            return true;
          } else {
            localStorage.removeItem(COOLDOWN_STORAGE_KEY);
          }
        }
      } catch (e) {
        // Ignore storage errors
      }
    }
    
    return false;
  };

  return { sendMessage, loading, error, resetChat, getCooldownTime, isInCooldown };
};
