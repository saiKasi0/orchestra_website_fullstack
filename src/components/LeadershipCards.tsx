"use client"

import React from 'react';
import { LeadershipSection } from '@/types/homepage';
import LeadershipMemberDisplay from './LeadershipMemberDisplay';
import { motion } from 'framer-motion';

type LeadershipCardsProps = {
  data: LeadershipSection[]
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

const LeadershipCards = ({ data }: LeadershipCardsProps) => {
  // Helper function to determine grid columns based on member count
  const getGridCols = (memberCount: number) => {
    // For small screens (default)
    const baseColumns = "grid-cols-1 sm:grid-cols-2";
    
    if (memberCount === 1) {
      return `${baseColumns} md:grid-cols-1 lg:grid-cols-1 mx-auto max-w-xs`;
    } else if (memberCount === 2) {
      return `${baseColumns} md:grid-cols-2 lg:grid-cols-2 max-w-2xl mx-auto`;
    } else if (memberCount === 3) {
      return `${baseColumns} md:grid-cols-3 lg:grid-cols-3 max-w-4xl mx-auto`;
    } else if (memberCount === 4) {
      return `${baseColumns} md:grid-cols-4 lg:grid-cols-4 max-w-5xl mx-auto`;
    } else {
      // Default grid for 5+ members
      return `${baseColumns} md:grid-cols-4 lg:grid-cols-5`;
    }
  };

  return (
    <div className="space-y-16">
      {data.map((section) => {
        // Sort members alphabetically by name
        const sortedMembers = [...section.members].sort((a, b) => 
          a.name.localeCompare(b.name)
        );
        
        return (
          <div key={section.id} className="space-y-6">
            <div className="space-y-2 text-center">
              <h3 
                className="text-2xl font-semibold"
                style={{ color: section.color || '#3b82f6' }}
              >
                {section.name}
              </h3>
              <div 
                className="h-1 w-24 mx-auto rounded" 
                style={{ backgroundColor: section.color || '#3b82f6' }}
              ></div>
            </div>

            <motion.div
              className={`grid ${getGridCols(sortedMembers.length)} gap-6`}
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              {sortedMembers.map((member) => (
                <motion.div key={member.id} variants={fadeIn}>
                  <LeadershipMemberDisplay 
                    name={member.name} 
                    imageUrl={member.image_url}
                    sectionColor={section.color || '#3b82f6'} 
                    size={sortedMembers.length === 1 ? 'extra-large' : sortedMembers.length <= 3 ? 'large' : 'normal'}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        );
      })}
    </div>
  );
};

export default LeadershipCards;

