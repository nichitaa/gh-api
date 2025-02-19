import path from "path";
import fs from "fs";
import {getDataDir} from "../utils/index.js";

const dataDir = getDataDir();

export const getRepoByName = async (repoName) => {
  return new Promise((resolve, reject) => {
    const filePath = path.join(dataDir, `${repoName}.json`);

    if (!fs.existsSync(filePath)) {
      resolve(undefined);
    }

    fs.readFile(filePath, 'utf-8', (err, data) => {
      if (err) {
        return resolve(undefined);
      }
      resolve(JSON.parse(data));
    });
  })
}