export const combineReposWithTags = (repos, allTagsResponse) => {
  const reposInfo = repos.map((repo, index) => {
    // TODO: this should be a proper lookup, not by index
    const tags = allTagsResponse[index];
    return {
      name: repo.name,
      html_url: repo.html_url,
      stargazers_count: repo.stargazers_count,
      tags,
      updatedAt: Date.now(),
      owner: repo.owner
    };
  });
  return reposInfo;
}