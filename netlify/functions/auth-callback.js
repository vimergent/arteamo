// Google OAuth Callback Handler
// Exchanges auth code for tokens, validates user, creates session

const crypto = require('crypto');
const https = require('https');

// Verify state token for CSRF protection
function verifyStateToken(token, secret, maxAge = 600000) {
  try {
    const [data, signature] = token.split('.');
    if (!data || !signature) return false;
    
    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(data)
      .digest('base64url');
    
    if (signature !== expectedSignature) return false;
    
    // Check expiry
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString());
    if (Date.now() - payload.timestamp > maxAge) return false;
    
    return true;
  } catch (e) {
    return false;
  }
}

// Create session JWT
function createSessionToken(user, secret, expiresIn = 8 * 60 * 60 * 1000) {
  const payload = {
    email: user.email,
    name: user.name,
    picture: user.picture,
    iat: Date.now(),
    exp: Date.now() + expiresIn
  };
  
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('base64url');
  
  return `${data}.${signature}`;
}

// Make HTTPS request (promisified)
function httpsRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ statusCode: res.statusCode, data: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

// Parse cookies from header
function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  
  cookieHeader.split(';').forEach(cookie => {
    const [name, ...rest] = cookie.split('=');
    cookies[name.trim()] = rest.join('=').trim();
  });
  
  return cookies;
}

exports.handler = async (event, context) => {
  const {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    JWT_SECRET,
    SITE_URL,
    ALLOWED_EMAILS
  } = process.env;

  // Validate required environment variables
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !JWT_SECRET || !SITE_URL) {
    console.error('Missing required environment variables');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server configuration error' })
    };
  }

  // Get authorization code and state from query params
  const params = event.queryStringParameters || {};
  const { code, state, error } = params;

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error);
    return {
      statusCode: 302,
      headers: {
        'Location': `${SITE_URL}/admin/?error=${encodeURIComponent(error)}`,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      },
      body: ''
    };
  }

  // Validate code and state
  if (!code || !state) {
    return {
      statusCode: 302,
      headers: {
        'Location': `${SITE_URL}/admin/?error=missing_params`,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      },
      body: ''
    };
  }

  // Verify state token (CSRF protection)
  const cookies = parseCookies(event.headers.cookie || event.headers.Cookie || '');
  const storedState = cookies.oauth_state;
  
  if (!storedState || state !== storedState || !verifyStateToken(state, JWT_SECRET)) {
    console.error('State validation failed');
    return {
      statusCode: 302,
      headers: {
        'Location': `${SITE_URL}/admin/?error=invalid_state`,
        'Set-Cookie': 'oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      },
      body: ''
    };
  }

  try {
    // Exchange code for tokens
    const tokenData = new URLSearchParams({
      code: code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: `${SITE_URL}/.netlify/functions/auth-callback`,
      grant_type: 'authorization_code'
    }).toString();

    const tokenResponse = await httpsRequest({
      hostname: 'oauth2.googleapis.com',
      path: '/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': tokenData.length
      }
    }, tokenData);

    if (tokenResponse.statusCode !== 200 || !tokenResponse.data.access_token) {
      console.error('Token exchange failed:', tokenResponse.data);
      return {
        statusCode: 302,
        headers: {
          'Location': `${SITE_URL}/admin/?error=token_exchange_failed`,
          'Set-Cookie': 'oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        },
        body: ''
      };
    }

    const accessToken = tokenResponse.data.access_token;

    // Get user info from Google
    const userResponse = await httpsRequest({
      hostname: 'www.googleapis.com',
      path: '/oauth2/v2/userinfo',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (userResponse.statusCode !== 200 || !userResponse.data.email) {
      console.error('User info fetch failed:', userResponse.data);
      return {
        statusCode: 302,
        headers: {
          'Location': `${SITE_URL}/admin/?error=user_info_failed`,
          'Set-Cookie': 'oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        },
        body: ''
      };
    }

    const user = userResponse.data;
    console.log('User authenticated:', user.email);

    // Check if email is allowed
    const allowedEmails = (ALLOWED_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
    const userEmail = user.email.toLowerCase();
    
    if (allowedEmails.length > 0 && allowedEmails[0] !== '' && !allowedEmails.includes(userEmail)) {
      console.error('Email not in allowed list:', userEmail);
      return {
        statusCode: 302,
        headers: {
          'Location': `${SITE_URL}/admin/?error=access_denied`,
          'Set-Cookie': 'oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        },
        body: ''
      };
    }

    // Create session token (8-hour expiry)
    const sessionToken = createSessionToken({
      email: user.email,
      name: user.name,
      picture: user.picture
    }, JWT_SECRET);

    // Set session cookie and redirect to admin
    const cookieMaxAge = 8 * 60 * 60; // 8 hours in seconds
    
    return {
      statusCode: 302,
      headers: {
        'Location': `${SITE_URL}/admin/`,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      },
      multiValueHeaders: {
        'Set-Cookie': [
          `session=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${cookieMaxAge}`,
          'oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0'
        ]
      },
      body: ''
    };

  } catch (error) {
    console.error('OAuth callback error:', error);
    return {
      statusCode: 302,
      headers: {
        'Location': `${SITE_URL}/admin/?error=server_error`,
        'Set-Cookie': 'oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      },
      body: ''
    };
  }
};
