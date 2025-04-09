"use client"

import { useEffect, useState } from "react"
import type React from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { FileMusicIcon as MusicNote, MapPin, Users } from "lucide-react"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { JSX } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { GalleryImage, type FeatureItem, TripsContent } from "@/types/trips"

// Default data as fallback
const defaultImages: string[] = [
  "/CypressRanchOrchestraInstagramPhotos/CocoSocial.jpg",
  "/CypressRanchOrchestraInstagramPhotos/HoustonSymphonyMargianos.jpg",
  "/CypressRanchOrchestraInstagramPhotos/HoustonSymphony.jpg",
  "/CypressRanchOrchestraInstagramPhotos/HoustonSymphonyTripArcade.jpg",
  "/CypressRanchOrchestraInstagramPhotos/Disney2023.jpg",
]

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
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {images.map((image, index) => (
        <motion.div key={image.id} variants={fadeIn} className="overflow-hidden rounded-lg shadow-md">
          <AspectRatio ratio={16 / 9}>
            <Image src={image.src || "/placeholder.svg"} alt={`Gallery image ${index + 1}`} fill className="object-cover" />
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

// Get icon component based on icon name
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
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="aspect-[16/9] w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TripsAndSocials(): JSX.Element {
  const [content, setContent] = useState<TripsContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    async function fetchContent() {
      try {
        const response = await fetch('/api/content/trips');
        if (!response.ok) {
          throw new Error('Failed to fetch content');
        }
        const data = await response.json();
        setContent(data.content);
      } catch (error) {
        console.error('Error fetching trips content:', error);
        // Set default content if fetch fails
        setContent({
          page_title: "Orchestra Trips & Socials",
          page_subtitle: "Explore our adventures and memorable moments",
          quote: "Thank you to everyone who makes these moments unforgettable. We're excited for the upcoming socials and journeys this year. Stay tuned for announcements on our next adventure!",
          gallery_images: defaultImages.map((src, index) => ({ id: `default-${index}`, src })),
          feature_items: [
            {
              id: "default-1",
              icon: "MusicNote",
              title: "More Than Just Music",
              description: "Being part of our orchestra is about creating beautiful music and forming lasting friendships. We believe that the bonds formed off-stage are just as important as the harmony we create on-stage."
            },
            {
              id: "default-2",
              icon: "MapPin",
              title: "Exciting Adventures",
              description: "From weekend retreats to city trips, each event is a chance to unwind, explore, and connect in new ways. We've explored museums, attended professional concerts, and even had fun at theme parks!"
            },
            {
              id: "default-3",
              icon: "Users",
              title: "Unforgettable Moments",
              description: "These experiences bring us together, whether it's sightseeing, enjoying group dinners, or simply having fun. The memories we create during these trips last a lifetime and strengthen our musical connection."
            }
          ]
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchContent();
  }, []);
  
  if (isLoading) {
    return <LoadingSkeleton />;
  }
  
  if (!content) {
    return <div>Error loading content</div>;
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
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-gray-900">{content.page_title}</h1>
          <p className="text-lg sm:text-xl text-gray-600">{content.page_subtitle}</p>
        </motion.div>

        <motion.div
          variants={fadeIn}
          className="mb-16"
        >
          <Gallery images={content.gallery_images} />
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
            Creating Harmony Beyond Music
          </motion.h2>

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

          <motion.div
            variants={fadeIn}
            className="mt-12 sm:mt-16 text-center"
          >
            <p className="text-lg sm:text-xl text-gray-600 italic">
              &quot;{content.quote}&quot;
            </p>
          </motion.div>
        </motion.div>
      </section>
    </main>
  )
}

