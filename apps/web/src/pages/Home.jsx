import HeroSection from "../Components/HeroSection";

import OverviewSection from "../Components/OverviewSection";
import FeaturesSection from "../Components/FeaturesSection";
import ExtraSections from "../Components/ExtraSections";
import ExtraSection2 from "../Components/ExtraSection2";
import DynamicSections from "../Components/DynamicSections";
import StatsSection from "../Components/StatsSection";
import AlertsSection from "../Components/AlertsSection";
import CTASection from "../Components/CTASection";

const Home = () => {
  return (
    <main className="w-full min-h-screen overflow-hidden">
      <HeroSection />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 space-y-20 sm:space-y-24 lg:space-y-28">
        <DynamicSections />
        <OverviewSection />
        <FeaturesSection />
        <AlertsSection />
        <StatsSection />
        <ExtraSections />
        <ExtraSection2 />
        <CTASection />
      </div>
    </main>
  );
};

export default Home;
