"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CircularProgressbar } from "react-circular-progressbar";
import { uploadFile } from "@/lib/firebase";
import { Presentation, Upload } from "lucide-react";
import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
const MeetingCard = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "audio/*": [".mp3", ".wav"],
    },
    multiple: false,
    maxSize: 50_000_000,
    onDrop: async (acceptedFile) => {
      setIsUploading(true);
      try {
        console.log(acceptedFile);
        const file = acceptedFile[0];
        const downloadUrl = await uploadFile(file as File, setProgress);
        window.alert(downloadUrl);
      } catch (error) {
        console.log(error);
      }
      setIsUploading(false);
    },
  });
  return (
    <Card
      className="col-span-2 flex flex-col items-center justify-center"
      {...getRootProps()}
    >
      {!isUploading && (
        <>
          <Presentation className="h-10 w-10 animate-bounce" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">
            Create a new meeting
          </h3>
          <p className="mt-1 text-center text-sm text-gray-500">
            Analyze your meeting with <br /> Powered by AI
          </p>
          <div className="mt-6">
            <Button disabled={isUploading}>
              <Upload className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden={true} />
              Upload Meeting
              <input className="hidden" {...getInputProps()} />
            </Button>
          </div>
        </>
      )}
      {isUploading && (
        <div>
          <CircularProgressbar
            value={progress}
            text={`${progress}%`}
            className="size-20"
          />
          <p className="text-center text-sm text-gray-500">
            Uploading your meeting...
          </p>
        </div>
      )}
    </Card>
  );
};

export default MeetingCard;
