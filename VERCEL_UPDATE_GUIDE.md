# Updating Vercel Deployment for New Folder Structure

After reorganizing the project into `frontend/` and `backend/` folders, you need to update your Vercel deployment settings.

## Option 1: Update Vercel Settings via Dashboard (Recommended)

1. **Go to your Vercel dashboard**: https://vercel.com/dashboard
2. **Select your project** (Archivum/JusBus-App)
3. **Go to Settings** → **General**
4. **Find "Root Directory"** section
5. **Set Root Directory to**: `frontend`
6. **Save changes**

This tells Vercel to treat the `frontend/` folder as the project root.

## Option 2: Move vercel.json to Root (Alternative)

If you prefer to keep vercel.json at the root level:

1. **Move vercel.json from frontend/ to root:**
   ```bash
   mv frontend/vercel.json ./vercel.json
   ```

2. **Update the vercel.json to point to frontend folder:**
   ```json
   {
     "buildCommand": "cd frontend && npm run build",
     "outputDirectory": "frontend/dist",
     "installCommand": "cd frontend && npm install"
   }
   ```

   Or set the root directory in Vercel dashboard instead (Option 1 is cleaner).

## Option 3: Use vercel.json with Root Directory Setting

Create/update `vercel.json` in the root:

```json
{
  "buildCommand": "npm run build:frontend",
  "outputDirectory": "frontend/dist",
  "installCommand": "cd frontend && npm install",
  "framework": "vite"
}
```

Then in Vercel dashboard, set Root Directory to the project root (leave blank or set to `.`).

## Environment Variables

Make sure your environment variables in Vercel are still set correctly:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_TMDB_API_KEY`
- Any other `VITE_*` variables

These are accessed by the frontend, so they should remain in Vercel's environment variables.

## After Updating

1. **Trigger a new deployment** (push a commit or manually redeploy)
2. **Check the build logs** to ensure it's using the correct directory
3. **Verify the deployment** works correctly

## Recommended Approach

**Use Option 1** (Vercel Dashboard Root Directory setting) - it's the cleanest and easiest to maintain.

