import express from 'express';

import { config } from '../../config';

import path from 'path';

import { EMediaTypes, FileUploadType } from './media.types';
import { promisify } from 'util';
import fs, { mkdir, stat } from 'fs';
import { timeStamp } from 'console';

const mkDirPromised = promisify(mkdir);
const fsStatPromised = promisify(stat);
const writeFiler = promisify(fs.writeFile);

const router = express.Router();

const staticOptions = { maxAge: 31536000000, immutable: true };

const MEDIA_PATH = path.join(process.cwd(), 'media');

export const filePath = (filename: any) => path.join(EMediaTypes.Doc, `${Date.now()}${filename}`);

export const saveFile = async (filename: string, file: any): Promise<any> => {
  // ensure directories
  await mkDirPromised(path.join(MEDIA_PATH, EMediaTypes.Doc), { recursive: true });

  // hold promises for parallel processing
  const promises = [];

  const rootFilePath = path.join(MEDIA_PATH, filePath(filename));

  // Save the file to disk
  promises.push(writeFiler(rootFilePath, file.buffer));

  // Retrieve file size for confirmation/response
  // const fileSize = (await stat(rootFilePath)).size;

  await Promise.all(promises);

  return rootFilePath;
};

router.use(
  '/' + EMediaTypes.Doc,
  express.static(path.join(MEDIA_PATH, EMediaTypes.Doc), staticOptions),
);

/*// Set header to force download
 */

export const setUpMediaEndpoints = (app: express.Express) => {
  // mount static server for media
  app.use('/media', router);
};

export const getLocalMediaUrl = (media: any): string => {
  return `${config.MAIN}/${filePath(media)}`;
};
