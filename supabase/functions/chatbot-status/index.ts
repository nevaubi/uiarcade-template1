
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Public chatbot status function called');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (req.method === 'GET') {
      console.log('Fetching public chatbot status...');
      const { data, error } = await supabaseClient
        .from('chatbot_config')
        .select('current_status, chatbot_name, description')
        .order('created_at', { ascending: true })
        .limit(1)
        .single()

      if (error) {
        console.error('Error fetching public status:', error)
        // Return default inactive status if config doesn't exist
        return new Response(
          JSON.stringify({ 
            current_status: 'draft',
            chatbot_name: 'AI Assistant',
            description: 'Your helpful AI assistant'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log('Successfully fetched public status:', data);
      return new Response(
        JSON.stringify({
          current_status: data.current_status,
          chatbot_name: data.chatbot_name,
          description: data.description
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Public chatbot status error:', error)
    return new Response(
      JSON.stringify({ 
        current_status: 'draft',
        chatbot_name: 'AI Assistant',
        description: 'Your helpful AI assistant'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
