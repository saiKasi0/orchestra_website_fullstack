"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { JSX } from "react"
import { CompetitionsContent, CompetitionSchema } from "@/types/competitions"

// Fallback data in case the API fails
const fallbackContent: CompetitionsContent = {
  title: "Our Competitions",
  description: "Cypress Ranch Orchestra participates in various prestigious competitions, showcasing our students' talents and dedication to musical excellence.",
  competitions: [
    {
      id: "1",
      name: "UIL Orchestra Competition",
      description: "The UIL Orchestra Competition is a prestigious event for school orchestras across Texas, promoting excellence in music education and performance. As a state-level competition, it offers participants the chance to showcase their talents in front of esteemed judges.",
      image: "/UILLogo.png",
      categories: ["Full Orchestra", "String Orchestra", "Solo & Ensemble"],
      additionalInfo: "Participation is by invitation only. Our orchestra has been invited for the past 5 consecutive years."
    },
    {
      id: "2",
      name: "TMEA Region & All-State Orchestra",
      description: "The Region Orchestra competition is a congregation of top student musicians from our region to play in the Region Symphony and Philharmonic Orchestras. This competition challenges participants to excel in performances of challenging music.",
      categories: ["Solo"],
      additionalInfo: "Process: Region Level Auditions → Area Auditions → State Selection"
    },
    {
      id: "3",
      name: "National Orchestra Festival – ASTA",
      description: "The National Orchestra Festival hosted by ASTA is an esteemed national competition that showcases some of the finest youth orchestras in the country. Our school orchestra is to proudly compete at this national level, facing the best from across the U.S.",
      image: "/ASTALogo.png",
      categories: ["String Orchestra"],
      additionalInfo: "Location: National Event - Various Locations Annually"
    }
  ]
}

const CompetitionCard: React.FC<CompetitionSchema> = ({ name, description, image, categories, additionalInfo }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg shadow-md overflow-hidden"
    >
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{name}</h2>
        {image && (
          <div className="mb-4">
            <Image
              src={image || "/placeholder.svg"}
              alt={name}
              width={400}
              height={200}
              className="object-contain w-full"
            />
          </div>
        )}
        <p className="text-gray-600 mb-4">{description}</p>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-700">Categories:</h3>
          <ul className="list-disc list-inside text-gray-600">
            {categories.map((category, index) => (
              <li key={index}>{category}</li>
            ))}
          </ul>
        </div>
        
        {additionalInfo && (
          <div className="mt-4 space-y-2">
            <h3 className="text-lg font-semibold text-gray-700">Additional Information:</h3>
            <p className="text-gray-600">{additionalInfo}</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// Add skeleton component for loading state
const SkeletonCompetitionCard: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        {/* Title skeleton */}
        <div className="h-8 bg-gray-200 rounded-md w-3/4 mb-4 animate-pulse"></div>
        
        {/* Image skeleton */}
        <div className="h-40 bg-gray-200 rounded-md mb-4 animate-pulse"></div>
        
        {/* Description skeleton - multiple lines */}
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-200 rounded-md w-full animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded-md w-full animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded-md w-4/5 animate-pulse"></div>
        </div>
        
        {/* Categories skeleton */}
        <div className="space-y-2 mb-4">
          <div className="h-5 bg-gray-200 rounded-md w-1/3 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded-md w-1/2 ml-4 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded-md w-2/5 ml-4 animate-pulse"></div>
        </div>
        
        {/* Additional info skeleton */}
        <div className="space-y-2 mt-4">
          <div className="h-5 bg-gray-200 rounded-md w-2/5 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded-md w-full animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded-md w-3/4 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default function Competitions(): JSX.Element {
  const [competitionData, setCompetitionData] = useState<CompetitionsContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCompetitionsData() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/admin/content/competitions');
        if (!response.ok) {
          throw new Error(`Failed to fetch competitions data: ${response.status}`);
        }
        const data = await response.json();
        
        // Check if we have valid content
        if (data.content && data.content.competitions && data.content.competitions.length > 0) {
          setCompetitionData(data.content);
        } else {
          // If the API returned empty content, use fallback
          console.info("API returned empty competitions data, using fallback");
          setCompetitionData(fallbackContent);
        }
      } catch (err) {
        console.error("Error fetching competitions data:", err);
        setError("Failed to load competitions data. Using fallback content.");
        // Use fallback data when API call fails
        setCompetitionData(fallbackContent);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCompetitionsData();
  }, []);

  // Extract title and description from competitionData or use fallback
  const pageTitle = competitionData?.title || fallbackContent.title;
  const pageDescription = competitionData?.description || fallbackContent.description;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.h1
          className="text-4xl font-bold text-gray-800 mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {pageTitle}
        </motion.h1>
        <motion.p
          className="text-xl text-gray-600 mb-12 text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {pageDescription}
        </motion.p>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, index) => (
              <SkeletonCompetitionCard key={index} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {competitionData?.competitions.map((competition, index) => (
              <CompetitionCard key={index} {...competition} />
            ))}
          </div>
        )}
        
        {error && (
          <div className="text-center text-amber-600 mt-4 text-sm">
            {error}
          </div>
        )}
      </div>
    </main>
  )
}

