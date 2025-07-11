import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Document {
  id: string;
  name: string;
  original_name: string;
  file_type: string;
  file_size: number;
  processing_status: 'pending' | 'processing' | 'processed' | 'error';
  error_message?: string;
  uploaded_by?: string;
  created_at: string;
  updated_at: string;
}

interface DocumentChunk {
  id: string;
  document_id: string;
  chunk_index: number;
  content: string;
  word_count: number;
  created_at: string;
}

const allowedTypes = ['pdf', 'docx', 'txt', 'md'];

// Utility function to validate File objects
const validateFileObject = (file: any): { isValid: boolean; error?: string } => {
  console.log('Validating file object:', file);
  
  if (!file) {
    return { isValid: false, error: 'File object is null or undefined' };
  }
  
  if (!(file instanceof File)) {
    return { isValid: false, error: 'Object is not a File instance' };
  }
  
  if (!file.name || typeof file.name !== 'string') {
    return { isValid: false, error: `File name is invalid: ${file.name}` };
  }
  
  if (!file.size || typeof file.size !== 'number') {
    return { isValid: false, error: `File size is invalid: ${file.size}` };
  }
  
  return { isValid: true };
};

export const useDocuments = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Cast the database response to match our Document interface
      const typedDocuments: Document[] = (data || []).map(doc => ({
        ...doc,
        processing_status: doc.processing_status as 'pending' | 'processing' | 'processed' | 'error'
      }));
      
      setDocuments(typedDocuments);
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
    console.log('Starting upload process with file:', file);
    
    // Validate file object first
    const validation = validateFileObject(file);
    if (!validation.isValid) {
      console.error('File validation failed:', validation.error);
      toast({
        title: "Error",
        description: `Invalid file: ${validation.error}`,
        variant: "destructive",
      });
      return null;
    }

    if (!user?.email) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return null;
    }

    setUploading(true);
    try {
      // Safely extract file extension with null checks
      let fileExtension: string | undefined;
      try {
        if (file.name && typeof file.name === 'string') {
          const nameParts = file.name.split('.');
          fileExtension = nameParts.length > 1 ? nameParts.pop()?.toLowerCase() : undefined;
        }
      } catch (splitError) {
        console.error('Error splitting file name:', splitError, 'File name:', file.name);
        throw new Error('Invalid file name format');
      }

      console.log('Extracted file extension:', fileExtension);
      
      if (!fileExtension || !allowedTypes.includes(fileExtension)) {
        throw new Error(`Invalid file type: .${fileExtension || 'unknown'}. Only PDF, DOCX, TXT, and MD files are allowed.`);
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        throw new Error('File size exceeds 10MB limit.');
      }

      if (file.size === 0) {
        throw new Error('Cannot upload empty file.');
      }

      // Generate unique filename
      const timestamp = Date.now();
      const fileName = `${timestamp}-${file.name}`;
      const filePath = `admin/${fileName}`;

      console.log(`Starting upload: ${file.name} (${file.size} bytes, type: ${fileExtension})`);

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('chatbot-documents')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      console.log('File uploaded to storage successfully');

      // Create document record
      const { data: documentData, error: dbError } = await supabase
        .from('documents')
        .insert({
          name: fileName,
          original_name: file.name,
          file_type: fileExtension,
          file_size: file.size,
          storage_path: filePath,
          uploaded_by: user.email,
          processing_status: 'pending'
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database insert error:', dbError);
        // Try to clean up uploaded file
        await supabase.storage.from('chatbot-documents').remove([filePath]);
        throw new Error(`Database error: ${dbError.message}`);
      }

      console.log('Document record created:', documentData.id);

      // Trigger document processing with better error handling
      try {
        const { data: functionData, error: processError } = await supabase.functions.invoke('process-document', {
          body: {
            documentId: documentData.id,
            fileName: fileName,
            fileType: fileExtension
          }
        });

        if (processError) {
          console.error('Processing function error:', processError);
          toast({
            title: "Warning",
            description: "Document uploaded but processing failed. You can retry processing later.",
            variant: "destructive",
          });
        } else {
          console.log('Processing function response:', functionData);
        }
      } catch (functionError) {
        console.error('Function invocation error:', functionError);
        toast({
          title: "Warning",
          description: "Document uploaded but processing may have issues. Check the document status.",
          variant: "destructive",
        });
      }

      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });

      await fetchDocuments();
      return documentData.id;

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload document",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deleteDocument = async (documentId: string) => {
    try {
      // Get document info first
      const { data: doc, error: fetchError } = await supabase
        .from('documents')
        .select('storage_path')
        .eq('id', documentId)
        .single();

      if (fetchError) throw fetchError;

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('chatbot-documents')
        .remove([doc.storage_path]);

      if (storageError) throw storageError;

      // Delete from database (chunks will be deleted automatically due to CASCADE)
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (dbError) throw dbError;

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

  const reprocessDocument = async (documentId: string) => {
    try {
      const document = documents.find(doc => doc.id === documentId);
      if (!document) throw new Error('Document not found');

      // Reset status to pending
      await supabase
        .from('documents')
        .update({ 
          processing_status: 'pending',
          error_message: null 
        })
        .eq('id', documentId);

      // Delete existing chunks
      await supabase
        .from('document_chunks')
        .delete()
        .eq('document_id', documentId);

      // Trigger reprocessing
      const { error: processError } = await supabase.functions.invoke('process-document', {
        body: {
          documentId: document.id,
          fileName: document.name,
          fileType: document.file_type
        }
      });

      if (processError) throw processError;

      toast({
        title: "Success",
        description: "Document reprocessing started",
      });

      await fetchDocuments();
    } catch (error: any) {
      console.error('Reprocess error:', error);
      toast({
        title: "Error",
        description: "Failed to reprocess document",
        variant: "destructive",
      });
    }
  };

  const getDocumentChunks = async (documentId: string): Promise<DocumentChunk[]> => {
    try {
      const { data, error } = await supabase
        .from('document_chunks')
        .select('*')
        .eq('document_id', documentId)
        .order('chunk_index');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching document chunks:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchDocuments();

    // Set up real-time subscription for document status updates
    const channel = supabase
      .channel('document-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'documents'
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
    reprocessDocument,
    getDocumentChunks,
    refreshDocuments: fetchDocuments
  };
};
