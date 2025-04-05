"use client"

import { useState, useEffect } from "react"
import type React from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { ResourcesContent } from "@/types/resources"

const Resources: React.FC = () => {
  const [content, setContent] = useState<ResourcesContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResourcesContent() {
      try {
        const response = await fetch('/api/admin/content/resources');
        
        if (!response.ok) {
          throw new Error('Failed to fetch resources content');
        }
        
        const data = await response.json();
        setContent(data.content);
      } catch (err) {
        console.error('Error fetching resources content:', err);
        setError('Unable to load resources content. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchResourcesContent();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-900 mx-auto mb-4" />
          <p className="text-gray-600">Loading resources...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !content) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error || "Failed to load resources content"}</p>
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
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-4xl mx-auto">
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-3xl font-bold text-gray-900 mb-8 text-center"
        >
          Orchestra Resources
        </motion.h1>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Orchestra Calendar</h2>
              <motion.iframe
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                title="Calendar"
                src={content.calendar_url}
                width="100%"
                height="600"
                className="border-0 rounded-lg"
              />
            </CardContent>
          </Card>
        </motion.div>

        <motion.section
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-12"
        >
          <Card>
            <CardContent className="p-6">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="mb-4 text-lg font-normal text-gray-600"
              >
                {content.support_title}
              </motion.p>

              <motion.iframe
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 1 }}
                title="Support Video"
                width="100%"
                height="400"
                src={content.youtube_url}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="rounded-lg"
              />
            </CardContent>
          </Card>
        </motion.section>
      </div>
    </motion.main>
  )
}

export default Resources

