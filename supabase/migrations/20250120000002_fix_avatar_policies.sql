-- Fix avatar storage policies to allow uploads to bucket root
-- Drop the existing INSERT policy that requires folder structure
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;

-- Create a simpler INSERT policy that allows authenticated users to upload to avatars bucket
CREATE POLICY "Users can upload their own avatars" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'avatars' 
        AND auth.uid() IS NOT NULL
    );

-- Drop the existing UPDATE policy that requires folder structure
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;

-- Create a simpler UPDATE policy
CREATE POLICY "Users can update their own avatars" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'avatars' 
        AND auth.uid() IS NOT NULL
    );

-- Drop the existing DELETE policy that requires folder structure
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;

-- Create a simpler DELETE policy
CREATE POLICY "Users can delete their own avatars" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'avatars' 
        AND auth.uid() IS NOT NULL
    );
