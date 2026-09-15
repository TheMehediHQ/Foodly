import { useState } from "react";
import { useAuth } from "../context/Provider/AuthProvider";
import { useNavigate } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import axiosSecure from "../api/axios";
import {
  ImageIcon,
  Type,
  Tag,
  Hash,
  CalendarDays,
  AlignLeft,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  Utensils,
  Info,
} from "lucide-react";

// ── constants ─────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: "Dairy",      emoji: "🥛", color: "bg-sky-100 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-900" },
  { value: "Meat",       emoji: "🥩", color: "bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900" },
  { value: "Vegetables", emoji: "🥦", color: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900" },
  { value: "Fruits",     emoji: "🍎", color: "bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900" },
  { value: "Snacks",     emoji: "🍿", color: "bg-yellow-100 dark:bg-yellow-950/40 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900" },
  { value: "Beverages",  emoji: "🧃", color: "bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900" },
  { value: "Other",      emoji: "📦", color: "bg-gray-100 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700" },
];

const today = new Date().toISOString().split("T")[0];

// ── field wrapper ─────────────────────────────────────────────────────────────

const Field = ({ label, required, icon: Icon, error, hint, children }) => (
  <div className="space-y-1.5">
    <label className="flex items-center gap-1.5 text-sm font-medium text-[#374151] dark:text-[#d1d5db]">
      {Icon && <Icon size={14} className="text-[#9ca3af] dark:text-[#6b7280]" />}
      {label}
      {required && <span className="text-[#ff6347] dark:text-[#ffa500]">*</span>}
    </label>
    {children}
    <AnimatePresence>
      {error && (
        <Motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1"
        >
          <Info size={11} /> {error}
        </Motion.p>
      )}
    </AnimatePresence>
    {hint && !error && (
      <p className="text-xs text-[#9ca3af] dark:text-[#6b7280]">{hint}</p>
    )}
  </div>
);

const inputCls =
  "w-full px-3.5 py-2.5 rounded-xl border text-sm text-[#111827] dark:text-[#e5e7eb] bg-white dark:bg-[#1c1c1c] placeholder-[#9ca3af] dark:placeholder-[#6b7280] focus:outline-none transition-all duration-200";

const normalBorder =
  "border-[#f0e8e2] dark:border-[#2a2a2a] focus:border-[#ff6347] dark:focus:border-[#ffa500] focus:ring-2 focus:ring-[#ff6347]/20 dark:focus:ring-[#ffa500]/20";

const errorBorder =
  "border-red-400 dark:border-red-600 focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900";

// ── image preview ─────────────────────────────────────────────────────────────

