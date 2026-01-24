// Netlify Function for handling contact form submissions
// Uses Resend API to send emails

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': process.env.SITE_URL || 'https://arteamo.net',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse the form data
    const data = JSON.parse(event.body);

    // Validate required fields
    const requiredFields = ['name', 'email', 'message'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: `Missing required field: ${field}` })
        };
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid email format' })
      };
    }

    // Check for Resend API key
    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured');
      // Fallback: just log and return success (for testing without email service)
      console.log('Contact form submission:', {
        name: data.name,
        email: data.email,
        phone: data.phone,
        subject: data.subject,
        message: data.message,
        language: data.language
      });
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: 'Form received (email service not configured)',
          success: true
        })
      };
    }

    // Email content
    const toEmail = process.env.CONTACT_EMAIL || 'petyaem@abv.bg';
    const subject = data.subject ? `[Studio Arteamo] ${data.subject}` : '[Studio Arteamo] New Contact Form Message';

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">
          New Contact Form Submission
        </h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #666;">Language:</td>
            <td style="padding: 8px 0;">${data.language || 'en'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #666;">Name:</td>
            <td style="padding: 8px 0;">${escapeHtml(data.name)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #666;">Email:</td>
            <td style="padding: 8px 0;"><a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #666;">Phone:</td>
            <td style="padding: 8px 0;">${data.phone ? escapeHtml(data.phone) : 'Not provided'}</td>
          </tr>
          ${data.subject ? `<tr>
            <td style="padding: 8px 0; font-weight: bold; color: #666;">Subject:</td>
            <td style="padding: 8px 0;">${escapeHtml(data.subject)}</td>
          </tr>` : ''}
        </table>
        <h3 style="color: #1a1a1a; margin-top: 20px;">Message:</h3>
        <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; white-space: pre-wrap;">
${escapeHtml(data.message)}
        </div>
        <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #999;">
          This email was sent from the Studio Arteamo website contact form at ${new Date().toISOString()}
        </p>
      </div>
    `;

    const textContent = `
New Contact Form Submission
===========================

Language: ${data.language || 'en'}
Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone || 'Not provided'}
${data.subject ? `Subject: ${data.subject}` : ''}

Message:
${data.message}

---
This email was sent from the Studio Arteamo website contact form.
    `;

    // Send email via Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Studio Arteamo <contact@arteamo.net>',
        to: [toEmail],
        reply_to: data.email,
        subject: subject,
        html: htmlContent,
        text: textContent
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Resend API error:', errorData);
      throw new Error(`Email sending failed: ${errorData.message || 'Unknown error'}`);
    }

    const result = await response.json();
    console.log('Email sent successfully:', result.id);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Message sent successfully',
        success: true
      })
    };

  } catch (error) {
    console.error('Error processing form submission:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to send message. Please try again.' })
    };
  }
};

// Helper function to escape HTML
function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}
