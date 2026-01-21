#!/bin/bash

# ToolBox Tamil - GitHub Setup Script
# This script helps you set up GitHub repository and hosting

echo "═══════════════════════════════════════════════════════"
echo "  🚀 ToolBox Tamil - GitHub Pages Setup"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "📝 Current Git Status:"
git status --short
echo ""
echo "📊 Commits Ready to Push:"
git log --oneline | head -5
echo ""
echo "═══════════════════════════════════════════════════════"
echo ""
echo "🔧 STEP 1: Create GitHub Repository"
echo "   Opening GitHub in your browser..."
echo ""

# Open GitHub new repository page
open "https://github.com/new"

echo "✅ Browser opened!"
echo ""
echo "👉 On GitHub, create a new repository with these details:"
echo ""
echo "   Repository name: toolbox-tamil"
echo "   Description: ToolBox Tamil - Free online tools for Tamil community 🇮🇳"
echo "   Visibility: Public"
echo "   ❌ DO NOT initialize with README, .gitignore, or license"
echo ""
echo "═══════════════════════════════════════════════════════"
echo ""
read -p "✋ Press ENTER after you've created the repository on GitHub..."
echo ""
echo "═══════════════════════════════════════════════════════"
echo ""
echo "🔧 STEP 2: Enter Your GitHub Username"
read -p "GitHub Username: " GITHUB_USERNAME
echo ""

if [ -z "$GITHUB_USERNAME" ]; then
    echo "❌ Error: GitHub username cannot be empty"
    exit 1
fi

echo "═══════════════════════════════════════════════════════"
echo ""
echo "🔧 STEP 3: Connecting to GitHub..."
echo ""

# Remove any existing remote (in case of retry)
git remote remove origin 2>/dev/null

# Add GitHub remote
REPO_URL="https://github.com/$GITHUB_USERNAME/toolbox-tamil.git"
echo "📡 Adding remote: $REPO_URL"
git remote add origin "$REPO_URL"

# Verify remote
echo ""
echo "✅ Remote configured:"
git remote -v
echo ""

echo "═══════════════════════════════════════════════════════"
echo ""
echo "🔧 STEP 4: Pushing to GitHub..."
echo ""

# Push to GitHub
git branch -M main
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "═══════════════════════════════════════════════════════"
    echo "  ✅ SUCCESS! Code pushed to GitHub!"
    echo "═══════════════════════════════════════════════════════"
    echo ""
    echo "📂 Repository: https://github.com/$GITHUB_USERNAME/toolbox-tamil"
    echo ""
    echo "═══════════════════════════════════════════════════════"
    echo ""
    echo "🔧 STEP 5: Enable GitHub Pages"
    echo ""
    echo "Opening repository settings..."
    open "https://github.com/$GITHUB_USERNAME/toolbox-tamil/settings/pages"
    echo ""
    echo "👉 In the settings page:"
    echo "   1. Under 'Source', select branch: main"
    echo "   2. Select folder: / (root)"
    echo "   3. Click 'Save'"
    echo "   4. Wait 1-2 minutes for deployment"
    echo ""
    echo "═══════════════════════════════════════════════════════"
    echo ""
    read -p "✋ Press ENTER after enabling GitHub Pages..."
    echo ""
    echo "═══════════════════════════════════════════════════════"
    echo "  🎉 CONGRATULATIONS!"
    echo "═══════════════════════════════════════════════════════"
    echo ""
    echo "🌐 Your website will be live at:"
    echo "   https://$GITHUB_USERNAME.github.io/toolbox-tamil/"
    echo ""
    echo "⏱️  Wait 1-2 minutes for first deployment"
    echo ""
    echo "📝 To update website in future:"
    echo "   git add ."
    echo "   git commit -m \"Update: description\""
    echo "   git push origin main"
    echo ""
    echo "═══════════════════════════════════════════════════════"
    echo ""
    echo "Opening your new website..."
    sleep 5
    open "https://$GITHUB_USERNAME.github.io/toolbox-tamil/"
    echo ""
    echo "✨ வாழ்க தமிழ்! Share with Tamil community worldwide!"
    echo ""
else
    echo ""
    echo "═══════════════════════════════════════════════════════"
    echo "  ❌ ERROR: Failed to push to GitHub"
    echo "═══════════════════════════════════════════════════════"
    echo ""
    echo "Possible reasons:"
    echo "  1. Wrong username"
    echo "  2. Repository doesn't exist"
    echo "  3. No Git credentials configured"
    echo "  4. Network issue"
    echo ""
    echo "💡 Try again:"
    echo "   ./setup-github.sh"
    echo ""
    echo "Or push manually:"
    echo "   git remote add origin https://github.com/$GITHUB_USERNAME/toolbox-tamil.git"
    echo "   git push -u origin main"
    echo ""
fi
