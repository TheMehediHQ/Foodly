import {
  BellRing,
  CalendarClock,
  ClipboardCheck,
  ShieldCheck,
  UserCheck,
  Workflow,
} from "lucide-react";

const features = [
  {
    title: "Expiry reminders",
    description: "Get alerts as items approach their expiry dates.",
    icon: BellRing,
  },
  {
    title: "Smart sorting",
    description: "Sort by newest, expiry date, and status in seconds.",
    icon: CalendarClock,
  },
  {
    title: "Full CRUD",
    description: "Create, read, update, and delete items with ease.",
    icon: ClipboardCheck,
  },
  {
    title: "Secure access",
    description: "Authentication keeps data scoped to each user.",
    icon: ShieldCheck,
  },
  {
    title: "User-friendly",
    description: "Simple flows for adding and managing food fast.",
    icon: UserCheck,
  },
  {
    title: "Clean workflow",
    description: "Reduce clutter with a focused, lightweight UI.",
    icon: Workflow,
  },
];

const FeaturesSection = () => {
  return (
    <section className="w-full transition-colors duration-300">
      <div className="text-center mb-10 sm:mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#ff6347] dark:text-[#ffa500]">
          Key Features
        </h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-[#d1d5db] mt-3 max-w-2xl mx-auto font-normal">
          Everything you need to track food items, avoid waste, and stay on top
          of expiry dates.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 dark:border-zinc-700/60"
          >
            <feature.icon className="text-4xl text-[#ff6347] dark:text-[#ffa500]" />
            <h3 className="text-lg sm:text-xl font-bold text-[#111827] dark:text-[#d1d5db] mt-4">
              {feature.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;
