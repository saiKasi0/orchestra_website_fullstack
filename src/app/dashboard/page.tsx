"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import StaffCards from "@/components/StaffCards"
import LeadershipCards from "@/components/LeadershipCards"

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
}

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <motion.section
        className="relative h-[60vh] bg-blue-900 overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
      <Image
        src="/CypressRanchOrchestraInstagramPhotos/Disney2023.jpg"
        alt="Cypress Ranch Orchestra performing"
        fill={true}
        className="opacity-50 object-cover"
      />
        <div className="absolute inset-0 flex flex-col justify-center items-center text-white">
          <motion.h1 className="text-4xl md:text-6xl font-bold mb-4 text-center" variants={fadeIn}>
            Cypress Ranch Orchestra
          </motion.h1>
          <motion.p className="text-xl md:text-2xl mb-8 text-center" variants={fadeIn}>
            Inspiring musical excellence since 2008
          </motion.p>
          <motion.div variants={fadeIn}>
            <Link
              href="/concerts"
              className="bg-amber-500 text-blue-900 px-6 py-3 rounded-md font-semibold hover:bg-amber-400 transition-colors duration-300"
            >
              Upcoming Concerts
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* About Section */}
      <motion.section
        className="py-16 px-4 max-w-4xl mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeIn}
      >
        <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">About Our Orchestra</h2>
        <p className="text-gray-600 mb-8 text-center">
          The Cypress Ranch High School Orchestra program is dedicated to fostering musical growth, creativity, and
          excellence in our students. Through rigorous training and passionate performances, we aim to enrich our
          community and inspire the next generation of musicians.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-amber-500 mb-2">100+</div>
            <div className="text-gray-700">Students</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-amber-500 mb-2">20+</div>
            <div className="text-gray-700">Annual Performances</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-amber-500 mb-2">15</div>
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
          <h2 className="text-3xl font-semibold text-gray-800 mb-8 text-center">Featured Events</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
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
          </div>
        </div>
      </motion.section>

      {/* Staff & Leadership Section */}
      <motion.section
        className="py-16 px-4 bg-gray-50"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeIn}
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-semibold text-gray-800 mb-8 text-center">Meet Our Staff & Leadership</h2>
          <p className="text-gray-600 mb-12 text-center max-w-3xl mx-auto">
            Our dedicated staff work tirelessly to coordinate, manage, and bring to life every aspect of our orchestra.
            They are supported by our leadership team, who assist in non-administrative day-to-day tasks. This
            collaborative effort ensures the orchestra&apos;s success and enriches our community through music.
          </p>
          <StaffCards />
          <div className="my-16 border-t border-gray-200"></div>
          <LeadershipCards />
        </div>
      </motion.section>

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
            Get Involved
          </Link>
        </div>
      </motion.section>
    </main>
  )
}

