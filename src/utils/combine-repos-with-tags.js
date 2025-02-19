export const combineReposWithTags = (repos, allTagsResponse) => {
  const reposInfo = repos.map((repo, index) => {
    const tagsResponse = allTagsResponse[index];
    const tags = tagsResponse.status === 'fulfilled' ? tagsResponse.value.data.map(tag => tag.name) : [];
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