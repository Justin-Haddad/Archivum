# Profile Privacy Feature Guide

## Overview

The profile page now includes privacy settings that control who can see your media statistics and archive. Currently, this affects your own profile view, but the setting is stored and will be used when viewing other users' profiles in the future.

## Features Implemented

### 1. View Mode (Default)
- Displays your profile picture, username, display name, and bio
- Shows media statistics (movies, books, TV shows, games)
- Displays total media count
- Includes a link to your archive
- Shows privacy badge (Public/Private)
- "Edit Profile" button to switch to edit mode

### 2. Edit Mode
- Click "Edit Profile" button to enter edit mode
- Update profile picture, username, display name, bio
- Toggle privacy setting:
  - **Public**: Friends can see your stats and archive
  - **Private**: Only you can see your stats and archive
- Save or cancel changes

### 3. Media Statistics
The profile automatically calculates and displays:
- Number of movies watched
- Number of TV shows watched
- Number of books read
- Number of games played
- Total media count

These stats are calculated from your library in real-time.

## Privacy Setting Storage

The privacy setting is stored in the user's metadata as `is_private` (boolean):
- `false` = Public (default)
- `true` = Private

## Current Behavior

Since the current Profile page (`/profile`) shows your own profile:
- **You always see everything** regardless of privacy setting
- Privacy setting is saved and will be used when other users view your profile

## Future Enhancements

To support viewing other users' profiles:
1. Add route parameter: `/profile/:userId`
2. Check friendship status between viewer and profile owner
3. Apply privacy rules:
   - If profile is **Public**: Friends can see stats and archive
   - If profile is **Private**: Only profile owner can see stats and archive
   - If not friends: Hide stats and archive regardless of privacy setting

## Database Notes

The privacy setting is currently stored in `user.user_metadata.is_private`. 

If you want to store it in the `user_profiles` table instead (recommended for future scalability), you would need to:

1. Add `is_private` column to `user_profiles` table:
```sql
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT false;
```

2. Update the Profile component to read/write from `user_profiles` table instead of user_metadata

3. Sync privacy setting between user_metadata and user_profiles table

