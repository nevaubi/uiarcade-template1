
-- Create the chatbot_config table with all settings columns
CREATE TABLE public.chatbot_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chatbot_name TEXT DEFAULT 'AI Assistant',
  description TEXT DEFAULT 'Your helpful AI assistant',
  personality TEXT DEFAULT 'professional',
  role TEXT DEFAULT 'Customer Support Specialist',
  custom_instructions TEXT DEFAULT '',
  response_style TEXT DEFAULT 'conversational',
  max_response_length TEXT DEFAULT 'medium',
  creativity_level INTEGER DEFAULT 30 CHECK (creativity_level >= 0 AND creativity_level <= 100),
  fallback_response TEXT DEFAULT 'I apologize, but I don''t have enough information to answer that question. Please contact our support team for further assistance.',
  current_status TEXT DEFAULT 'draft' CHECK (current_status IN ('active', 'draft', 'training', 'error')),
  include_citations BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE public.chatbot_config ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for admin-only access
CREATE POLICY "Admins can view chatbot config" 
  ON public.chatbot_config 
  FOR SELECT 
  USING (is_current_user_admin());

CREATE POLICY "Admins can insert chatbot config" 
  ON public.chatbot_config 
  FOR INSERT 
  WITH CHECK (is_current_user_admin());

CREATE POLICY "Admins can update chatbot config" 
  ON public.chatbot_config 
  FOR UPDATE 
  USING (is_current_user_admin())
  WITH CHECK (is_current_user_admin());

CREATE POLICY "Admins can delete chatbot config" 
  ON public.chatbot_config 
  FOR DELETE 
  USING (is_current_user_admin());

-- Insert default configuration row
INSERT INTO public.chatbot_config DEFAULT VALUES;

-- Create function to get current chatbot config
CREATE OR REPLACE FUNCTION public.get_chatbot_config()
RETURNS TABLE (
  id UUID,
  chatbot_name TEXT,
  description TEXT,
  personality TEXT,
  role TEXT,
  custom_instructions TEXT,
  response_style TEXT,
  max_response_length TEXT,
  creativity_level INTEGER,
  fallback_response TEXT,
  current_status TEXT,
  include_citations BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT 
    c.id,
    c.chatbot_name,
    c.description,
    c.personality,
    c.role,
    c.custom_instructions,
    c.response_style,
    c.max_response_length,
    c.creativity_level,
    c.fallback_response,
    c.current_status,
    c.include_citations,
    c.created_at,
    c.updated_at
  FROM public.chatbot_config c
  ORDER BY c.created_at ASC
  LIMIT 1;
$$;
