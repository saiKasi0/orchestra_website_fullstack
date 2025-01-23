"use client"

import type React from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { FileMusicIcon as MusicNote, MapPin, Users } from "lucide-react"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { JSX } from "react"

const images: string[] = [
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

function Gallery({ images }: { images: string[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {images.map((src, index) => (
        <motion.div key={src} variants={fadeIn} className="overflow-hidden rounded-lg shadow-md">
          <AspectRatio ratio={16 / 9}>
            <Image src={src || "/placeholder.svg"} alt={`Gallery image ${index + 1}`} fill className="object-cover" />
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

export default function TripsAndSocials(): JSX.Element {
  return (
    <main className="min-h-screen bg-gray-50">
      <motion.section
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="relative max-w-6xl mx-auto pt-8 px-4 sm:px-6 lg:px-8"
      >
        <motion.div variants={fadeIn} className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-gray-900">Orchestra Trips & Socials</h1>
          <p className="text-lg sm:text-xl text-gray-600">Explore our adventures and memorable moments</p>
        </motion.div>

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <Gallery images={images} />
        </motion.div>
      </motion.section>

      <section className="bg-white py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-4xl mx-auto"
        >
          <motion.h2
            variants={fadeIn}
            className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 sm:mb-12 text-center"
          >
            Creating Harmony Beyond Music
          </motion.h2>

          <motion.div variants={staggerContainer} className="space-y-10 sm:space-y-14">
            <FeatureItem
              icon={<MusicNote className="w-8 h-8 sm:w-10 sm:h-10 text-amber-500" />}
              title="More Than Just Music"
              description="Being part of our orchestra is about creating beautiful music and forming lasting friendships. We believe that the bonds formed off-stage are just as important as the harmony we create on-stage."
            />
            <FeatureItem
              icon={<MapPin className="w-8 h-8 sm:w-10 sm:h-10 text-amber-500" />}
              title="Exciting Adventures"
              description="From weekend retreats to city trips, each event is a chance to unwind, explore, and connect in new ways. We've explored museums, attended professional concerts, and even had fun at theme parks!"
            />
            <FeatureItem
              icon={<Users className="w-8 h-8 sm:w-10 sm:h-10 text-amber-500" />}
              title="Unforgettable Moments"
              description="These experiences bring us together, whether it's sightseeing, enjoying group dinners, or simply having fun. The memories we create during these trips last a lifetime and strengthen our musical connection."
            />
          </motion.div>

          <motion.div
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-12 sm:mt-16 text-center"
          >
            <p className="text-lg sm:text-xl text-gray-600 italic">
              &quot;Thank you to everyone who makes these moments unforgettable. We&apos;re excited for the upcoming socials and
              journeys this year. Stay tuned for announcements on our next adventure!&quot;
            </p>
          </motion.div>
        </motion.div>
      </section>
    </main>
  )
}

