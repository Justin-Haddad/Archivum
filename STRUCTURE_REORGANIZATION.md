# File Structure Reorganization

The project has been reorganized into `frontend/` and `backend/` folders for better organization.

## What Changed

### Frontend Files (moved to `frontend/`)
- `src/` - All React components, pages, contexts, CSS
- `public/` - Static assets (video, images)
- `index.html` - HTML entry point
- `vite.config.js` - Vite configuration
- `eslint.config.js` - ESLint configuration
- `vercel.json` - Vercel deployment config (frontend)
- `package.json` - Frontend dependencies

### Backend Files (moved to `backend/`)
- `proxy-server.js` - Express CORS proxy server
- `package.json` - Backend dependencies (express, cors, dotenv)

### Root Level (shared/config)
- Root `package.json` - Workspace scripts to manage both frontend and backend
- All `.md` documentation files
- SQL files
- `.gitignore`
- `README.md`

## Next Steps

1. **Install dependencies in each folder:**
   ```bash
   npm run install:all
   ```

2. **Move environment variables:**
   - Copy `.env` to `frontend/.env` (if it exists)
   - Copy `.env` to `backend/.env` (if it exists, or create one for backend-specific vars)

3. **Update Vercel deployment:**
   - If deploying to Vercel, you may need to update the build settings to point to `frontend/` directory
   - Update `vercel.json` path references if needed

4. **Update any scripts or documentation** that reference the old file paths

## Running the Application

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Backend (if needed):**
```bash
cd backend
npm install
npm run dev
```

**From root (using workspace scripts):**
```bash
npm run dev:frontend  # Start frontend
npm run dev:backend   # Start backend
```

