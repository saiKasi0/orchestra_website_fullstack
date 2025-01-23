"use client"

import type React from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { JSX } from "react"

interface CompetitionDetails {
  readonly categories: readonly string[]
  readonly achievements: readonly string[]
  readonly additionalInfo?: Readonly<Record<string, string>>
}

interface CompetitionContent {
  readonly title: string
  readonly description: string
  readonly details: CompetitionDetails
  readonly imageUrl?: string
}

const competitionData: Record<string, CompetitionContent> = {
  uil: {
    title: "UIL Orchestra Competition",
    description:
      "The UIL Orchestra Competition is a prestigious event for school orchestras across Texas, promoting excellence in music education and performance. As a state-level competition, it offers participants the chance to showcase their talents in front of esteemed judges.",
    imageUrl: "/UILLogo.png",
    details: {
      categories: ["Full Orchestra", "String Orchestra", "Solo & Ensemble"],
      achievements: ["Multiple superior ratings"],
      additionalInfo: {
        "Judging Criteria": "Tone, Technique, Musicianship, General Effect",
      },
    },
  },
  tmea: {
    title: "TMEA Region & All-State Orchestra",
    description:
      "The Region Orchestra competition is a congregation of top student musicians from our region to play in the Region Symphony and Philharmonic Orchestras. This competition challenges participants to excel in performances of challenging music.",
    details: {
      categories: ["Solo"],
      achievements: ["Most Region Orchestra Members in District For Two Years in a Row"],
      additionalInfo: {
        Process: "Region Level Auditions → Area Auditions → State Selection",
      },
    },
  },
  asta: {
    title: "National Orchestra Festival – ASTA",
    description:
      "The National Orchestra Festival hosted by ASTA is an esteemed national competition that showcases some of the finest youth orchestras in the country. Our school orchestra is to proudly compete at this national level, facing the best from across the U.S.",
    imageUrl: "/ASTALogo.png",
    details: {
      categories: ["String Orchestra"],
      achievements: ["Qualified: Varsity Orchestra Competing this March"],
      additionalInfo: {
        Location: "National Event - Various Locations Annually",
      },
    },
  },
}

const CompetitionCard: React.FC<CompetitionContent> = ({ title, description, details, imageUrl }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg shadow-md overflow-hidden"
    >
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
        {imageUrl && (
          <div className="mb-4">
            <Image
              src={imageUrl || "/placeholder.svg"}
              alt={title}
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
            {details.categories.map((category, index) => (
              <li key={index}>{category}</li>
            ))}
          </ul>
        </div>
        <div className="mt-4 space-y-2">
          <h3 className="text-lg font-semibold text-gray-700">Achievements:</h3>
          <ul className="list-disc list-inside text-gray-600">
            {details.achievements.map((achievement, index) => (
              <li key={index}>{achievement}</li>
            ))}
          </ul>
        </div>
        {details.additionalInfo && (
          <div className="mt-4 space-y-2">
            <h3 className="text-lg font-semibold text-gray-700">Additional Information:</h3>
            {Object.entries(details.additionalInfo).map(([key, value], index) => (
              <p key={index} className="text-gray-600">
                <span className="font-medium">{key}:</span> {value}
              </p>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default function Competitions(): JSX.Element {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.h1
          className="text-4xl font-bold text-gray-800 mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Our Competitions
        </motion.h1>
        <motion.p
          className="text-xl text-gray-600 mb-12 text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Cypress Ranch Orchestra participates in various prestigious competitions, showcasing our students&apos; talents and
          dedication to musical excellence.
        </motion.p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Object.values(competitionData).map((competition, index) => (
            <CompetitionCard key={index} {...competition} />
          ))}
        </div>
      </div>
    </main>
  )
}

