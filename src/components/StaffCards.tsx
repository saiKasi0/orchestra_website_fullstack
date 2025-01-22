"use client"

import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface StaffCardProps {
  id: string
  name: string
  imageUrl: string
  description: React.ReactNode
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

const StaffCards: React.FC = () => {
  const staffMembers = [
    {
      id: "Mrs. Ledford Card",
      name: "Mrs. Elizabeth Ledford",
      imageUrl: "/OrchestraLeadershipAndStaffImages/MsLedford.jpg",
      description: (
        <>
          <h6 className="font-semibold mb-1">Education:</h6>
          <ul className="list-disc pl-5 mb-2">
            <li>MM, Violin Performance, Florida State University</li>
            <li>BA, Music and BA, English, Trinity University</li>
          </ul>
          <p className="mb-2">This is my 21st year directing public school orchestras in Texas.</p>
          <p className="mb-2">
            <span className="font-semibold">My Family:</span> Husband Tanner, Son Thomas, Daughter Grace, and Lea the
            Dog
          </p>
          <p className="mb-2">
            <span className="font-semibold">Hobbies:</span> Cross Stitch, Cooking
          </p>
          <h6 className="font-semibold mb-1">What I Am Most Excited About This Year:</h6>
          <p>Connections with students, performances in front of live audiences</p>
        </>
      ),
    },
    {
      id: "Ms. Sung Card",
      name: "Ms. Camila Sung",
      imageUrl: "/OrchestraLeadershipAndStaffImages/MsSung.jpg",
      description: (
        <>
          <h6 className="font-semibold mb-1">Education:</h6>
          <ul className="list-disc pl-5 mb-2">
            <li>University of Houston: Bachelor & Master Degree in Performance & Pedagogy</li>
            <li>Sam Houston State University: 2nd Undergraduate degree in Music Education</li>
          </ul>
          <p className="mb-2">
            <span className="font-semibold">Instrument:</span> Violin
          </p>
          <p className="mb-2">
            <span className="font-semibold">My Family:</span> Mom, Dad, and Myself
          </p>
          <p className="mb-2">
            <span className="font-semibold">Hobbies:</span> Watch movies
          </p>
          <h6 className="font-semibold mb-1">What I Am Most Excited About This Year:</h6>
          <p>This is my 5th year of teaching and at Cypress Ranch and looking forward to having a great year!</p>
        </>
      ),
    },
  ]

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

