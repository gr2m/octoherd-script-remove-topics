// @ts-check

/**
 * remove topic(s) from repositories
 *
 * @param {import('@octoherd/cli').Octokit} octokit
 * @param {import('@octoherd/cli').Repository} repository
 * @param {object} options
 * @param {string} options.topics
 */
export async function script(octokit, repository, { topics }) {
  if (!topics) {
    throw new Error("topics must set to a comma-separated list of topic names");
  }

  if (repository.archived) {
    octokit.log.info(`Repository is archived, skipping`);
    return;
  }

  const owner = repository.owner.login;
  const repo = repository.name;

  const {
    data: { names: currentTopics },
  } = await octokit.request("GET /repos/{owner}/{repo}/topics", {
    owner,
    repo,
    mediaType: {
      previews: ["mercy"],
    },
  });

  const topicsList = topics.split(/,/).map(normalize);

  const matchedTopics = [];
  const newTopics = [];

  for (const topic of currentTopics) {
    if (topicsList.includes(normalize(topic))) {
      matchedTopics.push(topic);
    } else {
      newTopics.push(topic);
    }
  }

  if (matchedTopics.length === 0) {
    octokit.log.info(`No topics matched`);
    return;
  }

  console.log(`newTopics`);
  console.log(newTopics);

  await octokit.request("PUT /repos/{owner}/{repo}/topics", {
    owner,
    repo,
    names: newTopics,
    mediaType: {
      previews: ["mercy"],
    },
  });

  octokit.log.info(`Topics removed: ${matchedTopics.join(", ")}`);
}

function normalize(topicName) {
  return topicName.trim().toLowerCase();
}
