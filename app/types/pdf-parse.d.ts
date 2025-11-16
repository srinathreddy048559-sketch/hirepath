// types/pdf-parse.d.ts
declare module 'pdf-parse' {
  interface PDFParseResult {
    numpages: number;
    numrender: number;
    info: Record<string, any>;
    metadata?: any;
    version?: string;
    text: string;
  }
  function pdf(dataBuffer: Buffer | Uint8Array, options?: Record<string, any>): Promise<PDFParseResult>;
  export default pdf;
}
