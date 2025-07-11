import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  FileText, 
  Download, 
  Trash2, 
  RotateCcw, 
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  FileIcon,
  Eye
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

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

interface DocumentManagerProps {
  documents: Document[];
  loading: boolean;
  deleteDocument: (documentId: string) => Promise<void>;
  reprocessDocument: (documentId: string) => Promise<void>;
  getDocumentChunks: (documentId: string) => Promise<DocumentChunk[]>;
}

const DocumentManager = ({ 
  documents, 
  loading, 
  deleteDocument, 
  reprocessDocument, 
  getDocumentChunks 
}: DocumentManagerProps) => {
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [chunks, setChunks] = useState<DocumentChunk[]>([]);
  const [chunksLoading, setChunksLoading] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return <FileIcon className="h-4 w-4 text-red-500" />;
      case 'docx':
        return <FileIcon className="h-4 w-4 text-blue-500" />;
      case 'txt':
      case 'md':
        return <FileText className="h-4 w-4 text-gray-500" />;
      default:
        return <FileIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewContent = async (documentId: string) => {
    setSelectedDoc(documentId);
    setChunksLoading(true);
    try {
      const documentChunks = await getDocumentChunks(documentId);
      setChunks(documentChunks);
    } catch (error) {
      console.error('Error loading document chunks:', error);
    } finally {
      setChunksLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Document Library</CardTitle>
          <CardDescription>Loading documents...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Document Library
        </CardTitle>
        <CardDescription>
          Manage uploaded documents and their processing status
        </CardDescription>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">No documents uploaded</p>
            <p className="text-sm">Upload your first document to get started with your chatbot's knowledge base.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getFileIcon(doc.file_type)}
                        <div>
                          <p className="font-medium">{doc.original_name}</p>
                          <p className="text-sm text-gray-500">{doc.file_type.toUpperCase()}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{formatFileSize(doc.file_size)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(doc.processing_status)}
                        <Badge className={getStatusColor(doc.processing_status)}>
                          {doc.processing_status.charAt(0).toUpperCase() + doc.processing_status.slice(1)}
                        </Badge>
                      </div>
                      {doc.error_message && (
                        <p className="text-xs text-red-600 mt-1">{doc.error_message}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{formatDate(doc.created_at)}</p>
                        {doc.uploaded_by && (
                          <p className="text-xs text-gray-500">by {doc.uploaded_by}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {doc.processing_status === 'processed' && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleViewContent(doc.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh]">
                              <DialogHeader>
                                <DialogTitle>Document Content: {doc.original_name}</DialogTitle>
                                <DialogDescription>
                                  Processed content chunks from this document
                                </DialogDescription>
                              </DialogHeader>
                              <ScrollArea className="h-[60vh] w-full">
                                {chunksLoading ? (
                                  <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin" />
                                  </div>
                                ) : (
                                  <div className="space-y-4">
                                    {chunks.map((chunk, index) => (
                                      <div key={chunk.id} className="border rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                          <Badge variant="outline">Chunk {chunk.chunk_index + 1}</Badge>
                                          <span className="text-xs text-gray-500">{chunk.word_count} words</span>
                                        </div>
                                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{chunk.content}</p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </ScrollArea>
                            </DialogContent>
                          </Dialog>
                        )}
                        
                        {doc.processing_status === 'error' && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => reprocessDocument(doc.id)}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteDocument(doc.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentManager;
