import { useEffect, useState, useMemo } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../context/firebase/firebase.config";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import axiosSecure from "../api/axios";
import {
  Search,
  LayoutGrid,
  List,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  Utensils,
  ArrowUpDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Package,
  ChevronRight,
  Info,
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
    ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "—";

const CATEGORIES = ["Dairy", "Meat", "Vegetables", "Fruits", "Snacks", "Beverages", "Other"];
const CATEGORY_EMOJI = {
  Dairy: "🥛", Meat: "🥩", Vegetables: "🥦", Fruits: "🍎",
  Snacks: "🍿", Beverages: "🧃", Other: "📦",
};
const SORT_OPTIONS = [
  { value: "newest", label: "Expiry: Newest first" },
  { value: "oldest", label: "Expiry: Oldest first" },
  { value: "title_asc", label: "Title: A → Z" },
  { value: "title_desc", label: "Title: Z → A" },
];

// ── Status badge ──────────────────────────────────────────────────────────────

const StatusBadge = ({ expiryDate }) => {
  if (isExpired(expiryDate))
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400 whitespace-nowrap">
        <AlertTriangle size={9} /> Expired
      </span>
    );
  if (isExpiringSoon(expiryDate))
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 whitespace-nowrap">
        <Clock size={9} /> Expiring soon
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 whitespace-nowrap">
      <CheckCircle2 size={9} /> Fresh
    </span>
  );
};

// ── Skeleton ──────────────────────────────────────────────────────────────────

