import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../context/firebase/firebase.config";
import Countdown from "react-countdown";
import { motion as Motion, AnimatePresence } from "framer-motion";
import axiosSecure from "../api/axios";
import Loading from "../Components/Loading";
import {
  ArrowLeft,
  CalendarDays,
  Hash,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Utensils,
  Tag,
  User,
  MessageSquare,
  Send,
  Loader2,
  Pencil,
  Info,
  Sparkles,
} from "lucide-react";

// ── helpers ───────────────────────────────────────────────────────────────────

const isExpired = (d) => d && new Date(d) < new Date();
const isExpiringSoon = (d) => {
  if (!d) return false;
  const diff = new Date(d) - new Date();
  return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000;
};

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

const CATEGORY_EMOJI = {
  Dairy: "🥛",
  Meat: "🥩",
  Vegetables: "🥦",
  Fruits: "🍎",
  Snacks: "🍿",
  Beverages: "🧃",
  Other: "📦",
};

// ── Status badge ──────────────────────────────────────────────────────────────

const StatusBadge = ({ expiryDate }) => {
  if (isExpired(expiryDate)) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 border border-red-200 dark:border-red-900 shadow-sm backdrop-blur-md">
        <AlertTriangle size={13} /> Expired
      </span>
    );
  }
  if (isExpiringSoon(expiryDate)) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-900 shadow-sm backdrop-blur-md">
        <Clock size={13} /> Expiring Soon
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 shadow-sm backdrop-blur-md">
      <CheckCircle2 size={13} /> Fresh & Valid
    </span>
  );
};

// ── Countdown renderer ────────────────────────────────────────────────────────

