# Friends Feature Setup Guide

## Overview
The Friends feature allows users to:
- Send and receive friend requests
- Accept or decline friend requests
- View their friends list
- Search for other users by username or email
- Remove friends

## Database Setup

You need to create two tables in your Supabase database:

### 1. Friends Table

Run this SQL in your Supabase SQL Editor:

```sql
-- Create friends table
CREATE TABLE IF NOT EXISTS friends (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, friend_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_friends_user_id ON friends(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_friend_id ON friends(friend_id);
CREATE INDEX IF NOT EXISTS idx_friends_status ON friends(status);

-- Enable Row Level Security
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own friendships
CREATE POLICY "Users can view own friendships"
ON friends FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id OR 
  auth.uid() = friend_id
);

-- Policy: Users can create friend requests
CREATE POLICY "Users can create friend requests"
ON friends FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their received friend requests
CREATE POLICY "Users can update received requests"
ON friends FOR UPDATE
TO authenticated
USING (auth.uid() = friend_id)
WITH CHECK (auth.uid() = friend_id);

-- Policy: Users can delete their own friend requests or friendships
CREATE POLICY "Users can delete own friendships"
ON friends FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id OR 
  auth.uid() = friend_id
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_friends_updated_at
BEFORE UPDATE ON friends
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

### 2. User Profiles Table (Optional but Recommended)

For better user search and display, create a `user_profiles` table:

```sql
-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  email TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view profiles
CREATE POLICY "Public profiles are viewable"
ON user_profiles FOR SELECT
TO authenticated
USING (true);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
ON user_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
ON user_profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Function to sync user metadata to user_profiles
CREATE OR REPLACE FUNCTION sync_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (user_id, username, display_name, email, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    username = EXCLUDED.username,
    display_name = EXCLUDED.display_name,
    email = EXCLUDED.email,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-sync on user creation/update
CREATE TRIGGER on_auth_user_created
AFTER INSERT OR UPDATE ON auth.users
FOR EACH ROW
EXECUTE FUNCTION sync_user_profile();
```

**Note:** The user_profiles table is optional. The Friends feature will work without it, but user search will be limited.

## Features

### 1. Friends List Tab
- Shows all accepted friends
- Displays friend's avatar, name, and username
- Options to view profile or remove friend

### 2. Requests Tab
- **Received Requests**: Friend requests you've received
  - Accept or decline buttons
  - Shows request sender's info
- **Sent Requests**: Friend requests you've sent
  - Shows "Pending" status
  - Displays recipient's info

### 3. Find Friends Tab
- Search for users by username or email
- Shows user status:
  - "Add Friend" button if not connected
  - "Friends" badge if already friends
  - "Request Sent" badge if request pending
  - "Accept Request" button if they sent you a request

## How It Works

### Friend Request Flow:
1. User searches for another user
2. Clicks "Add Friend"
3. Creates a `friends` record with `status: 'pending'`
4. Recipient sees request in "Requests" tab
5. Recipient can accept (updates status to 'accepted') or decline (deletes record)

### Friend Status:
- **pending**: Friend request sent, waiting for response
- **accepted**: Both users are friends
- **rejected**: Request was declined (record deleted)

## Limitations

### User Search
The current implementation has limitations for searching users:
- Supabase doesn't provide a direct way to search all users from the client
- The search currently works with:
  - Users you've interacted with (friends, requests)
  - Users visible through existing relationships

### To Enable Full User Search:
You would need to:
1. Create a `user_profiles` table that mirrors public user info
2. Set up a database function to search users
3. Or use Supabase Admin API (requires backend)

For now, users can find each other by:
- Sharing usernames
- Searching by email (if they know it)
- Finding through mutual connections

## Testing

1. **Test Friend Request:**
   - Sign in as User A
   - Go to Friends → Find Friends
   - Search for User B's email/username
   - Click "Add Friend"
   - Sign in as User B
   - Go to Friends → Requests
   - Accept the request

2. **Test Friends List:**
   - After accepting, both users should see each other in Friends tab
   - Test removing a friend

3. **Test Request Management:**
   - Send multiple requests
   - Accept some, decline others
   - Check that sent requests show "Pending"

## Troubleshooting

### "Table friends does not exist"
- Run the SQL setup script above in Supabase SQL Editor

### "Permission denied"
- Check Row Level Security policies are set up correctly
- Verify the user is authenticated

### "Cannot search users"
- This is expected - full user search requires additional setup
- Users can still find each other through known emails/usernames

