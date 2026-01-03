# IGDB API CORS Issue - Solution Guide

## The Problem
IGDB API v4 blocks direct browser requests due to CORS (Cross-Origin Resource Sharing) restrictions. This causes a "Failed to fetch" error when trying to search for games from the browser.

## Solutions

### Option 1: Use a CORS Proxy (Quick Fix for Development Only)

1. Add to your `.env` file:
```env
VITE_CORS_PROXY=https://api.allorigins.win/raw?url=
```

2. Restart your dev server

**⚠️ Warning**: Public CORS proxies are unreliable and should NOT be used in production. They can be slow, have rate limits, and may expose your API keys.

### Option 2: Create a Backend Proxy (Recommended for Production)

Create a simple backend server (Node.js/Express) that proxies requests to IGDB:

**Example backend route (Node.js/Express):**
```javascript
app.post('/api/igdb/games', async (req, res) => {
  const token = await getIGDBAccessToken() // Your token logic
  const response = await fetch('https://api.igdb.com/v4/games', {
    method: 'POST',
    headers: {
      'Client-ID': process.env.IGDB_CLIENT_ID,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'text/plain',
    },
    body: req.body,
  })
  const data = await response.json()
  res.json(data)
})
```

Then update `src/lib/api.js` to use your backend URL instead of direct IGDB calls.

### Option 3: Use Vercel Serverless Functions (If Deploying to Vercel)

Create `api/igdb/games.js`:
```javascript
export default async function handler(req, res) {
  // Get token and proxy request to IGDB
  // Return JSON response
}
```

### Current Status
The code is set up to use a CORS proxy if `VITE_CORS_PROXY` is set in your `.env` file. If not set, it will try direct requests (which will fail due to CORS).

## Testing
1. Make sure your IGDB credentials are in `.env`
2. Optionally add `VITE_CORS_PROXY` for development
3. Restart your dev server
4. Try searching for a game

## For Production
You MUST set up a backend proxy. Never use public CORS proxies in production.

