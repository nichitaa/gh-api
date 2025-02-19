import fs from 'fs/promises';
import {getDataDir} from './get-data-dir.js';

export const getCountOfSavedReposFiles = async () => {
  const dir = getDataDir();
  const files = await fs.readdir(dir);
  return files.length;
}