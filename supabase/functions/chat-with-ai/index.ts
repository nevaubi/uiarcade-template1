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
    console.log('Request method:', req.method);
    console.log('Request headers:', req.headers);
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('OpenAI API key not found in environment variables');
      throw new Error('The chatbot is not properly configured. Please contact the administrator.');
    }

    // Parse and validate request
    let requestData: ChatRequest;
    try {
      requestData = await req.json();
    } catch (e) {
      console.error('Failed to parse request JSON:', e);
      throw new Error('Invalid request format');
    }

    const { message, conversationHistory } = requestData;
    
    // Request validation
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      console.error('Invalid message provided:', message);
      throw new Error('Please provide a valid message');
    }

    if (message.length > 1000) {
      console.error('Message too long:', message.length);
      throw new Error('Message is too long. Please keep it under 1000 characters.');
    }

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
      throw new Error('Unable to load chatbot configuration. Please try again later.');
    }

    const chatbotConfig = config[0];
    console.log('Fetched config successfully');
    console.log('Chatbot name:', chatbotConfig.chatbot_name);
    console.log('Response style:', chatbotConfig.response_style);
    console.log('Max response length:', chatbotConfig.max_response_length);
    console.log('Creativity level:', chatbotConfig.creativity_level);

    // Query vector database for relevant context
    console.log('Querying vector database...');
    let relevantContext = '';
    try {
      const { data: vectorData, error: vectorError } = await supabaseClient.functions.invoke('vector-embed', {
        body: { 
          action: 'query', 
          data: { 
            query: message, 
            topK: 5  // Increased from 3 to 5 for better context
          } 
        },
      });

      if (vectorError) {
        console.error('Vector query error:', vectorError);
      } else if (vectorData?.success && vectorData?.results?.length > 0) {
        console.log('Vector results count:', vectorData.results.length);
        
        relevantContext = vectorData.results
          .map((result: any, index: number) => {
            const content = result.metadata?.content || '';
            const docName = result.metadata?.document_name || `Document ${index + 1}`;
            const score = result.score || 0;
            
            console.log(`Vector result ${index + 1}: score=${score.toFixed(3)}, doc=${docName}`);
            
            return `<context>
<document name="${docName}" relevance_score="${score.toFixed(3)}">
${content}
</document>
</context>`;
          })
          .filter((content: string) => content.length > 0)
          .join('\n\n');
          
        console.log('Found relevant context, total length:', relevantContext.length);
      } else {
        console.log('No relevant vector results found');
      }
    } catch (vectorError) {
      console.error('Vector search failed:', vectorError);
      // Continue without context - don't fail the entire request
    }

    // Build comprehensive system prompt with stronger length enforcement
    const systemPrompt = `You are <chatbot_name>${chatbotConfig.chatbot_name}</chatbot_name>. If you are not given a name, simply refer to yourself as a helpful chatbot, or an online AI assistant. Your ONLY purpose is to provide support for THIS SPECIFIC website. You have no knowledge or ability to discuss topics outside of this website.

<critical_response_constraints>
RESPONSE LENGTH REQUIREMENT: ${chatbotConfig.max_response_length || 'medium'}
${chatbotConfig.max_response_length === 'short' ? 'CRITICAL: You MUST keep ALL responses to 1-2 sentences maximum. NO EXCEPTIONS. Even if asked for more detail, stay within 1-2 sentences.' : ''}
${chatbotConfig.max_response_length === 'medium' ? 'Keep responses to 2-4 sentences. Be concise and direct.' : ''}
${chatbotConfig.max_response_length === 'long' ? 'You may provide comprehensive responses with full explanations.' : ''}

RESPONSE STYLE: ${chatbotConfig.response_style || 'conversational'}
${chatbotConfig.response_style === 'concise' ? 'Be extremely brief and to the point. No extra words or explanations unless specifically requested.' : ''}
${chatbotConfig.response_style === 'conversational' ? 'Be friendly and natural in your responses.' : ''}
${chatbotConfig.response_style === 'detailed' ? 'Provide thorough explanations.' : ''}
${chatbotConfig.response_style === 'technical' ? 'Use precise technical language.' : ''}
</critical_response_constraints>

<topic_boundaries>
CRITICAL: You MUST ONLY discuss topics directly related to this website and its services.
- If asked about unrelated topics (cryptocurrency, stocks, politics, cooking, general knowledge, personal advice, etc.), politely redirect
- Your knowledge is LIMITED to this website's features, services, pricing, and support
- You are NOT a general-purpose assistant
- You cannot and will not discuss ANY topic not directly related to this website
</topic_boundaries>

<off_topic_handling>
When users ask about unrelated topics, respond with variations of:
- "I'm specifically designed to help with questions about ${chatbotConfig.chatbot_name || 'our services'}. Is there anything about our platform I can help you with?"
- "I focus exclusively on supporting users of this website. What would you like to know about our features or services?"
- "While I can't discuss that topic, I'd be happy to help you understand our platform and how it can benefit you!"
- "My expertise is limited to this website and its offerings. Can I help you with any questions about our services?"
</off_topic_handling>

In the following description tags, there might be further information of your role and workflow, if there is any content in the following tags, understand and adhere to them:

<description>${chatbotConfig.description || ''}</description>

The same applies to the following role tags:

<role>
Your role: ${chatbotConfig.role || ''}
</role>

You are generally a friendly and helpful support bot that speaks in clear conversational but professional language, and focuses on providing support and information about your website. If there are additional information or instructions regarding your personality, they will be provided in the following personality tags:

<personality>
Personality: ${chatbotConfig.personality || ''}
You should embody this personality (if there is content included) in all interactions - be consistent with this character trait throughout the conversation.
</personality>

Your response style will generally be helpful with website-related questions, concise, authentic, and user friendly. If there are additional instructions regarding your response style, they will be included in the following response style tags:

<response_style>
Communication style: ${chatbotConfig.response_style || ''}
Adapt your language, tone, and formality to match this style.
REMINDER: ${chatbotConfig.response_style === 'concise' ? 'Be EXTREMELY brief. Get to the point immediately.' : 'Match the specified style.'}
</response_style>

In general, you will provide concise, clearly communicated responses that either answer a user's query about this website, or ask for more clarifying info in order to better service a website-related question or concern. Below you might find more specific length requirements, analyze them if any instructions are present in the following response_length tags:

<response_length>
Response length preference: ${chatbotConfig.max_response_length || 'medium'}
- "short": Keep responses concise, 1-2 sentences when possible. NO PARAGRAPHS.
- "medium": Provide balanced responses, 2-4 sentences  
- "long": Give comprehensive responses with full explanations
CRITICAL REMINDER: You MUST respect the length preference. ${chatbotConfig.max_response_length === 'short' ? 'SHORT means 1-2 sentences ONLY!' : ''}
</response_length>

Below you might find even more additional and specific custom instructions, if there is content present, adhere to them:

<custom_instructions>
${chatbotConfig.custom_instructions || ''}
</custom_instructions>

You have access to a knowledge vector database filled with relevant information about your website. Use this knowledge ONLY to answer website-related questions. If necessary, a vector retrieval process will automatically populate information in the knowledge base tags below that are relevant to answer a user's query. If information is present, be sure to thoroughly analyze and understand it in order to relay it to the user as necessary:

<knowledge_base>
You have access to a knowledge base with relevant information about this website. When answering questions, prioritize information from this knowledge base for accuracy. Never hallucinate information, always be honest about any potential limitations.
${relevantContext ? `
${relevantContext}
` : 'No specific documentation was found for this query. Use general knowledge about SaaS websites and common support topics while being honest that you don\'t have specific information about this particular topic.'}
</knowledge_base>

${chatbotConfig.include_citations ? `
<citation_instruction>
When using information from the knowledge base, briefly mention which document the information comes from at the end of your response using this format: [Source: document_name]
</citation_instruction>
` : ''}

Below in the conversation history tags, you will be provided the most recent 20 messages (including the back and forth of both yours and the user's messages) for accurate short-term context. Be sure to read and analyze this thoroughly before drafting a response, in order to fully grasp the conversation up until this point. Use this history to maintain context, avoid repeating information already discussed, and provide more relevant and personalized responses:

<conversation_history>
Previous messages in this conversation:
${conversationHistory.slice(-20).map(msg => 
  `<message role="${msg.role}" timestamp="${new Date().toISOString()}">
