-- Add cancellation status fields to subscribers table
ALTER TABLE public.subscribers 
ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS cancellation_status TEXT DEFAULT NULL;