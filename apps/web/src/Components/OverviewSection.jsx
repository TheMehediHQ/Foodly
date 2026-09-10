import { CheckCircle } from "lucide-react";

const overviewPoints = [
  {
    title: "Track expiry dates",
    description:
      "Add food items with expiry dates and notes so you know exactly what is in your kitchen.",
  },
  {
    title: "Reduce food waste",
    description:
      "See upcoming expirations early and use items before they go bad.",
  },
  {
    title: "Stay organized",
    description:
      "Group items by category, status, and freshness to manage your inventory faster.",
  },
  {
    title: "Secure data handling",
    description:
      "Authentication and protected routes keep your food data private.",
  },
];

const OverviewSection = () => {
  return (
    <section className="w-full transition-colors duration-300">
      <div className="text-center mb-10 sm:mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#ff6347] dark:text-[#ffa500]">
          Food Expiry Tracker Overview
        </h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-[#d1d5db] mt-3 max-w-2xl mx-auto font-normal">
          A smart system to catalog, monitor, and manage food items with expiration dates.
          Keep your kitchen organized and eliminate food waste effortlessly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {overviewPoints.map((point, index) => (
          <div
            key={index}
            className="flex gap-4 bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-zinc-700/60"
          >
            <CheckCircle className="text-[#ff6347] dark:text-[#ffa500] flex-shrink-0 w-6 h-6 mt-0.5" />
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-[#111827] dark:text-[#d1d5db]">
                {point.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1.5 leading-relaxed">
                {point.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default OverviewSection;
