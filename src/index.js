import express from 'express';
import {githubApi} from './services/index.js';
import {combineReposWithTags, getDataDir, saveReposToFiles} from './utils/index.js';
import {getAllReposNames, getRepoByName} from './resource-access/index.js';

const dataDir = getDataDir();

const app = express();
const PORT = 8080;
app.use(express.json());

app.post('/repositories/fetch', async (req, res) => {
  try {

    const {count} = req.body;
    if (!count || typeof count !== 'number' || count <= 0) {
      return res.status(400).json({error: 'Invalid count value'});
    }

    const {cache, repos} = await githubApi.listRepos(count);
    console.log('[list repos] repos nr:', repos.length, ', cache: ', cache);
    if (cache) return res.json({success: true, cache: true, repos});

    // fetch tags & save update files only if cache not hit
    const tags = await githubApi.listTagsForRepos(repos);
    console.log('[list tags] tags nr:', tags.length);
    const reposInfo = combineReposWithTags(repos, tags);

    // save to files is non-blocking (not to block client response)
    saveReposToFiles(reposInfo, dataDir);
    console.log('[saved repos to file]')

    res.json({success: true, reposInfo});
  } catch (error) {
    console.error(error);
    res.status(500).json({error: 'Failed to fetch repositories'});
  }
});

app.get('/repositories', async (req, res) => {
  const repos = await getAllReposNames();
  res.json(repos);
});

app.get('/repositories/:name', async (req, res) => {
  const repoName = req.params.name;
  if (!repoName?.trim()) res.status(400).json({error: 'Invalid repository name'});
  const repo = await getRepoByName(repoName);
  if (!repo) res.status(404).json({error: 'Repository not found'});
  res.json(repo);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
