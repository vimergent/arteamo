#!/bin/bash
# Code Rollback Script (Git Revert)
# Usage: ./scripts/rollback-code.sh <commit-hash>
#        ./scripts/rollback-code.sh HEAD (rollback last commit)

set -e

COMMIT=$1
if [ -z "$COMMIT" ]; then
    echo "❌ Error: Commit hash required"
    echo ""
    echo "Usage: ./scripts/rollback-code.sh <commit-hash>"
    echo "   Or: ./scripts/rollback-code.sh HEAD (rollback last commit)"
    echo ""
    echo "Recent commits:"
    git log --oneline -10
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_DIR"

# Check if commit exists
if ! git rev-parse --verify "$COMMIT" >/dev/null 2>&1; then
    echo "❌ Error: Commit $COMMIT not found"
    exit 1
fi

# Show commit info
echo "📋 Commit to revert:"
git log -1 --oneline "$COMMIT"
echo ""
read -p "⚠️  Are you sure you want to revert this commit? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Rollback cancelled"
    exit 1
fi

# Revert commit
echo "🔄 Reverting commit $COMMIT..."
git revert "$COMMIT" --no-edit

# Push to staging
BRANCH=$(git branch --show-current)
echo "📤 Pushing to $BRANCH..."
git push origin "$BRANCH"

echo "✅ Rolled back commit $COMMIT"
echo "📋 Netlify will auto-deploy the change"
