-- Create email_configs table for managing email templates and settings
CREATE TABLE public.email_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_type TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  template_html TEXT NOT NULL,
  template_subject TEXT NOT NULL DEFAULT 'Welcome to our platform!',
  from_name TEXT NOT NULL DEFAULT 'Our Team',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

-- Enable Row Level Security
ALTER TABLE public.email_configs ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access only
CREATE POLICY "Admins can view email configs" 
ON public.email_configs 
FOR SELECT 
USING (is_current_user_admin());

CREATE POLICY "Admins can insert email configs" 
ON public.email_configs 
FOR INSERT 
WITH CHECK (is_current_user_admin());

CREATE POLICY "Admins can update email configs" 
ON public.email_configs 
FOR UPDATE 
USING (is_current_user_admin())
WITH CHECK (is_current_user_admin());

CREATE POLICY "Admins can delete email configs" 
ON public.email_configs 
FOR DELETE 
USING (is_current_user_admin());

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_email_configs_updated_at
BEFORE UPDATE ON public.email_configs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default welcome email configuration
INSERT INTO public.email_configs (config_type, enabled, template_html, template_subject, from_name)
VALUES (
  'welcome_email',
  true,
  '<div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Our Platform!</h1>
    </div>
    <div style="padding: 40px 20px; background: #ffffff;">
      <h2 style="color: #333; margin-bottom: 20px;">Thanks for joining us!</h2>
      <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
        We''re excited to have you on board. Your account has been successfully created and you can now access all the features of our platform.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="[DASHBOARD_URL]" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Get Started
        </a>
      </div>
      <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
        <p style="color: #999; font-size: 14px; margin: 0;">
          If you have any questions, feel free to contact our support team.
        </p>
      </div>
    </div>
  </div>',
  'Welcome to our platform!',
  'Our Team'
);

-- Update handle_new_user function to call welcome email edge function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  request_id bigint;
BEGIN
  -- Insert user profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', '')
  );
  
  -- Send welcome email asynchronously (non-blocking)
  BEGIN
    SELECT net.http_post(
      url := 'https://xqhpquybkvyaaruedfkj.supabase.co/functions/v1/send-welcome-email',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxaHBxdXlia3Z5YWFydWVkZmtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0OTcwNzcsImV4cCI6MjA2NjA3MzA3N30.Yi6f5Vekg2jkrpI2thiuGeZTORzODYBnf6z5ke3-X18"}'::jsonb,
      body := json_build_object(
        'user_id', NEW.id,
        'email', NEW.email,
        'full_name', COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', '')
      )::jsonb
    ) INTO request_id;
  EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail user creation
    RAISE WARNING 'Failed to send welcome email for user %: %', NEW.id, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$;