// This will contain code to take the input as the githubUrl and give all the files.
import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { Document } from "@langchain/core/documents";
import { generateEmbedding, summarizeCode } from "./gemini";
import { db } from "@/server/db";
import { Octokit } from "octokit";

const getFileCount = async (
  githubOwner: string,
  githubRepo: string,
  path: string,
  octokit: Octokit,
  acc: number,
) => {
  const { data } = await octokit.rest.repos.getContent({
    owner: githubOwner,
    repo: githubRepo,
    path,
  });
  if(!Array.isArray(data) && data.type === "file") {
    return acc+1;
  }
  if(Array.isArray(data)){
    let fileCount = 0;
    const directories: string[] = []
    for (const item of data){
      if(item.type === "dir"){
        directories.push(item.path)
      } else{
        fileCount++;
      }
    }
    if(directories.length > 0){
      const directoryCounts = await Promise.all(
        directories.map(dirPath => getFileCount(githubOwner,githubRepo,dirPath,octokit,0))
      );
      fileCount += directoryCounts.reduce((acc,count) => acc+count,0);
    }
    return acc+fileCount;
  }
  return acc;
};

export const checkCredits = async (githubUrl: string, githubToken?: string) => {
  // how many files?
  const octokit = new Octokit({ auth: githubToken });
  const githubRepo = githubUrl.split("/")[4];
  const githubOwner = githubUrl.split("/")[3];
  if (!githubRepo || !githubOwner) {
    return 0;
  }
  const fileCount = await getFileCount(githubOwner,githubRepo,'',octokit,0);
  return fileCount;
};

export const loadGithubRepo = async (
  githubUrl: string,
  githubToken?: string,
) => {
  console.log("GITHUB ==> ", githubUrl);

  const loader = new GithubRepoLoader(githubUrl, {
    accessToken: githubToken || "",
    branch: "main",
    recursive: true,
    unknown: "warn",
    maxConcurrency: 5,
    ignoreFiles: [
      "package-lock.json",
      "yarn.lock",
      "pnpm-lock.yaml",
      "bun.lockb",
    ],
  });
  const docs = await loader.load();
  return docs;
};

// console.log(
//   await loadGithubRepo("https://github.com/elliott-chong/chatpdf-yt"),
// );

export const indexGithubRepo = async (
  projectId: string,
  githubUrl: string,
  githubToken?: string,
) => {
  console.log("inside Index function");

  const docs = await loadGithubRepo(githubUrl, githubToken);
  const allEmbeddings = await generateEmbeddings(docs);
  await Promise.allSettled(
    allEmbeddings.map(async (embedding, index) => {
      const sourceCodeEmbedding = await db.sourceCodeEmbedding.create({
        data: {
          summary: embedding.summary,
          fileName: embedding.fileName,
          sourceCode: embedding.sourceCode,
          projectId,
        },
      });
      await db.$executeRaw`
      UPDATE "SourceCodeEmbedding"
      SET "summaryEmbedding" = ${embedding.embedding} :: vector
      WHERE "id" = ${sourceCodeEmbedding.id}
      `;
    }),
  );
};

const generateEmbeddings = async (docs: Document[]) => {
  console.log("generateEmbeddings function");

  return await Promise.all(
    docs.map(async (doc) => {
      const summary = await summarizeCode(doc);
      const embedding = await generateEmbedding(summary);
      return {
        summary,
        embedding,
        sourceCode: JSON.parse(JSON.stringify(doc.pageContent)),
        fileName: doc.metadata.source,
      };
    }),
  );
};
