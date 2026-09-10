
import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaGithub,
  FaTwitter,
} from "react-icons/fa";
import navLogo from "../assets/nav-logo.png";
import Swal from "sweetalert2";

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    Swal.fire({
      icon: "success",
      title: "Subscribed!",
      text: "Thank you for subscribing to Foodly kitchen tips.",
      timer: 2000,
      showConfirmButton: false,
      background: document.documentElement.classList.contains("dark")
        ? "#18181b"
        : "#ffffff",
      color: document.documentElement.classList.contains("dark")
        ? "#f4f4f5"
        : "#18181b",
    });
    setEmail("");
  };

  return (
    <footer className="relative bg-[#fffaf5] dark:bg-[#1f1f1f] text-gray-700 dark:text-[#d1d5db] border-t border-orange-200/60 dark:border-zinc-800 transition-colors duration-300">
      {/* Top subtle gradient accent line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff6347]/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-5 flex flex-col items-start">
            <Link to="/" className="flex items-center gap-3 mb-4 group">
              <img
                src={navLogo}
                alt="Foodly"
                className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </Link>

            <p className="text-sm leading-relaxed text-gray-600 dark:text-[#ccc] max-w-sm mb-6">
              Smart kitchen companion for real-time food inventory tracking, automated
              expiry date alerts, and zero-waste meal planning.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3">
              {[
                { icon: FaFacebookF, href: "https://facebook.com", label: "Facebook" },
                { icon: FaTwitter, href: "https://twitter.com", label: "Twitter" },
                { icon: FaInstagram, href: "https://instagram.com", label: "Instagram" },
                { icon: FaLinkedinIn, href: "https://linkedin.com", label: "LinkedIn" },
                { icon: FaGithub, href: "https://github.com", label: "GitHub" },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <a
                    key={idx}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.label}
                    className="w-9 h-9 rounded-xl flex items-center justify-center bg-white dark:bg-[#2c2c2c] text-gray-600 dark:text-zinc-300 border border-orange-200/60 dark:border-zinc-700/60 hover:bg-[#ff6347] hover:text-white dark:hover:bg-[#ff6347] dark:hover:text-white transition-all duration-200 transform hover:-translate-y-0.5 shadow-sm"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="lg:col-span-2 sm:col-span-1">
            <h3 className="text-sm font-bold tracking-wider uppercase text-gray-900 dark:text-[#f0f0f0] mb-4">
              Navigation
            </h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { name: "Home", path: "/" },
                { name: "My Fridge", path: "/fridge" },
                { name: "About Foodly", path: "/about" },
                { name: "FAQ", path: "/faq" },
                { name: "Contact", path: "/contact" },
              ].map((link, idx) => (
                <li key={idx}>
                  <Link
                    to={link.path}
                    className="hover:text-[#ff6347] dark:hover:text-[#ffa500] transition-colors inline-flex items-center gap-1 group"
                  >
                    <span className="transition-transform group-hover:translate-x-0.5">
                      {link.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Explore / Product */}
          <div className="lg:col-span-2 sm:col-span-1">
            <h3 className="text-sm font-bold tracking-wider uppercase text-gray-900 dark:text-[#f0f0f0] mb-4">
              Explore
            </h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { name: "Fresh Inventory", path: "/fridge" },
                { name: "Expiry Reminders", path: "/fridge" },
                { name: "Create Account", path: "/signup" },
                { name: "Member Login", path: "/login" },
              ].map((link, idx) => (
                <li key={idx}>
                  <Link
                    to={link.path}
                    className="hover:text-[#ff6347] dark:hover:text-[#ffa500] transition-colors inline-flex items-center gap-1 group"
                  >
                    <span className="transition-transform group-hover:translate-x-0.5">
                      {link.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Newsletter / Zero-waste Tips */}
          <div className="lg:col-span-3">
            <h3 className="text-sm font-bold tracking-wider uppercase text-gray-900 dark:text-[#f0f0f0] mb-4 flex items-center gap-1.5">
              <span>Stay Updated</span>
              <Sparkles className="w-3.5 h-3.5 text-[#ffa500]" />
            </h3>
            <p className="text-sm text-gray-600 dark:text-[#ccc] mb-4 leading-relaxed">
              Get seasonal food preservation tips and smart kitchen updates directly to your inbox.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="flex items-center rounded-xl bg-white dark:bg-[#2c2c2c] border border-orange-200/80 dark:border-zinc-700 p-1 focus-within:border-[#ff6347] transition-all shadow-sm">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email..."
                  className="w-full bg-transparent px-3 py-1.5 text-sm text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-400 focus:outline-none"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="p-2 rounded-lg bg-[#ff6347] hover:bg-[#e5533d] dark:bg-[#ffa500] dark:hover:bg-[#cc8400] text-white dark:text-black transition-transform active:scale-95 cursor-pointer shrink-0 shadow-sm"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-zinc-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                No spam. Unsubscribe anytime.
              </p>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-orange-200/60 dark:border-zinc-800 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-gray-600 dark:text-zinc-400">
          <div>
            &copy; {new Date().getFullYear()}{" "}
            <span className="font-semibold text-gray-800 dark:text-zinc-200">
              Foodly
            </span>
            . All rights reserved.
          </div>

          <div className="flex items-center gap-1.5">
            <span>Developed by</span>
            <a
              href="https://www.mehedi-hasan.me"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#ff6347] dark:text-[#ffa500] hover:underline"
            >
              Mehedi Hasan
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
