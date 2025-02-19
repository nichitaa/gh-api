import fs from "fs";
import {getDataDir} from "../utils/index.js";

const dataDir = getDataDir();

export const getAllReposNames = () => {
  return new Promise((resolve) => {
    fs.readdir(dataDir, (err, files) => {
      if (err) {
        resolve([]);
      }
      const repositoryNames = files.map(file => file.replace('.json', ''));
      resolve(repositoryNames);
    });
  })
}