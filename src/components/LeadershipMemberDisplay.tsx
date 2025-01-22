"use client"

import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export interface LeadershipMemberProps {
  name: string
  image: string
}

interface TeamCardProps {
  teamName: string
  teamColor: string
  members: LeadershipMemberProps[]
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
}

const memberVariant = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
  hover: {
    y: -5,
    transition: {
      duration: 0.2,
    },
  },
}

const LeadershipMemberDisplay: React.FC<TeamCardProps> = ({ teamName, teamColor, members }) => {
  return (
    <motion.div className="container mx-auto my-8" initial="hidden" animate="show" variants={container}>
      <motion.h2
        className={`text-6xl font-bold text-center mb-8 text-${teamColor}`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {teamName}
      </motion.h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-16">
        {members.map((member, index) => (
          <motion.div
            key={index}
            variants={memberVariant}
            whileHover="hover"
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col items-center"
          >
            <motion.div whileHover={{ scale: 1.1 }} transition={{ type: "spring", stiffness: 300 }}>
              <Avatar className="w-20 h-20 mb-3">
                <AvatarImage src={member.image} className="object-cover"/>
                <AvatarFallback>{member.name}</AvatarFallback>
              </Avatar>
            </motion.div>
            <p className="text-sm font-medium text-gray-900 dark:text-white text-center">{member.name}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

export default LeadershipMemberDisplay

