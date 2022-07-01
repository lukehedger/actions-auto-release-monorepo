import { setFailed } from "@actions/core";
import { context } from "@actions/github";
import { Octokit } from "@octokit/core";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const createRelease = async () => {
  try {
    const body = "testing";

    // TODO: Would be good to get service name from package.json[name]
    const tagName = `${process.env.SERVICE_NAME}-${context.sha}`;

    await octokit.request("POST /repos/{owner}/{repo}/releases", {
      body: body,
      draft: process.env.INPUT_DRAFT === "true",
      generate_release_notes: false,
      name: process.env.NAME,
      owner: "lukehedger",
      prerelease: process.env.INPUT_PRERELEASE === "true",
      repo: "actions-auto-release-monorepo",
      tag_name: tagName,
      target_commitish: "main",
    });
  } catch (error) {
    console.log(error);

    return setFailed(error);
  }
};

createRelease();
