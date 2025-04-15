"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { JSX } from "react"
import { CompetitionsContent, CompetitionSchema } from "@/types/competitions"

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
        
        {/* Conditionally render the image block only if 'image' is truthy */}
        {image && (
          <div className="mb-4 relative aspect-video w-full overflow-hidden rounded-md"> 
            <Image
              src={image} // Use the image URL directly
              alt={name}
              fill // Use fill for responsive container
              className="object-contain" // Ensure image covers the area
              unoptimized={image.startsWith('data:image')} // Keep unoptimized for base64 if needed, though unlikely here
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
        if (data.content && data.content.competitions) {
          setCompetitionData(data.content);
        } else {
          // If the API returned empty content, show an error
          setError("No competition data available. Please contact the administrator.");
          setCompetitionData(null);
        }
      } catch (err) {
        console.error("Error fetching competitions data:", err);
        setError("Failed to load competitions data. Please try again later.");
        setCompetitionData(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCompetitionsData();
  }, []);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Skeleton for Title */}
          <div className="h-10 bg-gray-200 rounded-md w-1/2 mx-auto mb-8 animate-pulse"></div>
          {/* Skeleton for Description */}
          <div className="space-y-2 max-w-3xl mx-auto mb-12">
            <div className="h-4 bg-gray-200 rounded-md w-full animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded-md w-full animate-pulse"></div>
          </div>
          {/* Skeleton for Cards - Increased to 6 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <SkeletonCompetitionCard key={index} />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (error || !competitionData) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col items-center justify-center min-h-[40vh]">
            <h1 className="text-4xl font-bold text-gray-800 mb-8">Competitions</h1>
            <div className="bg-amber-50 border border-amber-200 rounded-md p-6 max-w-lg">
              <h2 className="text-xl font-semibold text-amber-800 mb-2">Information Unavailable</h2>
              <p className="text-amber-700">{error || "Unable to display competition information at this time."}</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Calculate dynamic grid classes based on the number of competitions
  const numCompetitions = competitionData?.competitions?.length ?? 0;
  let gridClasses = "grid gap-8 "; // Base classes

  if (numCompetitions === 1) {
    gridClasses += "grid-cols-1 max-w-2xl mx-auto"; // Center single card
  } else if (numCompetitions % 2 === 0) {
    gridClasses += "grid-cols-1 md:grid-cols-2"; // Max 2 columns
  }  else {
    // Default for 3 or 5+ items: use up to 3 columns
    gridClasses += "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"; 
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.h1
          className="text-4xl font-bold text-gray-800 mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {competitionData.title}
        </motion.h1>
        <motion.p
          className="text-xl text-gray-600 mb-12 text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {competitionData.description}
        </motion.p>
        
        {numCompetitions > 0 ? (
          <div className={gridClasses}> {/* Apply dynamic classes here */}
            {competitionData.competitions.map((competition, index) => (
              <CompetitionCard key={competition.id || index} {...competition} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-gray-500">No competitions are currently listed.</p>
          </div>
        )}
      </div>
    </main>
  )
}

