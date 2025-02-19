import fs from "fs";
import path from "path";

export const saveReposToFiles = (reposInfo, dir) => {
  reposInfo.forEach(repo => {
    fs.writeFile(path.join(dir, `${repo.name}.json`), JSON.stringify(repo, null, 2), (err) => {
      // TODO: handle error cases for writing files
    });
  })
}