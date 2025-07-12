import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useRateLimit } from '@/hooks/useRateLimit';

interface UploadFile {
  id: string;
  file: File;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
}

const DocumentUpload = ({ onUploadComplete }: { onUploadComplete?: () => void }) => {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const { toast } = useToast();
  const { handleRateLimitResponse, isRateLimited, timeUntilReset } = useRateLimit();

  const validateFile = (file: File): string | null => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['text/plain', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/markdown'];

    if (file.size > maxSize) {
      return 'File size exceeds 10MB';
    }

    if (!allowedTypes.includes(file.type)) {
      return 'Invalid file type. Only TXT, PDF, DOCX, and MD files are supported.';
    }

    return null;
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (isRateLimited) {
        toast({
          title: "Rate Limit Exceeded",
          description: `Please wait ${timeUntilReset} seconds before uploading more documents.`,
          variant: "destructive",
        });
        return;
      }

      const newFiles: UploadFile[] = acceptedFiles.map(file => ({
        id: Date.now().toString() + '-' + file.name,
        file: file,
        status: 'uploading',
        progress: 0,
        error: validateFile(file) || undefined,
      }));

      setUploadFiles(prev => [...newFiles, ...prev]);

      newFiles.forEach(async (uploadFile) => {
        if (uploadFile.error) {
          toast({
            title: "Upload Failed",
            description: uploadFile.error,
            variant: "destructive",
          });
          setUploadFiles(prev => prev.map(f =>
            f.id === uploadFile.id ? { ...f, status: 'error' } : f
          ));
          return;
        }

        try {
          const { data, error } = await supabase.storage
            .from('chatbot-documents')
            .upload(`admin/${uploadFile.file.name}`, uploadFile.file, {
              cacheControl: '3600',
              upsert: false
            });

          if (error) {
            throw new Error(error.message);
          }

          console.log('Upload complete:', data);

          setUploadFiles(prev => prev.map(f =>
            f.id === uploadFile.id ? { ...f, progress: 100 } : f
          ));

          const fileName = uploadFile.file.name;
          const fileType = uploadFile.file.name.split('.').pop() || 'txt';
          await processDocument(uploadFile.id, fileName, fileType);

        } catch (uploadError) {
          console.error('File upload error:', uploadError);
          setUploadFiles(prev => prev.map(f =>
            f.id === uploadFile.id ? { ...f, status: 'error', error: uploadError.message } : f
          ));
          toast({
            title: "Upload Failed",
            description: uploadError.message,
            variant: "destructive",
          });
        }
      });
    },
    [supabase, toast, isRateLimited, timeUntilReset]
  );

  const processDocument = async (uploadId: string, fileName: string, fileType: string) => {
    try {
      const response = await fetch(`https://xqhpquybkvyaaruedfkj.supabase.co/functions/v1/process-document`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId: uploadId,
          fileName: fileName,
          fileType: fileType,
        }),
      });

      // Handle rate limiting
      handleRateLimitResponse(response);

      const result = await response.json();
      
      if (!response.ok) {
        if (response.status === 429) {
          throw new Error(result.error || 'Too many document processing requests. Please try again later.');
        }
        throw new Error(result.error || 'Failed to process document');
      }

      if (!result.success) {
        throw new Error(result.error || 'Document processing failed');
      }

      console.log('Document processed successfully:', result);
      
      setUploadFiles(prev => prev.map(f => 
        f.id === uploadId 
          ? { ...f, status: 'completed', progress: 100 }
          : f
      ));

      toast({
        title: "Document Processed",
        description: `${fileName} has been processed and added to the knowledge base.`,
      });

    } catch (error) {
      console.error('Document processing error:', error);
      
      setUploadFiles(prev => prev.map(f => 
        f.id === uploadId 
          ? { ...f, status: 'error', error: error.message }
          : f
      ));

      toast({
        title: "Processing Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/markdown': ['.md'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true,
    disabled: isRateLimited,
  });

  const removeFile = (id: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== id));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Documents
        </CardTitle>
        <CardDescription>
          Upload documents to add to your chatbot's knowledge base. Supported formats: TXT, PDF, DOCX, MD
          {isRateLimited && (
            <span className="block text-red-500 text-sm mt-1">
              Rate limit reached. Please wait {timeUntilReset} seconds before uploading more documents.
            </span>
          )}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragActive 
              ? 'border-blue-400 bg-blue-50' 
              : isRateLimited
              ? 'border-gray-200 bg-gray-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${isRateLimited ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <input {...getInputProps()} disabled={isRateLimited} />
          
          <div className="flex flex-col items-center gap-2">
            <Upload className={`h-12 w-12 ${isRateLimited ? 'text-gray-400' : 'text-gray-400'}`} />
            <p className={`text-lg font-medium ${isRateLimited ? 'text-gray-400' : 'text-gray-600'}`}>
              {isRateLimited 
                ? `Rate limited - wait ${timeUntilReset}s`
                : isDragActive 
                ? 'Drop files here...' 
                : 'Drag & drop files or click to browse'
              }
            </p>
            <p className="text-sm text-gray-500">
              Supports TXT, PDF, DOCX, and MD files up to 10MB each
            </p>
          </div>
        </div>

        {uploadFiles.map((uploadFile) => (
          <div key={uploadFile.id} className="flex items-center justify-between border rounded-md p-2">
            <div className="flex items-center space-x-2">
              {uploadFile.status === 'uploading' && <Upload className="h-4 w-4 animate-spin text-gray-500" />}
              {uploadFile.status === 'processing' && <FileText className="h-4 w-4 animate-spin text-gray-500" />}
              {uploadFile.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
              {uploadFile.status === 'error' && <AlertCircle className="h-4 w-4 text-red-500" />}
              
              <span className="text-sm font-medium">{uploadFile.file.name}</span>
              {uploadFile.error && <span className="text-xs text-red-500">({uploadFile.error})</span>}
            </div>

            <div className="flex items-center space-x-2">
              {uploadFile.status === 'uploading' && (
                <Progress value={uploadFile.progress} className="w-24" />
              )}
              
              <Button variant="ghost" size="icon" onClick={() => removeFile(uploadFile.id)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default DocumentUpload;
