// Netlify Function for handling form submissions
// This function processes contact form submissions and sends emails

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse the form data
    const data = JSON.parse(event.body);
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'subject', 'message'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: `Missing required field: ${field}` })
        };
      }
    }

    // Email configuration
    const emailConfig = {
      to: process.env.CONTACT_EMAIL || 'studio@arteamo.net,petyaem@abv.bg',
      subject: `[Studio Arteamo] ${data.subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Language:</strong> ${data.language || 'en'}</p>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Phone:</strong> ${data.phone || 'Not provided'}</p>
        <p><strong>Subject:</strong> ${data.subject}</p>
        <h3>Message:</h3>
        <p>${data.message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p><small>This email was sent from the Studio Arteamo website contact form.</small></p>
      `,
      text: `
New Contact Form Submission

Language: ${data.language || 'en'}
Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone || 'Not provided'}
Subject: ${data.subject}

Message:
${data.message}

---
This email was sent from the Studio Arteamo website contact form.
      `
    };

    // Note: Netlify Forms handles email sending automatically
    // This function is here for custom processing if needed
    // You can integrate with services like SendGrid, Mailgun, or AWS SES

    // For now, we'll return success as Netlify Forms handles the actual sending
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Form submission received successfully',
        data: {
          name: data.name,
          email: data.email,
          subject: data.subject
        }
      })
    };

  } catch (error) {
    console.error('Error processing form submission:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

// Example integration with SendGrid (uncomment and configure if using SendGrid)
/*
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Inside the handler function, replace the return statement with:
const msg = {
  to: emailConfig.to.split(','),
  from: 'noreply@studio-arteamo.com',
  subject: emailConfig.subject,
  text: emailConfig.text,
  html: emailConfig.html,
};

try {
  await sgMail.send(msg);
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Email sent successfully' })
  };
} catch (error) {
  console.error('SendGrid error:', error);
  return {
    statusCode: 500,
    body: JSON.stringify({ error: 'Failed to send email' })
  };
}
*/