# 🚀 ToolBox Tamil - Quick Start

## Option 1: Automated Setup (Recommended)

Run the setup script that will guide you through everything:

```bash
cd /Volumes/Ai-Enneagram/Dorvin/toolbox-tamil
./setup-github.sh
```

The script will:
1. ✅ Open GitHub to create repository
2. ✅ Connect your local code to GitHub
3. ✅ Push all files to GitHub
4. ✅ Guide you to enable GitHub Pages
5. ✅ Open your live website

**Total time: 5 minutes!**

## Option 2: Manual Setup

If you prefer to do it manually:

### Step 1: Create GitHub Repository
1. Go to https://github.com/new
2. Repository name: `toolbox-tamil`
3. Description: `ToolBox Tamil - Free online tools for Tamil community 🇮🇳`
4. Visibility: **Public**
5. Click "Create repository"

### Step 2: Push to GitHub
```bash
cd /Volumes/Ai-Enneagram/Dorvin/toolbox-tamil

# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/toolbox-tamil.git
git branch -M main
git push -u origin main
```

### Step 3: Enable GitHub Pages
1. Go to repository Settings → Pages
2. Source: Branch `main`, Folder `/` (root)
3. Click "Save"
4. Wait 1-2 minutes

### Step 4: Access Website
Your website will be live at:
```
https://YOUR_USERNAME.github.io/toolbox-tamil/
```

## 📁 Project Location
```
/Volumes/Ai-Enneagram/Dorvin/toolbox-tamil/
```

## 🌐 Test Locally
```bash
cd /Volumes/Ai-Enneagram/Dorvin/toolbox-tamil
python3 -m http.server 8080
# Open: http://localhost:8080
```

## 📝 Update Website
After making changes:
```bash
git add .
git commit -m "Update: your changes description"
git push origin main
```

Website updates automatically in 1-2 minutes!

## ℹ️ More Help
- See `DEPLOY.md` for detailed instructions
- See `README.md` for project documentation

## 🎉 You're All Set!

Once live, your ToolBox Tamil will be:
- ✅ Accessible worldwide
- ✅ Free hosting on GitHub
- ✅ HTTPS secure
- ✅ Fast CDN delivery
- ✅ SEO friendly

**வாழ்க தமிழ்! 🇮🇳**
