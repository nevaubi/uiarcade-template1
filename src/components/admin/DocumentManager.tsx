
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
  Eye
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewContent = (doc: DocumentInfo) => {
    setSelectedDoc(doc.name);
    setViewingChunks(doc.chunks.sort((a, b) => a.chunk_index - b.chunk_index));
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
          Manage processed documents and their content chunks
        </CardDescription>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">No documents processed</p>
            <p className="text-sm">Upload your first document to get started with your chatbot's knowledge base.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Chunks</TableHead>
                  <TableHead>Words</TableHead>
                  <TableHead>Processed</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.name}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getFileIcon(doc.file_type)}
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-sm text-gray-500">{doc.file_type.toUpperCase()}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {doc.total_chunks} chunks
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {doc.total_words.toLocaleString()} words
                      </span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{formatDate(doc.created_at)}</p>
                        {doc.created_by && (
                          <p className="text-xs text-gray-500">by {doc.created_by}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleViewContent(doc)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh]">
                            <DialogHeader>
                              <DialogTitle>Document Content: {selectedDoc}</DialogTitle>
                              <DialogDescription>
                                Processed content chunks from this document
                              </DialogDescription>
                            </DialogHeader>
                            <ScrollArea className="h-[60vh] w-full">
                              <div className="space-y-4">
                                {viewingChunks.map((chunk, index) => (
                                  <div key={chunk.id} className="border rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                      <Badge variant="outline">Chunk {chunk.chunk_index + 1}</Badge>
                                      <span className="text-xs text-gray-500">{chunk.word_count} words</span>
                                    </div>
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{chunk.content}</p>
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          </DialogContent>
                        </Dialog>
                        
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteDocument(doc.name)}
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
