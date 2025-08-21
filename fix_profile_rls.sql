-- Fix RLS policies for profiles table
-- Run this in the Supabase SQL Editor

-- First, ensure the avatar_type column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'avatar_type'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN avatar_type text DEFAULT 'preset';
        
        -- Set existing profiles to 'preset' if avatar_type is null
        UPDATE public.profiles
        SET avatar_type = 'preset'
        WHERE avatar_type IS NULL;
    END IF;
END $$;

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "profiles_insert_self" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

-- Create more permissive policies
CREATE POLICY "profiles_insert_self" ON public.profiles 
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = id);

CREATE POLICY "profiles_select_own" ON public.profiles 
FOR SELECT USING (auth.uid() IS NOT NULL AND auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles 
FOR UPDATE USING (auth.uid() IS NOT NULL AND auth.uid() = id);

-- Allow public read access to profiles (for viewing other users' profiles)
CREATE POLICY "profiles_select_public" ON public.profiles 
FOR SELECT USING (true);

-- Fix the trigger function to use correct handle format
CREATE OR REPLACE FUNCTION public.on_auth_user_created()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, handle, display_name)
  VALUES (new.id, 'user' || substr(new.id::text, 1, 8), coalesce(split_part(new.email, '@', 1), 'user'))
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Ensure proper permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;

-- Create avatars storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars',
    'avatars',
    true,
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for avatars
DROP POLICY IF EXISTS "Avatar files are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;

CREATE POLICY "Avatar files are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatars" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'avatars'
        AND auth.uid() IS NOT NULL
    );

CREATE POLICY "Users can update their own avatars" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'avatars'
        AND auth.uid() IS NOT NULL
    );

CREATE POLICY "Users can delete their own avatars" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'avatars'
        AND auth.uid() IS NOT NULL
    );
