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

