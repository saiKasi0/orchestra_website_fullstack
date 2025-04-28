"use client"
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Orchestra, ConcertsContent } from "@/types/concerts";
import { Loader2 } from "lucide-react";

const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 }
};

const pageTransition = {
  duration: 0.3
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3
    }
  }
};

const ConcertOrder: React.FC<{ concertName: string; orchestras: Orchestra[] }> = ({ concertName, orchestras }) => {
  return (
    <motion.div
      className="grid gap-5 px-5 py-5 lg:gap-16"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="flex flex-col justify-center">
        <motion.h1
          className="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 dark:text-white md:text-5xl lg:text-5xl xl:text-6xl"
          variants={itemVariants}
        >
          {concertName} Concert Order
        </motion.h1>
        <div className="xxl:grid-cols-3 grid grid-cols-1 gap-8 md:grid-cols-1 lg:grid-cols-2">
          {orchestras.map((orchestra, index) => (
            <motion.div
              key={orchestra.id}
              className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800 hover:shadow-xl transition-shadow duration-300"
              variants={itemVariants}
            >
              <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
                {index + 1}. {orchestra.name}
              </h2>
              <ul className="list-inside list-decimal text-gray-700 dark:text-gray-300">
                {orchestra.songs.map((song, songIndex) => (
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
  const [isLoading, setIsLoading] = useState(true);
  const [concertData, setConcertData] = useState<ConcertsContent | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchConcertContent() {
      try {
        const response = await fetch('/api/admin/content/concerts');
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.content) {
          setConcertData(data.content);
        } else {
          setError("No concert data available");
        }
      } catch (err) {
        console.error("Failed to fetch concert content:", err);
        setError("Failed to load concert information. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchConcertContent();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]"> 
        <div className="mb-4 text-7xl">🎻</div>
        <p className="text-xl text-gray-600 dark:text-gray-400">Tuning the strings...</p>
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (error || !concertData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Oops!</h2>
        <p className="text-lg text-center text-gray-700 max-w-md">{error || "Something went wrong. Please try again later."}</p>
      </div>
    );
  }
  
  if (!concertData.orchestras || concertData.orchestras.length === 0) {
    return (
      <AnimatePresence mode="wait">
        <motion.main
          className="m-5"
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
        >
          <div className="flex flex-col items-center justify-center min-h-[40vh]">
            <h1 className="text-3xl font-bold mb-6">{concertData.concert_name}</h1>
            <p className="text-lg text-center text-gray-700 max-w-lg">
              {concertData.no_concert_text || "No concert order is available at this time. Please check back later."}
            </p>
          </div>
        </motion.main>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.main
        className="m-5"
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
      >
        <div className="grid justify-items-center xl:flex xl:items-center xl:justify-evenly">
          {concertData.poster_image_url && (
            <motion.div
              className="h-fit w-fit rounded-lg border border-gray-200 bg-white shadow sm:p-5"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Image
                src={concertData.poster_image_url}
                alt={`${concertData.concert_name} Poster`}
                width={500}
                height={500}
                className="object-fit rounded-lg"
              />
            </motion.div>
          )}
          <ConcertOrder 
            concertName={concertData.concert_name} 
            orchestras={concertData.orchestras} 
          />
        </div>
      </motion.main>
    </AnimatePresence>
  );
}