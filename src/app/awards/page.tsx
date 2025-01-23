"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { motion } from "framer-motion"

interface VarsityOrchestraCardProps {
  title: string
  imageSrc: string
  imageAlt: string
  index: number
}

const VarsityOrchestraCard: React.FC<VarsityOrchestraCardProps> = ({ title, imageSrc, imageAlt, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: "easeOut",
      }}
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.2 },
      }}
    >
      <Card className="grid grid-cols-1 h-full">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <motion.div
            className="flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <Image
              className="w-fit rounded-lg object-contain"
              src={imageSrc || "/placeholder.svg"}
              alt={imageAlt}
              width={200}
              height={200}
            />
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function Awards() {
  const achievements = [
    {
      title: "Most Area 27 Region Players in CFISD!",
      imageSrc: "/CypressRanchOrchestraInstagramPhotos/Region2023.jpg",
      imageAlt: "Cypress Ranch Orchestra Region players posing for a group photo",
    },
    {
      title: "Varsity UIL Orchestra Division 1 Rating",
      imageSrc: "/CypressRanchOrchestraInstagramPhotos/Chamber2024Uil.jpg",
      imageAlt: "Varsity UIL Orchestra performing at UIL competition",
    },
    {
      title: "Sub-Non-Varsity A UIL Orchestra Division 1 Rating",
      imageSrc: "/CypressRanchOrchestraInstagramPhotos/Symphony2024Uil.jpg",
      imageAlt: "Sub-Non-Varsity A UIL Orchestra performing at UIL competition",
    },
    {
      title: "Festival Disney Golden Mickey & String Orchestra Best in Class",
      imageSrc: "/CypressRanchOrchestraInstagramPhotos/Disney2023.jpg",
      imageAlt: "Cypress Ranch Orchestra winning Golden Mickey at Disney event",
    },
    {
      title: "Symphony - Commended Winner, Citation of Excellence 2024",
      imageSrc: "/CypressRanchOrchestraInstagramPhotos/SymphonyCitationOfExcellence.jpg",
      imageAlt: "Symphony orchestra receiving Citation of Excellence award",
    },
    {
      title: "Dallas Classic Orchestra Competition",
      imageSrc: "/CypressRanchOrchestraInstagramPhotos/Dallas.jpg",
      imageAlt: "Cypress Ranch Orchestra performing in Dallas",
    },
  ]

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
    >
      <section className="mb-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto max-w-4xl text-center"
        >
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold leading-tight text-gray-900 md:text-5xl lg:text-6xl mb-4"
          >
            Cypress Ranch Orchestra&apos;s Achievements
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-5 text-lg text-gray-600 sm:text-xl"
          >
            The Cypress Ranch Orchestra has consistently achieved remarkable success, earning a wide array of
            prestigious accolades across our various ensembles and competitions. From local and regional contests to
            state and national festivals, our orchestra&apos;s dedication to excellence has been recognized time and
            time again.
          </motion.p>
        </motion.div>
      </section>
      <motion.div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
        {achievements.map((achievement, index) => (
          <VarsityOrchestraCard
            key={index}
            index={index}
            title={achievement.title}
            imageSrc={achievement.imageSrc}
            imageAlt={achievement.imageAlt}
          />
        ))}
      </motion.div>
    </motion.main>
  )
}

