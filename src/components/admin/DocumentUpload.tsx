import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Upload, FileText, Loader2, AlertCircle, CloudUpload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRateLimit } from '@/hooks/useRateLimit';

interface DocumentUploadProps {
  onUploadComplete?: () => void;
  uploading?: boolean;
  uploadDocument?: (file: File) => Promise<string | null>;
}

const DocumentUpload = ({ onUploadComplete, uploading: externalUploading, uploadDocument: externalUploadDocument }: DocumentUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [internalUploading, setInternalUploading] = useState(false);
  const { toast } = useToast();
  const { isRateLimited, timeUntilReset } = useRateLimit();

  const uploading = externalUploading || internalUploading;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validTypes = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(selectedFile.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF, TXT, or DOCX file.",
          variant: "destructive",
        });
        return;
      }
      
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file || uploading || isRateLimited) return;

    if (externalUploadDocument) {
      try {
        await externalUploadDocument(file);
        setFile(null);
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        if (onUploadComplete) {
          onUploadComplete();
        }
      } catch (error) {
        console.error('Upload failed:', error);
      }
      return;
    }

    setInternalUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data, error } = await supabase.functions.invoke('process-document', {
        body: formData,
      });

      if (error) {
        if (error.message?.includes('Rate limit')) {
          toast({
            title: "Rate limit exceeded",
            description: error.message,
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      toast({
        title: "Document uploaded successfully",
        description: `Processed ${data.chunks} chunks from ${file.name}`,
      });

      setFile(null);
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setInternalUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CloudUpload className="h-5 w-5" />
          Upload Documents
        </CardTitle>
        <CardDescription>
          Upload documents to build your chatbot's knowledge base
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
          <CloudUpload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-600 mb-2">
            Select a file to upload
          </p>
          <Input
            type="file"
            accept=".pdf,.txt,.docx"
            onChange={handleFileChange}
            disabled={uploading || isRateLimited}
            className="max-w-xs mx-auto"
          />
          <p className="text-xs text-gray-500 mt-2">
            Supported formats: PDF, TXT, DOCX (max 10MB)
          </p>
        </div>

        {file && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
            <FileText className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">{file.name}</span>
            <span className="text-xs text-blue-700 ml-auto">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </span>
          </div>
        )}

        {isRateLimited && (
          <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            <span className="text-sm text-orange-700">
              Rate limit reached. Please wait {timeUntilReset} seconds.
            </span>
          </div>
        )}

        <Button 
          onClick={handleUpload} 
          disabled={!file || uploading || isRateLimited}
          className={`w-full ${file && !uploading ? 'animate-pulse bg-blue-600 hover:bg-blue-700' : ''}`}
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing Document...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
              {file && (
                <span className="ml-2 relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
              )}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DocumentUpload;
