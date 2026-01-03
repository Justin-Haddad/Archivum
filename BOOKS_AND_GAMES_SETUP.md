# Books and Games Setup Guide

Your Archivum app already supports searching and adding books and games! Here's how to set them up:

## 📚 Books (Open Library API)

**Good news:** Books work out of the box! No API key needed.

The app uses the **Open Library API** which is free and doesn't require authentication. Simply:

1. Go to the "Books" tab in "My Archive"
2. Use the search bar to search for books
3. Click "Add to Archive" on any book you find

### How to search for books:
- Search by title (e.g., "The Great Gatsby")
- Search by author (e.g., "Stephen King")
- Search by ISBN

## 🎮 Video Games (IGDB API)

Video games require IGDB (Internet Game Database) API credentials. Here's how to set it up:

### Step 1: Create a Twitch Developer Account
1. Go to https://dev.twitch.tv/console
2. Sign in with your Twitch account (create one if you don't have one)
3. Click "Register Your Application"

### Step 2: Register Your Application
1. **Name**: Enter "Archivum" (or any name you prefer)
2. **OAuth Redirect URLs**: Enter `http://localhost:5173` (for local development)
3. **Category**: Select "Website Integration"
4. Click "Create"

### Step 3: Get Your Credentials
After creating the application, you'll see:
- **Client ID**: Copy this
- **Client Secret**: Click "New Secret" and copy it

### Step 4: Add to Your .env File
Open your `.env` file in the project root and add:

```env
VITE_IGDB_CLIENT_ID=your_client_id_here
VITE_IGDB_CLIENT_SECRET=your_client_secret_here
```

**Important:** 
- Never commit your `.env` file to git (it should already be in `.gitignore`)
- Restart your development server after adding the credentials

### Step 5: Test It Out
1. Restart your dev server: `npm run dev`
2. Go to the "Video Games" tab in "My Archive"
3. Use the search bar to search for games (e.g., "The Legend of Zelda")
4. Click "Add to Archive" on any game you find

## Current Status

✅ **Books**: Ready to use (no setup needed)
✅ **Movies**: Already working (using your TMDB API key)
✅ **TV Shows**: Already working (using your TMDB API key)
⏳ **Games**: Requires IGDB credentials (see steps above)

## Troubleshooting

### Books not showing results?
- Check your internet connection
- Try a different search term
- Open Library API is free but may have rate limits

### Games not showing results?
- Make sure you've added the IGDB credentials to your `.env` file
- Restart your development server after adding credentials
- Check the browser console for any error messages
- Verify your Client ID and Client Secret are correct
- Make sure there are no extra spaces in your `.env` file

## API Documentation

- **Open Library API**: https://openlibrary.org/developers/api
- **IGDB API**: https://api-docs.igdb.com/
- **Twitch Developers**: https://dev.twitch.tv/docs


