import CountUp from "react-countup";
import { FaUtensils, FaClock, FaStickyNote } from "react-icons/fa";

const StatsSection = () => {
  const stats = [
    {
      icon: <FaUtensils className="text-4xl text-[#ff6347] dark:text-[#ffa500]" />,
      value: 500,
      suffix: "+",
      label: "Foods Tracked",
    },
    {
      icon: <FaClock className="text-4xl text-[#ff6347] dark:text-[#ffa500]" />,
      value: 10000,
      suffix: "+",
      label: "Expiry Alerts Sent",
    },
    {
      icon: <FaStickyNote className="text-4xl text-[#ff6347] dark:text-[#ffa500]" />,
      value: 3000,
      suffix: "+",
      label: "Notes Added",
    },
  ];

  return (
    <section className="w-full transition-colors duration-500">
      <div className="text-center mb-10 sm:mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#ff6347] dark:text-[#ffa500]">
          Our Impact in Numbers
        </h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-[#d1d5db] mt-3 max-w-2xl mx-auto font-normal">
          Real measurements of how Foodly helps households cut waste and preserve freshness.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-zinc-800 shadow-sm hover:shadow-md border border-gray-100 dark:border-zinc-700/60 rounded-2xl p-8 flex flex-col items-center justify-center hover:scale-[1.02] transition-all"
          >
            <div className="mb-4">{stat.icon}</div>
            <h3 className="text-3xl sm:text-4xl font-bold text-[#111827] dark:text-[#d1d5db]">
              <CountUp end={stat.value} duration={2.5} suffix={stat.suffix} />
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StatsSection;