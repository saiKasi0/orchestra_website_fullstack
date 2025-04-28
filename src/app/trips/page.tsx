"use client"

import { useEffect, useState } from "react"
import type React from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { FileMusicIcon as MusicNote, MapPin, Users, AlertCircle } from "lucide-react"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { JSX } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { GalleryImage, type FeatureItem, TripsContent } from "@/types/trips"

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
}

function Gallery({ images }: { images: GalleryImage[] }) {
  if (!images || images.length === 0) {
    return <p className="text-center text-gray-500">No gallery images available.</p>;
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {images.map((image, index) => (
        <motion.div key={image.id} variants={fadeIn} className="overflow-hidden rounded-lg shadow-md">
          <AspectRatio ratio={16 / 9}>
            <Image 
              src={image.src || ""} 
              alt={`Gallery image ${index + 1}`} 
              fill 
              className="object-cover" 
              loading="lazy" 
            />
          </AspectRatio>
        </motion.div>
      ))}
    </div>
  )
}

function FeatureItem({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <motion.div variants={fadeIn} className="flex items-start">
      <motion.div whileHover={{ scale: 1.1 }} className="flex-shrink-0 mr-4 sm:mr-6">
        {icon}
      </motion.div>
      <div>
        <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-base sm:text-lg text-gray-600">{description}</p>
      </div>
    </motion.div>
  )
}

function getIconComponent(iconName: string) {
  switch (iconName) {
    case 'MusicNote':
      return <MusicNote className="w-8 h-8 sm:w-10 sm:h-10 text-amber-500" />;
    case 'MapPin':
      return <MapPin className="w-8 h-8 sm:w-10 sm:h-10 text-amber-500" />;
    case 'Users':
      return <Users className="w-8 h-8 sm:w-10 sm:h-10 text-amber-500" />;
    default:
      return <MusicNote className="w-8 h-8 sm:w-10 sm:h-10 text-amber-500" />;
  }
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center mb-12">
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-8 w-1/2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="aspect-[16/9] w-full rounded-lg" />
          ))}
        </div>
        <div className="max-w-4xl mx-auto space-y-10">
          <Skeleton className="h-10 w-1/2 mx-auto mb-12" />
          {[1, 2].map((i) => (
            <div key={i} className="flex items-start">
              <Skeleton className="w-10 h-10 rounded-full mr-6" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </div>
          ))}
          <Skeleton className="h-6 w-3/4 mx-auto mt-16" />
        </div>
      </div>
    </div>
  );
}

function ErrorDisplay({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-md mx-auto text-center p-6 bg-white rounded-lg shadow-md border border-red-200">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-red-700 mb-2">Error Loading Content</h2>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}

export default function TripsAndSocials(): JSX.Element {
  const [content, setContent] = useState<TripsContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchContent() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/admin/content/trips');
        if (!response.ok) {
          throw new Error(`Failed to fetch content (status: ${response.status})`);
        }
        const data = await response.json();
        if (data.content && data.content.id) {
          setContent(data.content);
        } else {
          setContent(null);
          setError("No trips and socials content has been configured yet.");
        }
      } catch (err) {
        console.error('Error fetching trips content:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setContent(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchContent();
  }, []);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  if (!content) {
    return <ErrorDisplay message="Trips and socials content is not available at the moment." />;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <motion.section
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="relative max-w-6xl mx-auto pt-8 px-4 sm:px-6 lg:px-8"
      >
        <motion.div variants={fadeIn} className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-gray-900">{content.page_title || "Trips & Socials"}</h1>
          <p className="text-lg sm:text-xl text-gray-600">{content.page_subtitle || "Our latest adventures and gatherings."}</p>
        </motion.div>

        <motion.div variants={fadeIn} className="mb-16">
          <Gallery images={content.gallery_images || []} />
        </motion.div>
      </motion.section>

      <section className="bg-white py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="max-w-4xl mx-auto"
        >
          <motion.h2
            variants={fadeIn}
            className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 sm:mb-12 text-center"
          >
            {content.feature_items?.length > 0 ? "Creating Harmony Beyond Music" : "More Information Coming Soon"}
          </motion.h2>

          {content.feature_items && content.feature_items.length > 0 ? (
            <motion.div variants={staggerContainer} className="space-y-10 sm:space-y-14">
              {content.feature_items.map((item) => (
                <FeatureItem
                  key={item.id}
                  icon={getIconComponent(item.icon)}
                  title={item.title}
                  description={item.description}
                />
              ))}
            </motion.div>
          ) : (
            <motion.p variants={fadeIn} className="text-center text-gray-500">
              Details about our features will be added here.
            </motion.p>
          )}

          {content.quote && (
            <motion.div variants={fadeIn} className="mt-12 sm:mt-16 text-center">
              <p className="text-lg sm:text-xl text-gray-600 italic">
                &quot;{content.quote}&quot;
              </p>
            </motion.div>
          )}
        </motion.div>
      </section>
    </main>
  );
}

