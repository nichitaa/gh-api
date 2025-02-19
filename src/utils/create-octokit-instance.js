import {retry} from '@octokit/plugin-retry';
import {throttling} from '@octokit/plugin-throttling';
import {Octokit} from 'octokit';

export const createOctokit = (githubToken) => {
  const OctokitWithPlugins = Octokit.plugin(retry, throttling);
  const instance = new OctokitWithPlugins({
    auth: githubToken,
    onRateLimit: (retryAfter, options) => {
      console.warn(`Request quota exhausted for request ${options.method} ${options.url}`);

      if (options.request.retryCount === 2) {
        console.info(`Retrying after ${retryAfter} seconds!`);
        return true;
      }
    },
    onAbuseLimit: (_retryAfter, options) => {
      console.warn(`Abuse detected for request ${options.method} ${options.url}`);
    },
    onSecondaryRateLimit: (_retryAfter, options) => {
      console.warn(`Secondary quota detected for request ${options.method} ${options.url}`);
    },
    retry: {},
  });

  return instance;
}
