/**
 * Email Service Helper
 * Centralized email sending functions
 */

export const sendEmailViaAPI = async (to, subject, html) => {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ to, subject, html })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Email sent successfully:', data);
      return { success: true, data };
    } else {
      console.error('❌ Failed to send email:', data.error);
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.error('❌ Email API error:', error);
    return { success: false, error: error.message };
  }
};
