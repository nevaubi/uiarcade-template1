import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  FileText, 
  Trash2, 
  AlertCircle,
  CheckCircle,
  Loader2,
  FileIcon,
  Eye,
  File
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DocumentInfo {
  name: string;
  file_type: string;
  chunks: any[];
  total_chunks: number;
  total_words: number;
  created_at: string;
  created_by?: string;
}

interface DocumentManagerProps {
  documents: DocumentInfo[];
  loading: boolean;
  deleteDocument: (documentName: string) => Promise<void>;
}

const DocumentManager = ({ 
  documents, 
  loading, 
  deleteDocument
}: DocumentManagerProps) => {
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [viewingChunks, setViewingChunks] = useState<any[]>([]);
  const [deletingDoc, setDeletingDoc] = useState<string | null>(null);

  const getFileIcon = (fileType: string) => {
    if (!fileType) return <File className="h-4 w-4 text-gray-400" />;
    
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return <File className="h-4 w-4 text-red-500" />;
      case 'docx':
        return <File className="h-4 w-4 text-blue-500" />;
      case 'txt':
      case 'md':
        return <FileText className="h-4 w-4 text-gray-500" />;
      default:
        return <File className="h-4 w-4 text-gray-400" />;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown';
    
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  const handleViewContent = (doc: DocumentInfo) => {
    if (!doc || !doc.chunks) return;
    
    setSelectedDoc(doc.name);
    setViewingChunks(doc.chunks.sort((a, b) => (a.chunk_index || 0) - (b.chunk_index || 0)));
  };

  const handleDelete = async (documentName: string) => {
    if (!documentName || deletingDoc) return;
    
    try {
      setDeletingDoc(documentName);
      await deleteDocument(documentName);
    } catch (error) {
      console.error('Failed to delete document:', error);
    } finally {
      setDeletingDoc(null);
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
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Library
          </CardTitle>
          <CardDescription>
            Manage processed documents and their content chunks
          </CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No documents uploaded yet</p>
              <p className="text-sm text-gray-400 mt-2">
                Upload documents above to build your knowledge base
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Chunks</TableHead>
                    <TableHead>Words</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.name}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {getFileIcon(doc.file_type)}
                          <span className="truncate max-w-[200px]">
                            {doc.name || 'Unnamed document'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {doc.file_type?.toUpperCase() || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell>{doc.total_chunks || 0}</TableCell>
                      <TableCell>{doc.total_words?.toLocaleString() || 0}</TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {formatDate(doc.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            onClick={() => handleViewContent(doc)}
                            size="sm"
                            variant="ghost"
                            disabled={!doc.chunks || doc.chunks.length === 0}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(doc.name)}
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700"
                            disabled={deletingDoc === doc.name}
                          >
                            {deletingDoc === doc.name ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
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

      {/* View Content Dialog */}
      <Dialog open={!!selectedDoc && viewingChunks.length > 0} onOpenChange={() => {
        setSelectedDoc(null);
        setViewingChunks([]);
      }}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Document Content: {selectedDoc}</DialogTitle>
            <DialogDescription>
              Viewing {viewingChunks.length} chunks
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[500px] w-full rounded-md border p-4">
            {viewingChunks.map((chunk, index) => (
              <div key={chunk.id || index} className="mb-4 pb-4 border-b last:border-b-0">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary">
                    Chunk {chunk.chunk_index !== undefined ? chunk.chunk_index + 1 : index + 1}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {chunk.word_count || 0} words
                  </span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {chunk.content || 'No content available'}
                </p>
              </div>
            ))}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DocumentManager;
