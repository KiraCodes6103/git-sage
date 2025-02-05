import { db } from "@/server/db";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";
import { toast } from "sonner";

type Props = {
  params: Promise<{ projectId: string }>;
};

const JoinHandler = async (props: Props) => {
  const { projectId } = await props.params;
  const { userId } = await auth();
  if (!userId) return redirect("/sign-in");
  const dbUser = db.user.findUnique({
    where: {
      id: userId,
    },
  });
  const client = await clerkClient();
  const user = await client.users.getUser(userId);

  if (!dbUser) {
    await db.user.create({
      data: {
        id: userId,
        imageUrl: user.imageUrl,
        firstName: user.firstName,
        lastName: user.lastName,
        emailAddress: user.emailAddresses[0]!.emailAddress,
      },
    });
  }
  const project = await db.project.findUnique({
    where: {
      id: projectId,
    },
  });
  console.log("projectInviteMembers => ", project);
  
  if (!project) {
    toast.error("Wrong URL");
    return redirect("/dashboard");
  }
  try {
    await db.userToProject.create({
      data: {
        userId,
        projectId,
      },
    });
  } catch (e) {
    console.log("user already a member");
  }

  return redirect(`/dashboard`);
};

export default JoinHandler
