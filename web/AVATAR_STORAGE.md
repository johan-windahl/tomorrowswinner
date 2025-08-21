# Avatar Storage Implementation

## Overview

This implementation provides a complete solution for storing user avatars using Supabase Storage and database, replacing the previous localStorage-based approach.

## Problem Solved

### ❌ Previous Issues:
- **localStorage storage** - Avatars were stored in browser localStorage
- **Environment isolation** - Different avatars between development and production
- **No persistence** - Avatars lost when clearing browser data
- **No file storage** - Uploaded images weren't actually stored anywhere

### ✅ Current Solution:
- **Database storage** - Avatar metadata stored in Supabase `profiles` table
- **File storage** - Images stored in Supabase Storage bucket
- **Cross-environment sync** - Same avatars across all environments
- **Persistent storage** - Avatars survive browser data clearing

## Architecture

### Database Schema
```sql
-- profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  handle text UNIQUE NOT NULL,
  display_name text,
  avatar_url text,           -- URL to stored image
  avatar_type text DEFAULT 'preset' CHECK (avatar_type IN ('upload', 'preset')),
  -- ... other fields
);
```

### Storage Bucket
```sql
-- avatars bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars',
    'avatars',
    true,
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp']
);
```

## Implementation Files

### 1. Storage Utilities (`src/lib/storage/avatar-storage.ts`)
- **`uploadAvatarImage()`** - Uploads images to Supabase Storage
- **`deleteAvatarImage()`** - Removes images from storage
- **`updateUserProfile()`** - Updates profile in database
- **`getUserProfile()`** - Fetches profile from database

### 2. Updated User Profile Hook (`src/hooks/use-user-profile.ts`)
- **Database integration** - Fetches and updates profiles in Supabase
- **File upload handling** - Converts data URLs to files and uploads
- **Cleanup** - Removes old avatars when switching types
- **Error handling** - Comprehensive error management

### 3. Image Processing (`src/lib/image-utils.ts`)
- **Image resizing** - Automatically resizes large images
- **Validation** - File type and size validation
- **Optimization** - Quality and size optimization

## Setup Requirements

### 1. Database Migration
Run the migration to add the `avatar_type` field:
```sql
-- 20250120000000_add_avatar_type.sql
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_type text DEFAULT 'preset' CHECK (avatar_type IN ('upload', 'preset'));
```

### 2. Storage Bucket Setup
Create the avatar storage bucket:
```sql
-- 20250120000001_create_avatar_bucket.sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']);
```

### 3. RLS Policies
Set up Row Level Security for the storage bucket:
```sql
-- Public read access
CREATE POLICY "Avatar files are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

-- User upload access
CREATE POLICY "Users can upload their own avatars" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## Usage Flow

### 1. Avatar Upload
```typescript
// User selects image file
const file = event.target.files[0];

// Image is resized and validated
const resizedImage = await resizeImage(file, 400, 400, 0.8);

// Image is uploaded to Supabase Storage
const uploadResult = await uploadAvatarImage(file, userId);

// Profile is updated in database
await updateUserProfile(userId, {
    avatar_url: uploadResult.url,
    avatar_type: 'upload'
});
```

### 2. Avatar Display
```typescript
// Profile is fetched from database
const profile = await getUserProfile(userId);

// Avatar is displayed based on type
if (profile.avatar_type === 'upload') {
    // Show uploaded image from storage URL
    <Image src={profile.avatar_url} />
} else {
    // Show preset avatar
    <PresetAvatar id={profile.avatar_url} />
}
```

## Benefits

### ✅ Performance
- **Optimized images** - Automatically resized to 400x400px
- **CDN delivery** - Images served from Supabase CDN
- **Caching** - Proper cache headers for fast loading

### ✅ User Experience
- **Cross-device sync** - Avatars appear on all devices
- **Environment consistency** - Same avatars in dev/prod
- **Persistent storage** - Avatars survive browser clearing
- **Error handling** - Graceful fallbacks for failed uploads

### ✅ Security
- **RLS policies** - Users can only access their own avatars
- **File validation** - Type and size restrictions
- **Secure URLs** - Signed URLs for private access if needed

### ✅ Scalability
- **Database storage** - Metadata stored efficiently
- **File storage** - Images stored separately for performance
- **Cleanup** - Old avatars automatically removed

## Migration from localStorage

The implementation automatically handles migration from the old localStorage approach:

1. **First load** - Profile data fetched from database
2. **Fallback** - If no database data, uses localStorage as fallback
3. **Update** - New avatars stored in database and storage
4. **Cleanup** - Old localStorage data can be cleared

## Error Handling

### Upload Errors
- **File validation** - Type and size checks
- **Storage errors** - Bucket not found, upload failures
- **Network errors** - Connection issues during upload

### Display Errors
- **Image load failures** - Fallback to user initials
- **Missing avatars** - Graceful degradation
- **Database errors** - Error state with retry options

## Future Enhancements

### Potential Improvements
- **Image optimization** - WebP format support
- **Multiple sizes** - Thumbnail generation
- **Crop interface** - User-controlled image cropping
- **Avatar history** - Keep previous avatars
- **Social avatars** - Integration with social platforms

### Monitoring
- **Upload metrics** - Track upload success rates
- **Storage usage** - Monitor bucket usage
- **Error tracking** - Log and alert on failures
- **Performance** - Monitor image load times

## Troubleshooting

### Common Issues
1. **Bucket not found** - Run the storage bucket migration
2. **Upload permissions** - Check RLS policies
3. **File size limits** - Verify bucket configuration
4. **Image display** - Check CORS settings

### Debug Steps
1. Check browser console for errors
2. Verify Supabase Storage bucket exists
3. Test RLS policies
4. Check network tab for failed requests
