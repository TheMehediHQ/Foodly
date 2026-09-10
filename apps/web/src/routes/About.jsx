import React from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Clock,
  Leaf,
  Refrigerator,
  CheckCircle2,
  TrendingDown,
  ArrowRight,
  Plus,
} from "lucide-react";

const About = () => {
  const pillars = [
    {
      icon: Clock,
      title: "Smart Expiry Tracking",
      description:
        "Color-coded countdowns and timely alerts ensure you consume items while they are fresh, before they expire.",
    },
    {
      icon: Leaf,
      title: "Sustainable Living",
      description:
        "Minimizing household food waste helps the environment by reducing landfill impact and greenhouse gas emissions.",
    },
    {
      icon: Refrigerator,
      title: "Total Kitchen Clarity",
      description:
        "Categorize, search, and manage your dairy, produce, meats, and snacks with a clean, clutter-free interface.",
    },
  ];

  const stats = [
    { value: "1.3B", label: "Tons of food wasted globally each year" },
    { value: "30%+", label: "Average waste reduced with proactive tracking" },
    { value: "$1,500", label: "Estimated annual grocery savings per household" },
    { value: "100%", label: "Simple, transparent, and user-first" },
  ];

  const keyPoints = [
    "Never let fresh groceries spoil in the back of the fridge",
    "Real-time countdown badges: Expiring Soon, Expired, and Days Left",
    "Instant category filters for dairy, vegetables, snacks, and meat",
    "Smart pantry management designed to save you money every week",
  ];

  return (
    <div className="min-h-screen bg-[#fffaf5] dark:bg-[#1f1f1f] text-gray-800 dark:text-zinc-100 transition-colors duration-300 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-24">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-100/80 dark:bg-zinc-800 text-[#ff6347] dark:text-[#ffa500] border border-orange-200/60 dark:border-zinc-700 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Our Mission & Story</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
            Smarter food tracking for a{" "}
            <span className="text-[#ff6347] dark:text-[#ffa500]">zero-waste</span> kitchen.
          </h1>

          <p className="text-base sm:text-lg text-gray-600 dark:text-zinc-400 leading-relaxed">
            Foodly was built with a simple premise: nobody likes throwing away forgotten groceries.
            We empower households to stay organized, save money, and cut kitchen waste effortlessly.
          </p>
        </div>

        {/* Story & Vision Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Visual Card */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-lg border border-orange-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80"
                alt="Fresh organic groceries"
                className="w-full h-80 sm:h-96 object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Floating Stat Pill */}
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-orange-200/50 dark:border-zinc-800 shadow-md flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-zinc-800 text-[#ff6347] dark:text-[#ffa500] flex items-center justify-center shrink-0">
                  <TrendingDown className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 font-medium">Household Impact</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    Up to 30% reduction in grocery waste
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Story Content */}
          <div className="lg:col-span-6 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              Why We Built Foodly
            </h2>

            <p className="text-sm sm:text-base text-gray-600 dark:text-zinc-300 leading-relaxed">
              Every year, over one-third of all food produced around the world is thrown away — with
              the vast majority happening right at home. Groceries get pushed to the back of the fridge,
              expiration dates pass unnoticed, and hard-earned money is wasted.
            </p>

            <p className="text-sm sm:text-base text-gray-600 dark:text-zinc-300 leading-relaxed">
              Foodly transforms kitchen management from a guessing game into a calm, organized routine.
              By tracking purchases and dates proactively, you know what to cook next before anything spoils.
            </p>

            {/* Checklist */}
            <div className="space-y-3 pt-2">
              {keyPoints.map((point, index) => (
                <div key={index} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#ff6347] dark:text-[#ffa500] shrink-0 mt-0.5" />
                  <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">
                    {point}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pillars / Values Grid */}
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              What We Stand For
            </h2>
            <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-zinc-400">
              Designed with precision to make sustainable kitchen habits natural and effortless.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pillars.map((pillar, idx) => {
              const IconComponent = pillar.icon;
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-zinc-900 rounded-2xl border border-orange-200/60 dark:border-zinc-800 p-6 sm:p-8 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col"
                >
                  <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-zinc-800 text-[#ff6347] dark:text-[#ffa500] flex items-center justify-center mb-5">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Impact Numbers */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-orange-200/60 dark:border-zinc-800 p-8 sm:p-10 shadow-xs">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 dark:divide-zinc-800">
            {stats.map((stat, i) => (
              <div
                key={i}
                className={`text-center ${i !== 0 ? "pt-6 sm:pt-0 sm:pl-6" : ""}`}
              >
                <div className="text-3xl sm:text-4xl font-extrabold text-[#ff6347] dark:text-[#ffa500] mb-1">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 font-medium leading-snug">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center space-y-6 pt-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            Ready to organize your kitchen?
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-zinc-400 max-w-lg mx-auto">
            Take the first step toward a zero-waste household. Track your ingredients, stay ahead of
            expiry dates, and save on groceries today.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Link
              to="/fridge"
              className="px-6 py-3 rounded-xl bg-[#ff6347] hover:bg-[#e5533d] dark:bg-[#ffa500] dark:hover:bg-[#cc8400] text-white dark:text-black font-semibold text-sm sm:text-base shadow-sm transition-all flex items-center gap-2 active:scale-95"
            >
              <Refrigerator className="w-4 h-4" />
              <span>Explore Fridge</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/dashboard/add-food"
              className="px-6 py-3 rounded-xl border border-[#ff6347] text-[#ff6347] hover:bg-[#ff6347] hover:text-white dark:border-[#ffa500] dark:text-[#ffa500] dark:hover:bg-[#ffa500] dark:hover:text-black font-semibold text-sm sm:text-base transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Food Item</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
