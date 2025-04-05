"use client"

import LeadershipMemberDisplay from "./LeadershipMemberDisplay"
import { LeadershipSection } from "@/types/homepage"

interface LeadershipCardsProps {
  data?: LeadershipSection[]
}

const LeadershipCards: React.FC<LeadershipCardsProps> = ({ data }) => {
  // If no data is provided, don't render anything
  if (!data || data.length === 0) {
    return null;
  }

  // Map the sections to colors - add more mappings as needed
  const colorMap: {[key: string]: string} = {
    "Gold Team": "amber-400",
    "Blue Team": "blue-800",
    "Red Team": "red-600",
    "Green Team": "green-600",
    "Purple Team": "purple-600"
  };

  return (
    <div id="Leadership Cards" className="">
      {data.map((section) => (
        <LeadershipMemberDisplay
          key={section.id}
          teamName={section.name}
          teamColor={colorMap[section.name] || "gray-600"} // Default to gray if no color is found
          members={section.members.map(member => ({
            name: member.name,
            image: member.image_url
          }))}
        />
      ))}
    </div>
  );
}

export default LeadershipCards

