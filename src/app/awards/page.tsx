"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { motion } from "framer-motion"
import { AwardsContent, Achievement as AchievementData } from "@/types/awards"
import { Skeleton } from "@/components/ui/skeleton" // Import Skeleton

type AchievementCardProps = Partial<AchievementData> & {
  index: number
  isLoading?: boolean
}

const AchievementCard = ({ title, imageSrc, imageAlt, index, isLoading }: AchievementCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: "easeOut",
      }}
      whileHover={!isLoading ? { // Disable hover effect when loading
        scale: 1.02,
        transition: { duration: 0.2 },
      } : {}}
    >
      <Card className="grid grid-cols-1 h-full">
        <CardHeader>
          {isLoading ? (
            <Skeleton className="h-6 w-3/4" /> // Skeleton for title
          ) : (
            <CardTitle className="text-lg font-semibold text-gray-800">{title}</CardTitle>
          )}
        </CardHeader>
        <CardContent>
          <motion.div
            className="flex items-center justify-center"
            whileHover={!isLoading ? { scale: 1.05 } : {}} // Disable hover effect when loading
            transition={{ duration: 0.2 }}
          >
            {isLoading ? (
              <Skeleton className="w-[200px] h-[200px] rounded-lg" /> // Skeleton for image
            ) : (
              <Image
                className="w-fit rounded-lg object-contain"
                src={imageSrc || ""}
                alt={imageAlt || "Award image"}
                width={200}
                height={200}
                loading="lazy"
              />
            )}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function Awards() {
  const [content, setContent] = useState<AwardsContent | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchContent() {
      try {
        const response = await fetch("/api/admin/content/awards")
        
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

  if (error) {
    return <div className="min-h-screen flex justify-center items-center">Error loading content</div>
  }

  // Render skeleton grid while loading
  if (isLoading) {
    const loadingGridClasses = "grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto"; // Example: always 3 columns for loading

    return (
      <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        {/* Optional: Skeleton for header */}
        <section className="mb-16">
          <div className="mx-auto max-w-4xl text-center">
            <Skeleton className="h-10 w-3/4 mx-auto mb-4" />
            <Skeleton className="h-6 w-full mx-auto mt-5" />
            <Skeleton className="h-6 w-5/6 mx-auto mt-2" />
          </div>
        </section>
        {/* Skeleton Grid */}
        <div className={loadingGridClasses}>
          {Array.from({ length: 6 }).map((_, index) => ( // Render 6 skeleton cards
            <AchievementCard key={`skeleton-${index}`} index={index} isLoading={true} />
          ))}
        </div>
      </main>
    )
  }

  if (!content) {
    return <div className="min-h-screen flex justify-center items-center">No content available</div>
  }

  // Calculate dynamic grid classes based on the actual number of achievements
  const numAchievements = content.achievements.length;
  let gridClasses = "grid gap-8 ";

  if (numAchievements === 1) {
    gridClasses += "grid-cols-1 max-w-2xl mx-auto"; // Center single card
  } else if (numAchievements === 2) {
    gridClasses += "grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto"; // Two columns centered
  } else if (numAchievements === 4) {
    gridClasses += "grid-cols-1 md:grid-cols-2"; // Two columns full width
  } else {
    // Default for 3 or 5+ items: use up to 3 columns
    gridClasses += "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
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

      {numAchievements > 0 ? (
        <motion.div className={`${gridClasses} max-w-7xl mx-auto`}>
          {content.achievements.map((achievement, index) => (
            <AchievementCard
              key={achievement.id}
              {...achievement} // Spread the achievement data
              index={index}
              isLoading={false} // Pass isLoading as false when data is loaded
            />
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-12 max-w-7xl mx-auto">
          <p className="text-lg text-gray-500">No achievements are currently listed.</p>
        </div>
      )}
    </motion.main>
  )
}

