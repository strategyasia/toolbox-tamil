#!/bin/bash

echo "═══════════════════════════════════════════════════════"
echo "  🚀 ToolBox Tamil - Quick Deploy to GitHub"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "STEP 1: Opening GitHub to create repository..."
echo ""

# Open GitHub new repository page
open "https://github.com/new"

echo "✅ GitHub opened in your browser!"
echo ""
echo "═══════════════════════════════════════════════════════"
echo "👉 CREATE REPOSITORY with these details:"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "  Repository name: toolbox-tamil"
echo "  Description: ToolBox Tamil - Free online tools for Tamil community 🇮🇳"
echo "  Visibility: ✅ Public"
echo "  ❌ DO NOT check 'Add README file'"
echo "  ❌ DO NOT check 'Add .gitignore'"
echo "  ❌ DO NOT check 'Choose a license'"
echo ""
echo "  Then click: 'Create repository' button"
echo ""
echo "═══════════════════════════════════════════════════════"
echo ""
echo "After creating the repository, GitHub will show you"
echo "commands. Copy the HTTPS URL that looks like:"
echo "  https://github.com/YOUR_USERNAME/toolbox-tamil.git"
echo ""
echo "═══════════════════════════════════════════════════════"
echo ""
read -p "Paste your repository URL here: " REPO_URL

if [ -z "$REPO_URL" ]; then
    echo "❌ Error: Repository URL cannot be empty"
    echo ""
    echo "URL should look like:"
    echo "https://github.com/YOUR_USERNAME/toolbox-tamil.git"
    exit 1
fi

echo ""
echo "═══════════════════════════════════════════════════════"
echo "STEP 2: Connecting to GitHub..."
echo "═══════════════════════════════════════════════════════"
echo ""

# Remove existing remote if any
git remote remove origin 2>/dev/null

# Add new remote
git remote add origin "$REPO_URL"

echo "✅ Connected to: $REPO_URL"
echo ""

echo "═══════════════════════════════════════════════════════"
echo "STEP 3: Pushing code to GitHub..."
echo "═══════════════════════════════════════════════════════"
echo ""

# Push to GitHub
git branch -M main
git push -u origin main

if [ $? -eq 0 ]; then
    # Extract username from URL
    USERNAME=$(echo "$REPO_URL" | sed -E 's|https://github.com/([^/]+)/.*|\1|')

    echo ""
    echo "═══════════════════════════════════════════════════════"
    echo "  ✅ SUCCESS! Code pushed to GitHub!"
    echo "═══════════════════════════════════════════════════════"
    echo ""
    echo "📂 Repository: https://github.com/$USERNAME/toolbox-tamil"
    echo ""
    echo "═══════════════════════════════════════════════════════"
    echo "STEP 4: Enable GitHub Pages"
    echo "═══════════════════════════════════════════════════════"
    echo ""
    echo "Opening Settings → Pages..."
    open "https://github.com/$USERNAME/toolbox-tamil/settings/pages"
    echo ""
    echo "👉 In the Pages settings:"
    echo "  1. Under 'Source', select: main"
    echo "  2. Keep folder as: / (root)"
    echo "  3. Click 'Save'"
    echo ""
    read -p "Press ENTER after clicking Save..."
    echo ""
    echo "═══════════════════════════════════════════════════════"
    echo "  🎉 WEBSITE DEPLOYED!"
    echo "═══════════════════════════════════════════════════════"
    echo ""
    echo "🌐 Your website is live at:"
    echo "   https://$USERNAME.github.io/toolbox-tamil/"
    echo ""
    echo "⏱️  First deployment takes 1-2 minutes"
    echo "   Refresh the page if it's not ready yet"
    echo ""
    echo "Opening your website..."
    sleep 3
    open "https://$USERNAME.github.io/toolbox-tamil/"
    echo ""
    echo "═══════════════════════════════════════════════════════"
    echo "  ✨ வாழ்க தமிழ்! Your site is live!"
    echo "═══════════════════════════════════════════════════════"
    echo ""
    echo "📝 To update website in future:"
    echo "   git add ."
    echo "   git commit -m 'Update: description'"
    echo "   git push origin main"
    echo ""
else
    echo ""
    echo "═══════════════════════════════════════════════════════"
    echo "  ❌ Error pushing to GitHub"
    echo "═══════════════════════════════════════════════════════"
    echo ""
    echo "Possible issues:"
    echo "  • Wrong repository URL"
    echo "  • No Git credentials configured"
    echo "  • Repository doesn't exist"
    echo ""
    echo "Try running: git push -u origin main"
    echo ""
fi
