import { db } from "@/server/db";
import { Octokit } from "octokit";
import axios from "axios";
import { aiSummarizeCommit } from "./gemini";
// Configure Octokit
export const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

// For testing
// const githubUrl = "https://github.com/docker/genai-stack";

// Response dataType
type Response = {
  commitMessage: string;
  commitHash: string;
  commitAuthorName: string;
  commitAuthorAvatar: string;
  commitDate: string;
};

//Function to get the commits from the url
export const getCommitHashes = async (
  githubUrl: string,
): Promise<Response[]> => {
  const [owner, repo] = githubUrl.split("/").slice(-2);
  if (!owner || !repo) {
    throw new Error("Invalid Github URL");
  }
  const { data } = await octokit.rest.repos.listCommits({
    owner,
    repo,
  });
  const sortedCommits = data.sort(
    (a: any, b: any) =>
      new Date(b.commit.author.date).getTime() -
      new Date(a.commit.author.date).getTime(),
  ) as any[];
  return sortedCommits.slice(0, 10).map((commit: any) => ({
    commitHash: commit.sha as string,
    commitMessage: commit.commit?.message ?? "",
    commitAuthorAvatar: commit.author?.avatar_url ?? "",
    commitAuthorName: commit.commit?.author?.name ?? "",
    commitDate: commit.commit?.author?.date ?? "",
  }));
};

export const pollCommits = async (projectId: string) => {
  console.log("project > ", projectId);
  const { project, githubUrl } = await fetchProjectGithubUrl(projectId);
  const commitHashes = await getCommitHashes(githubUrl);
  const unProcessedCommits = await filterUnprocessedCommits(
    projectId,
    commitHashes,
  );
  const summaryResponses = await Promise.allSettled(
    unProcessedCommits.map((commit) => {
      return summarizeCommit(githubUrl, commit.commitHash);
    }),
  );
  console.log("Summary Responses ==> ",summaryResponses);
  
  const summarise = summaryResponses.map((response) => {
    if (response.status === "fulfilled") {
      return response.value as string;
    }
    return "";
  });
  const commits = await db.commit.createMany({
    data: summarise.map((summary, index) => {
      console.log(`Processing Commint ${index}`);
      return {
        projectId,
        commitHash: unProcessedCommits[index]!.commitHash,
        commitAuthorAvatar: unProcessedCommits[index]!.commitAuthorAvatar,
        commitAuthorName: unProcessedCommits[index]!.commitAuthorName,
        commitMessage: unProcessedCommits[index]!.commitMessage,
        commitDate: unProcessedCommits[index]!.commitDate,
        summary: summary,
      };
    }),
  });
  return commits;
};

const fetchProjectGithubUrl = async (projectId: string) => {
  const project = await db.project.findUnique({
    where: {
      id: projectId,
    }
  });
  console.log("project ==> ", projectId);
  
  
  if (!project?.githubUrl) {
    throw new Error("Project Url Not Found");
  }
  return {
    project,
    githubUrl: project.githubUrl ,
  };
};

const filterUnprocessedCommits = async (
  projectId: string,
  commitHashes: Response[],
) => {
  const processedCommits = await db.commit.findMany({
    where: {
      projectId,
    },
  });
  const unProcessedCommits = commitHashes.filter(
    (commit) =>
      !processedCommits.some(
        (processedCommit) => processedCommit.commitHash === commit.commitHash,
      ),
  );
  return unProcessedCommits;
};

const summarizeCommit = async (githubUrl: string, commitHash: string) => {
    console.log("SUMMARIZE-COMMIT CALLED")
  const { data } = await axios.get(`${githubUrl}/commit/${commitHash}.diff`, {
    headers: {
      Accept: "application/vnd.github.v3.diff",
    },
  });
  const response = (await aiSummarizeCommit(data)) || "";
  console.log(response);
  return response;
};

// console.log(await summarizeCommit("https://github.com/docker/genai-stack","caec526d75b821efffc7987d4c12d831ca0498b2"));

// const temp = await pollCommits("cm698f23900004x3nbh7gzh7r");
// console.log(temp);
// console.log(await pollCommits("cm6dm8jgi000011kth40aniuz"));

