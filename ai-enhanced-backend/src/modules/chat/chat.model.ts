import { saveFile } from '../media/utils';

import 'pdf-parse'; // Peer dep
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';

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

export const ChatModel = {
  uploadAndIndexDocument: async (file: Express.Multer.File) => {
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
  },

  askQuestion: async (question: string) => {
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
      input: question,
    });

    return results;
  },
};
