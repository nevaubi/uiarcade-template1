// supabase/functions/vector-embed/index.ts

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Upstash Vector API wrapper (since the SDK doesn't work well in Deno)
class VectorClient {
  private url: string;
  private token: string;

  constructor(url: string, token: string) {
    this.url = url;
    this.token = token;
  }

  async upsert(vectors: any[]) {
    const response = await fetch(`${this.url}/upsert`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(vectors),
    });

    if (!response.ok) {
      throw new Error(`Upstash Vector error: ${response.statusText}`);
    }

    return await response.json();
  }

  async query(params: any) {
    const response = await fetch(`${this.url}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`Upstash Vector error: ${response.statusText}`);
    }

    return await response.json();
  }

  async delete(ids: string[]) {
    const response = await fetch(`${this.url}/delete`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids }),
    });

    if (!response.ok) {
      throw new Error(`Upstash Vector error: ${response.statusText}`);
    }

    return await response.json();
  }

  async info() {
    const response = await fetch(`${this.url}/info`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Upstash Vector error: ${response.statusText}`);
    }

    return await response.json();
  }
}

// Initialize Vector client
const initializeVectorClient = () => {
  const url = Deno.env.get('UPSTASH_VECTOR_REST_URL');
  const token = Deno.env.get('UPSTASH_VECTOR_REST_TOKEN');
  
  if (!url || !token) {
    throw new Error('Upstash Vector credentials not configured');
  }
  
  return new VectorClient(url, token);
};

// Generate embeddings using OpenAI
const generateEmbedding = async (text: string): Promise<number[]> => {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }
  
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
};

// Batch generate embeddings
const generateEmbeddings = async (texts: string[]): Promise<number[][]> => {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }
  
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
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, data } = await req.json();
    const vectorClient = initializeVectorClient();

    switch (action) {
      case 'embed_document': {
        const { documentName, chunks } = data;
        
        console.log(`Embedding ${chunks.length} chunks for document: ${documentName}`);
        
        const BATCH_SIZE = 10;
        const results = [];
        
        for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
          const batch = chunks.slice(i, i + BATCH_SIZE);
          const embeddings = await generateEmbeddings(batch.map((c: any) => c.content));
          
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
          
          await vectorClient.upsert(vectors);
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
        const { query, topK = 5, filter } = data;
        const queryEmbedding = await generateEmbedding(query);
        
        const queryParams: any = {
          vector: queryEmbedding,
          topK,
          includeMetadata: true,
        };
        
        if (filter) {
          queryParams.filter = filter;
        }
        
        const results = await vectorClient.query(queryParams);
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            results: results.result || results 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      case 'delete_document': {
        const { documentName } = data;
        
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
          { auth: { persistSession: false } }
        );
        
        const { data: chunks, error } = await supabaseClient
          .from('document_chunks')
          .select('id')
          .eq('document_name', documentName);
        
        if (error) throw error;
        
        if (chunks && chunks.length > 0) {
          const chunkIds = chunks.map(c => c.id);
          await vectorClient.delete(chunkIds);
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
        const info = await vectorClient.info();
        
        return new Response(
          JSON.stringify({ 
            success: true,
            stats: {
              totalVectors: info.vectorCount || 0,
              dimension: info.dimension || 768,
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
