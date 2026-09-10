import React from "react";

const Loading = ({ className = "" }) => {
  return (
    <div
      className={`flex items-center justify-center w-full min-h-[250px] py-12 ${className}`}
      role="status"
      aria-label="Loading"
    >
      <div className="w-10 h-10 rounded-full border-3 border-gray-200 dark:border-zinc-700 border-t-[#ff6347] animate-spin" />
    </div>
  );
};

export default Loading;

