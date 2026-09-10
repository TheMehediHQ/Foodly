import React from 'react';
import { motion } from 'framer-motion';

const MotionDiv = motion.div;

const foodTips = [
  {
    category: 'Fruits & Vegetables',
    title: 'Store Leafy Greens Properly',
    tip: 'Wash greens, pat them thoroughly dry,  wrap  in a paper towel and place them in an airtight container or bag in the crisper drawer. This absorbs moisture and prevents wilting.',
    icon: '🥬'
  },
  {
    category: 'Fruits & Vegetables',
    title: 'Keep Bananas Separate',
    tip: 'Bananas release ethylene gas, which ripens other fruits quickly. Store them away from other produce to prevent premature spoiling of sensitive fruits like apples, avocados, and tomatoes.',
    icon: '🍌'
  },
  {
    category: 'Fruits & Vegetables',
    title: 'Refrigerate Tomatoes ',
    tip: 'For optimal flavor .However, if they are getting too ripe and you want to extend their life by a few days, refrigerate them, but be aware it might slightly reduce their flavor.',
    icon: '🍅'
  },
  {
    category: 'Dairy & Eggs',
    title: 'Store Milk on the Coldest Shelf',
    tip: "Avoid storing milk in the refrigerator door, as it's the warmest part. Keep it on an inside shelf, where temperatures are more consistent and colder, to prolong its freshness.",
    icon: '🥛'
  }
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 50, opacity: 0, scale: 0.9 },
  show: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10
    }
  }
};

const ExtraSections = () => {
  return (
    <section className="w-full transition-colors duration-300">
      <div className="text-center mb-10 sm:mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#ff6347] dark:text-[#ffa500]">
          Food Preservation & Storage Tips
        </h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-[#d1d5db] mt-3 max-w-2xl mx-auto font-normal">
          Learn how to store your food properly to extend its freshness, reduce waste, and save money!
        </p>
      </div>

      <MotionDiv
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
      >
        {foodTips.map((tip, index) => (
          <MotionDiv
            key={index}
            className="flex flex-col bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
            variants={itemVariants}
            whileHover={{ scale: 1.05, y: -5, transition: { duration: 0.2 } }}
          >
            {/* Centered Icon */}
            <div className="text-5xl mb-4 mx-auto" role="img" aria-label={tip.category}>
              {tip.icon}
            </div>

            {/* Left-aligned content */}
            <h3 className="text-2xl font-bold text-[#111827] dark:text-[#d1d5db] mb-1">
              {tip.title}
            </h3>
            <p className="text-sm text-[#ff6347] dark:text-[#ffa500] font-semibold mb-2">
              Category: {tip.category}
            </p>
            <p className="text-[#111827] dark:text-[#d1d5db] text-sm flex-grow">
              {tip.tip}
            </p>
          </MotionDiv>
        ))}
      </MotionDiv>
    </section>
  );
};

export default ExtraSections;
