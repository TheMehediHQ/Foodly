import React, { useState } from "react";
import { Mail, MapPin, Clock, CheckCircle2, Sparkles } from "lucide-react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Please enter your name";
    if (!formData.email.trim()) {
      newErrors.email = "Please enter your email";
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email.trim())
    ) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.message.trim()) newErrors.message = "Please write a message";
    return newErrors;
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: null }));
    setSubmitSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    setSubmitSuccess(null);

    try {
      await new Promise((res) => setTimeout(res, 1000));
      setSubmitSuccess("Thank you! Your message has been sent successfully.");
      setFormData({ name: "", email: "", message: "" });
    } catch {
      setSubmitSuccess("Failed to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fffaf5] dark:bg-[#1f1f1f] text-gray-800 dark:text-zinc-100 transition-colors duration-300 pt-24 sm:pt-28 pb-16 sm:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Left: Contact Info */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-100/80 dark:bg-zinc-800 text-[#ff6347] dark:text-[#ffa500] border border-orange-200/60 dark:border-zinc-700 shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Contact & Support</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Get in touch
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-zinc-400 leading-relaxed">
                Have questions about Foodly or feedback on managing your kitchen? Drop us a line.
              </p>
            </div>

            <div className="space-y-6 text-sm">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-zinc-800 text-[#ff6347] dark:text-[#ffa500] flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Email</p>
                  <a
                    href="mailto:support@foodly.app"
                    className="text-gray-600 dark:text-zinc-400 hover:text-[#ff6347] dark:hover:text-[#ffa500] transition-colors"
                  >
                    support@foodly.app
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-zinc-800 text-[#ff6347] dark:text-[#ffa500] flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Location</p>
                  <p className="text-gray-600 dark:text-zinc-400">Dhaka, Bangladesh</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-zinc-800 text-[#ff6347] dark:text-[#ffa500] flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Response Time</p>
                  <p className="text-gray-600 dark:text-zinc-400">Usually within 24 hours</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Clean Contact Form */}
          <div className="lg:col-span-7 bg-white dark:bg-zinc-900 rounded-3xl border border-orange-200/60 dark:border-zinc-800 p-6 sm:p-8 lg:p-10 shadow-xs">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              Send a Message
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mb-6">
              Fill out the form below and we'll get back to you shortly.
            </p>

            {submitSuccess && (
              <div
                className={`mb-6 p-3.5 rounded-xl flex items-center gap-2.5 text-sm font-medium ${
                  submitSuccess.includes("Thank you")
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                    : "bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20"
                }`}
              >
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{submitSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1.5"
                >
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  disabled={submitting}
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-[#fffaf5] dark:bg-zinc-800/80 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 text-sm focus:outline-none transition-all ${
                    errors.name
                      ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
                      : "border-orange-200/80 dark:border-zinc-700 focus:border-[#ff6347] dark:focus:border-[#ffa500] focus:ring-2 focus:ring-[#ff6347]/20"
                  }`}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-600 font-medium">{errors.name}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1.5"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  disabled={submitting}
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-[#fffaf5] dark:bg-zinc-800/80 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 text-sm focus:outline-none transition-all ${
                    errors.email
                      ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
                      : "border-orange-200/80 dark:border-zinc-700 focus:border-[#ff6347] dark:focus:border-[#ffa500] focus:ring-2 focus:ring-[#ff6347]/20"
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600 font-medium">{errors.email}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1.5"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="4"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Write your message here..."
                  disabled={submitting}
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-[#fffaf5] dark:bg-zinc-800/80 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 text-sm focus:outline-none transition-all resize-none ${
                    errors.message
                      ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
                      : "border-orange-200/80 dark:border-zinc-700 focus:border-[#ff6347] dark:focus:border-[#ffa500] focus:ring-2 focus:ring-[#ff6347]/20"
                  }`}
                />
                {errors.message && (
                  <p className="mt-1 text-xs text-red-600 font-medium">{errors.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-[#ff6347] hover:bg-[#e5533d] dark:bg-[#ffa500] dark:hover:bg-[#cc8400] text-white dark:text-black font-semibold text-sm transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {submitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
