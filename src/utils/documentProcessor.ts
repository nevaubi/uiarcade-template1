
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface ProcessedDocument {
  chunks: {
    content: string;
    chunk_index: number;
    word_count: number;
  }[];
  document_name: string;
  file_type: string;
}

// Extract text from different file types
export const extractTextFromFile = async (file: File): Promise<string> => {
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  
  switch (fileExtension) {
    case 'pdf':
      return extractTextFromPDF(file);
    case 'docx':
      return extractTextFromDOCX(file);
    case 'txt':
    case 'md':
      return extractTextFromPlainText(file);
    default:
      throw new Error(`Unsupported file type: ${fileExtension}`);
  }
};

// Extract text from PDF using PDF.js
const extractTextFromPDF = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    fullText += pageText + '\n';
  }
  
  return fullText.trim();
};

// Extract text from DOCX using mammoth
const extractTextFromDOCX = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
};

// Extract text from plain text files
const extractTextFromPlainText = async (file: File): Promise<string> => {
  return await file.text();
};

// Chunk text into smaller pieces
export const chunkText = (text: string, maxChunkSize: number = 1000): string[] => {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const chunks: string[] = [];
  let currentChunk = '';
  
  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    if (currentChunk.length + trimmedSentence.length > maxChunkSize) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = trimmedSentence;
      } else {
        // If single sentence is too long, split by words
        const words = trimmedSentence.split(' ');
        let wordChunk = '';
        for (const word of words) {
          if (wordChunk.length + word.length > maxChunkSize) {
            if (wordChunk) chunks.push(wordChunk.trim());
            wordChunk = word;
          } else {
            wordChunk += (wordChunk ? ' ' : '') + word;
          }
        }
        if (wordChunk) currentChunk = wordChunk;
      }
    } else {
      currentChunk += (currentChunk ? '. ' : '') + trimmedSentence;
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks.filter(chunk => chunk.length > 0);
};

// Count words in text
export const countWords = (text: string): number => {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

// Process complete document
export const processDocument = async (file: File): Promise<ProcessedDocument> => {
  console.log('Processing document:', file.name);
  
  // Extract text
  const fullText = await extractTextFromFile(file);
  console.log('Extracted text length:', fullText.length);
  
  // Chunk text
  const textChunks = chunkText(fullText);
  console.log('Created chunks:', textChunks.length);
  
  // Prepare chunks with metadata
  const chunks = textChunks.map((content, index) => ({
    content,
    chunk_index: index,
    word_count: countWords(content)
  }));
  
  return {
    chunks,
    document_name: file.name,
    file_type: file.name.split('.').pop()?.toLowerCase() || 'unknown'
  };
};
