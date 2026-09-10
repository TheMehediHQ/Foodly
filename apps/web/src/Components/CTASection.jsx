import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Plus } from "lucide-react";
import { AuthContext } from "../context/Provider/AuthProvider";

const CTASection = () => {
  const { user } = useContext(AuthContext) || {};

  return (
    <section className="w-full transition-colors duration-300">
      <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#ff6347] to-[#ffa500] p-8 sm:p-10 lg:p-12 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
            Ready to track expiry dates?
          </h2>
          <p className="mt-2 text-sm sm:text-base text-white/90 max-w-xl">
            Add your food items and start eliminating kitchen waste today.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {user ? (
            <>
              <Link
                to="/dashboard/add-food"
                className="px-6 py-3 rounded-xl bg-white text-[#ff6347] font-semibold hover:bg-[#fff1e9] transition-colors flex items-center gap-1.5 shadow-sm text-sm sm:text-base"
              >
                <Plus className="w-4 h-4" />
                <span>Add Food</span>
              </Link>
              <Link
                to="/fridge"
                className="px-6 py-3 rounded-xl border border-white/80 text-white font-medium hover:bg-white/10 transition-colors text-sm sm:text-base"
              >
                My Fridge
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/signup"
                className="px-6 py-3 rounded-xl bg-white text-[#ff6347] font-semibold hover:bg-[#fff1e9] transition-colors flex items-center gap-1.5 shadow-sm text-sm sm:text-base"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/fridge"
                className="px-6 py-3 rounded-xl border border-white/80 text-white font-medium hover:bg-white/10 transition-colors text-sm sm:text-base"
              >
                Explore Fridge
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default CTASection;


