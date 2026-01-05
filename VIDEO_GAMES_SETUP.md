# Video Games Setup Guide

This guide will help you set up the video games functionality using the IGDB (Internet Game Database) API.

## Prerequisites

1. **IGDB API Credentials**: You need a Twitch Developer account to get IGDB API credentials
   - Go to https://dev.twitch.tv/console/apps
   - Create a new application
   - Note your **Client ID** and **Client Secret**

## Step 1: Add Environment Variables

Add these to your `frontend/.env` file:

```env
VITE_IGDB_CLIENT_ID=your_client_id_here
VITE_IGDB_CLIENT_SECRET=your_client_secret_here
VITE_CORS_PROXY=http://localhost:3001/proxy
```

**Important**: The `VITE_CORS_PROXY` is required because IGDB API blocks direct browser requests due to CORS restrictions.

## Step 2: Install Backend Dependencies

The proxy server is in the `backend/` folder. Make sure dependencies are installed:

```bash
cd backend
npm install
```

## Step 3: Start the Proxy Server

In a separate terminal, start the proxy server:

```bash
cd backend
npm run dev
```

You should see:
```
CORS proxy server running on http://localhost:3001
```

**Keep this terminal running** while you're developing. The proxy server needs to be running for game searches and game detail pages to work.

## Step 4: Start Your Frontend

In another terminal, start your frontend:

```bash
cd frontend
npm run dev
```

## Step 5: Test Game Search

1. Go to your Library page (`/library`)
2. Select the "Video Games" tab
3. Search for a game (e.g., "The Witcher 3", "Elden Ring", "Minecraft")
4. You should see game results appear

## Step 6: Test Game Details

1. Click on any game from the search results
2. You should see a detailed page with:
   - Game cover image
   - Release date
   - Genres
   - Platforms
   - Developers
   - Publishers
   - Ratings (IGDB and Critic ratings)
   - Official website links

## Troubleshooting

### Issue: "Failed to fetch" error when searching games

**Solution**: Make sure the proxy server is running:
```bash
cd backend
npm run dev
```

### Issue: "IGDB credentials not set" error

**Solution**: 
1. Check that `VITE_IGDB_CLIENT_ID` and `VITE_IGDB_CLIENT_SECRET` are in your `frontend/.env` file
2. Make sure the `.env` file is in the `frontend/` directory (not the root)
3. Restart your frontend dev server after adding environment variables

### Issue: "Failed to connect to proxy server" error

**Solution**:
1. Make sure the proxy server is running on port 3001
2. Check that `VITE_CORS_PROXY=http://localhost:3001/proxy` is in your `frontend/.env` file
3. Try accessing `http://localhost:3001` in your browser - you should see a response (or an error page, but not a connection refused)

### Issue: "Invalid credentials" error

**Solution**:
1. Double-check your Client ID and Client Secret from Twitch Developer Console
2. Make sure there are no extra spaces or quotes in your `.env` file
3. The credentials should be on separate lines:
   ```
   VITE_IGDB_CLIENT_ID=abc123
   VITE_IGDB_CLIENT_SECRET=xyz789
   ```

### Issue: Games appear but clicking them shows an error

**Solution**: This was likely a CORS issue with `getGameDetails`. The function has been updated to use the proxy server. Make sure:
1. The proxy server is running
2. You've restarted your frontend after the code changes

## How It Works

1. **IGDB API**: Requires Twitch OAuth authentication
2. **CORS Proxy**: Since browsers block direct requests to IGDB, we use a local Node.js proxy server
3. **Token Caching**: Access tokens are cached to avoid unnecessary requests
4. **Multiple API Calls**: Game details require multiple API calls to fetch genres, platforms, developers, publishers, and websites

## Production Deployment

For production, you'll need to:
1. Deploy the proxy server (e.g., on Heroku, Railway, or similar)
2. Update `VITE_CORS_PROXY` to point to your production proxy URL
3. Make sure your production proxy server has CORS enabled for your frontend domain

## Notes

- The proxy server must be running for games to work
- IGDB API has rate limits - be mindful of excessive requests
- Game images are hosted by IGDB and may take a moment to load

