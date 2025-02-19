import {createOctokit, getCountOfSavedReposFiles, retryWithBackoff} from '../utils/index.js';
import {config} from 'dotenv';
import {getAllReposDetails, getRepoByName} from '../resource-access/index.js';

config();

if (!process.env.GH_TOKEN) {
  throw new Error('GH_TOKEN is required');
}

class GithubApi {

  static REPOS_CACHE_TIME_MS = 1 * 60 * 1000; // 1 minutes
  static TAGS_CACHE_TIME_MS = 5 * 60 * 1000; // 5 minutes
  static REPOS_PER_PAGE = 10;
  static instance = null;

  static getInstance() {
    if (!GithubApi.instance) {
      GithubApi.instance = new GithubApi();
    }
    return GithubApi.instance;
  }

  reposCacheFlag = false;

  constructor() {
    setInterval(() => {
      this.reposCacheFlag = false;
    }, GithubApi.REPOS_CACHE_TIME_MS);
  }

  octokit = createOctokit(process.env.GH_TOKEN);

  listRepos = async (count) => {
    const currentCount = await getCountOfSavedReposFiles();
    if (currentCount >= count && this.reposCacheFlag) {
      const repos = await getAllReposDetails();
      repos.sort((a, b) => b.stargazers_count - a.stargazers_count);
      const sortedRepos = repos.slice(0, count)
      return {cache: true, repos: sortedRepos}
    } else {
      this.reposCacheFlag = true;
    }

    const repositoriesResponse = [];
    let perPage = GithubApi.REPOS_PER_PAGE;
    let noOfPages = count / perPage;

    if (count <= perPage) {
      noOfPages = 1;
      perPage = count;
    }

    for (let pageNo = 1; pageNo <= noOfPages; pageNo++) {
      const response = await retryWithBackoff(() => this.octokit.request('GET /search/repositories', {
        q: 'stars:>0', sort: 'stars', order: 'desc', per_page: perPage, page: pageNo
      }));
      console.log('[list repos] fetched page:', pageNo, ', repos:', response.data.items.length);
      repositoriesResponse.push(...response.data.items);
    }
    return {cache: false, repos: repositoriesResponse}
  }

  listTagsForRepo = async (repo) => {

    // check for cache first
    const savedRepo = await getRepoByName(repo.name);
    if (savedRepo) {
      const now = Date.now();
      if (now - savedRepo.updatedAt < GithubApi.TAGS_CACHE_TIME_MS) {
        console.log('[get tags] cache hit for repo:', repo.name);
        return savedRepo.tags
      }
    }

    const response = await retryWithBackoff(() => this.octokit.request('GET /repos/{owner}/{repo}/tags', {
      owner: repo.owner.login, repo: repo.name
    }));
    if (response.status !== 200) {
      console.error('[silent error] Failed to fetch tags for repo:', repo.name);
      return [];
    }
    const tagNames = response.data.map(tag => tag.name);
    console.log('[get tags] fetched tags for repo:', repo.name, ', tags:', tagNames);
    return tagNames;
  }

  listTagsForRepos = async (repos) => {
    const tagsResponsePromises = repos.map(repo => this.listTagsForRepo(repo));
    const tagsResponses = await Promise.all(tagsResponsePromises);
    return tagsResponses;
  }
}

export const githubApi = GithubApi.getInstance();