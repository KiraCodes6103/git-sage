"use client";
import useProject from "@/hooks/use-project";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const CommitLog = () => {
  const { projectId, project } = useProject();
  const { data: commits, isLoading } = api.project.getCommits.useQuery({
    projectId,
  });

  return (
    <>
      <ul className="space-y-6">
        {isLoading
          ? Array.from({ length: 3 }).map((_, idx) => (
              <li className="relative flex gap-x-4" key={idx}>
                <Skeleton className="size-8 rounded-full" />
                <div className="flex-auto p-3">
                  <Skeleton className="mb-2 h-4 w-32" />
                  <Skeleton className="mb-1 h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </li>
            ))
          : commits?.map((commit, idx) => (
              <li className="relative flex gap-x-4" key={commit.id}>
                <div
                  className={cn(
                    idx === commits.length - 1 ? "h-6" : "-bottom-6",
                    "absolute left-0 top-0 flex w-6 justify-center",
                  )}
                >
                  <div className="w-px translate-x-1 bg-gray-200"></div>
                </div>
                <>
                  <img
                    src={commit.commitAuthorAvatar}
                    alt="commit avatar"
                    className="relative m-4 size-8 flex-none rounded-full bg-gray-50"
                  />
                  <div className="rounded-mg flex-auto bg-white p-3 ring-1 ring-inset ring-gray-200">
                    <div className="justyfy-between flex gap-x-4">
                      <Link
                        target="_blank"
                        href={`${project?.githubUrl}/commits/${commit.commitHash}`}
                        className="py-0.5 text-xs leading-5"
                      >
                        <span className="font-medium text-gray-900">
                          {commit.commitAuthorName}
                        </span>{" "}
                        <span className="inline-flex items-center">
                          commited
                          <ExternalLink className="ml-1 size-4" />
                        </span>
                      </Link>
                    </div>
                    <span className="font-semibold">
                      {commit.commitMessage}
                    </span>
                    <pre className="m-2 whitespace-pre-wrap text-sm leading-6 text-gray-500">
                      {commit.summary}
                    </pre>
                  </div>
                </>
              </li>
            ))}
      </ul>
    </>
  );
};

export default CommitLog;
