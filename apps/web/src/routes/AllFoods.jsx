import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import axiosSecure from "../api/axios";
import {
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  X,
  ArrowUpDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Utensils,
  ExternalLink,
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

const CATEGORIES = ["All", "Dairy", "Meat", "Vegetables", "Snacks", "Fruits", "Beverages", "Other"];
const SORT_OPTIONS = [
  { value: "newest", label: "Expiry: Newest first" },
  { value: "oldest", label: "Expiry: Oldest first" },
  { value: "title_asc", label: "Title: A → Z" },
  { value: "title_desc", label: "Title: Z → A" },
  { value: "qty_desc", label: "Quantity: High → Low" },
];
const PAGE_SIZE = 12;

// ── status badge ──────────────────────────────────────────────────────────────

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

// ── category pill ─────────────────────────────────────────────────────────────

const CategoryPill = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
      active
        ? "bg-[#ff6347] dark:bg-[#ffa500] text-white dark:text-[#1a1a1a] shadow-sm"
        : "bg-white dark:bg-[#1c1c1c] text-[#6b7280] dark:text-[#9ca3af] border border-[#f0e8e2] dark:border-[#2a2a2a] hover:border-[#ff6347]/40 dark:hover:border-[#ffa500]/40 hover:text-[#ff6347] dark:hover:text-[#ffa500]"
    }`}
  >
    {label}
  </button>
);

// ── skeleton loader ───────────────────────────────────────────────────────────

const SkeletonCard = () => (
  <div className="bg-white dark:bg-[#1c1c1c] rounded-2xl border border-[#f0e8e2] dark:border-[#2a2a2a] p-5 animate-pulse">
    <div className="h-4 bg-[#f3f4f6] dark:bg-[#2a2a2a] rounded w-2/3 mb-3" />
    <div className="h-3 bg-[#f3f4f6] dark:bg-[#2a2a2a] rounded w-1/3 mb-2" />
    <div className="h-3 bg-[#f3f4f6] dark:bg-[#2a2a2a] rounded w-1/2 mb-4" />
    <div className="h-8 bg-[#f3f4f6] dark:bg-[#2a2a2a] rounded-xl" />
  </div>
);

// ── grid card ─────────────────────────────────────────────────────────────────

const GridCard = ({ food, onDetails, index }) => (
  <Motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay: index * 0.04 }}
    whileHover={{ y: -3, transition: { duration: 0.2 } }}
    className="bg-white dark:bg-[#1c1c1c] rounded-2xl border border-[#f0e8e2] dark:border-[#2a2a2a] p-5 flex flex-col gap-3 shadow-sm hover:shadow-md hover:border-[#ff6347]/30 dark:hover:border-[#ffa500]/30 transition-all"
  >
    {/* Icon + category */}
    <div className="flex items-center justify-between">
      <div className="w-10 h-10 rounded-xl bg-[#ff6347]/10 dark:bg-[#ffa500]/10 flex items-center justify-center text-[#ff6347] dark:text-[#ffa500]">
        <Utensils size={18} />
      </div>
      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#ff6347]/10 dark:bg-[#ffa500]/10 text-[#ff6347] dark:text-[#ffa500]">
        {food.category || "—"}
      </span>
    </div>

    {/* Title */}
    <div>
      <h3 className="font-semibold text-[#111827] dark:text-[#e5e7eb] text-sm leading-snug line-clamp-2">
        {food.title}
      </h3>
      {food.description && (
        <p className="text-xs text-[#9ca3af] dark:text-[#6b7280] mt-1 line-clamp-1">
          {food.description}
        </p>
      )}
    </div>

    {/* Meta */}
    <div className="flex items-center justify-between text-xs text-[#6b7280] dark:text-[#9ca3af]">
      <span>Qty: <strong className="text-[#374151] dark:text-[#d1d5db]">{food.quantity ?? "—"}</strong></span>
      <span>{formatDate(food.expiryDate)}</span>
    </div>

    {/* Status */}
    <StatusBadge expiryDate={food.expiryDate} />

    {/* CTA */}
    <button
      onClick={() => onDetails(food._id)}
      className="mt-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-[#ff6347] hover:bg-[#e5533d] dark:bg-[#ffa500] dark:hover:bg-[#cc8400] text-white dark:text-[#1a1a1a] rounded-xl text-xs font-semibold transition-colors"
    >
      See Details <ExternalLink size={12} />
    </button>
  </Motion.div>
);

// ── list row ──────────────────────────────────────────────────────────────────

const ListRow = ({ food, onDetails, index }) => (
  <Motion.tr
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3, delay: index * 0.03 }}
    className="border-b border-[#f0e8e2] dark:border-[#252525] last:border-0 hover:bg-[#fdf8f5] dark:hover:bg-[#252525] transition-colors group"
  >
    <td className="px-5 py-3.5">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#ff6347]/10 dark:bg-[#ffa500]/10 flex items-center justify-center text-[#ff6347] dark:text-[#ffa500] shrink-0">
          <Utensils size={14} />
        </div>
        <span className="font-medium text-sm text-[#111827] dark:text-[#e5e7eb]">
          {food.title}
        </span>
      </div>
    </td>
    <td className="px-5 py-3.5">
      <span className="text-xs px-2 py-0.5 rounded-full bg-[#ff6347]/10 dark:bg-[#ffa500]/10 text-[#ff6347] dark:text-[#ffa500] font-medium">
        {food.category || "—"}
      </span>
    </td>
    <td className="px-5 py-3.5 text-sm text-[#6b7280] dark:text-[#9ca3af]">
      {food.quantity ?? "—"}
    </td>
    <td className="px-5 py-3.5 text-sm text-[#6b7280] dark:text-[#9ca3af]">
      {formatDate(food.expiryDate)}
    </td>
    <td className="px-5 py-3.5">
      <StatusBadge expiryDate={food.expiryDate} />
    </td>
    <td className="px-5 py-3.5">
      <button
        onClick={() => onDetails(food._id)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ff6347] hover:bg-[#e5533d] dark:bg-[#ffa500] dark:hover:bg-[#cc8400] text-white dark:text-[#1a1a1a] rounded-lg text-xs font-semibold transition-colors opacity-0 group-hover:opacity-100"
      >
        Details <ExternalLink size={11} />
      </button>
    </td>
  </Motion.tr>
);

// ── main component ────────────────────────────────────────────────────────────

const AllFoods = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await axiosSecure.get("/foods");
        const payload = res.data;
        const items = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload)
          ? payload
          : [];
        setFoods(items);
      } catch (err) {
        console.error("Error fetching foods:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [search, category, sortBy]);

  const filtered = useMemo(() => {
    let list = foods.filter(
      (f) =>
        f.title?.toLowerCase().includes(search.toLowerCase()) &&
        (category === "All" || f.category === category)
    );
    return list.sort((a, b) => {
      if (sortBy === "newest") return new Date(b.expiryDate) - new Date(a.expiryDate);
      if (sortBy === "oldest") return new Date(a.expiryDate) - new Date(b.expiryDate);
      if (sortBy === "title_asc") return a.title.localeCompare(b.title);
      if (sortBy === "title_desc") return b.title.localeCompare(a.title);
      if (sortBy === "qty_desc") return (b.quantity ?? 0) - (a.quantity ?? 0);
      return 0;
    });
  }, [foods, search, category, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const hasActiveFilters = search || category !== "All" || sortBy !== "newest";

  const resetFilters = () => {
    setSearch("");
    setCategory("All");
    setSortBy("newest");
  };

  const goToDetails = (id) => navigate(`/dashboard/food-details/${id}`);

  // Category counts
  const counts = useMemo(() => {
    const map = {};
    foods.forEach((f) => {
      map[f.category] = (map[f.category] || 0) + 1;
    });
    return map;
  }, [foods]);

  return (
    <div className="px-4 py-6 lg:px-8 lg:py-8 max-w-7xl mx-auto space-y-6">

      {/* ── Page header ── */}
      <Motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl lg:text-3xl font-bold text-[#111827] dark:text-[#e5e7eb]">
          All Foods
        </h1>
        <p className="text-sm text-[#6b7280] dark:text-[#9ca3af] mt-1">
          {loading ? "Loading…" : `${filtered.length} item${filtered.length !== 1 ? "s" : ""} found`}
          {hasActiveFilters && !loading && (
            <button
              onClick={resetFilters}
              className="ml-2 text-[#ff6347] dark:text-[#ffa500] hover:underline font-medium"
            >
              Clear filters
            </button>
          )}
        </p>
      </Motion.div>

      {/* ── Category pills ── */}
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 flex-wrap"
      >
        {CATEGORIES.map((cat) => (
          <CategoryPill
            key={cat}
            label={cat === "All" ? `All (${foods.length})` : `${cat}${counts[cat] ? ` (${counts[cat]})` : ""}`}
            active={category === cat}
            onClick={() => setCategory(cat)}
          />
        ))}
      </Motion.div>

      {/* ── Search + Sort + View toggle bar ── */}
      <Motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9ca3af] dark:text-[#6b7280] pointer-events-none"
          />
          <input
            type="search"
            placeholder="Search food items…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#f0e8e2] dark:border-[#2a2a2a] bg-white dark:bg-[#1c1c1c] text-sm text-[#111827] dark:text-[#e5e7eb] placeholder-[#9ca3af] dark:placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#ff6347]/40 dark:focus:ring-[#ffa500]/40 focus:border-[#ff6347] dark:focus:border-[#ffa500] transition"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#ff6347] dark:hover:text-[#ffa500] transition"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="relative">
          <ArrowUpDown
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af] dark:text-[#6b7280] pointer-events-none"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="pl-8 pr-4 py-2.5 rounded-xl border border-[#f0e8e2] dark:border-[#2a2a2a] bg-white dark:bg-[#1c1c1c] text-sm text-[#111827] dark:text-[#e5e7eb] focus:outline-none focus:ring-2 focus:ring-[#ff6347]/40 dark:focus:ring-[#ffa500]/40 focus:border-[#ff6347] dark:focus:border-[#ffa500] transition cursor-pointer appearance-none pr-8"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* View toggle */}
        <div className="flex rounded-xl border border-[#f0e8e2] dark:border-[#2a2a2a] bg-white dark:bg-[#1c1c1c] p-1 gap-1 shrink-0">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg transition-all ${
              viewMode === "grid"
                ? "bg-[#ff6347] dark:bg-[#ffa500] text-white dark:text-[#1a1a1a]"
                : "text-[#9ca3af] dark:text-[#6b7280] hover:text-[#ff6347] dark:hover:text-[#ffa500]"
            }`}
            aria-label="Grid view"
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg transition-all ${
              viewMode === "list"
                ? "bg-[#ff6347] dark:bg-[#ffa500] text-white dark:text-[#1a1a1a]"
                : "text-[#9ca3af] dark:text-[#6b7280] hover:text-[#ff6347] dark:hover:text-[#ffa500]"
            }`}
            aria-label="List view"
          >
            <List size={16} />
          </button>
        </div>
      </Motion.div>

      {/* ── Content ── */}
      {loading ? (
        /* Skeleton */
        <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : "space-y-3"}>
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : paginated.length === 0 ? (
        /* Empty state */
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#ff6347]/10 dark:bg-[#ffa500]/10 flex items-center justify-center text-[#ff6347] dark:text-[#ffa500] mb-4">
            <SlidersHorizontal size={28} />
          </div>
          <p className="text-base font-semibold text-[#374151] dark:text-[#d1d5db]">
            No food items found
          </p>
          <p className="text-sm text-[#9ca3af] dark:text-[#6b7280] mt-1">
            Try adjusting your search or filters
          </p>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="mt-4 px-4 py-2 text-sm font-semibold text-[#ff6347] dark:text-[#ffa500] border border-[#ff6347]/30 dark:border-[#ffa500]/30 rounded-xl hover:bg-[#ff6347]/10 dark:hover:bg-[#ffa500]/10 transition"
            >
              Reset all filters
            </button>
          )}
        </Motion.div>
      ) : viewMode === "grid" ? (
        /* Grid view */
        <AnimatePresence mode="wait">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginated.map((food, i) => (
              <GridCard key={food._id} food={food} onDetails={goToDetails} index={i} />
            ))}
          </div>
        </AnimatePresence>
      ) : (
        /* List view */
        <AnimatePresence mode="wait">
          <div className="bg-white dark:bg-[#1c1c1c] rounded-2xl border border-[#f0e8e2] dark:border-[#2a2a2a] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#f0e8e2] dark:border-[#2a2a2a] bg-[#fdf8f5] dark:bg-[#1a1a1a]">
                    {["Food Item", "Category", "Qty", "Expiry Date", "Status", ""].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#9ca3af] dark:text-[#6b7280]"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((food, i) => (
                    <ListRow key={food._id} food={food} onDetails={goToDetails} index={i} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </AnimatePresence>
      )}

      {/* ── Pagination ── */}
      {!loading && filtered.length > PAGE_SIZE && (
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between gap-4 pt-2"
        >
          <p className="text-xs text-[#9ca3af] dark:text-[#6b7280]">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-xl border border-[#f0e8e2] dark:border-[#2a2a2a] bg-white dark:bg-[#1c1c1c] text-[#374151] dark:text-[#d1d5db] disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#ff6347]/40 dark:hover:border-[#ffa500]/40 hover:text-[#ff6347] dark:hover:text-[#ffa500] transition"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Page numbers */}
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                .reduce((acc, n, idx, arr) => {
                  if (idx > 0 && n - arr[idx - 1] > 1) acc.push("…");
                  acc.push(n);
                  return acc;
                }, [])
                .map((n, i) =>
                  n === "…" ? (
                    <span
                      key={`ellipsis-${i}`}
                      className="px-3 py-1.5 text-xs text-[#9ca3af] dark:text-[#6b7280]"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      className={`min-w-[32px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        page === n
                          ? "bg-[#ff6347] dark:bg-[#ffa500] text-white dark:text-[#1a1a1a]"
                          : "bg-white dark:bg-[#1c1c1c] border border-[#f0e8e2] dark:border-[#2a2a2a] text-[#374151] dark:text-[#d1d5db] hover:border-[#ff6347]/40 dark:hover:border-[#ffa500]/40 hover:text-[#ff6347] dark:hover:text-[#ffa500]"
                      }`}
                    >
                      {n}
                    </button>
                  )
                )}
            </div>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-xl border border-[#f0e8e2] dark:border-[#2a2a2a] bg-white dark:bg-[#1c1c1c] text-[#374151] dark:text-[#d1d5db] disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#ff6347]/40 dark:hover:border-[#ffa500]/40 hover:text-[#ff6347] dark:hover:text-[#ffa500] transition"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </Motion.div>
      )}

    </div>
  );
};

export default AllFoods;
