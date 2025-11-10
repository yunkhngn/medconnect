import { useState } from 'react';

export const useEmailService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const sendEmail = async ({ to, subject, html }) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          subject,
          html,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Không thể gửi email');
      }

      setSuccess(true);
      return data;
    } catch (err) {
      console.error('Error sending email:', err);
      setError(err.message || 'Không thể gửi email. Vui lòng thử lại.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    sendEmail,
    loading,
    error,
    success,
  };
};
