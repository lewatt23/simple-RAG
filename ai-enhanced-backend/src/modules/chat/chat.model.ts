import { saveFile } from '../media/utils';

import fs from 'fs';
import path from 'path';

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

const fileNamePath = path.resolve(__dirname, '../../../uploaded_files.txt');

const appendFileName = async (fileName: string, title: string, description: string) => {
  try {
    const entry = `${fileName}|${title}|${description}
    
`;

    console.log('entry', entry);
    await fs.promises.appendFile(fileNamePath, entry, { flag: 'a' }).catch((err) => {
      console.error('Error appending file name:', err);
    });
  } catch (err) {
    console.error('Error appending file name:', err);
  }
};

const readFileNames = async () => {
  try {
    const data = await fs.promises.readFile(fileNamePath, 'utf8');

    // Split the data into lines and filter out any empty or whitespace-only lines
    const entries = data.split('\n').filter((line) => line.trim());

    // Map each entry to an object, only if it has the correct number of parts
    return entries
      .map((entry) => {
        const [fileName, title, description] = entry.split('|').map((part) => part?.trim());

        // Return only if all parts are defined
        if (fileName && title && description) {
          return {
            fileName,
            title,
            description,
          };
        }
      })
      .filter(Boolean); // Filter out any undefined values from the map
  } catch (err) {
    console.error('Error reading file names:', err);
    return [];
  }
};
const embeddings = new OpenAIEmbeddings({
  model: 'text-embedding-3-small',
});

const pinecone = new PineconeClient();

const pineconeIndex = pinecone.Index(config.PINECODE_INDEX);

export const ChatModel = {
  uploadAndIndexDocument: async (file: Express.Multer.File, name: string, content: string) => {
    // console.log('file', file);
    const filePath = await saveFile(file.originalname, file);

    await appendFileName(file.originalname, name, content);

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

    await vectorStore.addDocuments(
      splits.map((split, index) => ({
        pageContent: split.pageContent, // The text of the split
        metadata: {
          title: name,
        },
      })),
    );

    const doc = readFileNames();
    return doc;
  },

  askQuestion: async (question: string, title: string) => {
    const model = new ChatOpenAI({ model: 'gpt-4o' });

    const systemTemplate = [
      `You are an assistant for answering questions specifically related to the content of a book.
      Use the provided retrieved context from the vector database to answer questions. If the user asks about a specific page, provide information from that page if it exists in the context. If the user asks what the book is about, provide a concise summary based on the book's title and the retrieved context. 
    
      Your response should adapt to the user's question: be brief if the question is straightforward, or expand only when necessary. 
      If you cannot find relevant information in the context, say that you don't know. Do not invent answers or provide information not found in the retrieved context.
    
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

    // console.log('vectorStore', vectorStore);

    const questionAnswerChain = await createStuffDocumentsChain({ llm: model, prompt });

    const ragChain = await createRetrievalChain({
      retriever: vectorStore.asRetriever({
        filter: { title },
      }),
      combineDocsChain: questionAnswerChain,
    });

    console.log('ragChain', ragChain);

    const results = await ragChain.invoke({
      input: question,
    });

    console.log('results', results);

    return results;
  },

  recommendBooks: async (questions: string) => {
    const model = new ChatOpenAI({ model: 'gpt-4o' });

    // Create a recommendation prompt
    const prompt = [
      'system : You are a book recommendation assistant. Based on user preferences, suggest 3 books with a brief description of why each book might appeal to the user. not more that 3 sentence.',

      `human :Here are the user's preferences:\n${questions}`,
    ];

    const results = await model.invoke(prompt);

    return results;
  },

  getDocuments: async () => {
    const docs = readFileNames();
    return docs;
  },
};
