# Vercel Deployment Guide for Archivum

## 🚀 Should You Deploy Now or Wait?

### ✅ **Deploy Now** (Recommended!)

**Reasons:**

- Test your app in a production environment
- Share with friends/family for feedback
- Catch deployment issues early
- Learn the deployment process
- Your app is already functional (auth, library, profile)

**What works now:**

- ✅ User authentication
- ✅ Profile management
- ✅ Library feature (with database)
- ✅ Search functionality (with API keys)

**What you can add later:**

- More features
- Better styling
- Additional pages

### ⏳ **Wait if:**

- You want everything perfect first (not recommended - you'll never deploy!)
- You're not ready to share it yet

**Recommendation: Deploy now!** You can always update it later.

---

## 📋 Pre-Deployment Checklist

Before deploying, make sure:

- [ ] Your code is working locally (`npm run dev`)
- [ ] You have a GitHub account (or GitLab/Bitbucket)
- [ ] Your project is in a Git repository
- [ ] Environment variables are documented (you'll add them in Vercel)

---

## 🚀 Step-by-Step Deployment

### Step 1: Push Your Code to GitHub

1. **Initialize Git** (if not already done):

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Create a GitHub repository:**

   - Go to https://github.com/new
   - Name it (e.g., `archivum`)
   - Don't initialize with README (you already have files)
   - Click "Create repository"

3. **Push your code:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/archivum.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Sign Up for Vercel

1. Go to https://vercel.com
2. Click "Sign Up"
3. Sign up with GitHub (easiest option)
4. Authorize Vercel to access your GitHub

### Step 3: Deploy Your Project

1. **Import Project:**

   - Click "Add New..." → "Project"
   - Select your `archivum` repository
   - Click "Import"

2. **Configure Project:**

   - **Framework Preset:** Vite (should auto-detect)
   - **Root Directory:** `./` (leave as is)
   - **Build Command:** `npm run build` (should auto-fill)
   - **Output Directory:** `dist` (should auto-fill)
   - **Install Command:** `npm install` (should auto-fill)

3. **Add Environment Variables:**
   This is **CRITICAL**! Add all your `.env` variables:

   Click "Environment Variables" and add:

   ```
   VITE_SUPABASE_URL = your_supabase_url
   VITE_SUPABASE_ANON_KEY = your_supabase_anon_key
   VITE_TMDB_API_KEY = your_tmdb_api_key (if you have it)
   VITE_IGDB_CLIENT_ID = your_igdb_client_id (if you have it)
   VITE_IGDB_CLIENT_SECRET = your_igdb_client_secret (if you have it)
   ```

   **Important:**

   - Use the **exact same names** as in your `.env` file
   - Don't include quotes around values
   - Add them for all environments (Production, Preview, Development)

4. **Deploy:**
   - Click "Deploy"
   - Wait 1-2 minutes for build to complete
   - Your app will be live! 🎉

### Step 4: Get Your Live URL

- Vercel will give you a URL like: `archivum.vercel.app`
- You can also add a custom domain later

---

## 🔧 Post-Deployment Configuration

### 1. Update Supabase Redirect URLs

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **URL Configuration**
3. Add your Vercel URL to **Redirect URLs:**
   ```
   https://your-app.vercel.app
   https://your-app.vercel.app/**
   ```

### 2. Test Your Live Site

- ✅ Test authentication (sign up, sign in)
- ✅ Test profile updates
- ✅ Test library features
- ✅ Test search (if API keys are set)

### 3. Set Up Custom Domain (Optional)

1. In Vercel dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add your domain
4. Follow DNS configuration instructions

---

## 🔄 Updating Your Deployment

Every time you push to GitHub:

1. **Push your changes:**

   ```bash
   git add .
   git commit -m "Your update message"
   git push
   ```

2. **Vercel automatically:**

   - Detects the push
   - Builds your app
   - Deploys the new version
   - Usually takes 1-2 minutes

3. **Preview Deployments:**
   - Vercel creates preview URLs for pull requests
   - Test changes before merging to main

---

## 🛠️ Troubleshooting

### Build Fails

**Error: "Module not found"**

- Make sure all dependencies are in `package.json`
- Run `npm install` locally to verify

**Error: "Environment variable not found"**

- Check that all `VITE_*` variables are added in Vercel
- Make sure variable names match exactly

**Error: "Build command failed"**

- Check build logs in Vercel dashboard
- Try building locally: `npm run build`

### App Works Locally But Not on Vercel

1. **Check environment variables:**

   - Are they all added in Vercel?
   - Are the names correct?
   - Did you redeploy after adding them?

2. **Check browser console:**

   - Open your live site
   - Press F12 → Console
   - Look for errors

3. **Check Supabase CORS:**
   - Make sure your Vercel URL is allowed
   - Check Supabase dashboard → Settings → API

### Routing Issues (404 on refresh)

- The `vercel.json` file I created should fix this
- It rewrites all routes to `index.html` for React Router

---

## 📝 Important Notes

### Security

- ✅ Never commit `.env` file (should be in `.gitignore`)
- ✅ Environment variables in Vercel are encrypted
- ✅ API keys are safe in Vercel's environment variables

### Performance

- Vercel automatically:
  - Optimizes your build
  - Serves from CDN (fast worldwide)
  - Handles caching
  - Provides SSL certificates

### Free Tier Limits

Vercel's free tier includes:

- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Automatic SSL
- ✅ Custom domains
- ✅ Preview deployments

---

## 🎯 Quick Reference

**Deploy Command:**

```bash
# Just push to GitHub - Vercel auto-deploys!
git push
```

**View Deployments:**

- Go to https://vercel.com/dashboard
- Click your project
- See all deployments and logs

**Update Environment Variables:**

- Vercel Dashboard → Your Project → Settings → Environment Variables
- Changes require redeployment

---

## ✅ You're Ready!

Your app is ready to deploy. Follow the steps above and you'll have a live website in minutes!

**Need help?** Check Vercel's docs: https://vercel.com/docs
