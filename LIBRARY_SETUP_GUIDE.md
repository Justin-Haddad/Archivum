# Library Feature Setup Guide

This guide will help you set up the "My Library" feature with API integrations.

## Prerequisites

1. **Supabase Database Setup**
   - You need to create the `user_library` table in your Supabase database
   - See `DATABASE_SCHEMA.md` for the SQL commands

2. **API Keys** (Optional but recommended)
   - TMDB API key (for Movies & TV Shows)
   - IGDB credentials (for Video Games)
   - Open Library (no key needed for Books)

## Step 1: Create Database Table

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the SQL from `DATABASE_SCHEMA.md`
4. Run the SQL to create the table and policies

## Step 2: Get API Keys

### TMDB (The Movie Database) - Movies & TV Shows

1. Go to https://www.themoviedb.org/
2. Sign up for a free account
3. Go to Settings → API
4. Request an API key (free tier available)
5. Copy your API key

### IGDB (Internet Game Database) - Video Games

1. Go to https://www.igdb.com/
2. Sign up for a free account (uses Twitch account)
3. Go to https://dev.twitch.tv/console/apps
4. Create a new application
5. Copy your **Client ID** and **Client Secret**

### Open Library - Books

- **No API key needed!** It's completely free and open.

## Step 3: Add API Keys to Environment Variables

1. Create or edit your `.env` file in the project root:

```env
# Supabase (you should already have these)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# TMDB API
VITE_TMDB_API_KEY=your_tmdb_api_key

# IGDB API (for games)
VITE_IGDB_CLIENT_ID=your_igdb_client_id
VITE_IGDB_CLIENT_SECRET=your_igdb_client_secret
```

2. **Restart your dev server** after adding environment variables:
   ```bash
   npm run dev
   ```

## Step 4: Test the Feature

1. **Without API Keys:**
   - Books will work (Open Library doesn't need keys)
   - Movies, TV Shows, and Games will show warnings but won't break

2. **With API Keys:**
   - All media types will work
   - Search will return real results
   - You can add items to your library
   - You can rate items 1-10 stars

## Features

### ✅ What Works Now:

1. **Search Media:**
   - Search for movies, TV shows, books, and games
   - Results display with posters/images
   - Click "Add to Library" to save

2. **Manage Library:**
   - View all your saved media by type
   - Remove items from library
   - Rate items from 1-10 stars
   - See your ratings on library items

3. **Organized by Type:**
   - Separate tabs for Movies, TV Shows, Books, Games
   - Each tab shows count of items
   - Easy navigation between types

### 🚧 What's Not Implemented Yet:

- Editing existing ratings (you can re-rate by clicking stars)
- Sorting/filtering library items
- Bulk operations
- Media details pages
- Reviews/comments
- Sharing library with friends

## Troubleshooting

### "No results found"
- Check if API keys are set correctly
- Check browser console for errors
- Verify API keys are valid
- For IGDB, make sure you've created a Twitch application

### "Error searching"
- Check network tab in browser DevTools
- Verify API keys in `.env` file
- Make sure dev server was restarted after adding keys

### Database errors
- Make sure you've run the SQL from `DATABASE_SCHEMA.md`
- Check Row Level Security policies are set up
- Verify you're logged in

### Images not loading
- Some APIs may have rate limits
- Check if image URLs are valid
- Some media may not have posters (fallback icons will show)

## API Rate Limits

- **TMDB**: 40 requests per 10 seconds (free tier)
- **IGDB**: 4 requests per second (free tier)
- **Open Library**: No official limit, but be respectful

## Next Steps

Once this is working, you can:
1. Add more features (reviews, lists, etc.)
2. Improve search (filters, sorting)
3. Add media details pages
4. Implement social features (sharing, friends)

Enjoy building your media library! 🎬📺📖🎮