const CountdownBox = ({ value, label }) => (
  <div className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white/80 dark:bg-[#1c1c1c]/80 border border-[#f0e8e2] dark:border-[#2a2a2a] shadow-xs">
    <span className="text-xl font-extrabold text-[#ff6347] dark:text-[#ffa500] leading-tight">
      {String(value).padStart(2, "0")}
    </span>
    <span className="text-[10px] uppercase font-semibold text-[#9ca3af] dark:text-[#6b7280] tracking-wider mt-0.5">
      {label}
    </span>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────

const FoodDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, authLoading] = useAuthState(auth);

  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchFoodDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        let data = null;
        try {
          const res = await axiosSecure.get(`/foods/${id}`);
          data = res.data?.data || res.data;
        } catch {
          // Fallback to external endpoint if local fails
          const res = await fetch(`https://food-garden-server-bd.vercel.app/foods/${id}`);
          if (!res.ok) throw new Error("Failed to fetch food details");
          data = await res.json();
        }

        if (isMounted && data) {
          setFood(data);
          setNotes(Array.isArray(data.notes) ? data.notes : []);
        }
      } catch (err) {
        if (isMounted) setError(err.message || "Failed to load food details");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchFoodDetails();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setSubmitting(true);

    try {
      const res = await axiosSecure.post(`/foods/notes/${id}`, {
        note: newNote.trim(),
        postedBy: user?.email || "Anonymous",
        postedAt: new Date().toISOString(),
      });

      if (res.data?.ok) {
        const savedNote = res.data.data;
        setNotes((prev) => [...prev, savedNote]);
        setNewNote("");
      } else {
        // Optimistic append if backend mock
        const fallbackNote = {
          _id: Date.now().toString(),
          note: newNote.trim(),
          postedBy: user?.email || "Anonymous",
          postedAt: new Date().toISOString(),
        };
        setNotes((prev) => [...prev, fallbackNote]);
        setNewNote("");
      }
    } catch {
      // Local fallback in case note route is not configured in all environments
      const fallbackNote = {
        _id: Date.now().toString(),
        note: newNote.trim(),
        postedBy: user?.email || "Anonymous",
        postedAt: new Date().toISOString(),
      };
      setNotes((prev) => [...prev, fallbackNote]);
      setNewNote("");
    } finally {
      setSubmitting(false);
    }
  };

  const isFoodCreator = useMemo(() => {
    if (!user?.email || !food?.userEmail) return false;
    return user.email.toLowerCase() === food.userEmail.toLowerCase();
  }, [user?.email, food?.userEmail]);

  if (loading || authLoading) {
    return <Loading />;
  }

  if (error || !food) {
    return (
      <div className="px-4 py-16 max-w-6xl mx-auto text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-950/40 text-red-500 mx-auto flex items-center justify-center">
          <AlertTriangle size={32} />
        </div>
        <h2 className="text-xl font-bold text-[#111827] dark:text-[#e5e7eb]">
          Food Item Not Found
        </h2>
        <p className="text-sm text-[#6b7280] dark:text-[#9ca3af] max-w-md mx-auto">
          {error || "The food item you are looking for might have been deleted or does not exist."}
        </p>
        <button
          onClick={() => navigate("/dashboard/all-foods")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#ff6347] hover:bg-[#e5533d] dark:bg-[#ffa500] dark:hover:bg-[#cc8400] text-white dark:text-[#1a1a1a] text-sm font-semibold transition"
        >
          <ArrowLeft size={16} /> Back to All Foods
        </button>
      </div>
    );
  }

  const categoryEmoji = CATEGORY_EMOJI[food.category] || "🍽️";

  return (
    <div className="px-4 py-6 lg:px-8 lg:py-8 space-y-6 max-w-6xl mx-auto">

      {/* ── Top Bar: Back & Actions ── */}
      <Motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#6b7280] dark:text-[#9ca3af] hover:text-[#ff6347] dark:hover:text-[#ffa500] transition group self-start"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Overview
        </button>

        {isFoodCreator && (
          <Link
            to={`/update-food/${food._id}`}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-[#f0e8e2] dark:border-[#2a2a2a] bg-white dark:bg-[#1c1c1c] text-xs font-semibold text-[#374151] dark:text-[#d1d5db] hover:border-[#ff6347]/40 dark:hover:border-[#ffa500]/40 hover:text-[#ff6347] dark:hover:text-[#ffa500] transition shadow-xs self-start sm:self-auto"
          >
            <Pencil size={13} /> Edit Item
          </Link>
        )}
      </Motion.div>

      {/* ── Hero Details Card: 2 Column Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Visual & Countdown (5 cols) */}
        <Motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-5 space-y-5"
        >
          {/* Food Image Container */}
          <div className="relative rounded-2xl overflow-hidden border border-[#f0e8e2] dark:border-[#2a2a2a] bg-white dark:bg-[#1c1c1c] shadow-sm aspect-4/3 flex items-center justify-center">
            {food.image && !imageError ? (
              <img
                src={food.image}
                alt={food.title || "Food Item"}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 text-[#9ca3af] dark:text-[#6b7280]">
                <span className="text-5xl">{categoryEmoji}</span>
                <span className="text-xs font-medium">No image available</span>
              </div>
            )}

            {/* Floating Top Status Badge */}
            <div className="absolute top-3 left-3">
              <StatusBadge expiryDate={food.expiryDate} />
            </div>

            {/* Floating Category Pill */}
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-white/90 dark:bg-[#1c1c1c]/90 text-[#111827] dark:text-[#e5e7eb] shadow-sm backdrop-blur-md border border-[#f0e8e2] dark:border-[#2a2a2a]">
                <span>{categoryEmoji}</span>
                <span>{food.category || "Uncategorized"}</span>
              </span>
            </div>
          </div>

          {/* Expiration Countdown Widget */}
          <div className="bg-white dark:bg-[#1c1c1c] rounded-2xl border border-[#f0e8e2] dark:border-[#2a2a2a] p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#9ca3af] dark:text-[#6b7280] flex items-center gap-1.5">
                <Clock size={14} className="text-[#ff6347] dark:text-[#ffa500]" />
                Shelf Life Countdown
              </h3>
              <span className="text-xs font-medium text-[#6b7280] dark:text-[#9ca3af]">
                Expires: {formatDate(food.expiryDate)}
              </span>
            </div>

            {new Date(food.expiryDate) > new Date() ? (
              <Countdown
                date={new Date(food.expiryDate)}
                renderer={({ days, hours, minutes, seconds, completed }) =>
                  completed ? (
                    <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-center">
                      <p className="text-sm font-bold text-red-600 dark:text-red-400">
                        Item has expired!
                      </p>
                      <p className="text-xs text-red-500/80 mt-0.5">
                        Please check condition before consumption.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-2 pt-1">
                      <CountdownBox value={days} label="Days" />
                      <CountdownBox value={hours} label="Hours" />
                      <CountdownBox value={minutes} label="Mins" />
                      <CountdownBox value={seconds} label="Secs" />
                    </div>
                  )
                }
              />
            ) : (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-center">
                <p className="text-sm font-bold text-red-600 dark:text-red-400">
                  Item has expired!
                </p>
                <p className="text-xs text-red-500/80 mt-0.5">
                  Expiry date has passed.
                </p>
              </div>
            )}
          </div>
        </Motion.div>

        {/* Right Column: Metadata & Notes (7 cols) */}
        <Motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="lg:col-span-7 space-y-6"
        >
          {/* Main Info Card */}
          <div className="bg-white dark:bg-[#1c1c1c] rounded-2xl border border-[#f0e8e2] dark:border-[#2a2a2a] p-6 shadow-sm space-y-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-[#111827] dark:text-[#e5e7eb] leading-tight">
                {food.title}
              </h1>
              {food.description ? (
                <p className="mt-3 text-sm text-[#4b5563] dark:text-[#9ca3af] leading-relaxed">
                  {food.description}
                </p>
              ) : (
                <p className="mt-2 text-xs italic text-[#9ca3af] dark:text-[#6b7280]">
                  No detailed description provided for this item.
                </p>
              )}
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              {/* Quantity */}
              <div className="p-3.5 rounded-xl bg-[#fdf8f5] dark:bg-[#151515] border border-[#f0e8e2] dark:border-[#252525]">
                <div className="flex items-center gap-1.5 text-xs text-[#9ca3af] dark:text-[#6b7280] mb-1">
                  <Hash size={13} />
                  <span>Quantity</span>
                </div>
                <p className="text-base font-bold text-[#111827] dark:text-[#e5e7eb]">
                  {food.quantity ?? "—"} <span className="text-xs font-normal text-[#9ca3af]">units</span>
                </p>
              </div>

              {/* Category */}
              <div className="p-3.5 rounded-xl bg-[#fdf8f5] dark:bg-[#151515] border border-[#f0e8e2] dark:border-[#252525]">
                <div className="flex items-center gap-1.5 text-xs text-[#9ca3af] dark:text-[#6b7280] mb-1">
                  <Tag size={13} />
                  <span>Category</span>
                </div>
                <p className="text-base font-bold text-[#111827] dark:text-[#e5e7eb] truncate">
                  {food.category || "—"}
                </p>
              </div>

              {/* Added Date */}
              <div className="p-3.5 rounded-xl bg-[#fdf8f5] dark:bg-[#151515] border border-[#f0e8e2] dark:border-[#252525] col-span-2 sm:col-span-1">
                <div className="flex items-center gap-1.5 text-xs text-[#9ca3af] dark:text-[#6b7280] mb-1">
                  <CalendarDays size={13} />
                  <span>Date Added</span>
                </div>
                <p className="text-base font-bold text-[#111827] dark:text-[#e5e7eb] truncate">
                  {formatDate(food.addedDate)}
                </p>
              </div>
            </div>

            {/* Creator Information */}
            <div className="pt-4 border-t border-[#f0e8e2] dark:border-[#252525] flex items-center justify-between text-xs text-[#6b7280] dark:text-[#9ca3af]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#ff6347]/10 dark:bg-[#ffa500]/10 flex items-center justify-center text-[#ff6347] dark:text-[#ffa500]">
                  <User size={13} />
                </div>
                <span>
                  Listed by: <strong className="text-[#111827] dark:text-[#e5e7eb]">{food.userEmail || "Anonymous"}</strong>
                </span>
              </div>
              {isFoodCreator && (
                <span className="px-2 py-0.5 rounded-full bg-[#ff6347]/10 dark:bg-[#ffa500]/10 text-[#ff6347] dark:text-[#ffa500] font-semibold text-[10px]">
                  Your Food
                </span>
              )}
            </div>
          </div>

          {/* ── Notes Section ── */}
          <div className="bg-white dark:bg-[#1c1c1c] rounded-2xl border border-[#f0e8e2] dark:border-[#2a2a2a] p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#111827] dark:text-[#e5e7eb] flex items-center gap-2">
                <MessageSquare size={18} className="text-[#ff6347] dark:text-[#ffa500]" />
                Notes & Reminders
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#f3f4f6] dark:bg-[#252525] text-[#6b7280] dark:text-[#9ca3af] font-semibold">
                  {notes.length}
                </span>
              </h3>
            </div>

            {/* Note List */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {notes.length === 0 ? (
                <div className="p-6 text-center border-2 border-dashed border-[#f0e8e2] dark:border-[#2a2a2a] rounded-xl text-xs text-[#9ca3af] dark:text-[#6b7280]">
                  No notes or reminders added yet.
                </div>
              ) : (
                notes.map((item, idx) => (
                  <div
                    key={item._id || item.postedAt || idx}
                    className="p-3.5 rounded-xl bg-[#fdf8f5] dark:bg-[#161616] border border-[#f0e8e2] dark:border-[#252525] space-y-1.5"
                  >
                    <p className="text-sm text-[#111827] dark:text-[#e5e7eb] leading-snug">
                      {item.note}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-[#9ca3af] dark:text-[#6b7280]">
                      <span>{item.postedBy}</span>
                      <span>{item.postedAt ? new Date(item.postedAt).toLocaleString() : ""}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add Note Form */}
            {isFoodCreator ? (
              <form onSubmit={handleAddNote} className="space-y-3 pt-3 border-t border-[#f0e8e2] dark:border-[#252525]">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#374151] dark:text-[#d1d5db] flex items-center gap-1">
                    <Sparkles size={12} className="text-[#ff6347] dark:text-[#ffa500]" />
                    Add a Reminder or Note
                  </label>
                  <textarea
                    rows={2}
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="e.g. Keep in sealed container, use for tomorrow's lunch..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#f0e8e2] dark:border-[#2a2a2a] bg-white dark:bg-[#202020] text-sm text-[#111827] dark:text-[#e5e7eb] placeholder-[#9ca3af] dark:placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#ff6347]/30 dark:focus:ring-[#ffa500]/30 focus:border-[#ff6347] dark:focus:border-[#ffa500] transition-all resize-none"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting || !newNote.trim()}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#ff6347] hover:bg-[#e5533d] dark:bg-[#ffa500] dark:hover:bg-[#cc8400] text-white dark:text-[#1a1a1a] text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        Saving…
                      </>
                    ) : (
                      <>
                        <Send size={13} />
                        Add Note
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[#fffaf5] dark:bg-[#161616] border border-[#f0e8e2] dark:border-[#2a2a2a] text-xs text-[#6b7280] dark:text-[#9ca3af]">
                <Info size={14} className="text-[#ff6347] dark:text-[#ffa500] shrink-0" />
                <span>Only the owner of this food item can add notes and reminders.</span>
              </div>
            )}
          </div>
        </Motion.div>

      </div>
    </div>
  );
};

export default FoodDetailsPage;
