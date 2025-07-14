-- Add SEO-specific fields to blog_posts table
ALTER TABLE public.blog_posts 
ADD COLUMN meta_title TEXT,
ADD COLUMN meta_description TEXT,
ADD COLUMN canonical_url TEXT;