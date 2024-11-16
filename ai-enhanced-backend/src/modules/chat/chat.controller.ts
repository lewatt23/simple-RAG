import express from 'express';
import {
  Body,
  Controller,
  Delete,
  FormField,
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
  public async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @FormField() title: string,
    @FormField() description: string,
  ): Promise<any> {
    const docs = await ChatModel.uploadAndIndexDocument(file, title, description);
    // console.log('File uploaded successfully.', file, title, description);

    return docs;
  }

  @Get('getDocuments')
  public async getDocuments(): Promise<any> {
    const docs = await ChatModel.getDocuments();

    return docs;
  }

  @Post('recommendBooks')
  public async askQuestion(@Body() body: { questions: string }): Promise<{ answer: string }> {
    const results = await ChatModel.recommendBooks(body.questions);

    console.log('results', results?.content);
    return { answer: String(results?.content) };
  }

  @Post('askQuestionAboutBook')
  public async askQuestionAboutBook(
    @Body() body: { question: string; title: string },
  ): Promise<{ answer: string; documentChunks: any[] }> {
    const results = await ChatModel.askQuestion(body.question, body.title);

    console.log('Question received:', results.answer);
    return { answer: results.answer, documentChunks: results.context };
  }
}
