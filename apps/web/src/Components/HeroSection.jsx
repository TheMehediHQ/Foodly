import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Refrigerator, Plus } from "lucide-react";
import heroVideo from "../assets/hero.mp4";
import { AuthContext } from "../context/Provider/AuthProvider";

export default function HeroSection() {
  const { user } = useContext(AuthContext) || {};

  return (
    <section className="relative w-full h-[75vh] sm:h-[82vh] lg:h-[88vh] overflow-hidden">
      {/* Background Video */}
      <video
        src={heroVideo}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover object-center"
      />

      {/* Clean Cinematic Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/55 to-black/85" />

      {/* Content */}
      <div className="relative z-10 h-full max-w-4xl mx-auto px-6 flex flex-col items-center justify-center text-center">
        {/* Minimal Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-xs sm:text-sm font-medium mb-5">
          <span className="w-2 h-2 rounded-full bg-[#ff6347] animate-pulse" />
          <span>Smart Kitchen & Food Inventory</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.15] drop-shadow-xl">
          Fresh Food. Smart Tracking. <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-[#ff6347] via-[#ff7e42] to-[#ffa500] bg-clip-text text-transparent">
            Zero Waste.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-base sm:text-lg md:text-xl text-white/85 max-w-2xl leading-relaxed drop-shadow">
          Track expiration dates, organize your fridge effortlessly, and get timely alerts before food spoils.
        </p>

        {/* Clean CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          {user ? (
            <>
              <Link
                to="/fridge"
                className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#ff6347] to-[#ffa500] hover:from-[#e55338] hover:to-[#ff8c00] text-white font-semibold shadow-lg shadow-[#ff6347]/25 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 text-base"
              >
                <Refrigerator className="w-5 h-5" />
                <span>Open Fridge</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/dashboard/add-food"
                className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/25 text-white font-medium transition-all flex items-center gap-2 text-base"
              >
                <Plus className="w-5 h-5" />
                <span>Add Item</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/signup"
                className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#ff6347] to-[#ffa500] hover:from-[#e55338] hover:to-[#ff8c00] text-white font-semibold shadow-lg shadow-[#ff6347]/25 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 text-base"
              >
                <Sparkles className="w-4 h-4" />
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/fridge"
                className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/25 text-white font-medium transition-all flex items-center gap-2 text-base"
              >
                <Refrigerator className="w-5 h-5 text-white/80" />
                <span>Explore Fridge</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
}


