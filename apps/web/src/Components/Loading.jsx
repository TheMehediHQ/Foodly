import React from "react";

const Loading = ({ className = "min-h-screen" }) => {
  return (
    <div
      className={`flex items-center justify-center w-full bg-[#fffaf5] dark:bg-[#1a1a1a] transition-colors duration-300 ${className}`}
      role="status"
      aria-label="Loading"
    >
      <div className="w-10 h-10 rounded-full border-4 border-gray-200 dark:border-zinc-700 border-t-[#ff6347] dark:border-t-[#ffa500] animate-spin" />
    </div>
  );
};

export default Loading;
