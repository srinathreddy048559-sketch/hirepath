declare module "pdf-parse" {
  export default function pdf(dataBuffer: Buffer | Uint8Array): Promise<{
    numpages: number;
    numrender: number;
    info: any;
    metadata: any;
    version: string;
    text: string;
  }>;
}
