// TODO fix styling across browsers
"use client";

import Image from "next/image";
import { motion } from "framer-motion";

interface Orchestra {
  name: string;
  songs: string[];
}

interface ConcertOrderProps {
  concertName: string;
}

const concertOrder: Orchestra[] = [
  {
    name: "Camerata Orchestra",
    songs: ["Geometric Dances #3, Triangle Dance", "Angry Spirits"],
  },
  {
    name: "Concert Orchestra",
    songs: ["Dark Catacombs", "Danse Diabolique"],
  },
  {
    name: "Philharmonic Orchestra",
    songs: ["Supernova", "Music from Wicked"],
  },
  {
    name: "Symphony Orchestra",
    songs: ["Simple Symphony, Mvt 1: Boisterous Bourrée", "Halloween Spooktacular"],
  },
  {
    name: "Chamber Orchestra",
    songs: ["Serenade for Strings, Mvt: Élégie", "Thriller"],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
    },
  },
};

const ConcertOrder: React.FC<ConcertOrderProps> = ({ concertName }) => {
  return (
    <motion.div
      className="grid gap-6 py-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.h1
        className="text-3xl font-bold text-gray-900 dark:text-white md:text-4xl lg:text-5xl"
        variants={itemVariants}
      >
        {concertName} Concert Order
      </motion.h1>

      <motion.p
        className="text-lg text-gray-600 dark:text-gray-400 mb-8"
        variants={itemVariants}
      >
        Experience the harmony of our upcoming performance.
      </motion.p>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        {concertOrder.map((concert, index) => (
          <motion.div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
            variants={itemVariants}
          >
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{concert.name}</h2>
              <ul className="space-y-2">
                {concert.songs.map((song, songIndex) => (
                  <li key={songIndex} className="text-gray-600 dark:text-gray-300">
                    {song}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default function Concert() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
          <div className="w-full lg:w-2/3 lg:pr-12">
            <ConcertOrder concertName="Fall" />
          </div>
          <motion.div
            className="w-full lg:w-1/3 mt-12 lg:mt-0"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="sticky top-8">
              <Image
                src="/CypressRanchOrchestraInstagramPhotos/FallConcertPoster.jpg"
                alt="Fall Concert Poster"
                width={500}
                height={750}
                className="rounded-lg shadow-lg object-cover"
                layout="responsive"
              />
              <div className="mt-4 text-center">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Fall Concert</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Join us for an evening of musical excellence</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
