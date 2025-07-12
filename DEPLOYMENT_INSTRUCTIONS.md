# Deployment Instructions for Studio Arteamo Website

## Before Deployment - IMPORTANT

You need to update the following files with your Netlify site URL:

1. **sitemap.xml** - Replace all instances of `https://YOUR-NETLIFY-SITE.netlify.app` with your actual Netlify URL
2. **robots.txt** - Replace `https://YOUR-NETLIFY-SITE.netlify.app` with your actual Netlify URL
3. **netlify.toml** - Update the `SITE_URL` environment variable with your actual Netlify URL

## Netlify Deployment Steps

1. **Create a new site in Netlify**
   - Log in to your Netlify account
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub account and select the `arteamo` repository
   - Leave all build settings as default (no build command needed)
   - Click "Deploy site"

2. **Configure Environment Variables**
   - Go to Site settings → Environment variables
   - Add the following variable:
     - `CONTACT_EMAIL`: petyaem@abv.bg (default contact email)
   
   Note: The contact email can also be managed from the CMS admin panel under Settings → Contact Settings

3. **Update Site URL**
   - Once deployed, note your Netlify site URL (e.g., `amazing-site-123456.netlify.app`)
   - Update the files mentioned above with this URL
   - Commit and push the changes

4. **Custom Domain (Optional)**
   - If you have a custom domain (e.g., arteamo.net):
   - Go to Site settings → Domain management
   - Click "Add custom domain"
   - Follow Netlify's instructions for DNS configuration

5. **Enable Form Notifications**
   - Go to Site settings → Forms → Form notifications
   - Add email notifications for the contact form

## Post-Deployment Checklist

- [ ] Test the contact form
- [ ] Verify all images load correctly
- [ ] Check multi-language switching
- [ ] Test the admin panel at `/admin/` (password: `arteamo2024admin`)
- [ ] Verify the site works on mobile devices

## Admin Panel Access

- URL: `https://your-site.com/admin/`
- Password: `arteamo2024admin`

## Support

For issues with:
- Website functionality: Check the browser console for errors
- Netlify deployment: Refer to Netlify documentation
- Contact form: Ensure environment variables are set correctly