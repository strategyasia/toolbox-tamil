# 🚀 Deploy ToolBox Tamil to GitHub Pages

## Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com) and login with your account (vinsonde@me.com)
2. Click the **"+"** icon in the top right corner
3. Select **"New repository"**
4. Fill in the details:
   - **Repository name:** `toolbox-tamil`
   - **Description:** `ToolBox Tamil - Free online tools for everyone. Universal utilities + special tools for Tamil community 🇮🇳`
   - **Visibility:** Public ✅
   - **DO NOT** initialize with README (we already have one)
5. Click **"Create repository"**

## Step 2: Push to GitHub

After creating the repository, GitHub will show you commands. Use these:

```bash
cd /Volumes/Ai-Enneagram/Dorvin/toolbox-tamil

# Add GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/toolbox-tamil.git

# Or if you prefer SSH:
# git remote add origin git@github.com:YOUR_USERNAME/toolbox-tamil.git

# Push to GitHub
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

## Step 3: Enable GitHub Pages

1. Go to your repository: `https://github.com/YOUR_USERNAME/toolbox-tamil`
2. Click **"Settings"** tab
3. Scroll down to **"Pages"** section in the left sidebar
4. Under **"Source"**, select:
   - Branch: `main`
   - Folder: `/ (root)`
5. Click **"Save"**
6. Wait 1-2 minutes for deployment

## Step 4: Access Your Website

Your website will be live at:
```
https://YOUR_USERNAME.github.io/toolbox-tamil/
```

## 🎉 That's it!

Your ToolBox Tamil is now live and accessible to everyone worldwide!

## Useful Git Commands

```bash
# Check status
git status

# Add new changes
git add .

# Commit changes
git commit -m "Update: description of changes"

# Push to GitHub
git push origin main

# View commit history
git log --oneline

# Check remote
git remote -v
```

## Update Website

To update the website after making changes:

```bash
cd /Volumes/Ai-Enneagram/Dorvin/toolbox-tamil

# Add changes
git add .

# Commit with message
git commit -m "Update: added new features"

# Push to GitHub (automatically updates website)
git push origin main
```

GitHub Pages will automatically rebuild your site within 1-2 minutes.

## Custom Domain (Optional)

If you want to use your own domain:

1. Buy a domain (e.g., toolboxtamil.com)
2. In repository Settings → Pages → Custom domain
3. Enter your domain name
4. Add DNS records at your domain provider:
   ```
   Type: CNAME
   Name: www
   Value: YOUR_USERNAME.github.io
   ```

## Troubleshooting

**Problem:** Website not loading after enabling Pages
**Solution:** Wait 2-3 minutes, then clear browser cache and try again

**Problem:** Changes not showing on website
**Solution:**
- Check commit was pushed: `git log --oneline`
- Wait 1-2 minutes for GitHub to rebuild
- Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)

**Problem:** CSS/JS not loading
**Solution:** Make sure all file paths in HTML are relative (not absolute)

## Share Your Website

Once live, share with Tamil community:
- Twitter/X
- Facebook
- WhatsApp
- LinkedIn
- Tamil forums and communities

**வாழ்க தமிழ்! 🇮🇳**

Made with ❤️ for Tamil people worldwide
