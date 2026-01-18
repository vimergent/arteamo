// Google OAuth Login Initiation
// Redirects user to Google OAuth with CSRF protection

const crypto = require('crypto');

// Simple JWT-like state token for CSRF protection
function createStateToken(secret) {
  const payload = {
    timestamp: Date.now(),
    nonce: crypto.randomBytes(16).toString('hex')
  };
  
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('base64url');
  
  return `${data}.${signature}`;
}

exports.handler = async (event, context) => {
  const {
    GOOGLE_CLIENT_ID,
    JWT_SECRET,
    SITE_URL
  } = process.env;

  // Validate required environment variables
  if (!GOOGLE_CLIENT_ID || !JWT_SECRET || !SITE_URL) {
    console.error('Missing required environment variables');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server configuration error' })
    };
  }

  // Generate state token for CSRF protection
  const state = createStateToken(JWT_SECRET);

  // Build Google OAuth URL
  const redirectUri = `${SITE_URL}/.netlify/functions/auth-callback`;
  const scope = encodeURIComponent('openid email profile');
  
  const googleAuthUrl = 
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${GOOGLE_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=${scope}` +
    `&state=${state}` +
    `&access_type=offline` +
    `&prompt=select_account`;

  // Set state in cookie for verification on callback
  return {
    statusCode: 302,
    headers: {
      'Location': googleAuthUrl,
      'Set-Cookie': `oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    },
    body: ''
  };
};
