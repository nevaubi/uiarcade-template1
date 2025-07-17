import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  FileText, 
  Trash2, 
  Loader2,
  Eye,
  File
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DocumentInfo {
  name: string;
  file_type: string;
  chunks: any[];
  total_chunks: number;
  total_words: number;
  created_at: string;
  created_by: string | null;
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
    if (!fileType) return <File className="h-5 w-5 text-muted-foreground" />;
    
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return <File className="h-5 w-5 text-red-500" />;
      case 'docx':
        return <File className="h-5 w-5 text-blue-500" />;
      case 'txt':
      case 'md':
        return <FileText className="h-5 w-5 text-muted-foreground" />;
      default:
        return <File className="h-5 w-5 text-muted-foreground" />;
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
      <Card className="overflow-hidden backdrop-blur-sm bg-card/95 border-0 shadow-lg ring-1 ring-border/10">
        <CardHeader className="pb-6 px-8 pt-8">
          <CardTitle className="flex items-center gap-4 text-xl font-semibold tracking-tight">
            <div className="p-3 rounded-2xl bg-primary/8 ring-1 ring-primary/10 backdrop-blur-sm">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            Document Library
          </CardTitle>
          <CardDescription className="text-muted-foreground text-base leading-relaxed mt-2">
            Loading documents...
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <div className="flex items-center justify-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/8 ring-1 ring-primary/10 backdrop-blur-sm">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="overflow-hidden backdrop-blur-sm bg-card/95 border-0 shadow-lg ring-1 ring-border/10">
        <CardHeader className="pb-6 px-8 pt-8">
          <CardTitle className="flex items-center gap-4 text-xl font-semibold tracking-tight">
            <div className="p-3 rounded-2xl bg-primary/8 ring-1 ring-primary/10 backdrop-blur-sm">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            Document Library
          </CardTitle>
          <CardDescription className="text-muted-foreground text-base leading-relaxed mt-2">
            Manage processed documents and their content chunks
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          {documents.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/30 mb-6 ring-1 ring-border/20 backdrop-blur-sm">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No documents uploaded yet</h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                Upload documents above to build your knowledge base
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border/30 backdrop-blur-sm bg-card/50">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30">
                    <TableHead className="font-semibold text-foreground">Document</TableHead>
                    <TableHead className="font-semibold text-foreground">Type</TableHead>
                    <TableHead className="font-semibold text-foreground">Chunks</TableHead>
                    <TableHead className="font-semibold text-foreground">Words</TableHead>
                    <TableHead className="font-semibold text-foreground">Uploaded</TableHead>
                    <TableHead className="text-right font-semibold text-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.name} className="border-border/30 hover:bg-accent/30 transition-colors duration-200">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/8 ring-1 ring-primary/10 backdrop-blur-sm">
                            {getFileIcon(doc.file_type)}
                          </div>
                          <span className="truncate max-w-[200px] font-semibold text-foreground">
                            {doc.name || 'Unnamed document'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="rounded-lg font-semibold">
                          {doc.file_type?.toUpperCase() || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-foreground">{doc.total_chunks || 0}</TableCell>
                      <TableCell className="font-medium text-foreground">{doc.total_words?.toLocaleString() || 0}</TableCell>
                      <TableCell className="text-sm text-muted-foreground font-medium">
                        {formatDate(doc.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            onClick={() => handleViewContent(doc)}
                            size="sm"
                            variant="ghost"
                            disabled={!doc.chunks || doc.chunks.length === 0}
                            className="h-10 w-10 p-0 rounded-xl hover:bg-accent/50 hover:scale-105 transition-all duration-200"
                          >
                            <Eye className="h-5 w-5" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(doc.name)}
                            size="sm"
                            variant="ghost"
                            className="h-10 w-10 p-0 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive hover:scale-105 transition-all duration-200"
                            disabled={deletingDoc === doc.name}
                          >
                            {deletingDoc === doc.name ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                              <Trash2 className="h-5 w-5" />
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
        <DialogContent className="max-w-4xl max-h-[85vh] rounded-3xl backdrop-blur-sm bg-card/95 border-0 shadow-2xl ring-1 ring-border/10">
          <DialogHeader className="px-2 pt-2">
            <DialogTitle className="text-xl font-semibold tracking-tight">Document Content: {selectedDoc}</DialogTitle>
            <DialogDescription className="text-base text-muted-foreground font-medium">
              Viewing {viewingChunks.length} chunks
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[500px] w-full rounded-2xl border border-border/30 p-6 backdrop-blur-sm bg-card/50">
            {viewingChunks.map((chunk, index) => (
              <div key={chunk.id || index} className="mb-6 pb-6 border-b border-border/30 last:border-b-0">
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="secondary" className="rounded-lg font-semibold">
                    Chunk {chunk.chunk_index !== undefined ? chunk.chunk_index + 1 : index + 1}
                  </Badge>
                  <span className="text-sm text-muted-foreground font-medium">
                    {chunk.word_count || 0} words
                  </span>
                </div>
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
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
