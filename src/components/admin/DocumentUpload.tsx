
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Upload, FileText, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRateLimit } from '@/hooks/useRateLimit';

interface DocumentUploadProps {
  onUploadComplete?: () => void;
  uploading?: boolean;
  uploadDocument?: (file: File) => Promise<string>;
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
          <Upload className="h-5 w-5" />
          Upload Document
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Input
            type="file"
            accept=".pdf,.txt,.docx"
            onChange={handleFileChange}
            disabled={uploading || isRateLimited}
          />
          <p className="text-sm text-muted-foreground mt-2">
            Supported formats: PDF, TXT, DOCX (max 10MB)
          </p>
        </div>

        {file && (
          <div className="flex items-center gap-2 p-2 bg-muted rounded">
            <FileText className="h-4 w-4" />
            <span className="text-sm">{file.name}</span>
          </div>
        )}

        {isRateLimited && (
          <div className="flex items-center gap-2 p-2 bg-orange-50 border border-orange-200 rounded">
            <AlertCircle className="h-4 w-4 text-orange-500" />
            <span className="text-sm text-orange-700">
              Rate limit reached. Please wait {timeUntilReset} seconds.
            </span>
          </div>
        )}

        <Button 
          onClick={handleUpload} 
          disabled={!file || uploading || isRateLimited}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DocumentUpload;
