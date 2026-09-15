import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";

const applyTheme = (dark) => {
  document.documentElement.classList.toggle("dark", dark);
  localStorage.setItem("theme", dark ? "dark" : "light");
};

const Switch = () => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => { applyTheme(isDark); }, [isDark]);

  const toggle = () => setIsDark((d) => !d);

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className="
        w-8 h-8 rounded-lg flex items-center justify-center
        text-[#9ca3af] dark:text-[#6b7280]
        hover:text-[#ff6347] dark:hover:text-[#ffa500]
        hover:bg-[#ff6347]/10 dark:hover:bg-[#ffa500]/10
        transition-colors duration-200
      "
    >
      <AnimatePresence mode="wait" initial={false}>
        <Motion.span
          key={isDark ? "moon" : "sun"}
          initial={{ opacity: 0, rotate: -30, scale: 0.7 }}
          animate={{ opacity: 1, rotate: 0,   scale: 1   }}
          exit={{    opacity: 0, rotate:  30, scale: 0.7 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="flex"
        >
          {isDark
            ? <Moon size={16} strokeWidth={2} />
            : <Sun  size={16} strokeWidth={2} />
          }
        </Motion.span>
      </AnimatePresence>
    </button>
  );
};

export default Switch;
