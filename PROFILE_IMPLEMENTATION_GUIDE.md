# Profile Feature Implementation Guide

This guide explains how the profile update functionality works in your Archivum app.

## Overview

The profile feature allows users to:
- Update their **username** (required, min 3 characters)
- Update their **display name** (optional)
- Add/edit their **bio** (optional, max 200 characters)
- Upload and update their **profile picture** (JPG, PNG, GIF, max 2MB)

## Architecture

### 1. **Supabase Storage** (for profile pictures)
- Profile pictures are stored in a Supabase Storage bucket called `avatars`
- Each image is named using the pattern: `{user_id}-{timestamp}.{extension}`
- Images are stored in the `avatars/` folder
- Public URLs are generated for easy access

### 2. **Supabase Auth User Metadata** (for profile data)
- Username, display name, and bio are stored in Supabase Auth's `user_metadata`
- This is part of the user object and automatically synced
- No separate database table needed for basic profile info

### 3. **React Context** (AuthContext)
- Manages user state and provides profile update functions
- Functions: `updateProfile()`, `uploadProfilePicture()`

## Step-by-Step Implementation

### Step 1: Set Up Supabase Storage Bucket

**You need to create the storage bucket in your Supabase dashboard:**

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the sidebar
3. Click **New bucket**
4. Name it: `avatars`
5. Make it **Public** (so profile pictures can be viewed)
6. Click **Create bucket**

**Set up bucket policies (Row Level Security):**
- Go to **Storage** → **Policies** for the `avatars` bucket
- Create a policy that allows:
  - **INSERT**: Authenticated users can upload their own files
  - **SELECT**: Public read access (or authenticated only)
  - **UPDATE**: Users can update their own files
  - **DELETE**: Users can delete their own files

Example policy SQL:
```sql
-- Allow authenticated users to upload their own avatars
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow public read access
CREATE POLICY "Public avatar access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

### Step 2: How Profile Updates Work

#### A. Profile Picture Upload (`uploadProfilePicture`)

**Location:** `src/contexts/AuthContext.jsx`

**Process:**
1. **File Validation:**
   - Checks file exists
   - Validates file size (max 2MB)
   - Validates file type (JPG, PNG, GIF only)

2. **File Upload:**
   - Creates unique filename: `{user_id}-{timestamp}.{extension}`
   - Uploads to `avatars/{filename}` in Supabase Storage
   - Uses `upsert: true` to replace existing files

3. **Get Public URL:**
   - Retrieves public URL from Supabase Storage
   - Updates user metadata with `avatar_url`

4. **Update User State:**
   - Updates local React state with new user data
   - Triggers re-render with new profile picture

**Code Flow:**
```javascript
// User selects file → handleImageChange() in Profile.jsx
// → uploadProfilePicture() in AuthContext.jsx
// → Supabase Storage upload
// → Update user metadata
// → Update React state
```

#### B. Profile Data Update (`updateProfile`)

**Location:** `src/contexts/AuthContext.jsx`

**Process:**
1. Takes updates object (username, full_name, bio)
2. Merges with existing user metadata
3. Calls `supabase.auth.updateUser()` with new metadata
4. Updates local user state

**Code Flow:**
```javascript
// User submits form → handleSubmit() in Profile.jsx
// → updateProfile() in AuthContext.jsx
// → Supabase Auth updateUser()
// → Update React state
```

### Step 3: Profile Component (`Profile.jsx`)

**Key Features:**

1. **Image Preview:**
   - Shows uploaded image if available
   - Falls back to user initial if no image
   - Uses `FileReader` API for instant preview before upload

2. **Form Handling:**
   - Controlled inputs with validation
   - Username required (min 3 chars)
   - Display name and bio optional
   - Bio max 200 characters

3. **User Feedback:**
   - Uses `react-hot-toast` for success/error messages
   - Loading states during upload/save
   - Disabled buttons during operations

## Key Concepts Explained

### 1. **Supabase Storage vs Database**
- **Storage**: For files (images, documents) - like AWS S3
- **Database**: For structured data (tables, rows)
- **User Metadata**: Part of Auth, for simple key-value pairs

### 2. **User Metadata**
- Stored in `user.user_metadata` object
- Automatically synced across sessions
- Good for: username, display name, bio, avatar_url
- Not good for: complex relationships, large datasets

### 3. **File Upload Process**
```
User selects file
  ↓
FileReader creates preview (instant)
  ↓
Validate file (size, type)
  ↓
Upload to Supabase Storage
  ↓
Get public URL
  ↓
Save URL to user metadata
  ↓
Update UI
```

### 4. **State Management**
- User state in `AuthContext` (global)
- Form state in `Profile` component (local)
- Preview state for image (local)

## Testing the Feature

1. **Test Profile Picture Upload:**
   - Go to `/profile`
   - Click "Change Photo"
   - Select an image (JPG, PNG, or GIF)
   - Should see preview immediately
   - Should see success toast when uploaded

2. **Test Profile Updates:**
   - Update username, display name, bio
   - Click "Save Changes"
   - Should see success toast
   - Refresh page - data should persist

3. **Test Validation:**
   - Try uploading file > 2MB → should show error
   - Try uploading non-image → should show error
   - Try username < 3 chars → should show error

## Troubleshooting

### Issue: "Bucket not found"
**Solution:** Create the `avatars` bucket in Supabase Storage dashboard

### Issue: "Permission denied"
**Solution:** Check Storage policies - ensure authenticated users can upload

### Issue: "Image not showing"
**Solution:** 
- Check if bucket is public
- Check if `avatar_url` is saved in user metadata
- Check browser console for errors

### Issue: "Profile updates not saving"
**Solution:**
- Check browser console for errors
- Verify Supabase connection
- Check user is authenticated

## Next Steps / Enhancements

1. **Image Cropping:** Add image cropping before upload
2. **Image Compression:** Compress images client-side before upload
3. **Profile Validation:** Add more validation rules
4. **Profile Viewing:** Show other users' profiles
5. **Default Avatars:** Generate default avatars for users without pictures

## Code Files Modified

1. `src/contexts/AuthContext.jsx` - Added `updateProfile()` and `uploadProfilePicture()`
2. `src/pages/Profile.jsx` - Implemented form handling and image upload
3. `src/main.jsx` - Added Toaster component for notifications
4. `src/App.css` - Added styles for avatar image display

## Environment Variables Needed

Make sure you have these in your `.env` file:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

That's it! Your profile feature is now fully functional. 🎉

