// Netlify Function for committing CMS changes to GitHub
// This enables Git-based persistence for the CMS
// SECURED: Requires valid session cookie

const https = require('https');
const crypto = require('crypto');

// Verify session token (must match auth-verify.js logic)
function verifySessionToken(token, secret) {
  try {
    const [data, signature] = token.split('.');
    if (!data || !signature) return null;

    // Verify signature using timing-safe comparison
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(data)
      .digest('base64url');

    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (sigBuffer.length !== expectedBuffer.length) return null;
    if (!crypto.timingSafeEqual(sigBuffer, expectedBuffer)) return null;

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
  const { SITE_URL, JWT_SECRET } = process.env;

  // CORS headers - restrict to site origin only
  const allowedOrigin = SITE_URL || 'https://arteamo-staging.netlify.app';
  const headers = {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
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

  // SECURITY: Verify user is authenticated
  if (!JWT_SECRET) {
    console.error('JWT_SECRET not configured');
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Server configuration error' })
    };
  }

  const cookies = parseCookies(event.headers.cookie || event.headers.Cookie || '');
  const sessionToken = cookies.session;

  if (!sessionToken) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Authentication required' })
    };
  }

  const user = verifySessionToken(sessionToken, JWT_SECRET);
  if (!user) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Invalid or expired session' })
    };
  }

  console.log(`[commit-config] Authenticated user: ${user.email}`);

  // Check for required environment variables
  const { GITHUB_TOKEN, GITHUB_REPO, GITHUB_BRANCH } = process.env;

  if (!GITHUB_TOKEN || !GITHUB_REPO) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Server configuration error',
        details: 'Missing GITHUB_TOKEN or GITHUB_REPO environment variables'
      })
    };
  }

  try {
    const { content, message, filePath } = JSON.parse(event.body);

    if (!content) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing content in request body' })
      };
    }

    const targetPath = filePath || 'project-config.js';
    const branch = GITHUB_BRANCH || 'main';
    const commitMessage = message || `CMS update: ${new Date().toISOString()}`;

    // Step 1: Get the current file SHA (needed for updates)
    let currentSha = null;
    try {
      const fileData = await githubRequest(
        'GET',
        `/repos/${GITHUB_REPO}/contents/${targetPath}?ref=${branch}`,
        GITHUB_TOKEN
      );
      currentSha = fileData.sha;
    } catch (err) {
      // File doesn't exist yet, that's okay for new files
      if (err.statusCode !== 404) {
        throw err;
      }
    }

    // Step 2: Create or update the file
    const contentBase64 = Buffer.from(content, 'utf-8').toString('base64');

    const updatePayload = {
      message: commitMessage,
      content: contentBase64,
      branch: branch
    };

    if (currentSha) {
      updatePayload.sha = currentSha;
    }

    const result = await githubRequest(
      'PUT',
      `/repos/${GITHUB_REPO}/contents/${targetPath}`,
      GITHUB_TOKEN,
      updatePayload
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Configuration committed successfully',
        commit: {
          sha: result.commit?.sha,
          url: result.commit?.html_url,
          message: commitMessage
        }
      })
    };

  } catch (error) {
    console.error('Error committing to GitHub:', error);

    return {
      statusCode: error.statusCode || 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to commit changes',
        details: error.message || 'Unknown error'
      })
    };
  }
};

// Helper function to make GitHub API requests
function githubRequest(method, path, token, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'Studio-Arteamo-CMS',
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve(data);
          }
        } else {
          const error = new Error(`GitHub API error: ${res.statusCode}`);
          error.statusCode = res.statusCode;
          try {
            error.details = JSON.parse(data);
          } catch (e) {
            error.details = data;
          }
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}
