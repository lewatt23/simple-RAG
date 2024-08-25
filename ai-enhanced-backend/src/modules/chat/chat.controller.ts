import express from 'express';
import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Path,
  Post,
  Put,
  Request,
  Response,
  Route,
  Security,
  SuccessResponse,
  Tags,
  UploadedFile,
} from 'tsoa';
import { saveFile } from '../media/utils';

import 'pdf-parse'; // Peer dep
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';

/**
 * Chat
 */
@Tags('Chat')
@Route('chat')
export class ChatController extends Controller {
  @Post('upload')
  public async uploadDocument(@UploadedFile() file: Express.Multer.File): Promise<string> {
    // Here, you would process the file, save it, or analyze it.
    console.log('File uploaded:', file.originalname);

    const filePath = await saveFile(file.originalname, file);

    const loader = new PDFLoader(filePath);

    const docs = await loader.load();

    console.log(docs.length);

    console.log(docs[0].pageContent.slice(0, 100));
    console.log(docs[0].metadata);

    return `File ${file.originalname} uploaded successfully.`;
  }

  @Post('ask')
  public async askQuestion(@Body() body: any): Promise<string> {
    // Replace with your actual question-answering logic
    console.log('Question received:', body.question);
    return `Answer to "${body.question}" is not implemented yet.`;
  }
}
