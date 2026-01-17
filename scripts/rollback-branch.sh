#!/bin/bash
# Branch Rollback Script
# Usage: ./scripts/rollback-branch.sh <branch-name>

set -e

BRANCH=$1
if [ -z "$BRANCH" ]; then
    echo "❌ Error: Branch name required"
    echo ""
    echo "Usage: ./scripts/rollback-branch.sh <branch-name>"
    echo ""
    echo "Available branches:"
    echo "  Local branches:"
    git branch
    echo ""
    echo "  Remote branches:"
    git branch -r | grep -E "(master|safety-backup|restore)"
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_DIR"

# Check if branch exists
if ! git show-ref --verify --quiet refs/heads/"$BRANCH" && ! git show-ref --verify --quiet refs/remotes/origin/"$BRANCH"; then
    echo "❌ Error: Branch $BRANCH not found"
    exit 1
fi

# Show current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Current branch: $CURRENT_BRANCH"
echo "🔄 Switching to branch: $BRANCH"
echo ""
read -p "⚠️  Are you sure? This will switch branches. (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Rollback cancelled"
    exit 1
fi

# Checkout branch (create local if remote)
if git show-ref --verify --quiet refs/remotes/origin/"$BRANCH"; then
    git checkout -b "$BRANCH" "origin/$BRANCH" 2>/dev/null || git checkout "$BRANCH"
else
    git checkout "$BRANCH"
fi

echo "✅ Switched to branch $BRANCH"
echo ""
echo "📋 Next steps:"
echo "1. Update Netlify Dashboard to deploy branch: $BRANCH"
echo "2. Or push this branch to trigger auto-deploy:"
echo "   git push origin $BRANCH"
