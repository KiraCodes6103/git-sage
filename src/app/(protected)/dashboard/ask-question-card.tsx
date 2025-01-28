import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import MDEditor from "@uiw/react-md-editor";
import { Textarea } from "@/components/ui/textarea";
import useProject from "@/hooks/use-project";
// import { DialogContent, DialogTitle } from "@radix-ui/react-dialog";
import Image from "next/image";
import React, { useState } from "react";
import { askQuestion } from "./actions";
import { readStreamableValue } from "ai/rsc";
import { CodeReferences } from "./code-references";
import { api } from "@/trpc/react";
import { toast } from "sonner";

const AskQuestionCard = () => {
  const { project } = useProject();

  const [question, setQuestion] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filesReferences, setFilesReferences] = useState<
    { fileName: string; sourceCode: string; summary: string }[]
  >([]);
  const [ans, setAns] = useState("");

  const saveAnswer = api.project.saveAnswer.useMutation();
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAns("");
    setFilesReferences([]);
    if (!project?.id) return;
    setLoading(true);
    const { output, filesReferences } = await askQuestion(question, project.id);
    setOpen(true);
    setFilesReferences(filesReferences);

    for await (const delta of readStreamableValue(output)) {
      if (delta) {
        setAns((ans) => ans + delta);
      }
    }
    setLoading(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[70vh] overflow-y-auto sm:max-w-[80vw]">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <DialogTitle>
                <Image src="/logo.png" alt="LOGO" height={40} width={40} />
              </DialogTitle>
              <Button
                variant="outline"
                disabled={saveAnswer.isPending}
                onClick={() => {
                  saveAnswer.mutate(
                    {
                      projectId: project!.id,
                      question,
                      answer: ans,
                      filesReferences,
                    },
                    {
                      onSuccess: () => {
                        toast.success("Answer Saved Successfully");
                      },
                      onError: () => {
                        toast.error("Couldn't Save the Answer");
                      },
                    },
                  );
                }}
              >
                Save Answer
              </Button>
            </div>
          </DialogHeader>
          <MDEditor.Markdown
            source={ans}
            className="!h-full max-h-[40vh] max-w-[70vw] overflow-y-auto"
          />
          <div className="h-4"></div>
          <CodeReferences filesReferences={filesReferences}></CodeReferences>
          <Button
            type="button"
            onClick={() => {
              setOpen(false);
            }}
          >
            Close
          </Button>
        </DialogContent>
      </Dialog>
      <Card className="relative col-span-3">
        <CardHeader>
          <CardTitle>Ask a question</CardTitle>
          <div className="h-4"></div>
          <CardContent>
            <form onSubmit={onSubmit}>
              <Textarea
                placeholder="Which file should I edit to change the Home Page?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
              <div className="h-4"></div>
              <Button type="submit" disabled={loading}>
                Ask GitSage!
              </Button>
            </form>
          </CardContent>
        </CardHeader>
      </Card>
    </>
  );
};

export default AskQuestionCard;
