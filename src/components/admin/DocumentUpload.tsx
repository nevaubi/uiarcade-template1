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
    let baseClasses = "relative border-2 border-dashed rounded-3xl transition-all duration-300 ease-out cursor-pointer group backdrop-blur-sm ring-1 ring-border/10";
    
    if (isDragOver || isDragActive) {
      return `${baseClasses} border-primary/60 bg-primary/8 scale-[1.02] shadow-xl ring-primary/20`;
    }
    
    if (uploading || isRateLimited) {
      return `${baseClasses} border-muted bg-muted/20 cursor-not-allowed opacity-60`;
    }
    
    if (file) {
      return `${baseClasses} border-primary/40 bg-primary/8 hover:border-primary/60 hover:bg-primary/12 hover:shadow-lg hover:ring-primary/20`;
    }
    
    return `${baseClasses} border-border/40 hover:border-primary/40 hover:bg-accent/30 hover:shadow-md hover:ring-border/20`;
  };

  return (
    <Card className="overflow-hidden backdrop-blur-sm bg-card/95 border-0 shadow-lg ring-1 ring-border/10">
      <CardHeader className="pb-6 px-8 pt-8">
        <CardTitle className="flex items-center gap-4 text-xl font-semibold tracking-tight">
          <div className="p-3 rounded-2xl bg-primary/8 ring-1 ring-primary/10 backdrop-blur-sm">
            <CloudUpload className="h-6 w-6 text-primary" />
          </div>
          Upload Documents
        </CardTitle>
        <CardDescription className="text-muted-foreground text-base leading-relaxed mt-2">
          Upload documents to build your chatbot's knowledge base
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-8 px-8 pb-8">
        {/* Drag & Drop Zone */}
        <div
          className={getDropZoneClasses()}
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onClick={handleBrowseClick}
        >
          <div className="px-10 py-12 text-center">
            <div className="mb-6">
              {uploading ? (
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/8 mb-3 ring-1 ring-primary/10 backdrop-blur-sm">
                  <Loader2 className="h-10 w-10 text-primary animate-spin" />
                </div>
              ) : file ? (
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/8 mb-3 ring-1 ring-primary/10 backdrop-blur-sm transform group-hover:scale-105 transition-all duration-300 ease-out">
                  <FileText className="h-10 w-10 text-primary" />
                </div>
              ) : (
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted/30 mb-3 ring-1 ring-border/20 backdrop-blur-sm transform group-hover:scale-105 group-hover:bg-primary/8 group-hover:ring-primary/10 transition-all duration-300 ease-out">
                  <CloudUpload className="h-10 w-10 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              {uploading ? (
                <>
                  <h3 className="text-xl font-semibold text-foreground tracking-tight">Processing Document...</h3>
                  <p className="text-base text-muted-foreground leading-relaxed">Please wait while we process your file</p>
                </>
              ) : file ? (
                <>
                  <h3 className="text-xl font-semibold text-foreground tracking-tight">Ready to Upload</h3>
                  <p className="text-base text-muted-foreground leading-relaxed">Click the upload button below to proceed</p>
                </>
              ) : isDragActive ? (
                <>
                  <h3 className="text-xl font-semibold text-primary tracking-tight">Drop your file here</h3>
                  <p className="text-base text-muted-foreground leading-relaxed">Release to select this file</p>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-semibold text-foreground tracking-tight">Drop files to upload</h3>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    Or <span className="text-primary font-semibold">browse</span> to choose files
                  </p>
                </>
              )}
            </div>
            
            <div className="mt-6 pt-6 border-t border-border/30">
              <p className="text-sm text-muted-foreground font-medium">
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
          <div className="p-5 bg-accent/30 rounded-2xl border border-border/30 transition-all duration-300 hover:bg-accent/40 backdrop-blur-sm ring-1 ring-border/10">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/8 ring-1 ring-primary/10 backdrop-blur-sm">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-foreground truncate">{file.name}</p>
                <p className="text-sm text-muted-foreground font-medium">
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
                className="h-10 w-10 p-0 rounded-xl hover:bg-destructive/10 hover:text-destructive hover:scale-105 transition-all duration-200"
              >
                <span className="text-lg">×</span>
              </Button>
            </div>
          </div>
        )}

        {/* Rate Limit Warning */}
        {isRateLimited && (
          <div className="p-5 bg-destructive/5 border border-destructive/20 rounded-2xl backdrop-blur-sm ring-1 ring-destructive/10">
            <div className="flex items-center gap-4">
              <AlertCircle className="h-6 w-6 text-destructive flex-shrink-0" />
              <div>
                <p className="text-base font-semibold text-destructive">Rate limit reached</p>
                <p className="text-sm text-destructive/80 font-medium">
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
          className="w-full h-14 text-base font-semibold transition-all duration-300 disabled:opacity-50 rounded-2xl hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl backdrop-blur-sm"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-3 h-6 w-6 animate-spin" />
              Processing Document...
            </>
          ) : (
            <>
              <Upload className="mr-3 h-6 w-6" />
              Upload Document
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DocumentUpload;
