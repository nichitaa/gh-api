import {getDataDir} from "../utils/index.js";
import fs from "fs/promises";
import path from "path";

export async function getAllReposDetails() {
  const directoryPath = getDataDir()
  try {
    const files = await fs.readdir(directoryPath);
    let combinedData = [];

    for (const file of files) {
      const filePath = path.join(directoryPath, file);
      const stat = await fs.stat(filePath);

      if (stat.isFile()) {
        const content = await fs.readFile(filePath, 'utf8');
        try {
          const jsonData = JSON.parse(content);
          combinedData = combinedData.concat(jsonData);
        } catch (error) {
          console.error(`Skipping invalid JSON file: ${file}`);
        }
      }
    }

    return combinedData;
  } catch (error) {
    console.error(`Error reading directory: ${error.message}`);
    return [];
  }
}