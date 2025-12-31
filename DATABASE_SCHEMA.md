# Database Schema for My Library

## Table: `user_library`

This table stores all media items that users add to their library.

### Columns:
- `id` (uuid, primary key, default: gen_random_uuid())
- `user_id` (uuid, foreign key → auth.users.id, not null)
- `media_type` (text, not null) - 'movie', 'tv_show', 'book', 'game'
- `media_id` (text, not null) - External API ID (TMDB ID, IGDB ID, etc.)
- `title` (text, not null)
- `year` (integer) - Release/publication year
- `poster_url` (text) - Image URL
- `rating` (integer) - User rating 1-10 (nullable)
- `added_at` (timestamp, default: now())
- `updated_at` (timestamp, default: now())

### Indexes:
- `idx_user_library_user_id` on `user_id`
- `idx_user_library_media_type` on `media_type`
- `idx_user_library_user_media` on `(user_id, media_type)`

### Row Level Security (RLS):
- Users can only SELECT their own library items
- Users can only INSERT their own library items
- Users can only UPDATE their own library items
- Users can only DELETE their own library items

## SQL to Create Table:

```sql
-- Create the user_library table
CREATE TABLE IF NOT EXISTS user_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL CHECK (media_type IN ('movie', 'tv_show', 'book', 'game')),
  media_id TEXT NOT NULL,
  title TEXT NOT NULL,
  year INTEGER,
  poster_url TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 10),
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, media_type, media_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_library_user_id ON user_library(user_id);
CREATE INDEX IF NOT EXISTS idx_user_library_media_type ON user_library(media_type);
CREATE INDEX IF NOT EXISTS idx_user_library_user_media ON user_library(user_id, media_type);

-- Enable RLS
ALTER TABLE user_library ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own library
CREATE POLICY "Users can view own library"
ON user_library FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can add to their own library
CREATE POLICY "Users can add to own library"
ON user_library FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own library
CREATE POLICY "Users can update own library"
ON user_library FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete from their own library
CREATE POLICY "Users can delete from own library"
ON user_library FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
```

## API Integrations:

1. **Movies & TV Shows**: The Movie Database (TMDB) API
   - Free tier available
   - Requires API key
   - Base URL: https://api.themoviedb.org/3

2. **Video Games**: IGDB (Internet Game Database) API
   - Free tier available (with Twitch account)
   - Requires Client ID and Client Secret
   - Base URL: https://api.igdb.com/v4

3. **Books**: Open Library API
   - Completely free, no API key required
   - Base URL: https://openlibrary.org

