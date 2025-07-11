import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { processDocument } from '@/utils/documentProcessor';
import { storeDocumentVectors } from '@/services/vectorService';

interface DocumentChunk {
  id: string;
  document_name: string;
  file_type: string;
  chunk_index: number;
  content: string;
  word_count: number;
  created_by?: string;
  created_at: string;
}

interface DocumentInfo {
  name: string;
  file_type: string;
  chunks: DocumentChunk[];
  total_chunks: number;
  total_words: number;
  created_at: string;
  created_by?: string;
}

export const useDocuments = () => {
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('document_chunks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Group chunks by document name
      const grouped = (data || []).reduce((acc, chunk) => {
        if (!acc[chunk.document_name]) {
          acc[chunk.document_name] = {
            name: chunk.document_name,
            file_type: chunk.file_type,
            chunks: [],
            total_chunks: 0,
            total_words: 0,
            created_at: chunk.created_at,
            created_by: chunk.created_by
          };
        }
        acc[chunk.document_name].chunks.push(chunk);
        acc[chunk.document_name].total_chunks++;
        acc[chunk.document_name].total_words += chunk.word_count;
        return acc;
      }, {} as Record<string, DocumentInfo>);

      setDocuments(Object.values(grouped));
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Error",
        description: "Failed to fetch documents",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (file: File): Promise<string | null> => {
    if (!user?.email) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return null;
    }

    console.log('Starting client-side processing for:', file.name);
    setUploading(true);

    try {
      // Process document client-side
      const processedDoc = await processDocument(file);
      
      // Insert chunks directly into database
      const chunksToInsert = processedDoc.chunks.map(chunk => ({
        document_name: processedDoc.document_name,
        file_type: processedDoc.file_type,
        chunk_index: chunk.chunk_index,
        content: chunk.content,
        word_count: chunk.word_count,
        created_by: user.email
      }));

      const { data, error } = await supabase
        .from('document_chunks')
        .insert(chunksToInsert)
        .select();

      if (error) throw error;

      console.log(`Successfully processed ${processedDoc.chunks.length} chunks`);

      // Store vectors after successful chunk insertion
      try {
        console.log('Starting vector embedding generation...');
        const chunksForVector = data.map(chunk => ({
          id: chunk.id,
          content: chunk.content,
          chunk_index: chunk.chunk_index,
          word_count: chunk.word_count
        }));

        await storeDocumentVectors(processedDoc.document_name, chunksForVector);
        console.log('Vector embeddings stored successfully');
      } catch (vectorError: any) {
        console.error('Vector storage failed (non-blocking):', vectorError);
        // Don't fail the whole upload if vector storage fails
        toast({
          title: "Warning",
          description: "Document uploaded but vector embeddings failed. Search functionality may be limited.",
          variant: "default",
        });
      }
      
      toast({
        title: "Success",
        description: `Document processed successfully! Created ${processedDoc.chunks.length} chunks.`,
      });

      await fetchDocuments();
      return data?.[0]?.id || null;

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process document",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deleteDocument = async (documentName: string) => {
    try {
      const { error } = await supabase
        .from('document_chunks')
        .delete()
        .eq('document_name', documentName);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Document deleted successfully",
      });

      await fetchDocuments();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchDocuments();

    // Set up real-time subscription
    const channel = supabase
      .channel('document-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'document_chunks'
      }, () => {
        fetchDocuments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    documents,
    loading,
    uploading,
    uploadDocument,
    deleteDocument,
    refreshDocuments: fetchDocuments
  };
};
