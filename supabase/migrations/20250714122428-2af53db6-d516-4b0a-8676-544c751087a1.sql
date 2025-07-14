-- Add status field to profiles table for user management
ALTER TABLE public.profiles 
ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended'));

-- Add suspension metadata
ALTER TABLE public.profiles 
ADD COLUMN suspended_at TIMESTAMPTZ,
ADD COLUMN suspended_by UUID REFERENCES auth.users(id);

-- Create index for faster status queries
CREATE INDEX idx_profiles_status ON public.profiles(status);

-- Update existing profiles to have active status
UPDATE public.profiles SET status = 'active' WHERE status IS NULL;