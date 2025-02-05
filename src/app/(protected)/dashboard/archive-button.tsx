import { Button } from "@/components/ui/button";
import useProject from "@/hooks/use-project";
import useRefetch from "@/hooks/use-refetch";
import { api } from "@/trpc/react";
import React from "react";
import { toast } from "sonner";

const ArchiveButton = () => {
  const archieveProject = api.project.archieveProject.useMutation();
  const { projectId } = useProject();
  const refetch = useRefetch();
  return (
    <Button
      disabled={archieveProject.isPending}
      size="sm"
      variant="destructive"
      onClick={() => {
        const confirm = window.confirm(
          "Are you sure you want to archive this project?",
        );
        if (confirm)
          archieveProject.mutate(
            { projectId },
            {
              onSuccess: () => {
                toast.success("Project archived successfully! ");
                refetch();
              },
              onError: () => {
                toast.error("Something went wrong");
              },
            },
          );
      }}
    >
      Archive
    </Button>
  );
};

export default ArchiveButton;