const ImagePreview = ({ url }) => {
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState(false);

  if (!url) return null;
  return (
    <Motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mt-2 relative w-full h-36 rounded-xl overflow-hidden border border-[#f0e8e2] dark:border-[#2a2a2a] bg-[#fdf8f5] dark:bg-[#1a1a1a]"
    >
      {!ok && !err && (
        <div className="absolute inset-0 flex items-center justify-center text-[#d1d5db] dark:text-[#4b5563]">
          <Loader2 size={20} className="animate-spin" />
        </div>
      )}
      {err && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-[#9ca3af] gap-1.5">
          <ImageIcon size={24} />
          <p className="text-xs">Invalid image URL</p>
        </div>
      )}
      <img
        src={url}
        alt="preview"
        onLoad={() => { setOk(true); setErr(false); }}
        onError={() => { setErr(true); setOk(false); }}
        className={`w-full h-full object-cover transition-opacity duration-300 ${ok ? "opacity-100" : "opacity-0"}`}
      />
    </Motion.div>
  );
};

// ── main component ────────────────────────────────────────────────────────────

const AddFoodPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    image: "",
    title: "",
    category: "Dairy",
    quantity: "",
    expiryDate: "",
    description: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  // ── validation ──────────────────────────────────────────────────────────────

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Food title is required.";
    if (!form.quantity || Number(form.quantity) < 1) e.quantity = "Enter a valid quantity (min 1).";
    if (!form.expiryDate) e.expiryDate = "Expiry date is required.";
    else if (form.expiryDate < today) e.expiryDate = "Expiry date cannot be in the past.";
    return e;
  };

  // ── submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);

    const payload = {
      ...form,
      quantity: Number(form.quantity),
      userEmail: user.email,
      addedDate: new Date().toISOString(),
    };

    try {
      const res = await axiosSecure.post("/foods", payload);
      if (res.data.ok) {
        setSuccess(true);
        setTimeout(() => navigate("/dashboard/my-foods"), 1800);
      }
    } catch (err) {
      console.error(err);
      setErrors({ submit: "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  // ── success screen ──────────────────────────────────────────────────────────

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] px-4">
        <Motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-4"
        >
          <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center mx-auto">
            <CheckCircle2 size={40} className="text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-[#111827] dark:text-[#e5e7eb]">Food Added!</h2>
          <p className="text-sm text-[#6b7280] dark:text-[#9ca3af]">
            Redirecting to My Foods…
          </p>
          <div className="w-8 h-1 rounded-full bg-[#ff6347] dark:bg-[#ffa500] mx-auto animate-pulse" />
        </Motion.div>
      </div>
    );
  }

  // ── form ────────────────────────────────────────────────────────────────────

  return (
    <div className="px-4 py-6 lg:px-8 lg:py-8 max-w-6xl mx-auto">

      {/* Page header */}
      <Motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-[#6b7280] dark:text-[#9ca3af] hover:text-[#ff6347] dark:hover:text-[#ffa500] transition mb-4"
        >
          <ArrowLeft size={15} /> Back
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#ff6347]/10 dark:bg-[#ffa500]/10 flex items-center justify-center text-[#ff6347] dark:text-[#ffa500]">
            <Utensils size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#111827] dark:text-[#e5e7eb]">Add New Food</h1>
            <p className="text-sm text-[#6b7280] dark:text-[#9ca3af] mt-0.5">
              Track a new item in your food inventory
            </p>
          </div>
        </div>
      </Motion.div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left column: main fields ── */}
          <Motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="lg:col-span-2 space-y-5 bg-white dark:bg-[#1c1c1c] rounded-2xl border border-[#f0e8e2] dark:border-[#2a2a2a] p-6 shadow-sm"
          >
            <h2 className="text-sm font-semibold text-[#374151] dark:text-[#d1d5db] border-b border-[#f0e8e2] dark:border-[#2a2a2a] pb-3">
              Food Details
            </h2>

            {/* Title */}
            <Field label="Food Title" required icon={Type} error={errors.title}>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={set("title")}
                placeholder="e.g. Whole Milk, Chicken Breast…"
                className={`${inputCls} ${errors.title ? errorBorder : normalBorder}`}
              />
            </Field>

            {/* Category — visual pill selector */}
            <Field label="Category" icon={Tag}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {CATEGORIES.map(({ value, emoji, color }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, category: value }))}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all duration-200 ${
                      form.category === value
                        ? color + " ring-2 ring-offset-1 ring-current dark:ring-offset-[#1c1c1c]"
                        : "border-[#f0e8e2] dark:border-[#2a2a2a] text-[#6b7280] dark:text-[#9ca3af] hover:border-[#ff6347]/30 dark:hover:border-[#ffa500]/30"
                    }`}
                  >
                    <span>{emoji}</span>
                    <span className="truncate">{value}</span>
                  </button>
                ))}
              </div>
              {/* Hidden select for form submit */}
              <input type="hidden" name="category" value={form.category} />
            </Field>

            {/* Qty + Expiry — 2 col */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Quantity" required icon={Hash} error={errors.quantity} hint="Number of units or grams">
                <input
                  type="number"
                  name="quantity"
                  min="1"
                  value={form.quantity}
                  onChange={set("quantity")}
                  placeholder="e.g. 2"
                  className={`${inputCls} ${errors.quantity ? errorBorder : normalBorder}`}
                />
              </Field>

              <Field label="Expiry Date" required icon={CalendarDays} error={errors.expiryDate}>
                <input
                  type="date"
                  name="expiryDate"
                  min={today}
                  value={form.expiryDate}
                  onChange={set("expiryDate")}
                  className={`${inputCls} ${errors.expiryDate ? errorBorder : normalBorder}`}
                />
              </Field>
            </div>

            {/* Description */}
            <Field label="Description" icon={AlignLeft} hint="Optional — storage tips, notes, etc.">
              <textarea
                name="description"
                value={form.description}
                onChange={set("description")}
                rows={3}
                placeholder="Add any notes about this item…"
                className={`${inputCls} ${normalBorder} resize-none`}
              />
            </Field>
          </Motion.div>

          {/* ── Right column: image + submit ── */}
          <Motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="space-y-5"
          >
            {/* Image card */}
            <div className="bg-white dark:bg-[#1c1c1c] rounded-2xl border border-[#f0e8e2] dark:border-[#2a2a2a] p-5 shadow-sm space-y-4">
              <h2 className="text-sm font-semibold text-[#374151] dark:text-[#d1d5db] border-b border-[#f0e8e2] dark:border-[#2a2a2a] pb-3">
                Food Image
              </h2>

              <Field label="Image URL" icon={ImageIcon} hint="Paste a direct image link">
                <input
                  type="url"
                  name="image"
                  value={form.image}
                  onChange={set("image")}
                  placeholder="https://example.com/food.jpg"
                  className={`${inputCls} ${normalBorder}`}
                />
              </Field>

              {/* Preview */}
              {form.image ? (
                <ImagePreview url={form.image} />
              ) : (
                <div className="w-full h-36 rounded-xl border-2 border-dashed border-[#f0e8e2] dark:border-[#2a2a2a] flex flex-col items-center justify-center text-[#d1d5db] dark:text-[#4b5563] gap-2">
                  <ImageIcon size={28} />
                  <p className="text-xs">Preview appears here</p>
                </div>
              )}
            </div>

            {/* User info read-only */}
            <div className="bg-white dark:bg-[#1c1c1c] rounded-2xl border border-[#f0e8e2] dark:border-[#2a2a2a] p-5 shadow-sm space-y-3">
              <h2 className="text-sm font-semibold text-[#374151] dark:text-[#d1d5db] border-b border-[#f0e8e2] dark:border-[#2a2a2a] pb-3">
                Added By
              </h2>
              <div className="flex items-center gap-3">
                <img
                  src={user?.photoURL || "https://i.ibb.co/5r5C1fJ/user.png"}
                  alt="avatar"
                  className="w-9 h-9 rounded-full border-2 border-[#ff6347] dark:border-[#ffa500] object-cover shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#111827] dark:text-[#e5e7eb] truncate">
                    {user?.displayName || "You"}
                  </p>
                  <p className="text-xs text-[#9ca3af] dark:text-[#6b7280] truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
              <p className="text-xs text-[#9ca3af] dark:text-[#6b7280]">
                Added on:{" "}
                <span className="font-medium text-[#6b7280] dark:text-[#9ca3af]">
                  {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </p>
            </div>

            {/* Submit error */}
            <AnimatePresence>
              {errors.submit && (
                <Motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl px-4 py-3"
                >
                  <Info size={15} /> {errors.submit}
                </Motion.div>
              )}
            </AnimatePresence>

            {/* Submit button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[#ff6347] hover:bg-[#e5533d] dark:bg-[#ffa500] dark:hover:bg-[#cc8400] text-white dark:text-[#1a1a1a] font-semibold text-sm transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm hover:shadow-md active:scale-[0.98]"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Adding Food…
                </>
              ) : (
                <>
                  <Utensils size={16} />
                  Add Food Item
                </>
              )}
            </button>

            <p className="text-center text-xs text-[#9ca3af] dark:text-[#6b7280]">
              You'll be redirected to My Foods after saving.
            </p>
          </Motion.div>
        </div>
      </form>
    </div>
  );
};

export default AddFoodPage;
