# CLAUDE.md - Studio Arteamo Portfolio Website

## Project Overview

This is a static portfolio website for **Studio Arteamo**, an interior design studio founded in 2008 in Varna, Bulgaria by Eng. Petya Petrova. The website showcases 11 interior design projects spanning 2017-2024, including residential, commercial, medical, and office spaces.

**Live URL**: Deployed on Netlify
**Repository**: github.com/vimergent/arteamo
**Version**: 1.3.3

## Tech Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Hosting**: Netlify (static site hosting)
- **Forms**: Netlify Forms with optional serverless functions
- **Build**: No build step required - static files served directly
- **Languages**: 6 languages supported (BG, EN, RU, ES, HE, ZH)

## Directory Structure

```
arteamo/
├── index.html                    # Main website entry point
├── gallery-premium.html          # Full-screen project gallery viewer
├── admin/                        # CMS admin panel
│   ├── index.html               # Admin interface
│   ├── admin.js                 # Admin functionality
│   └── admin-styles.css         # Admin styling
├── netlify/
│   └── functions/
│       └── send-email.js        # Serverless function for email
├── [Project Folders]/            # Image folders for each project
│   ├── Apartament Flavia Garden 2024/
│   ├── Elite Clinic 2021/
│   ├── Apartament K55_2021/
│   ├── Balev Corporation 2020/
│   └── ... (11 total projects)
├── project-config.js             # Centralized project data (multilingual)
├── translations.js               # All UI translations (6 languages)
├── dynamic-projects.js           # Dynamic project loading logic
├── language-switcher-v2.js       # Language switching functionality
├── script-enhanced.js            # Main site functionality
├── contact-form-netlify.js       # Contact form handler
├── gallery-init.js               # Gallery initialization
├── video-player.js               # Video playback controls
├── mobile-video-intro.js         # Mobile video intro handling
├── styles-enhanced.min.css       # Main styles (minified)
├── mobile-optimizations.min.css  # Mobile-specific styles
├── critical.min.css              # Critical CSS for fast loading
├── netlify.toml                  # Netlify configuration
├── _redirects                    # URL redirects
├── _headers                      # HTTP headers configuration
├── sitemap.xml                   # SEO sitemap
├── robots.txt                    # Search engine directives
└── ArteamoAd.mp4                 # Promo video
```

## Key Files and Their Purposes

### Core Files

| File | Purpose |
|------|---------|
| `index.html` | Main SPA with inline critical CSS, loads all sections |
| `gallery-premium.html` | Full-screen gallery with navigation, loaded via URL params |
| `project-config.js` | Central source of truth for all project data |
| `translations.js` | Complete translation dictionary for all 6 languages |
| `netlify.toml` | Netlify build config, redirects, headers, plugins |

### JavaScript Modules

| File | Purpose |
|------|---------|
| `dynamic-projects.js` | Renders project cards from `projectConfig` |
| `language-switcher-v2.js` | Handles language selection and localStorage |
| `script-enhanced.js` | Navigation, filtering, animations |
| `contact-form-netlify.js` | Creates and handles contact form submission |
| `gallery-init.js` | Initializes gallery lightbox functionality |
| `video-player.js` | Custom video player controls |
| `mobile-video-intro.js` | Mobile-optimized video intro |
| `awards-handler.js` | Handles awards section with links |
| `site-settings.js` | Global site settings |

## Development Workflow

### Local Development

```bash
# Start local server
npm run serve
# or
python3 -m http.server 8080
```

Then open `http://localhost:8080`

### Deployment

The site auto-deploys to Netlify on push to the main branch. No build step is required.

### Testing Checklist

Before deploying:
- [ ] Test all 6 languages switch correctly
- [ ] Verify all project images load
- [ ] Test contact form submission
- [ ] Check mobile responsiveness
- [ ] Verify gallery navigation works
- [ ] Test admin panel access

## Important Conventions

### Adding/Modifying Projects

