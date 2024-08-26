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

import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

import { createRetrievalChain } from 'langchain/chains/retrieval';
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents';
import { ChatPromptTemplate } from '@langchain/core/prompts';

import { PineconeStore } from '@langchain/pinecone';
import { OpenAIEmbeddings } from '@langchain/openai';
import { ChatOpenAI } from '@langchain/openai';

import { Pinecone as PineconeClient } from '@pinecone-database/pinecone';
import { config } from '../../config';

const embeddings = new OpenAIEmbeddings({
  model: 'text-embedding-3-small',
});

const pinecone = new PineconeClient();

const pineconeIndex = pinecone.Index(config.PINECODE_INDEX);

/**
 * Chat
 */
@Tags('Chat')
@Route('chat')
export class ChatController extends Controller {
  @Post('upload')
  public async uploadDocument(@UploadedFile() file: Express.Multer.File): Promise<string> {
    console.log('File uploaded:', file.originalname);

    const filePath = await saveFile(file.originalname, file);

    const loader = new PDFLoader(filePath);

    const docs = await loader.load();

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const splits = await textSplitter.splitDocuments(docs);

    // pincode setup

    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex,
      maxConcurrency: 5,
    });

    await vectorStore.addDocuments(splits);

    return `File ${file.originalname} uploaded successfully.`;
  }

  @Post('ask')
  public async askQuestion(
    @Body() body: { question: string },
  ): Promise<{ answer: string; documentChunks: any[] }> {
    const model = new ChatOpenAI({ model: 'gpt-4o' });

    const systemTemplate = [
      `You are an assistant for question-answering tasks. ,
      Use the following pieces of retrieved context to answer ,
      the question. If you don't know the answer, say that you ,
      don't know. Use three sentences maximum and keep the ,
      answer concise.,
      \n\n,
      {context}`,
    ].join('');

    const prompt = ChatPromptTemplate.fromMessages([
      ['system', systemTemplate],
      ['human', '{input}'],
    ]);

    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex,
      maxConcurrency: 5,
    });

    const questionAnswerChain = await createStuffDocumentsChain({ llm: model, prompt });
    const ragChain = await createRetrievalChain({
      retriever: vectorStore.asRetriever(),
      combineDocsChain: questionAnswerChain,
    });

    const results = await ragChain.invoke({
      input: body.question,
    });

    console.log('Question received:', results.answer);
    return { answer: results.answer, documentChunks: results.context };
  }
}
