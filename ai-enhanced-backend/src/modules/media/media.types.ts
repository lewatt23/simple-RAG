import { Readable } from 'stream';

export interface MediaCreateOneFromFileInput {
  type: EMediaTypes;
  isPrivate: boolean;
  file: any;
}

export enum EMediaTypes {
  Doc = 'document',
}

export interface FileUploadType extends Express.Multer.File {
  filename: string;
  mimetype: string;
  encoding: string;
  createReadStream(): Readable | null;
  buffer: any;
}
