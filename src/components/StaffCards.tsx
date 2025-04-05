"use client"

import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StaffMember } from "@/types/homepage"

interface StaffCardProps {
  id: string
  name: string
  imageUrl: string
  description: React.ReactNode
}

interface StaffCardsProps {
  data?: StaffMember[]
}

const StaffCard: React.FC<StaffCardProps> = ({ id, name, imageUrl, description }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      id={id}
      className="grid grid-cols-1 bg-white border p-8 border-gray-200 rounded-lg shadow hover:shadow-lg transition-shadow duration-300"
    >
      <div className="flex justify-center">
        <Avatar className="w-64 h-64 mb-3">
          <AvatarImage src={imageUrl} className="object-fit"/>
          <AvatarFallback>{name}</AvatarFallback>
        </Avatar>
      </div>
      <div className="p-5">
        <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">{name}</h5>
        <div className="font-normal text-gray-700 dark:text-gray-400">{description}</div>
      </div>
    </motion.div>
  )
}

const StaffCards: React.FC<StaffCardsProps> = ({ data }) => {
  // If no data is provided, don't render anything
  if (!data || data.length === 0) {
    return null;
  }

  // Map staff members data to format expected by StaffCard
  const staffMembers = data.map(staff => ({
    id: staff.id,
    name: staff.name,
    imageUrl: staff.image_url,
    description: (
      <>
        {staff.position && (
          <p className="mb-2 text-lg font-semibold">{staff.position}</p>
        )}
        {staff.bio && (
          <p className="mb-2">{staff.bio}</p>
        )}
      </>
    )
  }));

  return (
    <motion.div
      className="container mx-auto px-4 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-16">
        {staffMembers.map((staff) => (
          <StaffCard
            key={staff.id}
            id={staff.id}
            name={staff.name}
            imageUrl={staff.imageUrl}
            description={staff.description}
          />
        ))}
      </div>
    </motion.div>
  )
}

export default StaffCards

