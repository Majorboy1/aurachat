#!/bin/bash

# AuraChat — auto GitHub setup script

set -e

echo "🚀 Setting up AuraChat GitHub repository..."

if ! command -v gh &> /dev/null; then
  echo "❌ GitHub CLI (gh) is not installed."
  echo "Install it from https://cli.github.com then run this script again."
  exit 1
fi

if ! command -v git &> /dev/null; then
  echo "❌ Git is not installed. Install git and try again."
  exit 1
fi

GH_USER=$(gh api user --jq .login)
echo "✅ Logged in as: $GH_USER"

if [ ! -d ".git" ]; then
  git init
  echo "✅ Git initialized"
fi

cat > .gitignore << 'EOF'
node_modules/
.env
.env.local
.next/
dist/
.DS_Store
EOF
echo "✅ .gitignore created"

git add .
git commit -m "feat: initial AuraChat scaffold — multiplayer AI chat with streaming"
echo "✅ Initial commit created"

gh repo create aurachat \
  --public \
  --description "Multiplayer AI chat app with real-time streaming, live cursors, and AI personas" \
  --push \
  --source=.

echo ""
echo "✅ Repository created and pushed!"
echo "🔗 View it at: https://github.com/$GH_USER/aurachat"
echo ""
echo "Next steps:"
echo "  1. cd client && cp .env.example .env.local && npm install && npm run dev"
echo "  2. cd server && cp .env.example .env && npm install && npm run dev"
echo "  3. Add your OPENAI_API_KEY to server/.env"
