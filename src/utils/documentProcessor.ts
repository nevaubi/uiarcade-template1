import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Configure PDF.js worker with proper error handling
const configurePDFWorker = () => {
  try {
    // Use HTTPS CDN URL with fallback
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  } catch (error) {
    console.error('Failed to configure PDF.js worker:', error);
    // Fallback to local worker if available
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
  }
};

// Initialize worker configuration
configurePDFWorker();

export interface ProcessedDocument {
  chunks: {
    content: string;
    chunk_index: number;
    word_count: number;
  }[];
  document_name: string;
  file_type: string;
}

// File size limit (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Processing timeout (30 seconds)
const PROCESSING_TIMEOUT = 30000;

// Type guard for PDF.js text items - only TextItem has str property

// Validate file before processing
const validateFile = (file: File): void => {
  if (!file) {
    throw new Error('No file provided');
  }
  
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
  }
  
  const allowedTypes = ['pdf', 'docx', 'txt', 'md'];
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  
  if (!fileExtension || !allowedTypes.includes(fileExtension)) {
    throw new Error(`Unsupported file type: ${fileExtension}. Supported types: ${allowedTypes.join(', ')}`);
  }
};

// Create timeout wrapper for async operations
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Processing timeout')), timeoutMs)
    )
  ]);
};

// Extract text from different file types
export const extractTextFromFile = async (file: File): Promise<string> => {
  console.log(`Starting text extraction for: ${file.name} (${file.size} bytes)`);
  
  validateFile(file);
  
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  
  try {
    let extractionPromise: Promise<string>;
    
    switch (fileExtension) {
      case 'pdf':
        extractionPromise = extractTextFromPDF(file);
        break;
      case 'docx':
        extractionPromise = extractTextFromDOCX(file);
        break;
      case 'txt':
      case 'md':
        extractionPromise = extractTextFromPlainText(file);
        break;
      default:
        throw new Error(`Unsupported file type: ${fileExtension}`);
    }
    
    const text = await withTimeout(extractionPromise, PROCESSING_TIMEOUT);
    console.log(`Successfully extracted ${text.length} characters from ${file.name}`);
    
    if (!text.trim()) {
      throw new Error('No readable text found in document');
    }
    
    return text;
  } catch (error: any) {
    console.error(`Text extraction failed for ${file.name}:`, error);
    throw new Error(`Failed to extract text from ${fileExtension?.toUpperCase()} file: ${error.message}`);
  }
};

// Extract text from PDF using PDF.js with proper types
const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    console.log('Processing PDF file...');
    const arrayBuffer = await file.arrayBuffer();
    
    const loadingTask = pdfjsLib.getDocument({ 
      data: arrayBuffer,
      cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/cmaps/`,
      cMapPacked: true
    });
    
    const pdf = await loadingTask.promise;
    console.log(`PDF loaded with ${pdf.numPages} pages`);
    
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        // Extract text using type-safe approach
        const pageText = textContent.items
          .map((item: any) => {
            // Check if item has str property (TextItem)
            if (item && typeof item === 'object' && 'str' in item && typeof item.str === 'string') {
              return item.str;
            }
            return '';
          })
          .filter(text => text.length > 0)
          .join(' ');
        
        fullText += pageText + '\n';
        console.log(`Processed page ${i}/${pdf.numPages}`);
      } catch (pageError) {
        console.warn(`Failed to process page ${i}:`, pageError);
        // Continue with other pages
      }
    }
    
    return fullText.trim();
  } catch (error: any) {
    console.error('PDF processing error:', error);
    throw new Error(`PDF processing failed: ${error.message}`);
  }
};

// Extract text from DOCX using mammoth
const extractTextFromDOCX = async (file: File): Promise<string> => {
  try {
    console.log('Processing DOCX file...');
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    
    if (result.messages && result.messages.length > 0) {
      console.warn('DOCX processing warnings:', result.messages);
    }
    
    return result.value;
  } catch (error: any) {
    console.error('DOCX processing error:', error);
    throw new Error(`DOCX processing failed: ${error.message}`);
  }
};

// Extract text from plain text files
const extractTextFromPlainText = async (file: File): Promise<string> => {
  try {
    console.log('Processing plain text file...');
    const text = await file.text();
    return text;
  } catch (error: any) {
    console.error('Plain text processing error:', error);
    throw new Error(`Text file processing failed: ${error.message}`);
  }
};

// Chunk text into smaller pieces with improved algorithm
export const chunkText = (text: string, maxChunkSize: number = 1000): string[] => {
  if (!text || text.trim().length === 0) {
    throw new Error('No text to chunk');
  }
  
  console.log(`Chunking text of ${text.length} characters with max chunk size ${maxChunkSize}`);
  
  // Split by sentences first
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const chunks: string[] = [];
  let currentChunk = '';
  
  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    
    // If adding this sentence would exceed the limit
    if (currentChunk.length + trimmedSentence.length + 2 > maxChunkSize) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = trimmedSentence;
      } else {
        // Single sentence is too long, split by words
        const words = trimmedSentence.split(' ');
        let wordChunk = '';
        
        for (const word of words) {
          if (wordChunk.length + word.length + 1 > maxChunkSize) {
            if (wordChunk) {
              chunks.push(wordChunk.trim());
            }
            wordChunk = word;
          } else {
            wordChunk += (wordChunk ? ' ' : '') + word;
          }
        }
        
        if (wordChunk) {
          currentChunk = wordChunk;
        }
      }
    } else {
      currentChunk += (currentChunk ? '. ' : '') + trimmedSentence;
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  const validChunks = chunks.filter(chunk => chunk.length > 0);
  console.log(`Created ${validChunks.length} chunks`);
  
  return validChunks;
};

// Count words in text
export const countWords = (text: string): number => {
  if (!text || typeof text !== 'string') {
    return 0;
  }
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

// Process complete document with comprehensive error handling
export const processDocument = async (file: File): Promise<ProcessedDocument> => {
  console.log('=== Starting document processing ===');
  console.log('File details:', {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: new Date(file.lastModified).toISOString()
  });
  
  try {
    // Extract text with timeout
    const fullText = await extractTextFromFile(file);
    
    if (!fullText || fullText.trim().length === 0) {
      throw new Error('No readable text found in document');
    }
    
    console.log(`Extracted text: ${fullText.length} characters`);
    
    // Chunk text
    const textChunks = chunkText(fullText);
    
    if (textChunks.length === 0) {
      throw new Error('Failed to create text chunks');
    }
    
    // Prepare chunks with metadata
    const chunks = textChunks.map((content, index) => ({
      content,
      chunk_index: index,
      word_count: countWords(content)
    }));
    
    const result: ProcessedDocument = {
      chunks,
      document_name: file.name,
      file_type: file.name.split('.').pop()?.toLowerCase() || 'unknown'
    };
    
    console.log('=== Document processing completed ===');
    console.log(`Created ${chunks.length} chunks with ${chunks.reduce((sum, chunk) => sum + chunk.word_count, 0)} total words`);
    
    return result;
  } catch (error: any) {
    console.error('=== Document processing failed ===');
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    
    // Re-throw with more context
    throw new Error(`Document processing failed for "${file.name}": ${error.message}`);
  }
};
