# GitHub Setup Guide for Archivum

## 🔍 Current Status

**Git is NOT initialized yet** - Your project isn't connected to GitHub.

---

## 🚀 Quick Setup Steps

### Step 1: Initialize Git

Open your terminal in the project directory and run:

```bash
cd /Users/justinhaddad/JusBus-App
git init
```

### Step 2: Create Your First Commit

```bash
# Add all files
git add .

# Create your first commit
git commit -m "Initial commit: Archivum app with auth, library, and profile features"
```

### Step 3: Create GitHub Repository

1. Go to https://github.com/new
2. **Repository name:** `archivum` (or whatever you prefer)
3. **Description:** "Personal media tracking app - Movies, TV Shows, Books, Games"
4. **Visibility:** 
   - Choose **Public** (if you want to share/showcase)
   - Choose **Private** (if you want it private)
5. **DO NOT** check:
   - ❌ "Add a README file" (you already have one)
   - ❌ "Add .gitignore" (you already have one)
   - ❌ "Choose a license" (optional, can add later)
6. Click **"Create repository"**

### Step 4: Connect Your Local Project to GitHub

After creating the repository, GitHub will show you commands. Use these:

```bash
# Add the remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/archivum.git

# Rename branch to main (if needed)
git branch -M main

# Push your code
git push -u origin main
```

You'll be prompted for your GitHub username and password (or use a Personal Access Token).

---

## 🔐 Authentication Options

### Option 1: Personal Access Token (Recommended)

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a name: "Archivum"
4. Select scopes: Check `repo` (full control of private repositories)
5. Click "Generate token"
6. **Copy the token** (you won't see it again!)
7. When pushing, use the token as your password

### Option 2: SSH Key (More Secure)

1. Generate SSH key:
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```
2. Add to GitHub:
   - Copy your public key: `cat ~/.ssh/id_ed25519.pub`
   - Go to GitHub → Settings → SSH and GPG keys → New SSH key
   - Paste and save
3. Use SSH URL instead:
   ```bash
   git remote add origin git@github.com:YOUR_USERNAME/archivum.git
   ```

---

## ✅ Verify Connection

After pushing, verify it worked:

```bash
# Check remote
git remote -v

# Should show:
# origin  https://github.com/YOUR_USERNAME/archivum.git (fetch)
# origin  https://github.com/YOUR_USERNAME/archivum.git (push)
```

Then check GitHub - you should see all your files!

---

## 📝 Future Updates

After initial setup, to update GitHub:

```bash
# Make your changes, then:
git add .
git commit -m "Description of your changes"
git push
```

---

## 🚨 Important: Before Pushing

Make sure your `.env` file is in `.gitignore` (it already is! ✅)

**Never commit:**
- ❌ `.env` files
- ❌ `node_modules/`
- ❌ API keys
- ❌ Personal credentials

Your `.gitignore` already has these covered! ✅

---

## 🎯 Quick Command Reference

```bash
# Initialize Git
git init

# Add all files
git add .

# Commit
git commit -m "Your message"

# Connect to GitHub (first time)
git remote add origin https://github.com/YOUR_USERNAME/archivum.git
git branch -M main
git push -u origin main

# Future updates
git add .
git commit -m "Update message"
git push
```

---

## ❓ Troubleshooting

### "Repository not found"
- Check your GitHub username is correct
- Make sure the repository exists on GitHub
- Verify you have access (if it's a private repo)

### "Authentication failed"
- Use Personal Access Token instead of password
- Or set up SSH keys

### "Permission denied"
- Check you're logged into GitHub
- Verify repository name matches

---

## ✅ Once Connected

After this setup:
1. ✅ Your code will be on GitHub
2. ✅ You can deploy to Vercel
3. ✅ You can collaborate with others
4. ✅ You have version control

**Then proceed with Vercel deployment!** 🚀

