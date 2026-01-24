// Session Verification Endpoint
// Validates JWT session token and returns user data

const crypto = require('crypto');

// Verify and decode session token
function verifySessionToken(token, secret) {
  try {
    const [data, signature] = token.split('.');
    if (!data || !signature) return null;
    
    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(data)
      .digest('base64url');
    
    if (signature !== expectedSignature) return null;
    
    // Decode and check expiry
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString());
    
    if (!payload.exp || Date.now() > payload.exp) {
      return null; // Token expired
    }
    
    return payload;
  } catch (e) {
    console.error('Token verification error:', e);
    return null;
  }
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
  const { JWT_SECRET } = process.env;

  if (!JWT_SECRET) {
    console.error('JWT_SECRET not configured');
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      },
      body: JSON.stringify({ error: 'Server configuration error' })
    };
  }

  // Get session cookie
  const cookies = parseCookies(event.headers.cookie || event.headers.Cookie || '');
  const sessionToken = cookies.session;

  if (!sessionToken) {
    return {
      statusCode: 401,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      },
      body: JSON.stringify({ error: 'No session', authenticated: false })
    };
  }

  // Verify session token
  const user = verifySessionToken(sessionToken, JWT_SECRET);

  if (!user) {
    return {
      statusCode: 401,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      },
      body: JSON.stringify({ error: 'Invalid or expired session', authenticated: false })
    };
  }

  // Return user data
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    },
    body: JSON.stringify({
      authenticated: true,
      user: {
        email: user.email,
        name: user.name,
        picture: user.picture
      },
      expiresAt: user.exp
    })
  };
};
