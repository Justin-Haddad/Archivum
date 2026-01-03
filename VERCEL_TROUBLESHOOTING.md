# Vercel Deployment Troubleshooting - Blank Page Fix

## Common Causes of Blank Page on Vercel

### 1. Missing Environment Variables (Most Likely Issue)

Your app requires Supabase environment variables. If they're missing, the app will throw an error and show a blank page.

**Fix:**
1. Go to your Vercel project dashboard
2. Click on **Settings** → **Environment Variables**
3. Add these two variables:
   - `VITE_SUPABASE_URL` = Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = Your Supabase anon/public key

4. **Important:** After adding variables, you need to **redeploy**:
   - Go to **Deployments** tab
   - Click the **⋯** (three dots) on the latest deployment
   - Click **Redeploy**

### 2. Build Errors

Check if the build is failing:
1. Go to **Deployments** tab in Vercel
2. Click on the failed deployment
3. Check the **Build Logs** for errors

**Common build errors:**
- Missing dependencies
- TypeScript errors
- ESLint errors

**Fix:** Run `npm run build` locally to test:
```bash
npm run build
```

If it fails locally, fix the errors before deploying.

### 3. Browser Console Errors

1. Open your deployed site
2. Open browser DevTools (F12)
3. Check the **Console** tab for JavaScript errors
4. Check the **Network** tab for failed requests

### 4. Routing Issues

Your app uses React Router. Make sure `vercel.json` has the correct rewrite rules (already configured).

### 5. Check Vercel Build Logs

1. Go to Vercel dashboard → Your project
2. Click on the deployment
3. Check **Build Logs** for any errors or warnings

## Quick Fix Checklist

- [ ] Added `VITE_SUPABASE_URL` to Vercel environment variables
- [ ] Added `VITE_SUPABASE_ANON_KEY` to Vercel environment variables
- [ ] Redeployed after adding environment variables
- [ ] Checked build logs for errors
- [ ] Tested `npm run build` locally (works without errors)
- [ ] Checked browser console for JavaScript errors

## Testing Locally Before Deploying

Test your production build locally:
```bash
npm run build
npm run preview
```

This will show you if there are any build issues before deploying to Vercel.

## Getting Your Supabase Keys

1. Go to [supabase.com](https://supabase.com)
2. Open your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → Use for `VITE_SUPABASE_URL`
   - **anon/public key** → Use for `VITE_SUPABASE_ANON_KEY`

## Still Not Working?

1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify environment variables are set correctly
4. Make sure you redeployed after adding variables
5. Try clearing Vercel cache and redeploying


