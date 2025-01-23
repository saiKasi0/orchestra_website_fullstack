"use client"

import type React from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"

const Resources: React.FC = () => (
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
              src="https://calendar.google.com/calendar/embed?src=c_20p6293m4hda8ecdv1k63ki418%40group.calendar.google.com&amp"
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
              Just For Some Support :)
            </motion.p>

            <motion.iframe
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
              title="2 set violin"
              width="100%"
              height="400"
              src="https://www.youtube.com/embed/QkklAQLhnQY?si=HGTk2aKkxV3r1ITb"
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

export default Resources

