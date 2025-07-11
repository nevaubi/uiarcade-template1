
-- Drop the complex tables and create a simplified document_chunks table
DROP TABLE IF EXISTS document_chunks CASCADE;
DROP TABLE IF EXISTS documents CASCADE;

-- Create simplified document_chunks table for client-side processing
CREATE TABLE public.document_chunks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  word_count INTEGER NOT NULL,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to manage all chunks
CREATE POLICY "Admins can manage all document chunks" 
  ON public.document_chunks 
  FOR ALL 
  USING (is_current_user_admin())
  WITH CHECK (is_current_user_admin());

-- Create policy for authenticated users to view chunks
CREATE POLICY "Authenticated users can view document chunks" 
  ON public.document_chunks 
  FOR SELECT 
  USING (auth.role() = 'authenticated');
