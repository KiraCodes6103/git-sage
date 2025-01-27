import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import useProject from "@/hooks/use-project";
// import { DialogContent, DialogTitle } from "@radix-ui/react-dialog";
import Image from "next/image";
import React, { useState } from "react";
import { askQuestion } from "./actions";
import { readStreamableValue } from "ai/rsc";

const AskQuestionCard = () => {
  const { project } = useProject();

  const [question, setQuestion] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileReferences, setFileReferences] =
    useState<{ fileName: string; sourceCode: string; summary: string }[]>();
  const [ans, setAns] = useState("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!project?.id) return;
    setLoading(true);
    setOpen(true);
    const { output, fileReferences } = await askQuestion(question, project.id);
    setFileReferences(fileReferences);

    for await (const delta of readStreamableValue(output)) {
      if (delta) {
        setAns((ans) => ans + delta);
      }
    }
    setLoading(false);
    setQuestion("");
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <Image src="/logo.png" alt="LOGO" height={40} width={40} />
            </DialogTitle>
          </DialogHeader>
          {ans}
          <h1>File References</h1>
          {fileReferences?.map((file) => {
            return <span>{file.fileName}</span>;
          })}
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
              <Button type="submit">Ask GitSage!</Button>
            </form>
          </CardContent>
        </CardHeader>
      </Card>
    </>
  );
};

export default AskQuestionCard;
