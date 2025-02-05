import useProject from "@/hooks/use-project";
import { api } from "@/trpc/react";
import React from "react";

const TeamMembers = () => {
  const { projectId } = useProject();
  const { data: members } = api.project.getTeamMembers.useQuery({ projectId });

  return (
    <div className="flex items-center">
      {members?.map((member, index) => (
        <div
          key={member.id}
          className="relative group"
          style={{ marginLeft: index === 0 ? "0px" : "-12px" }} // Overlapping effect
        >
          <img
            src={member.user.imageUrl || ""}
            alt={member.user.firstName || ""}
            height={32}
            width={32}
            className="rounded-full border-2 border-white shadow-md"
          />
          {/* Tooltip
          <span className="absolute left-1/2 bottom-full mb-2 w-max -translate-x-1/2 scale-0 rounded-lg bg-primary px-2 py-1 text-xs text-white opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100 z-10">
            {member.user.firstName}
          </span> */}
        </div>
      ))}
    </div>
  );
};

export default TeamMembers;
