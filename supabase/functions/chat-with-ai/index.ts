
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  message: string;
  conversationHistory: Message[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Chat with AI function called');
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { message, conversationHistory }: ChatRequest = await req.json();
    console.log('Received message:', message);
    console.log('Conversation history length:', conversationHistory?.length || 0);

    // Initialize Supabase client for fetching config and querying vectors
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch chatbot configuration
    console.log('Fetching chatbot config...');
    const { data: config, error: configError } = await supabaseClient
      .rpc('get_chatbot_config');

    if (configError || !config || config.length === 0) {
      console.error('Error fetching config:', configError);
      throw new Error('Failed to fetch chatbot configuration');
    }

    const chatbotConfig = config[0];
    console.log('Fetched config:', chatbotConfig.chatbot_name);

    // Query vector database for relevant context
    console.log('Querying vector database...');
    let relevantContext = '';
    try {
      const { data: vectorData, error: vectorError } = await supabaseClient.functions.invoke('vector-embed', {
        body: { 
          action: 'query', 
          data: { 
            query: message, 
            topK: 3 
          } 
        },
      });

      if (vectorError) {
        console.error('Vector query error:', vectorError);
      } else if (vectorData?.success && vectorData?.results?.length > 0) {
        relevantContext = vectorData.results
          .map((result: any) => result.metadata?.content || '')
          .filter((content: string) => content.length > 0)
          .join('\n\n');
        console.log('Found relevant context, length:', relevantContext.length);
      }
    } catch (vectorError) {
      console.error('Vector search failed:', vectorError);
      // Continue without context - don't fail the entire request
    }

    // Build system prompt dynamically
    const systemPrompt = `
<role>
You are ${chatbotConfig.chatbot_name}, a ${chatbotConfig.role}.
</role>

<personality>
Your personality is: ${chatbotConfig.personality}
Response style: ${chatbotConfig.response_style}
</personality>

<instructions>
${chatbotConfig.custom_instructions || 'Provide helpful and accurate responses.'}

Response length should be: ${chatbotConfig.max_response_length}
${chatbotConfig.include_citations ? 'Include citations when referencing specific information.' : ''}
</instructions>

${relevantContext ? `<context>
Here is relevant information from the knowledge base:

${relevantContext}
</context>` : ''}

<conversation_guidelines>
- Be helpful, accurate, and engaging
- Stay in character based on your defined role and personality
- Use the provided context when relevant to answer questions
- If you don't know something, be honest about it
- Fallback response if needed: "${chatbotConfig.fallback_response}"
</conversation_guidelines>
    `.trim();

    // Prepare messages for OpenAI
    const messages = [
      { role: 'system', content: systemPrompt },
      // Include last conversation history (limit to prevent token overflow)
      ...conversationHistory.slice(-10),
      { role: 'user', content: message }
    ];

    console.log('Calling OpenAI API...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: chatbotConfig.max_response_length === 'short' ? 150 : 
                   chatbotConfig.max_response_length === 'long' ? 500 : 300,
        temperature: (chatbotConfig.creativity_level || 30) / 100,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const botResponse = data.choices[0].message.content;

    console.log('Generated response length:', botResponse.length);

    return new Response(
      JSON.stringify({ 
        response: botResponse,
        success: true 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in chat-with-ai function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
