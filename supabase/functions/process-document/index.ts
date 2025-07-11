
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DocumentProcessingRequest {
  documentId: string;
  fileName: string;
  fileType: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { documentId, fileName, fileType }: DocumentProcessingRequest = await req.json()
    
    console.log(`Processing document: ${documentId}, file: ${fileName}, type: ${fileType}`)

    // Update status to processing
    await supabaseClient
      .from('documents')
      .update({ processing_status: 'processing' })
      .eq('id', documentId)

    // Download the file from storage
    const { data: fileData, error: downloadError } = await supabaseClient.storage
      .from('chatbot-documents')
      .download(`admin/${fileName}`)

    if (downloadError) {
      throw new Error(`Failed to download file: ${downloadError.message}`)
    }

    // Convert file to text based on type
    let extractedText = ''
    const fileBuffer = await fileData.arrayBuffer()

    switch (fileType.toLowerCase()) {
      case 'txt':
      case 'md':
        extractedText = new TextDecoder().decode(fileBuffer)
        break
      
      case 'pdf':
        // For PDF processing, we'll implement a simple text extraction
        // In a production environment, you'd use a proper PDF parsing library
        extractedText = `PDF content extraction not fully implemented yet for ${fileName}. This is a placeholder for the extracted text.`
        break
      
      case 'docx':
        // For DOCX processing, we'll implement a simple text extraction
        // In a production environment, you'd use a proper DOCX parsing library
        extractedText = `DOCX content extraction not fully implemented yet for ${fileName}. This is a placeholder for the extracted text.`
        break
      
      default:
        throw new Error(`Unsupported file type: ${fileType}`)
    }

    // Chunk the text (split into ~500 word chunks)
    const chunks = chunkText(extractedText, 500)
    
    // Store chunks in database
    const chunkPromises = chunks.map((chunk, index) => 
      supabaseClient
        .from('document_chunks')
        .insert({
          document_id: documentId,
          chunk_index: index,
          content: chunk,
          word_count: chunk.split(' ').length
        })
    )

    await Promise.all(chunkPromises)

    // Update document status to processed
    await supabaseClient
      .from('documents')
      .update({ 
        processing_status: 'processed',
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId)

    console.log(`Successfully processed document ${documentId} with ${chunks.length} chunks`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Document processed successfully',
        chunks: chunks.length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error processing document:', error)

    // Update document status to error if we have documentId
    const body = await req.json().catch(() => ({}))
    if (body.documentId) {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )
      
      await supabaseClient
        .from('documents')
        .update({ 
          processing_status: 'error',
          error_message: error.message,
          updated_at: new Date().toISOString()
        })
        .eq('id', body.documentId)
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

function chunkText(text: string, maxWords: number): string[] {
  const words = text.split(' ')
  const chunks: string[] = []
  
  for (let i = 0; i < words.length; i += maxWords) {
    const chunk = words.slice(i, i + maxWords).join(' ')
    if (chunk.trim()) {
      chunks.push(chunk.trim())
    }
  }
  
  return chunks.length > 0 ? chunks : [text]
}
