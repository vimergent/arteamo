#!/bin/bash
# Quick Feature Flag Rollback Script
# Usage: ./scripts/rollback-feature.sh <feature-name>

set -e

FEATURE=$1
if [ -z "$FEATURE" ]; then
    echo "❌ Error: Feature name required"
    echo ""
    echo "Usage: ./scripts/rollback-feature.sh <feature-name>"
    echo ""
    echo "Available features:"
    echo "  - NEW_CMS_AUTH"
    echo "  - NEW_STORAGE"
    echo "  - NEW_IMAGES"
    echo "  - NEW_DEPLOY"
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_DIR"

# Check if feature-flags.js exists
if [ ! -f "admin/feature-flags.js" ]; then
    echo "❌ Error: admin/feature-flags.js not found"
    exit 1
fi

# Update feature flag
echo "🔄 Disabling feature: $FEATURE"
sed -i "s/${FEATURE}: true/${FEATURE}: false/g" admin/feature-flags.js
sed -i "s/${FEATURE}: false/${FEATURE}: false/g" admin/feature-flags.js  # Ensure it's false

# Commit and push
git add admin/feature-flags.js
git commit -m "Rollback: Disable $FEATURE feature flag" || echo "No changes to commit"
git push origin cms-implementation-staging || git push origin master

echo "✅ Feature $FEATURE disabled"
echo "📋 Netlify will auto-deploy the change"
echo ""
echo "To re-enable:"
echo "  sed -i 's/${FEATURE}: false/${FEATURE}: true/g' admin/feature-flags.js"
echo "  git add admin/feature-flags.js"
echo "  git commit -m 'Re-enable: $FEATURE'"
echo "  git push origin cms-implementation-staging"
