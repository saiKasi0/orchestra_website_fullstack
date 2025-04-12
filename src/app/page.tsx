"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import StaffCards from "@/components/StaffCards"
import LeadershipCards from "@/components/LeadershipCards"
import { HomepageContent } from "@/types/homepage"
import { Skeleton } from "@/components/ui/skeleton"

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
}

const slideIn = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
}

export default function Home() {
  const [content, setContent] = useState<HomepageContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHomepageContent() {
      try {
        const response = await fetch('/api/admin/content/homepage');
        
        if (!response.ok) {
          throw new Error('Failed to fetch homepage content');
        }
        
        const data = await response.json();
        setContent(data.content);
      } catch (err) {
        console.error('Error fetching homepage content:', err);
        setError('Unable to load page content. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchHomepageContent();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section Skeleton */}
        <section className="relative h-[60vh] overflow-hidden">
          <div className="absolute inset-0 bg-blue-800/90 animate-pulse"></div>
          <div className="absolute inset-0 flex flex-col justify-center items-center text-white">
            <Skeleton className="h-16 w-96 max-w-full bg-blue-700/50 mb-4" />
            <Skeleton className="h-8 w-80 max-w-full bg-blue-700/50 mb-8" />
            <Skeleton className="h-12 w-48 bg-amber-500/50 rounded-md" />
          </div>
        </section>

        {/* About Section Skeleton */}
        <section className="py-16 px-4 max-w-4xl mx-auto">
          <Skeleton className="h-10 w-60 mx-auto bg-gray-200 mb-6" />
          <div className="space-y-2 mb-8">
            <Skeleton className="h-4 w-full bg-gray-200" />
            <Skeleton className="h-4 w-5/6 mx-auto bg-gray-200" />
            <Skeleton className="h-4 w-4/6 mx-auto bg-gray-200" />
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center">
                <Skeleton className="h-10 w-16 mx-auto bg-amber-200 mb-2" />
                <Skeleton className="h-5 w-24 mx-auto bg-gray-200" />
              </div>
            ))}
          </div>
        </section>

        {/* Featured Events Skeleton */}
        <section className="bg-white py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-10 w-60 mx-auto bg-gray-200 mb-8" />
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="bg-gray-50 p-6 rounded-lg shadow-md">
                  <Skeleton className="h-7 w-3/4 bg-gray-200 mb-4" />
                  <div className="space-y-2 mb-4">
                    <Skeleton className="h-4 w-full bg-gray-200" />
                    <Skeleton className="h-4 w-5/6 bg-gray-200" />
                    <Skeleton className="h-4 w-4/6 bg-gray-200" />
                  </div>
                  <Skeleton className="h-4 w-32 bg-amber-200" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    );
  }

  // Error state
  if (error || !content) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error || "Failed to load homepage content"}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-900 text-white px-6 py-2 rounded-md hover:bg-blue-800 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-[60vh] bg-blue-900 overflow-hidden">
        {content?.hero_image_url ? (
          <Image
            src={content.hero_image_url}
            alt="Cypress Ranch Orchestra"
            fill={true}
            className="opacity-50 object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-blue-800/90 animate-pulse"></div>
        )}
        <div className="absolute inset-0 flex flex-col justify-center items-center text-white">
          <motion.h1 
            className="text-4xl md:text-6xl font-bold mb-4 text-center px-4" 
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            {content ? content.hero_title : (
              <Skeleton className="h-16 w-96 max-w-full bg-blue-700/50" />
            )}
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl mb-8 text-center px-4" 
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ delay: 0.2 }}
          >
            {content ? content.hero_subtitle : (
              <Skeleton className="h-8 w-80 max-w-full bg-blue-700/50" />
            )}
          </motion.p>
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ delay: 0.4 }}
          >
            <Link
              href="/concerts"
              className="bg-amber-500 text-blue-900 px-6 py-3 rounded-md font-semibold hover:bg-amber-400 transition-colors duration-300"
            >
              Upcoming Concerts
            </Link>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <motion.section
        className="py-16 px-4 max-w-4xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">
          {content ? content.about_title : (
            <Skeleton className="h-10 w-60 mx-auto bg-gray-200" />
          )}
        </h2>
        <div className="text-gray-600 mb-8 text-center">
          {content ? content.about_description : (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full bg-gray-200" />
              <Skeleton className="h-4 w-5/6 mx-auto bg-gray-200" />
              <Skeleton className="h-4 w-4/6 mx-auto bg-gray-200" />
            </div>
          )}
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-amber-500 mb-2">
              {content ? content.stats_students : (
                <Skeleton className="h-10 w-16 mx-auto bg-amber-200" />
              )}
            </div>
            <div className="text-gray-700">Students</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-amber-500 mb-2">
              {content ? content.stats_performances : (
                <Skeleton className="h-10 w-16 mx-auto bg-amber-200" />
              )}
            </div>
            <div className="text-gray-700">Annual Performances</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-amber-500 mb-2">
              {content ? content.stats_years : (
                <Skeleton className="h-10 w-16 mx-auto bg-amber-200" />
              )}
            </div>
            <div className="text-gray-700">Years of Excellence</div>
          </div>
        </div>
      </motion.section>

      {/* Featured Events */}
      <motion.section
        className="bg-white py-16 px-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeIn}
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-semibold text-gray-800 mb-8 text-center">
            {content ? content.featured_events_title : (
              <Skeleton className="h-10 w-60 mx-auto bg-gray-200" />
            )}
          </h2>
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {content?.event_cards && content.event_cards.length > 0 ? (
              content.event_cards.map((card) => (
                <motion.div 
                  key={card.id} 
                  className="bg-gray-50 p-6 rounded-lg shadow-md"
                  variants={slideIn}
                >
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{card.title}</h3>
                  <p className="text-gray-600 mb-4">
                    {card.description}
                  </p>
                  <Link
                    href={card.link_url}
                    className="text-amber-500 font-semibold hover:text-amber-600 transition-colors duration-300"
                  >
                    {card.link_text}
                  </Link>
                </motion.div>
              ))
            ) : isLoading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="bg-gray-50 p-6 rounded-lg shadow-md">
                  <Skeleton className="h-7 w-3/4 bg-gray-200 mb-4" />
                  <div className="space-y-2 mb-4">
                    <Skeleton className="h-4 w-full bg-gray-200" />
                    <Skeleton className="h-4 w-5/6 bg-gray-200" />
                    <Skeleton className="h-4 w-4/6 bg-gray-200" />
                  </div>
                  <Skeleton className="h-4 w-32 bg-amber-200" />
                </div>
              ))
            ) : (
              <>
                <div className="bg-gray-50 p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Concerts</h3>
                  <p className="text-gray-600 mb-4">
                    Join us for evenings of classical masterpieces and contemporary works.
                  </p>
                  <Link
                    href="/concerts"
                    className="text-amber-500 font-semibold hover:text-amber-600 transition-colors duration-300"
                  >
                    View Concert Schedule →
                  </Link>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Competitions</h3>
                  <p className="text-gray-600 mb-4">
                    Explore our orchestra&apos;s participation in various prestigious competitions.
                  </p>
                  <Link
                    href="/competitions"
                    className="text-amber-500 font-semibold hover:text-amber-600 transition-colors duration-300"
                  >
                    View Competitions →
                  </Link>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Trips & Socials</h3>
                  <p className="text-gray-600 mb-4">Discover our adventures and memorable moments beyond the stage.</p>
                  <Link
                    href="/trips-and-socials"
                    className="text-amber-500 font-semibold hover:text-amber-600 transition-colors duration-300"
                  >
                    Explore Our Journeys →
                  </Link>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Awards</h3>
                  <p className="text-gray-600 mb-4">Celebrate our orchestra&apos;s achievements and accolades.</p>
                  <Link
                    href="/awards"
                    className="text-amber-500 font-semibold hover:text-amber-600 transition-colors duration-300"
                  >
                    View Our Achievements →
                  </Link>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </motion.section>

      {/* Staff & Leadership Section */}
      {(content.staff_members?.length > 0 || content.leadership_sections?.length > 0) && (
        <motion.section
          className="py-16 px-4 bg-gray-50"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
        >
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-semibold text-gray-800 mb-8 text-center">
              {content ? content.staff_leadership_title : (
                <Skeleton className="h-10 w-72 mx-auto bg-gray-200" />
              )}
            </h2>
            <div className="text-gray-600 mb-12 text-center max-w-3xl mx-auto">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full bg-gray-200" />
                  <Skeleton className="h-4 w-5/6 mx-auto bg-gray-200" />
                  <Skeleton className="h-4 w-4/6 mx-auto bg-gray-200" />
                </div>
              ) : (
                <>
                  Our dedicated staff work tirelessly to coordinate, manage, and bring to life every aspect of our orchestra.
                  They are supported by our leadership team, who assist in non-administrative day-to-day tasks. This
                  collaborative effort ensures the orchestra&apos;s success and enriches our community through music.
                </>
              )}
            </div>
            
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="bg-white rounded-lg p-6 shadow-md flex flex-col items-center">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 mb-4 relative">
                      <Skeleton className="h-full w-full" />
                    </div>
                    <Skeleton className="h-6 w-40 bg-gray-200 mb-2" />
                    <Skeleton className="h-4 w-24 bg-gray-200 mb-4" />
                    <div className="space-y-2 w-full">
                      <Skeleton className="h-3 w-full bg-gray-200" />
                      <Skeleton className="h-3 w-5/6 bg-gray-200" />
                      <Skeleton className="h-3 w-4/6 bg-gray-200" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {content.staff_members?.length > 0 && (
                  <StaffCards data={content.staff_members} />
                )}
                
                {content.staff_members?.length > 0 && content.leadership_sections?.length > 0 && (
                  <div className="my-16 border-t border-gray-200"></div>
                )}
                
                {content.leadership_sections?.length > 0 && (
                  <div className="leadership-sections-container">
                    <LeadershipCards data={content.leadership_sections} />
                  </div>
                )}
              </>
            )}
          </div>
        </motion.section>
      )}

      {/* Call to Action */}
      <motion.section
        className="bg-blue-900 text-white py-16 px-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeIn}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-4">Join Our Orchestra Family</h2>
          <p className="mb-8">
            Whether you&apos;re a student looking to join or a community member wanting to support, we&apos;d love to have you as
            part of our musical journey.
          </p>
          <Link
            href="/resources"
            className="bg-amber-500 text-blue-900 px-6 py-3 rounded-md font-semibold hover:bg-amber-400 transition-colors duration-300 inline-block"
          >
            Access Resources
          </Link>
        </div>
      </motion.section>
    </main>
  )
}

