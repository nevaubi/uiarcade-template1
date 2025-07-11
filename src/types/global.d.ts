// src/types/global.d.ts

declare module 'pdfjs-dist' {
  export * from 'pdfjs-dist/types/src/pdf';
}

declare module 'mammoth' {
  export interface ExtractRawTextOptions {
    arrayBuffer: ArrayBuffer;
  }
  
  export interface ExtractRawTextResult {
    value: string;
    messages: any[];
  }
  
  export function extractRawText(options: ExtractRawTextOptions): Promise<ExtractRawTextResult>;
  export function convertToHtml(options: { arrayBuffer: ArrayBuffer }): Promise<{ value: string; messages: any[] }>;
  export function convertToMarkdown(options: { arrayBuffer: ArrayBuffer }): Promise<{ value: string; messages: any[] }>;
}

// Extend Window interface for any custom properties
declare global {
  interface Window {
    fs?: {
      readFile: (path: string, options?: { encoding?: string }) => Promise<ArrayBuffer | string>;
    };
  }
}

export {};
