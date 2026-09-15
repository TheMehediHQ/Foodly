import { useState, useEffect, useMemo } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import axiosSecure from "../../api/axios";
import Loading from "../../Components/Loading";
import {
  ShieldAlert,
  Users,
  Utensils,
  Search,
  Pencil,
  Trash2,
  X,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Clock,
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
    ? new Date(d).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

const CATEGORIES = ["Dairy", "Meat", "Vegetables", "Fruits", "Snacks", "Beverages", "Other"];

const inputCls =
  "w-full px-3.5 py-2.5 rounded-xl border text-sm text-[#111827] dark:text-[#e5e7eb] bg-white dark:bg-[#252525] placeholder-[#9ca3af] dark:placeholder-[#6b7280] border-[#f0e8e2] dark:border-[#333] focus:outline-none focus:ring-2 focus:ring-[#ff6347]/30 dark:focus:ring-[#ffa500]/30 focus:border-[#ff6347] dark:focus:border-[#ffa500] transition-all";

// ── Edit Modal for Admin ──────────────────────────────────────────────────────

const AdminEditModal = ({ item, onClose, onSave }) => {
  const [form, setForm] = useState({
    title: item.title || "",
    category: item.category || "Other",
    quantity: item.quantity ?? "",
    expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().split("T")[0] : "",
    description: item.description || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await axiosSecure.put(`/foods/${item._id}`, {
        ...form,
        quantity: Number(form.quantity),
      });
      if (res.data?.ok) onSave(res.data.data);
    } catch {
      setError("Admin update failed. Please try again.");
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
        initial={{ scale: 0.94, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 16 }}
        className="bg-white dark:bg-[#1c1c1c] rounded-2xl border border-[#f0e8e2] dark:border-[#2a2a2a] shadow-2xl w-full max-w-lg overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0e8e2] dark:border-[#2a2a2a]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#ff6347]/10 dark:bg-[#ffa500]/10 flex items-center justify-center text-[#ff6347] dark:text-[#ffa500]">
              <Pencil size={15} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#111827] dark:text-[#e5e7eb]">
                Admin Edit Food
              </h3>
              <p className="text-xs text-[#9ca3af] dark:text-[#6b7280]">
                Owner: {item.userEmail || "Unknown"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#9ca3af] hover:text-[#ff6347] dark:hover:text-[#ffa500] hover:bg-[#ff6347]/10 dark:hover:bg-[#ffa500]/10 transition"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-[#9ca3af] dark:text-[#6b7280]">
              Title *
            </label>
            <input
              value={form.title}
              onChange={set("title")}
              placeholder="Food name"
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-[#9ca3af] dark:text-[#6b7280]">
                Category
              </label>
              <select value={form.category} onChange={set("category")} className={inputCls}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-[#9ca3af] dark:text-[#6b7280]">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                value={form.quantity}
                onChange={set("quantity")}
                className={inputCls}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-[#9ca3af] dark:text-[#6b7280]">
              Expiry Date
            </label>
            <input
              type="date"
              value={form.expiryDate}
              onChange={set("expiryDate")}
              className={inputCls}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-[#9ca3af] dark:text-[#6b7280]">
              Notes / Description
            </label>
            <textarea
              rows={2}
              value={form.description}
              onChange={set("description")}
              className={`${inputCls} resize-none`}
            />
          </div>

          {error && (
            <p className="flex items-center gap-1.5 text-xs text-red-500">
              <Info size={12} /> {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[#f0e8e2] dark:border-[#333] text-sm font-semibold text-[#6b7280] dark:text-[#9ca3af] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#ff6347] hover:bg-[#e5533d] dark:bg-[#ffa500] dark:hover:bg-[#cc8400] text-white dark:text-[#1a1a1a] text-sm font-semibold transition disabled:opacity-60"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : "Save Changes"}
            </button>
          </div>
        </form>
      </Motion.div>
    </Motion.div>
  );
};

// ── Delete Confirmation Modal ─────────────────────────────────────────────────

const AdminDeleteModal = ({ item, onClose, onConfirm, deleting }) => (
  <Motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm"
    onClick={(e) => e.target === e.currentTarget && onClose()}
  >
    <Motion.div
      initial={{ scale: 0.94, opacity: 0, y: 16 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.94, opacity: 0, y: 16 }}
      className="bg-white dark:bg-[#1c1c1c] rounded-2xl border border-[#f0e8e2] dark:border-[#2a2a2a] shadow-2xl w-full max-w-sm p-6 text-center"
    >
      <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/40 flex items-center justify-center text-red-500 mx-auto mb-4">
        <Trash2 size={22} />
      </div>
      <h3 className="text-base font-semibold text-[#111827] dark:text-[#e5e7eb] mb-1">
        Admin: Delete Item
      </h3>
      <p className="text-sm text-[#6b7280] dark:text-[#9ca3af] mb-1">
        Permanently remove item:
      </p>
      <p className="text-sm font-semibold text-[#111827] dark:text-[#e5e7eb] mb-2">
        "{item?.title}"
      </p>
      <p className="text-xs text-[#9ca3af] dark:text-[#6b7280] mb-5">
        Owner: {item?.userEmail}
      </p>
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 py-2.5 rounded-xl border border-[#f0e8e2] dark:border-[#333] text-sm font-semibold text-[#6b7280] dark:text-[#9ca3af]"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={deleting}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition disabled:opacity-60"
        >
          {deleting ? <Loader2 size={14} className="animate-spin" /> : "Delete"}
        </button>
      </div>
    </Motion.div>
  </Motion.div>
);

// ── Main Admin Dashboard ──────────────────────────────────────────────────────

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalFoods: 0, totalUsers: 0, totalCategories: 0 });
  const [foods, setFoods] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("foods");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchAdminData = async () => {
      setLoading(true);
      try {
        const [statsRes, foodsRes, usersRes] = await Promise.all([
          axiosSecure.get("/admin/stats"),
          axiosSecure.get("/admin/foods"),
          axiosSecure.get("/admin/users"),
        ]);

        if (isMounted) {
          if (statsRes.data?.ok) setStats(statsRes.data.data);
          if (foodsRes.data?.ok) setFoods(foodsRes.data.data);
          if (usersRes.data?.ok) setUsers(usersRes.data.data);
        }
      } catch (err) {
        console.error("Admin dashboard fetch error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAdminData();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredFoods = useMemo(() => {
    if (!search.trim()) return foods;
    const q = search.toLowerCase();
    return foods.filter(
      (f) =>
        f.title?.toLowerCase().includes(q) ||
        f.category?.toLowerCase().includes(q) ||
        f.userEmail?.toLowerCase().includes(q)
    );
  }, [foods, search]);

  const handleSaved = (updated) => {
    setFoods((prev) => prev.map((f) => (f._id === updated._id ? updated : f)));
    setEditingItem(null);
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    setDeleteLoading(true);
    try {
      const res = await axiosSecure.delete(`/foods/${deletingItem._id}`);
      if (res.data?.ok) {
        setFoods((prev) => prev.filter((f) => f._id !== deletingItem._id));
        setStats((prev) => ({ ...prev, totalFoods: Math.max(0, prev.totalFoods - 1) }));
        setDeletingItem(null);
      }
    } catch (err) {
      console.error("Admin delete failed:", err);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="px-4 py-6 lg:px-8 lg:py-8 space-y-6 max-w-6xl mx-auto">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#ff6347]/15 dark:bg-[#ffa500]/20 text-[#ff6347] dark:text-[#ffa500]">
              Admin Control Center
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#111827] dark:text-[#e5e7eb] mt-1">
            Administration & Content Moderation
          </h1>
          <p className="text-sm text-[#6b7280] dark:text-[#9ca3af] mt-0.5">
            Full overview and management of all foods and registered users.
          </p>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#1c1c1c] rounded-2xl border border-[#f0e8e2] dark:border-[#2a2a2a] p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#ff6347]/10 dark:bg-[#ffa500]/10 flex items-center justify-center text-[#ff6347] dark:text-[#ffa500] shrink-0">
            <Utensils size={22} />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#111827] dark:text-[#e5e7eb]">
              {stats.totalFoods}
            </p>
            <p className="text-xs text-[#9ca3af] dark:text-[#6b7280]">Total Food Items</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1c1c1c] rounded-2xl border border-[#f0e8e2] dark:border-[#2a2a2a] p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500 shrink-0">
            <Users size={22} />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#111827] dark:text-[#e5e7eb]">
              {stats.totalUsers}
            </p>
            <p className="text-xs text-[#9ca3af] dark:text-[#6b7280]">Registered Users</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1c1c1c] rounded-2xl border border-[#f0e8e2] dark:border-[#2a2a2a] p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
            <ShieldAlert size={22} />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#111827] dark:text-[#e5e7eb]">
              {stats.totalCategories}
            </p>
            <p className="text-xs text-[#9ca3af] dark:text-[#6b7280]">Active Categories</p>
          </div>
        </div>
      </div>

      {/* ── Tabs Navigation ── */}
      <div className="flex items-center gap-2 border-b border-[#f0e8e2] dark:border-[#2a2a2a] pb-2">
        <button
          onClick={() => setActiveTab("foods")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
            activeTab === "foods"
              ? "bg-[#ff6347] dark:bg-[#ffa500] text-white dark:text-[#1a1a1a] shadow-xs"
              : "text-[#6b7280] dark:text-[#9ca3af] hover:text-[#ff6347] dark:hover:text-[#ffa500]"
          }`}
        >
          Food Management ({foods.length})
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
            activeTab === "users"
              ? "bg-[#ff6347] dark:bg-[#ffa500] text-white dark:text-[#1a1a1a] shadow-xs"
              : "text-[#6b7280] dark:text-[#9ca3af] hover:text-[#ff6347] dark:hover:text-[#ffa500]"
          }`}
        >
          User Directory ({users.length})
        </button>
      </div>

      {/* ── Tab 1: Food Management ── */}
      {activeTab === "foods" && (
        <div className="space-y-4">
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9ca3af] pointer-events-none"
            />
            <input
              type="search"
              placeholder="Search by food title, category, or owner email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-[#f0e8e2] dark:border-[#2a2a2a] bg-white dark:bg-[#1c1c1c] text-sm text-[#111827] dark:text-[#e5e7eb] placeholder-[#9ca3af] dark:placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#ff6347]/30 dark:focus:ring-[#ffa500]/30 transition"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#ff6347] transition"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="bg-white dark:bg-[#1c1c1c] rounded-2xl border border-[#f0e8e2] dark:border-[#2a2a2a] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-[#f0e8e2] dark:border-[#2a2a2a] bg-[#fdf8f5] dark:bg-[#1a1a1a]">
                    <th className="px-5 py-3 text-xs font-semibold uppercase text-[#9ca3af] dark:text-[#6b7280]">
                      Food Item
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase text-[#9ca3af] dark:text-[#6b7280]">
                      Owner Email
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase text-[#9ca3af] dark:text-[#6b7280]">
                      Category
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase text-[#9ca3af] dark:text-[#6b7280]">
                      Expiry
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase text-[#9ca3af] dark:text-[#6b7280] text-center">
                      Admin Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFoods.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-[#9ca3af]">
                        No foods matching search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredFoods.map((f) => (
                      <tr
                        key={f._id}
                        className="border-b border-[#f0e8e2] dark:border-[#252525] last:border-0 hover:bg-[#fdf8f5] dark:hover:bg-[#202020] transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <p className="font-semibold text-sm text-[#111827] dark:text-[#e5e7eb]">
                            {f.title}
                          </p>
                          <p className="text-xs text-[#9ca3af]">Qty: {f.quantity ?? 1}</p>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-[#6b7280] dark:text-[#9ca3af]">
                          {f.userEmail || "—"}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[#ff6347]/10 dark:bg-[#ffa500]/10 text-[#ff6347] dark:text-[#ffa500] font-medium">
                            {f.category || "Other"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-xs font-medium">
                          {isExpired(f.expiryDate) ? (
                            <span className="text-red-500 flex items-center gap-1">
                              <AlertTriangle size={12} /> {formatDate(f.expiryDate)}
                            </span>
                          ) : isExpiringSoon(f.expiryDate) ? (
                            <span className="text-amber-500 flex items-center gap-1">
                              <Clock size={12} /> {formatDate(f.expiryDate)}
                            </span>
                          ) : (
                            <span className="text-[#6b7280] dark:text-[#9ca3af]">
                              {formatDate(f.expiryDate)}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setEditingItem(f)}
                              className="p-1.5 rounded-lg text-[#6b7280] hover:text-[#ff6347] dark:hover:text-[#ffa500] hover:bg-[#ff6347]/10 transition"
                              title="Edit Food"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => setDeletingItem(f)}
                              className="p-1.5 rounded-lg text-[#6b7280] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
                              title="Delete Food"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 2: User Directory ── */}
      {activeTab === "users" && (
        <div className="bg-white dark:bg-[#1c1c1c] rounded-2xl border border-[#f0e8e2] dark:border-[#2a2a2a] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-[#f0e8e2] dark:border-[#2a2a2a] bg-[#fdf8f5] dark:bg-[#1a1a1a]">
                  <th className="px-5 py-3 text-xs font-semibold uppercase text-[#9ca3af] dark:text-[#6b7280]">
                    Email Address
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase text-[#9ca3af] dark:text-[#6b7280]">
                    Firebase UID
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase text-[#9ca3af] dark:text-[#6b7280]">
                    Role
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase text-[#9ca3af] dark:text-[#6b7280]">
                    Member Since
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u._id || u.firebaseUid}
                    className="border-b border-[#f0e8e2] dark:border-[#252525] last:border-0 hover:bg-[#fdf8f5] dark:hover:bg-[#202020] transition-colors"
                  >
                    <td className="px-5 py-3.5 font-medium text-[#111827] dark:text-[#e5e7eb]">
                      {u.email}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[#9ca3af] font-mono">
                      {u.firebaseUid}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          u.role === "admin"
                            ? "bg-[#ff6347]/15 dark:bg-[#ffa500]/20 text-[#ff6347] dark:text-[#ffa500]"
                            : "bg-gray-100 dark:bg-[#2a2a2a] text-[#6b7280] dark:text-[#9ca3af]"
                        }`}
                      >
                        {u.role === "admin" && <CheckCircle2 size={11} />}
                        {u.role || "user"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[#6b7280] dark:text-[#9ca3af]">
                      {formatDate(u.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      <AnimatePresence>
        {editingItem && (
          <AdminEditModal
            key="admin-edit"
            item={editingItem}
            onClose={() => setEditingItem(null)}
            onSave={handleSaved}
          />
        )}
        {deletingItem && (
          <AdminDeleteModal
            key="admin-delete"
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

export default AdminDashboard;

