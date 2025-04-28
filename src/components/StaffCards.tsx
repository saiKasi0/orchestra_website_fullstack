"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { StaffMember } from "@/types/homepage"
import React from "react"

interface StaffCardProps {
  id: string;
  name: string;
  imageUrl: string;
  description: React.ReactNode;
}

interface StaffCardsProps {
  data: StaffMember[];
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
      <div className="flex justify-center mb-5">
        <div className="relative w-64 h-64 overflow-hidden rounded-full border-2 border-gray-200">
          {imageUrl ? (
            <Image 
              src={imageUrl} 
              alt={name} 
              fill
              className="object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-gray-100 text-gray-500 text-4xl font-semibold">
              {name ? name.charAt(0) : '?'}
            </div>
          )}
        </div>
      </div>
      <div className="p-5 text-center">
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
      {staffMembers.length === 1 ? (
        <div className="flex justify-center">
          <div className="max-w-xl">
            <StaffCard
              key={staffMembers[0].id}
              id={staffMembers[0].id}
              name={staffMembers[0].name}
              imageUrl={staffMembers[0].imageUrl}
              description={staffMembers[0].description}
            />
          </div>
        </div>
      ) : (
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
      )}
    </motion.div>
  )
}

export default StaffCards

