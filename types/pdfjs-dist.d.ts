// types/pdfjs-dist.d.ts
// Minimal types so TypeScript stops complaining about pdfjs-dist.
// We're only using GlobalWorkerOptions + getDocument + PDFDocumentProxy.

declare module "pdfjs-dist/build/pdf" {
  export interface PDFPageProxy {
    getTextContent(): Promise<{
      items: any[];
    }>;
  }

  export interface PDFDocumentProxy {
    numPages: number;
    getPage(pageNumber: number): Promise<PDFPageProxy>;
  }

  export interface GlobalWorkerOptionsType {
    workerSrc: string;
  }

  export const GlobalWorkerOptions: GlobalWorkerOptionsType;

  export function getDocument(
    src: any
  ): {
    promise: Promise<PDFDocumentProxy>;
  };
}