const SkeletonCard = () => (
  <div className="bg-white dark:bg-[#1c1c1c] rounded-2xl border border-[#f0e8e2] dark:border-[#2a2a2a] p-5 animate-pulse">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-xl bg-[#f3f4f6] dark:bg-[#2a2a2a]" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-[#f3f4f6] dark:bg-[#2a2a2a] rounded w-2/3" />
        <div className="h-3 bg-[#f3f4f6] dark:bg-[#2a2a2a] rounded w-1/3" />
      </div>
    </div>
    <div className="space-y-2 mb-4">
      <div className="h-3 bg-[#f3f4f6] dark:bg-[#2a2a2a] rounded w-1/2" />
      <div className="h-3 bg-[#f3f4f6] dark:bg-[#2a2a2a] rounded w-2/5" />
    </div>
    <div className="flex gap-2">
      <div className="flex-1 h-8 bg-[#f3f4f6] dark:bg-[#2a2a2a] rounded-xl" />
      <div className="flex-1 h-8 bg-[#f3f4f6] dark:bg-[#2a2a2a] rounded-xl" />
    </div>
  </div>
);

// ── input style ───────────────────────────────────────────────────────────────

const inputCls =
  "w-full px-3.5 py-2.5 rounded-xl border text-sm text-[#111827] dark:text-[#e5e7eb] bg-white dark:bg-[#252525] placeholder-[#9ca3af] dark:placeholder-[#6b7280] border-[#f0e8e2] dark:border-[#333] focus:outline-none focus:ring-2 focus:ring-[#ff6347]/30 dark:focus:ring-[#ffa500]/30 focus:border-[#ff6347] dark:focus:border-[#ffa500] transition-all";

// ── Edit Modal ────────────────────────────────────────────────────────────────

const EditModal = ({ item, onClose, onSave }) => {
  const [form, setForm] = useState({
    title: item.title || "",
    category: item.category || "Dairy",
    quantity: item.quantity ?? "",
    expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().split("T")[0] : "",
    description: item.description || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError("Title is required."); return; }
    setSaving(true);
    setError("");
    try {
      const res = await axiosSecure.put(`/foods/${item._id}`, {
        ...form,
        quantity: Number(form.quantity),
      });
      if (res.data.ok) onSave(res.data.data);
    } catch {
      setError("Update failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <Motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="bg-white dark:bg-[#1c1c1c] rounded-2xl border border-[#f0e8e2] dark:border-[#2a2a2a] shadow-2xl w-full max-w-lg"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0e8e2] dark:border-[#2a2a2a]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#ff6347]/10 dark:bg-[#ffa500]/10 flex items-center justify-center text-[#ff6347] dark:text-[#ffa500]">
              <Pencil size={15} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#111827] dark:text-[#e5e7eb]">Edit Food Item</h3>
              <p className="text-xs text-[#9ca3af] dark:text-[#6b7280] truncate max-w-[200px]">{item.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#9ca3af] hover:text-[#ff6347] dark:hover:text-[#ffa500] hover:bg-[#ff6347]/10 dark:hover:bg-[#ffa500]/10 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-[#9ca3af] dark:text-[#6b7280]">Title *</label>
            <input value={form.title} onChange={set("title")} placeholder="Food name" className={inputCls} />
          </div>

          {/* Category + Qty row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-[#9ca3af] dark:text-[#6b7280]">Category</label>
              <select value={form.category} onChange={set("category")} className={inputCls}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{CATEGORY_EMOJI[c]} {c}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-[#9ca3af] dark:text-[#6b7280]">Quantity</label>
              <input type="number" min="1" value={form.quantity} onChange={set("quantity")} placeholder="e.g. 2" className={inputCls} />
            </div>
          </div>

          {/* Expiry date */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-[#9ca3af] dark:text-[#6b7280]">Expiry Date</label>
            <input type="date" value={form.expiryDate} onChange={set("expiryDate")} className={inputCls} />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-[#9ca3af] dark:text-[#6b7280]">Notes</label>
            <textarea rows={2} value={form.description} onChange={set("description")} placeholder="Optional notes…" className={`${inputCls} resize-none`} />
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <Motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 text-xs text-red-500 dark:text-red-400"
              >
                <Info size={12} /> {error}
              </Motion.p>
            )}
          </AnimatePresence>

          {/* Footer */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[#f0e8e2] dark:border-[#333] text-sm font-semibold text-[#6b7280] dark:text-[#9ca3af] hover:border-[#ff6347]/40 dark:hover:border-[#ffa500]/40 hover:text-[#ff6347] dark:hover:text-[#ffa500] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#ff6347] hover:bg-[#e5533d] dark:bg-[#ffa500] dark:hover:bg-[#cc8400] text-white dark:text-[#1a1a1a] text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : "Save Changes"}
            </button>
          </div>
        </form>
      </Motion.div>
    </Motion.div>
  );
};

// ── Delete Modal ──────────────────────────────────────────────────────────────

const DeleteModal = ({ item, onClose, onConfirm, deleting }) => (
  <Motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm"
    onClick={(e) => e.target === e.currentTarget && onClose()}
  >
    <Motion.div
      initial={{ scale: 0.92, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.92, opacity: 0, y: 20 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="bg-white dark:bg-[#1c1c1c] rounded-2xl border border-[#f0e8e2] dark:border-[#2a2a2a] shadow-2xl w-full max-w-sm p-6"
    >
      {/* Icon */}
      <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/40 flex items-center justify-center text-red-500 mx-auto mb-4">
        <Trash2 size={22} />
      </div>
      <h3 className="text-base font-semibold text-[#111827] dark:text-[#e5e7eb] text-center mb-1">Delete Food Item</h3>
      <p className="text-sm text-center text-[#6b7280] dark:text-[#9ca3af] mb-1">
        Are you sure you want to delete
      </p>
      <p className="text-sm font-semibold text-center text-[#111827] dark:text-[#e5e7eb] mb-6">
        "{item?.title}"?
      </p>
      <p className="text-xs text-center text-[#9ca3af] dark:text-[#6b7280] mb-5">
        This action cannot be undone.
      </p>
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 py-2.5 rounded-xl border border-[#f0e8e2] dark:border-[#333] text-sm font-semibold text-[#6b7280] dark:text-[#9ca3af] hover:border-[#ff6347]/40 dark:hover:border-[#ffa500]/40 transition"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={deleting}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition disabled:opacity-60"
        >
          {deleting ? <><Loader2 size={14} className="animate-spin" /> Deleting…</> : <>
            <Trash2 size={14} /> Delete
          </>}
        </button>
      </div>
    </Motion.div>
  </Motion.div>
);

// ── Grid Card ─────────────────────────────────────────────────────────────────

const GridCard = ({ item, onEdit, onDelete, index }) => (
  <Motion.div
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95 }}
    transition={{ duration: 0.3, delay: index * 0.04 }}
    whileHover={{ y: -3, transition: { duration: 0.18 } }}
    className="bg-white dark:bg-[#1c1c1c] rounded-2xl border border-[#f0e8e2] dark:border-[#2a2a2a] p-5 flex flex-col gap-3 shadow-sm hover:shadow-md hover:border-[#ff6347]/30 dark:hover:border-[#ffa500]/30 transition-all"
  >
    {/* Top row */}
    <div className="flex items-start justify-between gap-2">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-[#ff6347]/10 dark:bg-[#ffa500]/10 flex items-center justify-center text-lg shrink-0">
          {CATEGORY_EMOJI[item.category] || "📦"}
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-sm text-[#111827] dark:text-[#e5e7eb] line-clamp-1">{item.title}</h3>
          <span className="text-[10px] font-medium text-[#ff6347] dark:text-[#ffa500]">{item.category}</span>
        </div>
      </div>
      <StatusBadge expiryDate={item.expiryDate} />
    </div>

    {/* Meta */}
    <div className="grid grid-cols-2 gap-2 text-xs">
      <div className="bg-[#fdf8f5] dark:bg-[#1a1a1a] rounded-lg px-2.5 py-2">
        <p className="text-[#9ca3af] dark:text-[#6b7280] mb-0.5">Quantity</p>
        <p className="font-semibold text-[#374151] dark:text-[#d1d5db]">{item.quantity ?? "—"}</p>
      </div>
      <div className="bg-[#fdf8f5] dark:bg-[#1a1a1a] rounded-lg px-2.5 py-2">
        <p className="text-[#9ca3af] dark:text-[#6b7280] mb-0.5">Expires</p>
        <p className={`font-semibold ${isExpired(item.expiryDate) ? "text-red-500 dark:text-red-400" : isExpiringSoon(item.expiryDate) ? "text-amber-500 dark:text-amber-400" : "text-[#374151] dark:text-[#d1d5db]"}`}>
          {formatDate(item.expiryDate)}
        </p>
      </div>
    </div>

    {item.description && (
      <p className="text-xs text-[#9ca3af] dark:text-[#6b7280] line-clamp-1">{item.description}</p>
    )}

    {/* Actions */}
    <div className="flex gap-2 mt-auto pt-1">
      <button
        onClick={() => onEdit(item)}
        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-[#f0e8e2] dark:border-[#2a2a2a] text-xs font-semibold text-[#374151] dark:text-[#d1d5db] hover:border-[#ff6347]/40 dark:hover:border-[#ffa500]/40 hover:text-[#ff6347] dark:hover:text-[#ffa500] hover:bg-[#ff6347]/5 dark:hover:bg-[#ffa500]/5 transition"
      >
        <Pencil size={12} /> Edit
      </button>
      <button
        onClick={() => onDelete(item)}
        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-[#f0e8e2] dark:border-[#2a2a2a] text-xs font-semibold text-[#374151] dark:text-[#d1d5db] hover:border-red-300 dark:hover:border-red-800 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
      >
        <Trash2 size={12} /> Delete
      </button>
    </div>
  </Motion.div>
);

// ── List Row ──────────────────────────────────────────────────────────────────

const ListRow = ({ item, onEdit, onDelete, index }) => (
  <Motion.tr
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.25, delay: index * 0.03 }}
    className="border-b border-[#f0e8e2] dark:border-[#252525] last:border-0 hover:bg-[#fdf8f5] dark:hover:bg-[#252525] transition-colors group"
  >
    <td className="px-5 py-3.5">
      <div className="flex items-center gap-3">
        <span className="text-lg">{CATEGORY_EMOJI[item.category] || "📦"}</span>
        <div>
          <p className="font-medium text-sm text-[#111827] dark:text-[#e5e7eb]">{item.title}</p>
          {item.description && (
            <p className="text-xs text-[#9ca3af] dark:text-[#6b7280] truncate max-w-[180px]">{item.description}</p>
          )}
        </div>
      </div>
    </td>
    <td className="px-5 py-3.5">
      <span className="text-xs px-2 py-0.5 rounded-full bg-[#ff6347]/10 dark:bg-[#ffa500]/10 text-[#ff6347] dark:text-[#ffa500] font-medium">
        {item.category || "—"}
      </span>
    </td>
    <td className="px-5 py-3.5 text-sm text-[#6b7280] dark:text-[#9ca3af]">{item.quantity ?? "—"}</td>
    <td className={`px-5 py-3.5 text-sm font-medium ${isExpired(item.expiryDate) ? "text-red-500 dark:text-red-400" : isExpiringSoon(item.expiryDate) ? "text-amber-500 dark:text-amber-400" : "text-[#6b7280] dark:text-[#9ca3af]"}`}>
      {formatDate(item.expiryDate)}
    </td>
    <td className="px-5 py-3.5">
      <StatusBadge expiryDate={item.expiryDate} />
    </td>
    <td className="px-5 py-3.5">
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(item)}
          className="p-1.5 rounded-lg text-[#9ca3af] hover:text-[#ff6347] dark:hover:text-[#ffa500] hover:bg-[#ff6347]/10 dark:hover:bg-[#ffa500]/10 transition"
          title="Edit"
        >
          <Pencil size={15} />
        </button>
        <button
          onClick={() => onDelete(item)}
          className="p-1.5 rounded-lg text-[#9ca3af] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
          title="Delete"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </td>
  </Motion.tr>
);

// ── Main Component ────────────────────────────────────────────────────────────

const MyFoods = () => {
  const [user, authLoading] = useAuthState(auth);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (authLoading || !user) return;
    (async () => {
      setLoading(true);
      try {
        const res = await axiosSecure.get("/foods");
        if (res.data.ok) {
          setItems(res.data.data.filter((f) => f.userEmail === user.email));
        }
      } catch { /* silent */ } finally {
        setLoading(false);
      }
    })();
  }, [user, authLoading]);

  const filtered = useMemo(() => {
    let list = items.filter((f) =>
      f.title?.toLowerCase().includes(search.toLowerCase())
    );
    return list.sort((a, b) => {
      if (sortBy === "newest") return new Date(b.expiryDate) - new Date(a.expiryDate);
      if (sortBy === "oldest") return new Date(a.expiryDate) - new Date(b.expiryDate);
      if (sortBy === "title_asc") return a.title.localeCompare(b.title);
      if (sortBy === "title_desc") return b.title.localeCompare(a.title);
      return 0;
    });
  }, [items, search, sortBy]);

  // Stats
  const expiredCount = useMemo(() => items.filter((f) => isExpired(f.expiryDate)).length, [items]);
  const soonCount = useMemo(() => items.filter((f) => isExpiringSoon(f.expiryDate)).length, [items]);

  const handleSaved = (updated) => {
    setItems((prev) => prev.map((i) => (i._id === updated._id ? updated : i)));
    setEditingItem(null);
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    setDeleteLoading(true);
    try {
      const res = await axiosSecure.delete(`/foods/${deletingItem._id}`);
      if (res.data.ok) {
        setItems((prev) => prev.filter((i) => i._id !== deletingItem._id));
        setDeletingItem(null);
      }
    } catch { /* silent */ } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="px-4 py-6 lg:px-8 lg:py-8 max-w-6xl mx-auto space-y-6">

      {/* ── Page header ── */}
      <Motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#111827] dark:text-[#e5e7eb]">My Foods</h1>
          <p className="text-sm text-[#6b7280] dark:text-[#9ca3af] mt-0.5">
            {loading ? "Loading…" : `${items.length} item${items.length !== 1 ? "s" : ""} in your inventory`}
          </p>
        </div>
        <Link
          to="/dashboard/add-food"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#ff6347] hover:bg-[#e5533d] dark:bg-[#ffa500] dark:hover:bg-[#cc8400] text-white dark:text-[#1a1a1a] rounded-xl text-sm font-semibold transition shadow-sm self-start sm:self-auto"
        >
          <Plus size={16} /> Add Food
        </Link>
      </Motion.div>

      {/* ── Alert cards (expiring/expired) ── */}
      <AnimatePresence>
        {!loading && (expiredCount > 0 || soonCount > 0) && (
          <Motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-wrap gap-3"
          >
            {expiredCount > 0 && (
              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-sm text-red-600 dark:text-red-400">
                <AlertTriangle size={15} />
                <span><strong>{expiredCount}</strong> item{expiredCount > 1 ? "s" : ""} expired — consider removing</span>
              </div>
            )}
            {soonCount > 0 && (
              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-sm text-amber-600 dark:text-amber-400">
                <Clock size={15} />
                <span><strong>{soonCount}</strong> item{soonCount > 1 ? "s" : ""} expiring within 7 days</span>
              </div>
            )}
          </Motion.div>
        )}
      </AnimatePresence>

      {/* ── Search + Sort + View ── */}
      <Motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        {/* Search */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9ca3af] pointer-events-none" />
          <input
            type="search"
            placeholder="Search your foods…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-[#f0e8e2] dark:border-[#2a2a2a] bg-white dark:bg-[#1c1c1c] text-sm text-[#111827] dark:text-[#e5e7eb] placeholder-[#9ca3af] dark:placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#ff6347]/30 dark:focus:ring-[#ffa500]/30 focus:border-[#ff6347] dark:focus:border-[#ffa500] transition"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#ff6347] dark:hover:text-[#ffa500] transition">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="relative">
          <ArrowUpDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af] pointer-events-none" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="pl-8 pr-4 py-2.5 rounded-xl border border-[#f0e8e2] dark:border-[#2a2a2a] bg-white dark:bg-[#1c1c1c] text-sm text-[#111827] dark:text-[#e5e7eb] focus:outline-none focus:ring-2 focus:ring-[#ff6347]/30 dark:focus:ring-[#ffa500]/30 transition cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* View toggle */}
        <div className="flex rounded-xl border border-[#f0e8e2] dark:border-[#2a2a2a] bg-white dark:bg-[#1c1c1c] p-1 gap-1 shrink-0">
          {[{ mode: "grid", Icon: LayoutGrid }, { mode: "list", Icon: List }].map(({ mode, Icon }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`p-2 rounded-lg transition-all ${viewMode === mode ? "bg-[#ff6347] dark:bg-[#ffa500] text-white dark:text-[#1a1a1a]" : "text-[#9ca3af] hover:text-[#ff6347] dark:hover:text-[#ffa500]"}`}
              aria-label={`${mode} view`}
            >
              <Icon size={15} />
            </button>
          ))}
        </div>
      </Motion.div>

      {/* ── Content ── */}
      {loading || authLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#ff6347]/10 dark:bg-[#ffa500]/10 flex items-center justify-center text-[#ff6347] dark:text-[#ffa500] mb-4">
            <Package size={28} />
          </div>
          <p className="text-base font-semibold text-[#374151] dark:text-[#d1d5db]">
            {search ? "No matching items found" : "No food items yet"}
          </p>
          <p className="text-sm text-[#9ca3af] dark:text-[#6b7280] mt-1">
            {search ? "Try a different search term" : "Start tracking your food inventory"}
          </p>
          {!search && (
            <Link
              to="/dashboard/add-food"
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-[#ff6347] hover:bg-[#e5533d] dark:bg-[#ffa500] dark:hover:bg-[#cc8400] text-white dark:text-[#1a1a1a] rounded-xl text-sm font-semibold transition"
            >
              <Plus size={15} /> Add Your First Food
            </Link>
          )}
        </Motion.div>
      ) : viewMode === "grid" ? (
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((item, i) => (
              <GridCard key={item._id} item={item} onEdit={setEditingItem} onDelete={setDeletingItem} index={i} />
            ))}
          </div>
        </AnimatePresence>
      ) : (
        <AnimatePresence mode="wait">
          <div className="bg-white dark:bg-[#1c1c1c] rounded-2xl border border-[#f0e8e2] dark:border-[#2a2a2a] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#f0e8e2] dark:border-[#2a2a2a] bg-[#fdf8f5] dark:bg-[#1a1a1a]">
                    {["Food Item", "Category", "Qty", "Expiry", "Status", ""].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#9ca3af] dark:text-[#6b7280]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item, i) => (
                    <ListRow key={item._id} item={item} onEdit={setEditingItem} onDelete={setDeletingItem} index={i} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </AnimatePresence>
      )}

      {/* ── Modals ── */}
      <AnimatePresence>
        {editingItem && (
          <EditModal
            key="edit"
            item={editingItem}
            onClose={() => setEditingItem(null)}
            onSave={handleSaved}
          />
        )}
        {deletingItem && (
          <DeleteModal
            key="delete"
            item={deletingItem}
            onClose={() => setDeletingItem(null)}
            onConfirm={handleDelete}
            deleting={deleteLoading}
          />
        )}
      </AnimatePresence>

    </div>
  );
};

export default MyFoods;
