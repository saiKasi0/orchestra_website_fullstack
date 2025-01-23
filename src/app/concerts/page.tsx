// TODO fix formatting
"use client"

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
    songs: [
      "Simple Symphony, Mvt 1: Boisterous Bourrée",
      "Halloween Spooktacular",
    ],
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
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};

const ConcertOrder: React.FC<ConcertOrderProps> = ({ concertName }) => {
  return (
    <motion.div  
      className="grid gap-5 px-5 py-5 lg:gap-16"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, margin: "-100px" }}
      variants={containerVariants}
    >
      <div className="flex flex-col justify-center">
        <motion.h1 
          className="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 dark:text-white md:text-5xl lg:text-5xl xl:text-6xl"
          variants={itemVariants}
        >
          {concertName} Concert Order
        </motion.h1>
        
        <motion.p 
          className="mb-8 text-lg font-normal text-gray-500 dark:text-gray-400 lg:text-xl"
          variants={itemVariants}
        >
          This was our last concert order, next concert coming soon!
        </motion.p>
        
        <div className="xxl:grid-cols-3 grid grid-cols-1 gap-8 md:grid-cols-1 lg:grid-cols-2">
          {concertOrder.map((concert, index) => (
            <motion.div
              key={index}
              className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800 hover:shadow-xl transition-shadow duration-300"
              variants={itemVariants}
            >
              <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
                {index + 1}. {concert.name}
              </h2>
              <ul className="list-inside list-disc text-gray-700 dark:text-gray-300">
                {concert.songs.map((song, songIndex) => (
                  <li key={songIndex}>{song}</li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default function Concert() {
  return (
    <>
      <main className="m-5">
        <div className="grid justify-items-center xl:flex xl:items-center xl:justify-evenly">
          <motion.div 
            className="h-fit w-fit rounded-lg border border-gray-200 bg-white shadow sm:p-5"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Image
              src="/CypressRanchOrchestraInstagramPhotos/FallConcertPoster.jpg"
              alt="concert_img"
              width={500}
              height={500}
              className="object-fit rounded-lg"
            />
          </motion.div>
          <ConcertOrder concertName="Fall" />
        </div>
      </main>
    </>
  );
}