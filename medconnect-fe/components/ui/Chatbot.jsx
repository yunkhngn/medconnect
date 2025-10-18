import React, { useState, useRef, useEffect } from 'react';
import { Card, CardBody, Button, Input, Chip } from '@heroui/react';
import { useGemini } from '@/hooks/useGemini';
import Image from 'next/image';
import DOMPurify from 'isomorphic-dompurify';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Xin chào! Tôi có thể giúp bạn tư vấn về triệu chứng sức khỏe. Bạn cần hỏi gì?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [questionCount, setQuestionCount] = useState(0);
  const [resetTime, setResetTime] = useState(Date.now());
  const messagesEndRef = useRef(null);
  const { sendMessage, loading, error } = useGemini();

  const MAX_QUESTIONS = 5;
  const RESET_INTERVAL = 60000;

  useEffect(() => {
    const interval = setInterval(() => {
      setQuestionCount(0);
      setResetTime(Date.now());
    }, RESET_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    if (questionCount >= MAX_QUESTIONS) {
      const timeLeft = Math.ceil((RESET_INTERVAL - (Date.now() - resetTime)) / 1000);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Bạn đã hết lượt hỏi (${MAX_QUESTIONS} câu/phút). Vui lòng chờ ${timeLeft}s.`,
        timestamp: new Date()
      }]);
      return;
    }

    const userMessage = { role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setQuestionCount(prev => prev + 1);

    try {
      const response = await sendMessage(input);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: err.message || 'Xin lỗi, đã có lỗi xảy ra.',
        timestamp: new Date()
      }]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Format AI response to clean HTML with XSS protection
  const formatMessage = (text) => {
    const formatted = text
      // Bold text: **text** -> <strong>
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
      // Italic text: *text* -> <em>
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      // Headers: ### -> h3
      .replace(/^### (.*$)/gim, '<h3 class="text-base font-semibold text-gray-900 mt-3 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold text-gray-900 mt-4 mb-2">$1</h2>')
      // Bullet points: * item -> <li>
      .replace(/^\* (.*$)/gim, '<li class="ml-4 text-sm">• $1</li>')
      // Line breaks
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>');
    
    // Sanitize HTML to prevent XSS
    return DOMPurify.sanitize(formatted, {
      ALLOWED_TAGS: ['strong', 'em', 'h2', 'h3', 'li', 'br'],
      ALLOWED_ATTR: ['class'],
      KEEP_CONTENT: true,
    });
  };

  return (
    <>
      {/* Chat Panel */}
      {isOpen && (
        <div className={`fixed z-9999 transition-all duration-300 ${
          isFullscreen 
            ? 'inset-0' 
            : 'bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)]'
        }`}>
          <div className={`bg-white/10 backdrop-blur-3xl shadow-2xl border border-white/20 overflow-hidden ${
            isFullscreen ? 'h-full' : 'rounded-3xl'
          }`}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-white/5 backdrop-blur-2xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-lg">
                  <Image src="/assets/logo.svg" alt="Logo" width={24} height={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">MedConnect AI</h3>
                  <p className="text-sm text-gray-600">Trợ lý sức khỏe của bạn</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Fullscreen Toggle */}
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="w-10 h-10 rounded-2xl hover:bg-white/20 flex items-center justify-center transition-all duration-200 hover:scale-105"
                  title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
                >
                  {isFullscreen ? (
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  )}
                </button>
                {/* Close Button */}
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setIsFullscreen(false);
                  }}
                  className="w-10 h-10 rounded-2xl hover:bg-white/20 flex items-center justify-center transition-all duration-200 hover:scale-105"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Rate Limit */}
            <div className="px-6 py-3 bg-white/5 backdrop-blur-2xl border-b border-white/10">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700 font-medium">
                  {questionCount}/{MAX_QUESTIONS} câu hỏi
                </span>
                <Chip 
                  size="sm" 
                  variant="flat" 
                  color={questionCount >= MAX_QUESTIONS ? 'danger' : 'success'}
                  className="text-xs bg-white/20 backdrop-blur-sm border border-white/20"
                >
                  {questionCount >= MAX_QUESTIONS ? 'Hết lượt' : 'Sẵn sàng'}
                </Chip>
              </div>
            </div>

            {/* Messages */}
            <div className={`overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-white/5 to-transparent ${
              isFullscreen ? 'h-[calc(100vh-220px)]' : 'h-96'
            }`}>
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  <div
                    className={`max-w-[85%] rounded-3xl px-5 py-4 shadow-lg backdrop-blur-sm border border-white/20 ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-blue-500/25'
                        : 'bg-white/80 text-gray-900 shadow-gray-200/50'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    ) : (
                      <div 
                        className="text-sm leading-relaxed prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                      />
                    )}
                    <p className={`text-xs mt-3 opacity-70 ${
                      msg.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {msg.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start animate-fade-in">
                  <div className="bg-white/80 rounded-3xl px-5 py-4 shadow-lg backdrop-blur-sm border border-white/20">
                    <div className="flex items-center gap-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                      <span className="text-sm text-gray-600">Đang trả lời...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-6 border-t border-white/10 bg-white/5 backdrop-blur-2xl">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Nhập triệu chứng..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={loading || questionCount >= MAX_QUESTIONS}
                    className="w-full px-5 py-4 text-sm bg-white/60 backdrop-blur-sm border border-white/30 rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed placeholder-gray-500 transition-all duration-200"
                  />
                  {input.trim() && (
                    <button
                      onClick={() => setInput('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full hover:bg-gray-200 flex items-center justify-center transition-colors"
                    >
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || loading || questionCount >= MAX_QUESTIONS}
                  className="w-14 h-14 rounded-3xl bg-gradient-to-r from-sky-600 to-sky-500 text-white hover:from-sky-700 hover:to-sky-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl disabled:hover:scale-100 transform rotate-12 hover:rotate-0"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-6 h-6 transform -rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
              </div>
              {error && <p className="text-xs text-red-500 mt-3 bg-red-50/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-red-200/50">{error}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-r from-sky-600 to-sky-500 text-white shadow-2xl hover:shadow-3xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center group backdrop-blur-sm border-4 border-white"
        aria-label="Open chatbot"
      >
        {isOpen ? (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg">
              <Image 
                src="/assets/chatbot.svg" 
                alt="Chatbot" 
                width={24} 
                height={24}
                
              />
            </div>
            {questionCount >= MAX_QUESTIONS && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                <span className="text-[10px] font-bold text-white">!</span>
              </span>
            )}
          </>
        )}
      </button>
    </>
  );
};

export default Chatbot;