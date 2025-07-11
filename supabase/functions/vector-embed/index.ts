// supabase/functions/vector-embed/index.ts
// This is a Supabase Edge Function for vector operations

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Index } from "https://esm.sh/@upstash/vector@1.1.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Initialize Upstash Vector client
const initializeVectorIndex = () => {
  const url = Deno.env.get('UPSTASH_VECTOR_REST_URL');
  const token = Deno.env.get('UPSTASH_VECTOR_REST_TOKEN');
  
  if (!url || !token) {
    throw new Error('Upstash Vector credentials not configured');
  }
  
  return new Index({
    url,
    token,
  });
};

// Generate embeddings using OpenAI
const generateEmbedding = async (text: string): Promise<number[]> => {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }
  
  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-ada-002',
        input: text,
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
};

// Batch generate embeddings
const generateEmbeddings = async (texts: string[]): Promise<number[][]> => {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }
  
  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-ada-002',
        input: texts,
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    return data.data.map((item: any) => item.embedding);
  } catch (error) {
    console.error('Error generating embeddings:', error);
    throw error;
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, data } = await req.json();

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const index = initializeVectorIndex();

    switch (action) {
      case 'embed_document': {
        // data should contain: { documentName, chunks }
        const { documentName, chunks } = data;
        
        console.log(`Embedding ${chunks.length} chunks for document: ${documentName}`);
        
        // Process in batches
        const BATCH_SIZE = 10;
        const results = [];
        
        for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
          const batch = chunks.slice(i, i + BATCH_SIZE);
          
          // Generate embeddings for the batch
          const embeddings = await generateEmbeddings(batch.map((c: any) => c.content));
          
          // Prepare vectors for upsert
          const vectors = batch.map((chunk: any, idx: number) => ({
            id: chunk.id,
            vector: embeddings[idx],
            metadata: {
              document_name: documentName,
              chunk_index: chunk.chunk_index,
              content: chunk.content,
              word_count: chunk.word_count,
              timestamp: new Date().toISOString(),
            },
          }));
          
          // Upsert to Upstash Vector
          await index.upsert(vectors);
          
          results.push(...vectors.map(v => v.id));
          console.log(`Processed batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(chunks.length / BATCH_SIZE)}`);
        }
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: `Embedded ${results.length} chunks`,
            vectorIds: results 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      case 'query': {
        // data should contain: { query, topK, filter }
        const { query, topK = 5, filter } = data;
        
        // Generate embedding for the query
        const queryEmbedding = await generateEmbedding(query);
        
        // Query Upstash Vector
        const results = await index.query({
          vector: queryEmbedding,
          topK,
          includeMetadata: true,
          filter,
        });
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            results 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      case 'delete_document': {
        // data should contain: { documentName }
        const { documentName } = data;
        
        console.log(`Deleting vectors for document: ${documentName}`);
        
        // Get all chunk IDs for this document from Supabase
        const { data: chunks, error } = await supabaseClient
          .from('document_chunks')
          .select('id')
          .eq('document_name', documentName);
        
        if (error) throw error;
        
        if (chunks && chunks.length > 0) {
          const chunkIds = chunks.map(c => c.id);
          await index.delete(chunkIds);
          console.log(`Deleted ${chunkIds.length} vectors for ${documentName}`);
        }
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: `Deleted vectors for ${documentName}` 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      case 'stats': {
        const info = await index.info();
        
        return new Response(
          JSON.stringify({ 
            success: true,
            stats: {
              totalVectors: info.vectorCount,
              dimension: info.dimension,
            }
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('Error in vector-embed function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 500 
      },
    );
  }
});