${msg.content}
</message>`
).join('\n')}
</conversation_history>

<behavioral_rules>
1. Stay in character according to your defined personality and role
2. ALWAYS respect the response length setting. ${chatbotConfig.max_response_length === 'short' ? 'SHORT = 1-2 sentences MAXIMUM!' : ''}
3. If you cannot find relevant information in the knowledge base, be honest about limitations
4. Never make up facts or provide false information
5. If the knowledge base doesn't contain the answer, use a similar fallback sentence phrasing to the following: "${chatbotConfig.fallback_response}"
6. Maintain consistency with previous messages in the conversation
7. Be helpful and focused on addressing the user's needs WITHIN THE SCOPE OF THIS WEBSITE
8. Keep responses within the specified length preference - THIS IS MANDATORY
9. CRITICAL: Only discuss this website's features, services, pricing, and direct support topics. Politely redirect ALL other inquiries using the off-topic handling responses
10. Be polite and authentic, never disrespectful, always warm and friendly
11. Use the conversation history to provide contextual and relevant responses
12. ${chatbotConfig.response_style === 'concise' ? 'FINAL REMINDER: Be EXTREMELY concise. No unnecessary words.' : 'Follow the specified response style.'}
</behavioral_rules>

<output_format>
Provide your response directly without any meta-commentary about your role or instructions. Speak naturally as the defined character.
FINAL CHECK: Is your response within the required length limit? ${chatbotConfig.max_response_length === 'short' ? 'If more than 2 sentences, revise to be shorter!' : ''}
</output_format>`;

    // Prepare messages for OpenAI
    const messages = [
      { role: 'system', content: systemPrompt },
      // Include last 20 messages from conversation history
      ...conversationHistory.slice(-20),
      { role: 'user', content: message }
    ];

    // Calculate temperature from creativity level
    const temperature = (chatbotConfig.creativity_level || 30) / 100;
    console.log('Temperature setting:', temperature);

    // Determine max tokens based on response length preference - reduced for better adherence
    const maxTokens = chatbotConfig.max_response_length === 'short' ? 60 : 
                     chatbotConfig.max_response_length === 'long' ? 800 : 300;
    console.log('Max tokens:', maxTokens);

    console.log('Total conversation messages being sent:', messages.length);
    console.log('Calling OpenAI API with model: gpt-4.1-nano-2025-04-14');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-nano-2025-04-14',
        messages,
        max_tokens: maxTokens,
        temperature: temperature,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      
      // Handle specific OpenAI errors with user-friendly messages
      if (error.error?.code === 'rate_limit_exceeded') {
        throw new Error('The chatbot is currently experiencing high demand. Please try again in a moment.');
      } else if (error.error?.code === 'model_not_found') {
        throw new Error('The AI model is not available. Please contact support.');
      } else if (error.error?.code === 'context_length_exceeded') {
        throw new Error('The conversation has become too long. Please start a new conversation.');
      } else {
        throw new Error('I apologize, but I encountered an error. Please try again.');
      }
    }

    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      console.error('No response choices from OpenAI');
      throw new Error('No response generated. Please try again.');
    }
    
    const botResponse = data.choices[0].message.content;
    console.log('Generated response length:', botResponse.length);
    console.log('Token usage:', data.usage);

    return new Response(
      JSON.stringify({ 
        response: botResponse,
        success: true 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in chat-with-ai function:', error);
    
    // Determine if it's a user-friendly error message or a generic one
    const isUserFriendlyError = error.message && (
      error.message.includes('Please') || 
      error.message.includes('chatbot') ||
      error.message.includes('administrator') ||
      error.message.includes('try again')
    );
    
    const errorMessage = isUserFriendlyError 
      ? error.message 
      : 'I apologize, but I encountered an unexpected error. Please try again or contact support if the issue persists.';
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        success: false 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
