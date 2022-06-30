import { setFailed } from "@actions/core";
import { context } from "@actions/github";
import { Octokit } from "@octokit/core";

const octokit = new Octokit();

const createRelease = async () => {
  try {
    const body = "testing";

    // TODO: Would be good to get service name from package.json[name]
    const tagName = `${process.env.SERVICE_NAME}-${context.ref}`;

    await octokit.request("POST /repos/{owner}/{repo}/releases", {
      body: body,
      draft: process.env.INPUT_DRAFT === "true",
      generate_release_notes: false,
      name: process.env.NAME,
      owner: "lego-shop",
      prerelease: process.env.INPUT_PRERELEASE === "true",
      repo: "brickbank",
      tag_name: tagName,
      target_commitish: "main",
    });
  } catch (error) {
    return setFailed(error);
  }
};

createRelease();
