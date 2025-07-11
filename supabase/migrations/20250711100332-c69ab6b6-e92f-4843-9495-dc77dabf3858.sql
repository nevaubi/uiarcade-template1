
-- Add is_admin column to subscribers table
ALTER TABLE public.subscribers 
ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT false;

-- Migrate existing admin status from profiles to subscribers
UPDATE public.subscribers 
SET is_admin = profiles.is_admin 
FROM public.profiles 
WHERE subscribers.user_id = profiles.id;

-- Optional: Remove is_admin from profiles table (uncomment if you want to clean up)
-- ALTER TABLE public.profiles DROP COLUMN is_admin;
