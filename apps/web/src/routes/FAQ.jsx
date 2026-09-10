import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Search,
  ChevronDown,
  X,
  MessageSquare,
  Refrigerator,
  ArrowRight,
} from "lucide-react";

const faqData = [
  {
    category: "Getting Started",
    question: "What is the purpose of the Foodly app?",
    answer:
      "Foodly helps households reduce food waste and save money. By tracking expiry dates in real time, managing quantities, and organizing items into categories, you'll always know what to eat before it goes bad.",
  },
  {
    category: "Food Tracking",
    question: "How do I add a new food item to my fridge?",
    answer:
      "Once logged in, click '+ Add Item' from your Fridge or navigate to the Add Food page. Enter the item's title, category (Dairy, Meat, Vegetables, Snacks), quantity, expiry date, and an optional image URL.",
  },
  {
    category: "Food Tracking",
    question: "How can I update or delete my food items?",
    answer:
      "You can manage any food item you added from the Food Details page. Click 'Update' to edit details or 'Delete' to permanently remove an item. Changes reflect immediately across your dashboard.",
  },
  {
    category: "Food Tracking",
    question: "How does Foodly detect expired food?",
    answer:
      "Foodly continuously calculates the difference between today's date and the item's expiration date. Items are visually badged with real-time freshness statuses such as 'Expires Today', 'X days left', or 'Expired' in red.",
  },
  {
    category: "Food Tracking",
    question: "Can I filter or sort my food inventory?",
    answer:
      "Yes! On the Fridge page, you can search foods by name, filter by categories (Dairy, Meat, Vegetables, Snacks), and sort by expiry date (Soonest First or Furthest First) or alphabetically (A–Z).",
  },
  {
    category: "Food Tracking",
    question: "Can I add personal notes to food items?",
    answer:
      "Yes. You can add personal notes to any food item you own from the Food Details page. This is ideal for storage tips, leftover recipes, or reminder details.",
  },
  {
    category: "Account & Security",
    question: "How does user authentication work?",
    answer:
      "Foodly uses secure Firebase Authentication. You can sign up with your email and password to safely store, track, and personalize your food inventory across devices.",
  },
  {
    category: "Account & Security",
    question: "Are my food items and personal notes private?",
    answer:
      "Food items and notes are associated with your unique account. While inventory can be explored, only you have permission to edit, update, or delete your own food items.",
  },
  {
    category: "Getting Started",
    question: "What happens if a food image URL fails to load?",
    answer:
      "If an image URL is broken or missing, Foodly automatically falls back to a clean, high-resolution placeholder image so your inventory always looks pristine.",
  },
  {
    category: "Getting Started",
    question: "Is Foodly optimized for mobile devices?",
    answer:
      "Yes! Foodly is fully responsive. It provides an intuitive, high-performance interface that feels like a native app on mobile, tablet, and desktop screens.",
  },
];

