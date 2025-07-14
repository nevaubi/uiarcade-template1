import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.1';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  user_id: string;
  email: string;
  full_name?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Welcome email function invoked");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    
    if (!resend) {
      console.error("Resend API key not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { 
          status: 500, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    const { user_id, email, full_name }: WelcomeEmailRequest = await req.json();
    console.log(`Processing welcome email for user: ${email}`);

    // Create Supabase client to check email config
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get welcome email configuration
    const { data: emailConfig, error: configError } = await supabase
      .from('email_configs')
      .select('*')
      .eq('config_type', 'welcome_email')
      .single();

    if (configError) {
      console.error('Error fetching email config:', configError);
      return new Response(
        JSON.stringify({ error: "Email configuration not found" }),
        { 
          status: 500, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    // Check if welcome email is enabled
    if (!emailConfig.enabled) {
      console.log("Welcome email is disabled, skipping");
      return new Response(
        JSON.stringify({ message: "Welcome email disabled" }),
        { 
          status: 200, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    // Replace template variables
    const dashboardUrl = "https://xqhpquybkvyaaruedfkj.supabase.co";
    let emailHtml = emailConfig.template_html
      .replace(/\[USER_EMAIL\]/g, email)
      .replace(/\[DASHBOARD_URL\]/g, dashboardUrl)
      .replace(/\[PLATFORM_NAME\]/g, emailConfig.from_name)
      .replace(/\[DATE\]/g, new Date().toLocaleDateString());

    // Add user name if available
    if (full_name) {
      emailHtml = emailHtml.replace(/\[USER_NAME\]/g, full_name);
    }

    // Send welcome email
    const emailResponse = await resend.emails.send({
      from: `${emailConfig.from_name} <onboarding@resend.dev>`,
      to: [email],
      subject: emailConfig.template_subject,
      html: emailHtml,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        email_id: emailResponse.data?.id,
        message: "Welcome email sent successfully" 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);