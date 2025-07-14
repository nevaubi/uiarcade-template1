import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  const [isDragActive, setIsDragActive] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const { toast } = useToast();
  const { isRateLimited, timeUntilReset } = useRateLimit();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploading = externalUploading || internalUploading;

  const validateFile = useCallback((selectedFile: File) => {
    const validTypes = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(selectedFile.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, TXT, or DOCX file.",
        variant: "destructive",
      });
      return false;
    }
    
    if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  }, [toast]);

  const handleFileChange = useCallback((selectedFile: File) => {
    if (validateFile(selectedFile)) {
      setFile(selectedFile);
    }
  }, [validateFile]);

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileChange(selectedFile);
    }
  };

  const onDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!uploading && !isRateLimited) {
      setIsDragActive(true);
    }
  }, [uploading, isRateLimited]);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    setIsDragOver(false);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!uploading && !isRateLimited) {
      setIsDragOver(true);
    }
  }, [uploading, isRateLimited]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    setIsDragOver(false);

    if (uploading || isRateLimited) return;

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      handleFileChange(droppedFiles[0]);
    }
  }, [uploading, isRateLimited, handleFileChange]);

  const handleBrowseClick = () => {
    if (!uploading && !isRateLimited) {
      fileInputRef.current?.click();
    }
  };

  const resetFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!file || uploading || isRateLimited) return;

    if (externalUploadDocument) {
      try {
        await externalUploadDocument(file);
        resetFile();
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

      resetFile();
      
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

  const getDropZoneClasses = () => {
    let baseClasses = "relative border-2 border-dashed rounded-2xl transition-all duration-300 ease-out cursor-pointer group";
    
    if (isDragOver || isDragActive) {
      return `${baseClasses} border-primary/60 bg-primary/5 scale-[1.02] shadow-lg`;
    }
    
    if (uploading || isRateLimited) {
      return `${baseClasses} border-muted bg-muted/20 cursor-not-allowed opacity-60`;
    }
    
    if (file) {
      return `${baseClasses} border-primary/40 bg-primary/5 hover:border-primary/60 hover:bg-primary/10`;
    }
    
    return `${baseClasses} border-border hover:border-primary/40 hover:bg-accent`;
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-lg font-semibold">
          <div className="p-2 rounded-xl bg-primary/10">
            <CloudUpload className="h-5 w-5 text-primary" />
          </div>
          Upload Documents
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Upload documents to build your chatbot's knowledge base
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Drag & Drop Zone */}
        <div
          className={getDropZoneClasses()}
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onClick={handleBrowseClick}
        >
          <div className="p-8 text-center">
            <div className="mb-4">
              {uploading ? (
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-2">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                </div>
              ) : file ? (
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-2 transform group-hover:scale-105 transition-transform">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
              ) : (
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-2 transform group-hover:scale-105 transition-transform">
                  <CloudUpload className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              {uploading ? (
                <>
                  <h3 className="text-lg font-medium text-foreground">Processing Document...</h3>
                  <p className="text-sm text-muted-foreground">Please wait while we process your file</p>
                </>
              ) : file ? (
                <>
                  <h3 className="text-lg font-medium text-foreground">Ready to Upload</h3>
                  <p className="text-sm text-muted-foreground">Click the upload button below to proceed</p>
                </>
              ) : isDragActive ? (
                <>
                  <h3 className="text-lg font-medium text-primary">Drop your file here</h3>
                  <p className="text-sm text-muted-foreground">Release to select this file</p>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-medium text-foreground">Drop files to upload</h3>
                  <p className="text-sm text-muted-foreground">
                    Or <span className="text-primary font-medium">browse</span> to choose files
                  </p>
                </>
              )}
            </div>
            
            <div className="mt-4 pt-4 border-t border-border/50">
              <p className="text-xs text-muted-foreground">
                Supports PDF, TXT, DOCX • Max 10MB
              </p>
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.docx"
            onChange={onFileInputChange}
            disabled={uploading || isRateLimited}
            className="hidden"
          />
        </div>

        {/* Selected File Display */}
        {file && (
          <div className="p-4 bg-accent/50 rounded-xl border border-border/50 transition-all duration-200">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  resetFile();
                }}
                className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
              >
                ×
              </Button>
            </div>
          </div>
        )}

        {/* Rate Limit Warning */}
        {isRateLimited && (
          <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-xl">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-destructive">Rate limit reached</p>
                <p className="text-xs text-destructive/80">
                  Please wait {timeUntilReset} seconds before uploading
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Upload Button */}
        <Button 
          onClick={handleUpload} 
          disabled={!file || uploading || isRateLimited}
          size="lg"
          className="w-full h-12 text-base font-medium transition-all duration-200 disabled:opacity-50"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing Document...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-5 w-5" />
              Upload Document
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DocumentUpload;
