import React from 'react';
import { motion } from 'framer-motion';
import {
  Globe,
  LeafyGreen,
  Wallet,
  Lightbulb,
  Trash2
} from 'lucide-react';

const MotionDiv = motion.div;

const foodWasteFacts = [
  {
    title: '1/3 of Food Wasted Globally',
    description:
      'Roughly one-third of food produced for humans — approx. 1.3 billion tonnes — gets lost or wasted yearly.',
    icon: Globe,
    color: 'text-[#ff6347] dark:text-[#ffa500]',
  },
  {
    title: '$1 Trillion Economic Loss',
    description:
      'Food waste costs the global economy around $1 trillion each year.',
    icon: Wallet,
    color: 'text-[#ff6347] dark:text-[#ffa500]',
  },
  {
    title: 'Huge Environmental Impact',
    description:
      'If food waste were a country, it’d rank third in greenhouse gas emissions — after China and the U.S.',
    icon: LeafyGreen,
    color: 'text-[#ff6347] dark:text-[#ffa500]',
  },
  
  {
    title: 'Help End Hunger',
    description:
      'Cutting food loss could feed 2 billion people. Small actions have global impact.',
    icon: Lightbulb,
    color: 'text-[#ff6347] dark:text-[#ffa500]',
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const itemVariants = {
  hidden: { y: 60, opacity: 0, scale: 0.85 },
  show: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10,
      duration: 0.6
    }
  }
};

const ExtraSection2 = () => {
  return (
    <section className="w-full transition-colors duration-300">
      <div className="text-center mb-10 sm:mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#ff6347] dark:text-[#ffa500]">
          Understanding Food Waste: Facts & Statistics
        </h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-[#d1d5db] mt-3 max-w-2xl mx-auto font-normal">
          Every action to reduce food waste contributes to a healthier planet and future.
        </p>
      </div>

      
      <MotionDiv
  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
  variants={containerVariants}
  initial="hidden"
  whileInView="show"
  viewport={{ once: true, amount: 0.3 }}
>
  {foodWasteFacts.map((fact, index) => (
    <MotionDiv
      key={index}
      className="flex flex-col bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 "
      variants={itemVariants}
      whileHover={{ scale: 1.05, y: -8, transition: { duration: 0.2 } }}
    >
      {/* Icon Centered */}
      <div className={`text-5xl mb-4 mx-auto ${fact.color}`}>
        {React.createElement(fact.icon, { size: 64 })}
      </div>

      {/* Title */}
      <h3 className="text-2xl font-bold text-[#111827] dark:text-[#d1d5db] mb-2 text-left">
        {fact.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-[#d1d5db] text-left">
        {fact.description}
      </p>
    </MotionDiv>
  ))}
</MotionDiv>


     
    </section>
  );
};

export default ExtraSection2;
