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
import { ChatModel } from './chat.model';

/**
 * Chat
 */
@Tags('Chat')
@Route('chat')
export class ChatController extends Controller {
  @Post('upload')
  public async uploadDocument(@UploadedFile() file: Express.Multer.File): Promise<string> {
    await ChatModel.uploadAndIndexDocument(file);

    return `File ${file.originalname} uploaded successfully.`;
  }

  @Post('ask')
  public async askQuestion(
    @Body() body: { question: string },
  ): Promise<{ answer: string; documentChunks: any[] }> {
    const results = await ChatModel.askQuestion(body.question);

    console.log('Question received:', results.answer);
    return { answer: results.answer, documentChunks: results.context };
  }
}