1. **Add images** to a new folder with naming format: `Project Name Year/`
2. **Update `project-config.js`** with the new project entry:
   ```javascript
   'Folder Name': {
       name: { bg: '...', en: '...', ru: '...', es: '...' },
       subtitle: { bg: '...', en: '...', ru: '...', es: '...' },
       description: { bg: '...', en: '...', ru: '...', es: '...' },
       category: 'residential|commercial|office|medical|hospitality',
       year: 2024,
       area: 120,  // in square meters
       coverImage: 'filename.jpg',
       images: ['img1.jpg', 'img2.jpg', ...]
   }
   ```
3. Images are served directly from project folders

### Adding Translations

Edit `translations.js` and add entries to all 6 language sections:
- `en` - English (default)
- `bg` - Bulgarian
- `ru` - Russian
- `es` - Spanish
- `he` - Hebrew
- `zh` - Chinese

Use `data-translate="key.path"` attribute on HTML elements for automatic translation.

### URL Encoding for Images

Image paths with special characters (spaces, parentheses) must be URL-encoded. Use the helper function in `dynamic-projects.js`:
```javascript
function encodeImagePath(path) {
    return encodeURIComponent(path).replace(/\(/g, '%28').replace(/\)/g, '%29');
}
```

### CSS Variables

The site uses CSS custom properties defined in `:root`:
```css
--primary-color: #000000
--premium-gold: #d4af37
--bg-color: #ffffff
--text-primary: #000000
--text-secondary: #666666
--spacing-unit: 8px
--transition-base: 0.3s cubic-bezier(0.4, 0, 0.2, 1)
```

## Admin Panel

- **URL**: `/admin/`
- **Password**: Stored in `admin.js` (currently `kNl55zUPC(yH`)
- **Features**:
  - Edit project metadata
  - Export project-config.js
  - Create/restore backups
  - Manage contact email

## Netlify Configuration

### Key Settings in `netlify.toml`

- **Asset optimization**: CSS/JS bundling and minification enabled
- **Image compression**: Enabled
- **Security headers**: CSP, X-Frame-Options, etc.
- **Caching**:
  - Images: 1 year (`immutable`)
  - CSS/JS: 1 week with revalidation
  - Videos: 1 month
  - Config files: 1 hour
- **Sitemap plugin**: Auto-generates sitemap

### Redirects

- Language routes (`/bg/*`, `/en/*`, etc.) redirect to `index.html`
- Section routes (`/projects`, `/about`, etc.) redirect to hash anchors
- Admin panel at `/admin` serves `/admin/index.html`

## Common Tasks

### Update Version Number

1. Edit `index.html` meta tags:
   ```html
   <meta name="version" content="1.3.3">
   <meta name="deployment-date" content="2026-01-15">
   ```
2. Update `version.json` for tracking

### Fix Image Loading Issues

1. Check image path encoding
2. Verify folder name matches `project-config.js` exactly
3. Check console for 404 errors
4. Ensure images exist in the correct folder

### Debugging Language Issues

1. Check browser localStorage for `selectedLanguage`
2. Verify translation key exists in `translations.js`
3. Check `data-translate` attribute matches key path
4. Look for console errors from `language-switcher-v2.js`

### Contact Form Issues

1. Verify Netlify Forms is enabled in dashboard
2. Check honeypot field is hidden (`bot-field`)
3. Ensure `data-netlify="true"` attribute is present
4. Check for reCAPTCHA configuration if enabled

## Known Issues and Workarounds

1. **Geo-targeting redirects disabled**: Caused asset loading issues from language-specific URLs
2. **Edge functions disabled**: Caused redirect loops with images
3. **Checklinks plugin disabled**: False positives with Google Fonts preconnect

## Security Considerations

- Admin password stored client-side (not production-secure)
- Form submissions use Netlify's built-in spam protection
- CSP headers restrict script and style sources
- No sensitive data in repository

## Performance Optimizations

- Critical CSS inlined in `<head>`
- Non-critical CSS loaded asynchronously
- Images use `loading="lazy"`
- Scripts use `defer` attribute
- Netlify's CDN and edge caching
- Font preloading for Google Fonts

## Contact

- **Studio Email**: petyaem@abv.bg
- **Founded**: 2008 by Eng. Petya Petrova
- **Location**: Varna, Bulgaria
