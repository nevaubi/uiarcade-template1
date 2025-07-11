import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  X,
  File
} from 'lucide-react';

interface FileWithStatus extends File {
  uploadStatus?: 'pending' | 'uploading' | 'success' | 'error';
  uploadProgress?: number;
  errorMessage?: string;
}

interface DocumentUploadProps {
  uploading: boolean;
  uploadDocument: (file: File) => Promise<string | null>;
}

const DocumentUpload = ({ uploading, uploadDocument }: DocumentUploadProps) => {
  const [files, setFiles] = useState<FileWithStatus[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log('Files dropped:', acceptedFiles);
    
    const filesWithStatus: FileWithStatus[] = acceptedFiles.map(file => {
      // Create a new file object that preserves all File properties
      const fileWithStatus = Object.assign(file, {
        uploadStatus: 'pending' as const,
        uploadProgress: 0
      });
      return fileWithStatus;
    });

    setFiles(prev => [...prev, ...filesWithStatus]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true
  });

  const handleUpload = async (file: FileWithStatus, index: number) => {
    console.log('Starting upload for file:', file.name);
    
    setFiles(prev => prev.map((f, i) => 
      i === index ? { ...f, uploadStatus: 'uploading', uploadProgress: 50 } : f
    ));

    try {
      const result = await uploadDocument(file);
      
      if (result) {
        setFiles(prev => prev.map((f, i) => 
          i === index ? { ...f, uploadStatus: 'success', uploadProgress: 100 } : f
        ));
        
        // Remove successful upload after 2 seconds
        setTimeout(() => {
          setFiles(prev => prev.filter((_, i) => i !== index));
        }, 2000);
      } else {
        setFiles(prev => prev.map((f, i) => 
          i === index ? { ...f, uploadStatus: 'error', errorMessage: 'Processing failed' } : f
        ));
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      setFiles(prev => prev.map((f, i) => 
        i === index ? { 
          ...f, 
          uploadStatus: 'error', 
          errorMessage: error.message || 'Processing failed' 
        } : f
      ));
    }
  };

  const handleUploadAll = async () => {
    const pendingFiles = files.filter(f => f.uploadStatus === 'pending');
    
    for (let i = 0; i < files.length; i++) {
      if (files[i].uploadStatus === 'pending') {
        await handleUpload(files[i], i);
      }
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: FileWithStatus | File) => {
    // Add defensive checks
    if (!file || !file.name) {
      console.warn('Invalid file object passed to getFileIcon:', file);
      return <File className="h-8 w-8 text-gray-400" />;
    }

    const nameParts = file.name.split('.');
    const extension = nameParts.length > 1 ? nameParts.pop()?.toLowerCase() : undefined;

    switch (extension) {
      case 'pdf':
        return <File className="h-8 w-8 text-red-500" />;
      case 'docx':
        return <File className="h-8 w-8 text-blue-500" />;
      case 'txt':
      case 'md':
        return <FileText className="h-8 w-8 text-gray-500" />;
      default:
        return <File className="h-8 w-8 text-gray-400" />;
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'uploading':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Documents
        </CardTitle>
        <CardDescription>
          Upload documents to build your chatbot's knowledge base. Files are processed instantly in your browser! Supported formats: PDF, DOCX, TXT, MD (Max 10MB per file)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Drop Zone */}
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
            }
          `}
        >
          <input {...getInputProps()} />
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            {isDragActive ? 'Drop files here' : 'Drag and drop files here'}
          </p>
          <p className="text-sm text-gray-600 mb-4">
            or click to browse your computer
          </p>
          <Button variant="outline">
            Choose Files
          </Button>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Files to Process</h4>
              <div className="flex gap-2">
                <Button 
                  onClick={handleUploadAll}
                  disabled={uploading || files.every(f => f.uploadStatus !== 'pending')}
                  size="sm"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Process All'
                  )}
                </Button>
                <Button 
                  onClick={() => setFiles([])}
                  variant="outline"
                  size="sm"
                >
                  Clear All
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {files.map((file, index) => (
                <div 
                  key={`${file.name}-${index}`}
                  className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50"
                >
                  <div className="flex-shrink-0">
                    {getFileIcon(file)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name || 'Unknown file'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                    {file.errorMessage && (
                      <p className="text-xs text-red-600 mt-1">
                        {file.errorMessage}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {file.uploadStatus === 'uploading' && (
                      <Progress value={file.uploadProgress} className="w-24" />
                    )}
                    
                    {getStatusIcon(file.uploadStatus)}
                    
                    {file.uploadStatus === 'pending' && (
                      <Button
                        onClick={() => handleUpload(file, index)}
                        size="sm"
                        variant="outline"
                        disabled={uploading}
                      >
                        Process
                      </Button>
                    )}
                    
                    <Button
                      onClick={() => removeFile(index)}
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentUpload;
