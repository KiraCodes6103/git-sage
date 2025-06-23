"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useRefetch from "@/hooks/use-refetch";
import { api } from "@/trpc/react";
import { Info, Loader2 } from "lucide-react";
import Image from "next/image";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { motion } from "framer-motion";

type FormInput = {
  repoUrl: string;
  projectName: string;
  githubToken?: string;
};
const CreatePage = () => {
  const { register, handleSubmit, reset } = useForm<FormInput>();
  const createProject = api.project.createProject.useMutation();
  const checkCredits = api.project.checkCredits.useMutation();
  const refetch = useRefetch();
  const onSubmit = (data: FormInput) => {
    // window.alert(JSON.stringify(data));
    if (!!checkCredits.data) {
      createProject.mutate(
        {
          name: data.projectName,
          githubUrl: data.repoUrl,
          githubToken: data?.githubToken,
        },
        {
          onSuccess: () => {
            toast.success("Project created successfully");
            refetch();
            reset();
          },
          onError: () => {
            toast.error("Failed to create a project");
          },
        },
      );
    } else {
      checkCredits.mutate({
        githubUrl: data.repoUrl,
        githubToken: data.githubToken,
      });
    }

    return true;
  };
  const hasEnoughCredit = checkCredits?.data?.userCredits
    ? checkCredits?.data?.userCredits >= checkCredits?.data?.fileCount
    : true;
  return (
    <div className="flex h-full items-center justify-center gap-12">
      <Image src="/manworking.png" alt="" height={69} width={69} />
      <div>
        <div>
          <h1 className="text-2xl font-semibold">
            Link Your GitHub Repository
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter the URL of your repository to connect it to GitSage
          </p>
        </div>
        <div className="h-4"></div>
        <div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Input
              {...register("projectName", { required: true })}
              placeholder="Project Name"
              required
            />
            <div className="h-2"></div>
            <Input
              {...register("repoUrl", { required: true })}
              placeholder="Github URL"
              required
            />
            <div className="h-2"></div>
            <Input
              {...register("githubToken", { required: false })}
              placeholder="Github Token (Optional)"
            />
            {!!checkCredits.data && (
              <>
                <div className="mt-4 rounded-md border border-orange-200 bg-orange-50 px-4 py-2 text-orange-700">
                  <div className="flex items-center gap-2">
                    <Info className="size-4" />
                    <p className="text-sm">
                      You will be charged{" "}
                      <strong>{checkCredits.data?.fileCount}</strong> credits
                    </p>
                  </div>
                  <p className="ml-6 text-sm text-blue-600">
                    You have <strong>{checkCredits.data?.userCredits}</strong>{" "}
                    credits
                  </p>
                </div>
              </>
            )}
            <div className="h-4"></div>
            {/* <Button type="submit" disabled={createProject.isPending || checkCredits.isPending || !hasEnoughCredit}>
              {!!checkCredits.data?"Create Project":"Check Credit"}
            </Button> */}
            <Button
              type="submit"
              disabled={
                createProject.isPending ||
                checkCredits.isPending ||
                !hasEnoughCredit
              }
            >
              {createProject.isPending ? (
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      repeat: Infinity,
                      duration: 1,
                      ease: "linear",
                    }}
                  >
                    <Loader2 className="size-4 text-white" />
                  </motion.div>
                  Creating... (May take up to 1 min)
                </div>
              ) : checkCredits.isPending ? (
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      repeat: Infinity,
                      duration: 1,
                      ease: "linear",
                    }}
                  >
                    <Loader2 className="size-4 text-white" />
                  </motion.div>
                  Checking credits...
                </div>
              ) : !!checkCredits.data ? (
                "Create Project"
              ) : (
                "Check Credit"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePage;
