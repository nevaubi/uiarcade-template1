
-- Create documents table for admin-only document management
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  storage_path TEXT NOT NULL,
  processing_status TEXT NOT NULL DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'processed', 'error')),
  error_message TEXT,
  uploaded_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create document_chunks table for processed text storage
CREATE TABLE public.document_chunks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  word_count INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(document_id, chunk_index)
);

-- Create storage bucket for chatbot documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('chatbot-documents', 'chatbot-documents', false);

-- Enable RLS on documents table
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Enable RLS on document_chunks table  
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;

-- RLS policies for documents table - admin only
CREATE POLICY "Admins can view all documents" 
  ON public.documents 
  FOR SELECT 
  USING (is_current_user_admin());

CREATE POLICY "Admins can insert documents" 
  ON public.documents 
  FOR INSERT 
  WITH CHECK (is_current_user_admin());

CREATE POLICY "Admins can update documents" 
  ON public.documents 
  FOR UPDATE 
  USING (is_current_user_admin());

CREATE POLICY "Admins can delete documents" 
  ON public.documents 
  FOR DELETE 
  USING (is_current_user_admin());

-- RLS policies for document_chunks table - admin only
CREATE POLICY "Admins can view all document chunks" 
  ON public.document_chunks 
  FOR SELECT 
  USING (is_current_user_admin());

CREATE POLICY "Admins can insert document chunks" 
  ON public.document_chunks 
  FOR INSERT 
  WITH CHECK (is_current_user_admin());

CREATE POLICY "Admins can update document chunks" 
  ON public.document_chunks 
  FOR UPDATE 
  USING (is_current_user_admin());

CREATE POLICY "Admins can delete document chunks" 
  ON public.document_chunks 
  FOR DELETE 
  USING (is_current_user_admin());

-- Storage policies for chatbot-documents bucket - admin only
CREATE POLICY "Admins can view documents" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'chatbot-documents' AND is_current_user_admin());

CREATE POLICY "Admins can upload documents" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (bucket_id = 'chatbot-documents' AND is_current_user_admin());

CREATE POLICY "Admins can update documents" 
  ON storage.objects 
  FOR UPDATE 
  USING (bucket_id = 'chatbot-documents' AND is_current_user_admin());

CREATE POLICY "Admins can delete documents" 
  ON storage.objects 
  FOR DELETE 
  USING (bucket_id = 'chatbot-documents' AND is_current_user_admin());
