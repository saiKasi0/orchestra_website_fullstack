"use client"

import type { LeadershipMemberProps } from "./LeadershipMemberDisplay"
import LeadershipMemberDisplay from "./LeadershipMemberDisplay"

const LeadershipCards: React.FC = () => {
  const goldTeamMembers: LeadershipMemberProps[] = [
    {
      name: "Adrian",
      image: "/OrchestraLeadershipAndStaffImages/Adrian_Gold.jpg",
    },
    {
      name: "Akshara",
      image: "/OrchestraLeadershipAndStaffImages/Akshara_Gold.jpg",
    },
    {
      name: "Brianna",
      image: "/OrchestraLeadershipAndStaffImages/Brianna_Gold.jpg",
    },
    {
      name: "Chloe",
      image: "/OrchestraLeadershipAndStaffImages/Chloe_Gold.jpg",
    },
    {
      name: "Christian",
      image: "/OrchestraLeadershipAndStaffImages/Christian_Gold.jpg",
    },
    {
      name: "Claire",
      image: "/OrchestraLeadershipAndStaffImages/Claire_Gold.jpg",
    },
    {
      name: "Jonah",
      image: "/OrchestraLeadershipAndStaffImages/Jonah_Gold.jpg",
    },
    {
      name: "Jordan",
      image: "/OrchestraLeadershipAndStaffImages/Jordan_Gold.jpg",
    },
    { name: "Josh", image: "/OrchestraLeadershipAndStaffImages/Josh_Gold.png" },
    {
      name: "Prabhav",
      image: "/OrchestraLeadershipAndStaffImages/Prabhav_Gold.jpg",
    },
    {
      name: "Susan",
      image: "/OrchestraLeadershipAndStaffImages/Susan_Gold.jpg",
    },
    {
      name: "Tanav",
      image: "OrchestraLeadershipAndStaffImages/Tanav_Gold.jpg",
    },
    {
      name: "Varun",
      image: "OrchestraLeadershipAndStaffImages/Varun_Gold.jpg",
    },
  ]

  const blueTeamMembers: LeadershipMemberProps[] = [
    {
      name: "Aiden",
      image: "/OrchestraLeadershipAndStaffImages/Aiden_Blue.jpg",
    },
    {
      name: "Angelina",
      image: "/OrchestraLeadershipAndStaffImages/Angelina_Blue.jpg",
    },
    { name: "Ekam", image: "/OrchestraLeadershipAndStaffImages/Ekam_Blue.jpg" },
    {
      name: "Grace",
      image: "/OrchestraLeadershipAndStaffImages/Grace_Blue.jpg",
    },
    {
      name: "Hannah",
      image: "/OrchestraLeadershipAndStaffImages/Hannah_Blue.png",
    },
    {
      name: "Jaylene",
      image: "/OrchestraLeadershipAndStaffImages/Jaylene_Blue.jpg",
    },
    { name: "Joey", image: "/OrchestraLeadershipAndStaffImages/Joey_Blue.jpg" },
    {
      name: "Mathew",
      image: "/OrchestraLeadershipAndStaffImages/Mathew_Blue.jpg",
    },
    { name: "Samy", image: "/OrchestraLeadershipAndStaffImages/Samy_Blue.jpg" },
    {
      name: "Sydney",
      image: "/OrchestraLeadershipAndStaffImages/Sydney_Blue.jpg",
    },
    {
      name: "Tuvana",
      image: "/OrchestraLeadershipAndStaffImages/Tuvana_Blue.jpg",
    },
    {
      name: "Yuyan",
      image: "/OrchestraLeadershipAndStaffImages/Yuyan_Blue.jpg",
    },
  ]

  return (
    <div id="Leadership Cards" className="">
      <LeadershipMemberDisplay teamName="Gold Team" teamColor="amber-400" members={goldTeamMembers} />
      <LeadershipMemberDisplay teamName="Blue Team" teamColor="blue-800" members={blueTeamMembers} />
    </div>
  )
}

export default LeadershipCards

