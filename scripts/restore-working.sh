#!/bin/bash
# Full Restore to Working Version Script
# Usage: ./scripts/restore-working.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_DIR"

echo "⚠️  WARNING: This will restore to the working version (v1.0-working)"
echo "⚠️  This will LOSE all CMS implementation work!"
echo ""
echo "Current branch: $(git branch --show-current)"
echo "Recent commits:"
git log --oneline -5
echo ""
read -p "Are you absolutely sure? Type 'yes' to continue: " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Restore cancelled"
    exit 1
fi

# Check if tag exists
if ! git rev-parse --verify v1.0-working >/dev/null 2>&1; then
    echo "❌ Error: Tag v1.0-working not found"
    echo ""
    echo "Available tags:"
    git tag -l
    echo ""
    echo "To create the working version tag:"
    echo "  git tag -a v1.0-working -m 'Working version before CMS implementation'"
    echo "  git push origin v1.0-working"
    exit 1
fi

# Create restore branch with timestamp
RESTORE_BRANCH="restore-$(date +%Y%m%d-%H%M%S)"
echo "🔄 Creating restore branch: $RESTORE_BRANCH"

# Checkout working version
git checkout v1.0-working

# Create new branch from working version
git checkout -b "$RESTORE_BRANCH"

# Push restore branch
git push origin "$RESTORE_BRANCH"

echo ""
echo "✅ Restored to working version"
echo "📋 Branch created: $RESTORE_BRANCH"
echo ""
echo "Next steps:"
echo "1. Update Netlify Dashboard:"
echo "   - Go to Site Settings → Build & Deploy → Continuous Deployment"
echo "   - Change branch to: $RESTORE_BRANCH"
echo "   - Trigger deploy"
echo ""
echo "2. Verify site works correctly"
echo ""
echo "3. If confirmed working, you can update master:"
echo "   git checkout master"
echo "   git merge $RESTORE_BRANCH"
echo "   git push origin master"
echo ""
echo "⚠️  Note: All CMS implementation work is preserved in:"
echo "   - Branch: cms-implementation-staging"
echo "   - Tags: phase-* (all phase tags)"
echo "   You can return to CMS work anytime by checking out cms-implementation-staging"