const categories = ["All", "Getting Started", "Food Tracking", "Account & Security"];

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const filteredFaqs = useMemo(() => {
    return faqData.filter((item) => {
      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;
      const matchesSearch =
        item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchTerm]);

  return (
    <div className="min-h-screen bg-[#fffaf5] dark:bg-[#1f1f1f] text-gray-800 dark:text-zinc-100 transition-colors duration-300 pt-24 sm:pt-28 pb-16 sm:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-100/80 dark:bg-zinc-800 text-[#ff6347] dark:text-[#ffa500] border border-orange-200/60 dark:border-zinc-700 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Help & FAQ</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
            Frequently Asked{" "}
            <span className="text-[#ff6347] dark:text-[#ffa500]">Questions</span>
          </h1>

          <p className="text-sm sm:text-base text-gray-600 dark:text-zinc-400 leading-relaxed">
            Have questions about how Foodly works? Find answers on food tracking, expiry alerts, and
            kitchen management below.
          </p>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-zinc-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search questions or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-3 rounded-xl border border-orange-200/80 dark:border-zinc-700 bg-[#fffaf5] dark:bg-zinc-800/80 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 text-sm focus:outline-none focus:border-[#ff6347] dark:focus:border-[#ffa500] focus:ring-2 focus:ring-[#ff6347]/20 transition-all shadow-xs"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Pills */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-wrap">
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? "bg-[#ff6347] dark:bg-[#ffa500] text-white dark:text-black shadow-xs"
                      : "bg-[#fffaf5] dark:bg-[#1f1f1f] text-gray-700 dark:text-zinc-300 hover:text-[#ff6347] dark:hover:text-[#ffa500] hover:bg-orange-100/50 dark:hover:bg-zinc-800 border border-orange-200/80 dark:border-zinc-700"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Accordion List */}
        <div className="max-w-3xl mx-auto space-y-3.5">
          {filteredFaqs.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-orange-200/60 dark:border-zinc-800 p-10 text-center space-y-3">
              <p className="text-base font-semibold text-gray-900 dark:text-white">
                No matching questions found
              </p>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400">
                Try searching for another keyword or reset your active filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All");
                }}
                className="mt-2 px-4 py-2 rounded-xl text-xs font-semibold border border-[#ff6347] text-[#ff6347] hover:bg-[#ff6347] hover:text-white dark:border-[#ffa500] dark:text-[#ffa500] dark:hover:bg-[#ffa500] dark:hover:text-black transition-colors cursor-pointer"
              >
                Reset Search
              </button>
            </div>
          ) : (
            filteredFaqs.map((item, index) => {
              const isOpen = activeIndex === index;
              return (
                <div
                  key={index}
                  className={`bg-white dark:bg-zinc-900 rounded-2xl border transition-all duration-200 shadow-xs ${
                    isOpen
                      ? "border-orange-300 dark:border-zinc-700 ring-1 ring-orange-200/60 dark:ring-zinc-800"
                      : "border-orange-200/60 dark:border-zinc-800 hover:border-orange-300/80 dark:hover:border-zinc-700"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleAccordion(index)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${index}`}
                    className="w-full flex items-center justify-between p-5 sm:p-6 text-left cursor-pointer gap-4"
                  >
                    <span className="text-sm sm:text-base font-bold text-gray-900 dark:text-zinc-100">
                      {item.question}
                    </span>
                    <span
                      className={`w-7 h-7 rounded-lg bg-orange-100/60 dark:bg-zinc-800 flex items-center justify-center text-[#ff6347] dark:text-[#ffa500] shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 bg-orange-200/70 dark:bg-zinc-700" : ""
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </span>
                  </button>

                  {isOpen && (
                    <div
                      id={`faq-answer-${index}`}
                      className="px-5 pb-5 sm:px-6 sm:pb-6 pt-0 text-xs sm:text-sm text-gray-600 dark:text-zinc-300 leading-relaxed border-t border-gray-100 dark:border-zinc-800/80 mt-1"
                    >
                      <p className="pt-3">{item.answer}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Bottom CTA Banner */}
        <div className="max-w-3xl mx-auto text-center p-8 sm:p-10 rounded-3xl bg-white dark:bg-zinc-900 border border-orange-200/60 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-zinc-800 text-[#ff6347] dark:text-[#ffa500] flex items-center justify-center mx-auto">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Still have questions?
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 max-w-md mx-auto">
            Can’t find the answer you’re looking for? Our team is always here to help you get the most
            out of Foodly.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/contact"
              className="px-6 py-3 rounded-xl bg-[#ff6347] hover:bg-[#e5533d] dark:bg-[#ffa500] dark:hover:bg-[#cc8400] text-white dark:text-black font-semibold text-sm shadow-sm transition-all flex items-center gap-2 active:scale-95"
            >
              <span>Contact Support</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/fridge"
              className="px-6 py-3 rounded-xl border border-[#ff6347] text-[#ff6347] hover:bg-[#ff6347] hover:text-white dark:border-[#ffa500] dark:text-[#ffa500] dark:hover:bg-[#ffa500] dark:hover:text-black font-semibold text-sm transition-colors flex items-center gap-2"
            >
              <Refrigerator className="w-4 h-4" />
              <span>Explore Fridge</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
