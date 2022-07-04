import { setFailed } from "@actions/core";
import { context } from "@actions/github";
import { Octokit } from "@octokit/core";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const createRelease = async () => {
  try {
    const { data: releases } = await octokit.request(
      "GET /repos/{owner}/{repo}/releases",
      {
        owner: "lukehedger",
        repo: "actions-auto-release-monorepo",
      }
    );

    const [previousRelease] = releases
      .filter((release) => {
        return release.tag_name.includes(process.env.SERVICE_NAME);
      })
      .sort((releaseA, releaseB) => {
        return (
          new Date(releaseB.published_at).getTime() -
          new Date(releaseA.published_at).getTime()
        );
      });

    const { data: commits } = await octokit.request(
      "GET /repos/{owner}/{repo}/commits",
      {
        owner: "lukehedger",
        path: process.env.SERVICE_PATH,
        per_page: 100,
        repo: "actions-auto-release-monorepo",
        sha: "refs/heads/main",
      }
    );

    const orderedCommits = commits.sort((commitA, commitB) => {
      return (
        new Date(commitB.commit.committer.date).getTime() -
        new Date(commitA.commit.committer.date).getTime()
      );
    });

    const getCommitSummary = (commit) => {
      return `* ${commit.sha.substring(0, 7)} ${commit.commit.message}`;
    };

    let releaseCommits = [];

    if (typeof previousRelease !== "undefined") {
      const [, previousReleaseSha] = previousRelease.tag_name.match(/-(.*)/);

      for (const commit of orderedCommits) {
        if (commit.sha.substring(0, 7) === previousReleaseSha) {
          break;
        }

        releaseCommits.push(getCommitSummary(commit));
      }
    } else {
      for (const commit of orderedCommits) {
        releaseCommits.push(getCommitSummary(commit));
      }
    }

    const releaseBody = releaseCommits.join("\n");

    const shortSha = context.sha.substring(0, 7);

    const tagName = `${process.env.SERVICE_NAME}-${shortSha}`;

    await octokit.request("POST /repos/{owner}/{repo}/releases", {
      body: releaseBody,
      draft: process.env.INPUT_DRAFT === "true",
      generate_release_notes: false,
      name: tagName,
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
