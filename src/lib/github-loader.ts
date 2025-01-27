// This will contain code to take the input as the githubUrl and give all the files.
import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { Document } from "@langchain/core/documents";
import { generateEmbedding, summarizeCode } from "./gemini";
import { db } from "@/server/db";
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
  githubToken ?: string,
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
