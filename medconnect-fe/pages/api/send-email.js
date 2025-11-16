import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, subject, html } = req.body;

  // Validate required fields
  if (!to || !subject || !html) {
    return res.status(400).json({ error: 'Missing required fields: to, subject, html' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(to)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  try {
    console.log('=== SENDING EMAIL ===');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('API Key:', process.env.RESEND_API_KEY ? 'Configured' : 'Missing');
    
    const data = await resend.emails.send({
      from: 'MedConnect <noreply@mail.medconnects.app>',
      to: [to],
      subject: subject,
      html: html,
    });

    console.log('=== RESEND RESPONSE ===');
    console.log('Response:', JSON.stringify(data, null, 2));

    return res.status(200).json({ 
      success: true, 
      id: data.id,
      data: data,
      message: 'Email sent successfully' 
    });
  } catch (error) {
    console.error('=== EMAIL ERROR ===');
    console.error('Error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Handle specific Resend errors
    if (error.message?.includes('API key')) {
      return res.status(401).json({ error: 'Invalid API key configuration' });
    }
    
    if (error.message?.includes('domain')) {
      return res.status(400).json({ error: 'Invalid sender domain. Please verify your domain with Resend.' });
    }

    return res.status(500).json({ 
      error: error.message || 'Failed to send email. Please try again later.' 
    });
  }
}
