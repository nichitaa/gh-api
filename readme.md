### Setup

```bash
npm install
```
put your own github token in the .env file

```bash
npm start
```
 
_Time to implement the solution ~ 3 hours_

#### Mandatory improvements for future:
1. better caching mechanism (maybe in memory cache as a lot of files operation are too slow)
2. more flexibility with configuration
3. generic error handling (API level)
4. proper logging
5. fix race conditions with files access (so that is impossible to read from a file that is being currently written)
6. maybe tags could be fetched in a cron job separately (no need to block) - this way we could have a better performance for the endpoints while still having the tags updated
7. code cleanups

#### What was done so far ?
1. basic functionality & endpoints
2. using `octokit` to integrate with github API
3. using common best practices for octokit (pagination, throttling, retries)
4. structured a bit the code into (utils, services, resource-access) with main logic in `services/github-api.js`
5. basic caching mechanism that avoids calling the github API
   1. cached tags - added `updatedAt` field to the repos json file to know when the tags were last updated (configurable via `TAGS_CACHE_TIME_MS`)
   2. cached repos - using the `count` from request to know if we have such many repos & and an internal flag `reposCacheFlag` to control the cache time interval (configurable via `REPOS_CACHE_TIME_MS`)
   3. still need to be improved, as on every request it reads from file system (could be in memory cache and minimize fs operations)