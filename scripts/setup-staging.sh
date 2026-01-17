#!/bin/bash
# Pre-Staging Setup Script
# This script sets up the staging environment with safety backups

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_DIR"

echo "🚀 Arteamo CMS Staging Setup"
echo "=============================="
echo ""

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Error: Not a git repository"
    exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Current branch: $CURRENT_BRANCH"
echo ""

# Step 1: Create safety backup branch
echo "📦 Step 1: Creating safety backup branch..."
SAFETY_BRANCH="safety-backup-$(date +%Y%m%d)"
if git show-ref --verify --quiet refs/heads/"$SAFETY_BRANCH"; then
    echo "⚠️  Safety branch $SAFETY_BRANCH already exists"
else
    git checkout -b "$SAFETY_BRANCH"
    git push origin "$SAFETY_BRANCH"
    echo "✅ Created safety backup branch: $SAFETY_BRANCH"
fi
git checkout "$CURRENT_BRANCH"
echo ""

# Step 2: Tag current working version
echo "🏷️  Step 2: Tagging current working version..."
if git rev-parse --verify v1.0-working >/dev/null 2>&1; then
    echo "⚠️  Tag v1.0-working already exists"
    read -p "Overwrite existing tag? (yes/no): " overwrite
    if [ "$overwrite" = "yes" ]; then
        git tag -d v1.0-working
        git push origin :refs/tags/v1.0-working
    else
        echo "Skipping tag creation"
    fi
fi

if ! git rev-parse --verify v1.0-working >/dev/null 2>&1; then
    git tag -a v1.0-working -m "Working version before CMS implementation"
    git push origin v1.0-working
    echo "✅ Created tag: v1.0-working"
fi
echo ""

# Step 3: Create staging branch
echo "🌿 Step 3: Creating staging branch..."
STAGING_BRANCH="cms-implementation-staging"
if git show-ref --verify --quiet refs/heads/"$STAGING_BRANCH"; then
    echo "⚠️  Staging branch $STAGING_BRANCH already exists"
    read -p "Switch to existing branch? (yes/no): " switch
    if [ "$switch" = "yes" ]; then
        git checkout "$STAGING_BRANCH"
        echo "✅ Switched to staging branch"
    fi
else
    git checkout -b "$STAGING_BRANCH"
    git push origin "$STAGING_BRANCH"
    echo "✅ Created staging branch: $STAGING_BRANCH"
fi
echo ""

# Step 4: Create scripts directory if it doesn't exist
echo "📁 Step 4: Setting up scripts directory..."
mkdir -p scripts
chmod +x scripts/*.sh 2>/dev/null || true
echo "✅ Scripts directory ready"
echo ""

# Step 5: Create feature flags file
echo "🚩 Step 5: Creating feature flags..."
if [ ! -f "admin/feature-flags.js" ]; then
    cat > admin/feature-flags.js << 'EOF'
// Feature Flags for Gradual Rollout
// Disable features here to rollback instantly without code changes

export const FEATURES = {
  // Phase 0: Foundation
  SECURITY_FIXES: true,
  DATA_MIGRATION: true,
  TESTING_INFRASTRUCTURE: true,
  ERROR_HANDLING: true,
  
  // Phase 1: Storage
  NEW_STORAGE: false,
  OFFLINE_SUPPORT: false,
  
  // Phase 2: Authentication
  NEW_CMS_AUTH: false,
  NETLIFY_IDENTITY: false,
  
  // Phase 3: Images
  NEW_IMAGES: false,
  IMAGE_OPTIMIZATION: false,
  
  // Phase 4: Deployment
  NEW_DEPLOY: false,
  REAL_TIME_DEPLOY: false,
  
  // Phase 5: Polish
  PERFORMANCE_OPTIMIZATION: false,
  UX_POLISH: false,
};

// Helper function to check if feature is enabled
export function isFeatureEnabled(feature) {
  return FEATURES[feature] === true;
}
EOF
    echo "✅ Created admin/feature-flags.js"
else
    echo "⚠️  Feature flags file already exists"
fi
echo ""

# Step 6: Create health check endpoint
echo "🏥 Step 6: Creating health check endpoint..."
mkdir -p netlify/functions
if [ ! -f "netlify/functions/health.js" ]; then
    cat > netlify/functions/health.js << 'EOF'
// Health Check Endpoint
exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0',
    }),
  };
};
EOF
    echo "✅ Created health check endpoint"
else
    echo "⚠️  Health check endpoint already exists"
fi
echo ""

# Summary
echo "✅ Staging Setup Complete!"
echo ""
echo "📋 Summary:"
echo "  - Safety backup branch: $SAFETY_BRANCH"
echo "  - Working version tag: v1.0-working"
echo "  - Staging branch: $STAGING_BRANCH"
echo "  - Feature flags: admin/feature-flags.js"
echo "  - Health check: netlify/functions/health.js"
echo ""
echo "📋 Next Steps:"
echo "  1. Configure Netlify to deploy from: $STAGING_BRANCH"
echo "  2. Test staging site: arteamo-staging.netlify.app"
echo "  3. Begin Phase 0 implementation"
echo ""
echo "🔄 Rollback Commands:"
echo "  - Feature rollback: ./scripts/rollback-feature.sh <feature>"
echo "  - Code rollback: ./scripts/rollback-code.sh <commit>"
echo "  - Branch rollback: ./scripts/rollback-branch.sh <branch>"
echo "  - Full restore: ./scripts/restore-working.sh"
echo ""
