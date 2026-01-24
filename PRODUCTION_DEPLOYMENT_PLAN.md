# Production Deployment Plan

## Current State

| Environment | URL | Repo | Branch |
|-------------|-----|------|--------|
| Staging | arteamo-staging.netlify.app | vimergent/arteamo-portfolio | claude/clarify-requirements-aiQjM |
| Production | arteamo.net | vimergent/arteamo | master |

## Changes Being Deployed

1. **Google OAuth Authentication** for CMS admin
2. **Git-based CMS Persistence** (commits to GitHub)
3. **Contact Form** via Netlify Forms
4. **Translation Timing Fix** for multi-language support
5. **Security Fixes** (authenticated commits, timing-safe JWT)

---

## Pre-Deployment Checklist

- [ ] All staging tests passed
- [ ] Backup current production state
- [ ] Environment variables configured on production
- [ ] Google OAuth redirect URI updated for production domain

---

## Required Environment Variables (Production)

These must be set on the production Netlify site BEFORE deployment:

```
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
JWT_SECRET=<random-secure-string-32-chars>
SITE_URL=https://arteamo.net
ALLOWED_EMAILS=vissaev@gmail.com,petyaem1@gmail.com
GITHUB_TOKEN=<github-personal-access-token>
GITHUB_REPO=vimergent/arteamo
GITHUB_BRANCH=master
```

---

## Deployment Steps

### Phase 1: Backup (CRITICAL)

```bash
# 1. Create backup branch of current production
cd /Users/vissa/Development/github_repos/arteamo
git checkout master
git pull origin master
git checkout -b backup/pre-cms-deployment-$(date +%Y%m%d)
git push origin backup/pre-cms-deployment-$(date +%Y%m%d)

# 2. Note the current commit SHA for rollback
git rev-parse HEAD
# Save this SHA: ________________
```

### Phase 2: Merge Changes

```bash
# 1. Ensure we have latest changes
git checkout master
git pull origin master

# 2. Merge the feature branch
git merge claude/clarify-requirements-aiQjM --no-ff -m "feat: deploy CMS with Google OAuth, contact form, and Git persistence"

# 3. Push to trigger Netlify deploy
git push origin master
```

### Phase 3: Configure Environment Variables

1. Go to https://app.netlify.com/sites/studioarteamo/settings/env
2. Add all variables from the list above
3. **IMPORTANT**: Update Google OAuth Console:
   - Add `https://arteamo.net/.netlify/functions/auth-callback` as authorized redirect URI

### Phase 4: Verify Deployment

Run these checks after deploy completes:

```bash
# 1. Check auth endpoints
curl -I "https://arteamo.net/.netlify/functions/auth-login"
# Expected: 302 redirect to Google

curl "https://arteamo.net/.netlify/functions/auth-verify"
# Expected: {"error":"No session","authenticated":false}

# 2. Check commit-config security
curl -X POST "https://arteamo.net/.netlify/functions/commit-config" \
  -H "Content-Type: application/json" \
  -d '{"content":"test"}'
# Expected: {"error":"Authentication required"}

# 3. Check project config loads
curl -s "https://arteamo.net/project-config.js" | head -5
# Expected: Project configuration JS file

# 4. Check translations
curl -s "https://arteamo.net/translations.js" | grep -o "residential.*Жилищни"
# Expected: Match found
```

### Phase 5: Manual Testing

1. **Homepage**: https://arteamo.net
   - [ ] Projects load correctly
   - [ ] Language switcher works (EN, BG, RU, ES)
   - [ ] Categories translate when language changes

2. **Contact Form**:
   - [ ] Submit test message
   - [ ] Check petyaem@abv.bg receives email

3. **CMS Admin**: https://arteamo.net/admin/
   - [ ] Google login works
   - [ ] Projects display correctly
   - [ ] Make test edit, Export & Deploy
   - [ ] Verify change appears on site

---

## Rollback Plan

### If Issues Detected Within 1 Hour

**Option A: Instant Rollback via Netlify**

1. Go to https://app.netlify.com/sites/studioarteamo/deploys
2. Find the last successful deploy BEFORE the merge
3. Click "Publish deploy" to instantly rollback

**Option B: Git Rollback**

```bash
# 1. Revert to backup branch
git checkout master
git reset --hard backup/pre-cms-deployment-YYYYMMDD
git push origin master --force

# 2. Or revert the merge commit
git revert -m 1 <merge-commit-sha>
git push origin master
```

### If Issues Detected After 1 Hour (Data Created)

If users have submitted contact forms or made CMS changes:

1. Export any new form submissions from Netlify dashboard
2. Check GitHub for any CMS commits that need preservation
3. Then perform rollback as above
4. Re-apply any critical data manually

---

## Post-Deployment

### Monitoring (First 24 Hours)

- [ ] Check Netlify function logs for errors
- [ ] Monitor form submissions
- [ ] Test CMS from different browsers/devices
- [ ] Verify all 4 languages work

### Cleanup (After 1 Week Stable)

```bash
# Remove backup branch if no issues
git push origin --delete backup/pre-cms-deployment-YYYYMMDD
```

---

## Emergency Contacts

- Netlify Status: https://www.netlifystatus.com/
- GitHub Status: https://www.githubstatus.com/

---

## Quick Reference

| Action | Command |
|--------|---------|
| Check deploy status | `netlify status` |
| View deploy logs | `netlify deploy --build --prod` |
| Rollback to backup | `git reset --hard backup/pre-cms-deployment-YYYYMMDD && git push -f` |
| Check function logs | https://app.netlify.com/sites/studioarteamo/logs/functions |
