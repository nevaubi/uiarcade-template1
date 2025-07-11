// src/services/vectorService.ts
// Client-side service that calls the Supabase Edge Function

import { supabase } from '@/integrations/supabase/client';

// Helper function to call the vector edge function
const callVectorFunction = async (action: string, data: any) => {
  const { data: result, error } = await supabase.functions.invoke('vector-embed', {
    body: { action, data },
  });

  if (error) {
    console.error(`Vector function error (${action}):`, error);
    throw error;
  }

  if (!result.success) {
    throw new Error(result.error || `Vector operation failed: ${action}`);
  }

  return result;
};

// Store document chunks with embeddings in Upstash Vector
export const storeDocumentVectors = async (
  documentName: string,
  chunks: Array<{
    id: string;
    content: string;
    chunk_index: number;
    word_count: number;
  }>
): Promise<void> => {
  console.log(`Storing ${chunks.length} vectors for document: ${documentName}`);
  
  try {
    const result = await callVectorFunction('embed_document', {
      documentName,
      chunks,
    });
    
    console.log(`Successfully stored vectors:`, result.message);
  } catch (error) {
    console.error('Error storing vectors:', error);
    throw error;
  }
};

// Query similar chunks using vector search
export const queryVectors = async (
  query: string,
  topK: number = 5,
  filter?: Record<string, any>
): Promise<Array<{
  id: string;
  score: number;
  metadata: any;
}>> => {
  try {
    const result = await callVectorFunction('query', {
      query,
      topK,
      filter,
    });
    
    return result.results;
  } catch (error) {
    console.error('Error querying vectors:', error);
    throw error;
  }
};

// Delete vectors for a document
export const deleteDocumentVectors = async (documentName: string): Promise<void> => {
  try {
    const result = await callVectorFunction('delete_document', {
      documentName,
    });
    
    console.log(result.message);
  } catch (error) {
    console.error('Error deleting vectors:', error);
    throw error;
  }
};

// Get vector statistics
export const getVectorStats = async (): Promise<{
  totalVectors: number;
  dimension: number;
}> => {
  try {
    const result = await callVectorFunction('stats', {});
    return result.stats;
  } catch (error) {
    console.error('Error getting vector stats:', error);
    throw error;
  }
};
