import dotenv from 'dotenv';

// Set the NODE_ENV to 'development' by default
//process!.env!.NODE_ENV = process.env.NODE_ENV || "development";

const envFound = dotenv.config();
if (envFound.error) {
  // This error should crash whole process

  throw new Error("⚠️  Couldn't find .env file  ⚠️");
}

export const config = {
  /**
   * Your favorite port
   */

  MEDIA_SERVE_URL: String(process.env.MEDIA_SERVE_URL),
  APP_SERVING_URL: String(process.env.APP_SERVING_URL),
  SERVER_PORT: String(process.env.SERVER_PORT),
  REVERSE_PROXY: false,
  API_BASE_PATH: String(process.env.APP_SERVING_URL),
  DOMAIN: String(process.env.DOMAIN),
  MAIN: String(process.env.MAIN),
  NODE_ENV: String(process.env.NODE_ENV),
  OPENAI_API_KEY: String(process.env.OPENAI_API_KEY),
  PINECONE_API_KEY: String(process.env.PINECONE_API_KEY),
  PINECODE_INDEX: String(process.env.PINECONE_INDEX),
};

export default config;
