"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import { AwardsContent } from "@/types/awards"

type VarsityOrchestraCardProps = {
  title: string
  imageSrc: string
  imageAlt: string
  index: number
}

const VarsityOrchestraCard = ({ title, imageSrc, imageAlt, index }: VarsityOrchestraCardProps) => {
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

// Loading skeleton component
const LoadingSkeleton = () => {
  return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="text-center">
        <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4" />
        <p className="text-lg">Loading awards...</p>
      </div>
    </div>
  )
}

export default function Awards() {
  const [content, setContent] = useState<AwardsContent | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchContent() {
      try {
        const response = await fetch("/api/content/awards")
        
        if (!response.ok) {
          throw new Error(`Failed to fetch content: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (data.content) {
          setContent(data.content)
        } else {
          throw new Error("No content received")
        }
      } catch (err) {
        console.error("Error fetching awards content:", err)
        setError("Failed to load awards content")
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchContent()
  }, [])

  if (isLoading) {
    return <LoadingSkeleton />
  }
  
  if (error) {
    return <div className="min-h-screen flex justify-center items-center">Error loading content</div>
  }
  
  if (!content) {
    return <div className="min-h-screen flex justify-center items-center">No content available</div>
  }

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
            {content.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-5 text-lg text-gray-600 sm:text-xl"
          >
            {content.description}
          </motion.p>
        </motion.div>
      </section>
      <motion.div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
        {content.achievements.map((achievement, index) => (
          <VarsityOrchestraCard
            key={achievement.id}
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

