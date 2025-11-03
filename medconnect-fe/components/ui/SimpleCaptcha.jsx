import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@heroui/react';
import { RefreshCw } from 'lucide-react';

/**
 * Simple Canvas-based CAPTCHA component
 * No external libraries required
 */
const SimpleCaptcha = ({ onVerify }) => {
  const canvasRef = useRef(null);
  const [captchaText, setCaptchaText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');

  // Generate random captcha text
  const generateCaptchaText = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed similar chars like I,1,O,0
    let text = '';
    for (let i = 0; i < 6; i++) {
      text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return text;
  };

  // Draw captcha on canvas
  const drawCaptcha = (text) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#f0f9ff');
    gradient.addColorStop(1, '#e0f2fe');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add noise lines
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = `rgba(0, 150, 255, ${Math.random() * 0.3})`;
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.lineTo(Math.random() * width, Math.random() * height);
      ctx.stroke();
    }

    // Add noise dots
    for (let i = 0; i < 50; i++) {
      ctx.fillStyle = `rgba(0, 100, 200, ${Math.random() * 0.5})`;
      ctx.fillRect(Math.random() * width, Math.random() * height, 2, 2);
    }

    // Draw text with random rotation and position
    ctx.font = 'bold 32px Arial';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const x = 20 + i * 30 + Math.random() * 10;
      const y = height / 2 + Math.random() * 10 - 5;
      const angle = (Math.random() - 0.5) * 0.4; // Random rotation

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);

      // Shadow for depth
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 3;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      // Random color for each character
      const colors = ['#0066cc', '#0088ee', '#0055aa', '#006699'];
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      ctx.fillText(char, 0, 0);

      ctx.restore();
    }
  };

  // Initialize captcha
  const refreshCaptcha = () => {
    const newText = generateCaptchaText();
    setCaptchaText(newText);
    setUserInput('');
    setIsVerified(false);
    setError('');
    onVerify(false);
    drawCaptcha(newText);
  };

  useEffect(() => {
    refreshCaptcha();
  }, []);

  // Verify user input
  const handleVerify = () => {
    if (userInput.toUpperCase() === captchaText) {
      setIsVerified(true);
      setError('');
      onVerify(true);
    } else {
      setIsVerified(false);
      setError('Mã xác nhận không đúng');
      onVerify(false);
      refreshCaptcha();
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Mã xác nhận <span className="text-red-500">*</span>
      </label>
      
      <div className="flex items-center gap-3">
        {/* Canvas CAPTCHA */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={200}
            height={60}
            className="border-2 border-gray-300 rounded-lg shadow-sm"
          />
          {isVerified && (
            <div className="absolute inset-0 bg-green-500/10 rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </div>

        {/* Refresh button */}
        <Button
          isIconOnly
          variant="flat"
          size="sm"
          onPress={refreshCaptcha}
          title="Tạo mã mới"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Input field */}
      <div className="flex gap-2">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value.toUpperCase())}
          onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
          placeholder="Nhập mã xác nhận"
          disabled={isVerified}
          className={`flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
            isVerified
              ? 'bg-green-50 border-green-300 text-green-700'
              : error
              ? 'border-red-300 focus:ring-red-500'
              : 'border-gray-300 focus:ring-blue-500'
          }`}
          maxLength={6}
        />
        {!isVerified && (
          <Button
            color="primary"
            size="sm"
            onPress={handleVerify}
            isDisabled={userInput.length !== 6}
          >
            Xác nhận
          </Button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}

      {/* Success message */}
      {isVerified && (
        <p className="text-xs text-green-600">✓ Xác nhận thành công</p>
      )}
    </div>
  );
};

export default SimpleCaptcha;
