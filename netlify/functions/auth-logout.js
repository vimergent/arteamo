// Logout Handler
// Clears session cookie and redirects to login

exports.handler = async (event, context) => {
  const { SITE_URL } = process.env;
  const redirectUrl = SITE_URL ? `${SITE_URL}/admin/` : '/admin/';

  // Clear session cookie by setting it to expire immediately
  return {
    statusCode: 302,
    headers: {
      'Location': redirectUrl,
      'Set-Cookie': 'session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    },
    body: ''
  };
};
