// Netlify Function for committing CMS changes to GitHub
// This enables Git-based persistence for the CMS

const https = require('https');

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
