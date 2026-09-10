import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import axiosSecure from "../api/axios";
import Swal from "sweetalert2";
import Loading from "../Components/Loading";
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  Plus,
  Calendar,
  Package,
  ArrowRight,
  Refrigerator,
  Clock,
  AlertTriangle,
  X,
  CheckCircle2,
} from "lucide-react";

const categories = ["All", "Dairy", "Meat", "Vegetables", "Snacks"];

const getExpiryInfo = (expiryDate) => {
  if (!expiryDate) return null;
  const now = new Date();
  const expiry = new Date(expiryDate);
  if (isNaN(expiry.getTime())) return null;

  now.setHours(0, 0, 0, 0);
  const target = new Date(expiry);
  target.setHours(0, 0, 0, 0);

  const diffTime = target - now;
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      status: "expired",
      label: "Expired",
      badgeClass: "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30",
    };
  }
  if (diffDays === 0) {
    return {
      status: "today",
      label: "Expires Today",
      badgeClass: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30",
    };
  }
  if (diffDays <= 3) {
    return {
      status: "warning",
      label: `${diffDays} ${diffDays === 1 ? "day" : "days"} left`,
      badgeClass: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30",
    };
  }
  return {
    status: "fresh",
    label: `${diffDays} days left`,
    badgeClass: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30",
  };
};

const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const FridgePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [foods, setFoods] = useState([]);
  const [category, setCategory] = useState(() => searchParams.get("category") || "All");
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get("search") || "");
  const [sortBy, setSortBy] = useState("soonest");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const urlCategory = searchParams.get("category");
    const urlSearch = searchParams.get("search");
    if (urlCategory) setCategory(urlCategory);
    if (urlSearch !== null && urlSearch !== undefined) setSearchTerm(urlSearch);
  }, [searchParams]);

  useEffect(() => {
    const fetchFoods = async () => {
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
        Swal.fire({
          title: "Failed to fetch foods",
          icon: "error",
        });
        console.error("Error fetching foods:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFoods();
  }, []);

  // Sync category changes to query params cleanly
  const handleCategoryChange = (cat) => {
    setCategory(cat);
    const newParams = new URLSearchParams(searchParams);
    if (cat === "All") {
      newParams.delete("category");
    } else {
      newParams.set("category", cat);
    }
    setSearchParams(newParams);
  };

  const filteredFoods = useMemo(() => {
    return foods.filter((item) => {
      const titleMatch = (item.title || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const categoryMatch = category === "All" || item.category === category;
      return titleMatch && categoryMatch;
    });
  }, [foods, searchTerm, category]);

  const sortedFoods = useMemo(() => {
    return [...filteredFoods].sort((a, b) => {
      if (sortBy === "soonest" || sortBy === "newest") {
        return new Date(a.expiryDate || 0) - new Date(b.expiryDate || 0);
      }
      if (sortBy === "latest" || sortBy === "oldest") {
        return new Date(b.expiryDate || 0) - new Date(a.expiryDate || 0);
      }
      if (sortBy === "title_asc") {
        return (a.title || "").localeCompare(b.title || "");
      }
      if (sortBy === "title_desc") {
        return (b.title || "").localeCompare(a.title || "");
      }
      return 0;
    });
  }, [filteredFoods, sortBy]);

  const resetFilters = () => {
    setSearchTerm("");
    setCategory("All");
    setSortBy("soonest");
    setSearchParams({});
  };

  const expiringSoonCount = useMemo(() => {
    return foods.filter((f) => {
      const info = getExpiryInfo(f.expiryDate);
      return info && (info.status === "warning" || info.status === "today");
    }).length;
  }, [foods]);

  const expiredCount = useMemo(() => {
    return foods.filter((f) => {
      const info = getExpiryInfo(f.expiryDate);
      return info && info.status === "expired";
    }).length;
  }, [foods]);

  return (
    <div className="min-h-screen bg-[#fffaf5] dark:bg-[#1f1f1f] text-gray-800 dark:text-zinc-200 transition-colors duration-300 py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-orange-200/60 dark:border-zinc-800 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-zinc-800 text-[#ff6347] dark:text-[#ffa500] text-xs font-semibold uppercase tracking-wider mb-3">
              <Refrigerator className="w-3.5 h-3.5" />
              <span>Smart Pantry Inventory</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              My Fridge Inventory
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-[#d1d5db] max-w-xl">
              Track expiration dates in real-time, monitor freshness status, and keep your kitchen organized.
            </p>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <span className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-orange-200/60 dark:border-zinc-700 font-semibold shadow-xs">
                {foods.length} Total Items
              </span>
              {expiringSoonCount > 0 && (
                <span className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1 shadow-xs">
                  <Clock className="w-3.5 h-3.5" /> {expiringSoonCount} Expiring Soon
                </span>
              )}
              {expiredCount > 0 && (
                <span className="px-3 py-1.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-700 dark:text-red-400 font-semibold flex items-center gap-1 shadow-xs">
                  <AlertTriangle className="w-3.5 h-3.5" /> {expiredCount} Expired
                </span>
              )}
            </div>

            <Link
              to="/dashboard/add-food"
              className="px-4 py-2 rounded-xl bg-[#ff6347] hover:bg-[#e5533d] dark:bg-[#ffa500] dark:hover:bg-[#cc8400] text-white dark:text-black font-semibold text-sm shadow-sm transition-all flex items-center gap-1.5 active:scale-95 ml-auto md:ml-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Item</span>
            </Link>
          </div>
        </div>

        {/* Filter Panel / Search Bar Section */}
        <div className="mb-10 space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-zinc-500">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search food by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-orange-200/80 dark:border-zinc-700 bg-[#fffaf5] dark:bg-[#1f1f1f] text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 text-sm focus:outline-none focus:border-[#ff6347] dark:focus:border-[#ffa500] focus:ring-2 focus:ring-[#ff6347]/20 transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="relative w-full sm:w-56">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full appearance-none pl-3.5 pr-10 py-2.5 rounded-xl border border-orange-200/80 dark:border-zinc-700 bg-[#fffaf5] dark:bg-[#1f1f1f] text-gray-900 dark:text-zinc-100 text-sm font-medium focus:outline-none focus:border-[#ff6347] dark:focus:border-[#ffa500] transition-all cursor-pointer"
                >
                  <option value="soonest" className="bg-[#fffaf5] dark:bg-[#1f1f1f]">Expiry: Soonest First</option>
                  <option value="latest" className="bg-[#fffaf5] dark:bg-[#1f1f1f]">Expiry: Furthest First</option>
                  <option value="title_asc" className="bg-[#fffaf5] dark:bg-[#1f1f1f]">Name: A to Z</option>
                  <option value="title_desc" className="bg-[#fffaf5] dark:bg-[#1f1f1f]">Name: Z to A</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Reset Button */}
              {(searchTerm || category !== "All" || sortBy !== "soonest") && (
                <button
                  type="button"
                  onClick={resetFilters}
                  title="Reset all filters"
                  className="p-2.5 rounded-xl border border-orange-200/80 dark:border-zinc-700 bg-[#fffaf5] dark:bg-[#1f1f1f] text-gray-600 dark:text-zinc-300 hover:text-[#ff6347] dark:hover:text-[#ffa500] hover:border-[#ff6347] dark:hover:border-[#ffa500] transition-colors cursor-pointer shrink-0"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-semibold text-gray-500 dark:text-zinc-400 mr-1 shrink-0">
              Categories:
            </span>
            {categories.map((cat) => {
              const active = category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                    active
                      ? "bg-[#ff6347] dark:bg-[#ffa500] text-white dark:text-black shadow-xs"
                      : "bg-[#fffaf5] dark:bg-[#1f1f1f] text-gray-700 dark:text-zinc-300 hover:text-[#ff6347] dark:hover:text-[#ffa500] hover:bg-orange-100/50 dark:hover:bg-zinc-800 border border-orange-200/80 dark:border-zinc-700"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <Loading />
        ) : sortedFoods.length === 0 ? (
          /* Empty State */
          <div className="bg-[#fffaf5] dark:bg-[#1f1f1f] rounded-3xl border border-orange-200/80 dark:border-zinc-800 p-12 text-center max-w-lg mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-orange-100 dark:bg-zinc-800 text-[#ff6347] dark:text-[#ffa500] flex items-center justify-center mx-auto mb-4">
              <Refrigerator className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              No Food Items Found
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-[#d1d5db] leading-relaxed">
              {searchTerm || category !== "All"
                ? "We couldn't find any items matching your active search or filters."
                : "Your fridge is currently empty. Add your first food item to start tracking!"}
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              {searchTerm || category !== "All" ? (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-5 py-2.5 rounded-xl border border-[#ff6347] text-[#ff6347] hover:bg-[#ff6347] hover:text-white dark:border-[#ffa500] dark:text-[#ffa500] dark:hover:bg-[#ffa500] dark:hover:text-black text-sm font-semibold transition-colors cursor-pointer"
                >
                  Clear Filters
                </button>
              ) : null}
              <Link
                to="/dashboard/add-food"
                className="px-5 py-2.5 rounded-xl bg-[#ff6347] hover:bg-[#e5533d] dark:bg-[#ffa500] dark:hover:bg-[#cc8400] text-white dark:text-black text-sm font-semibold shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add Food</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Food Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sortedFoods.map((food) => {
              const expiryInfo = getExpiryInfo(food.expiryDate);

              return (
                <div
                  key={food._id}
                  className="group bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-orange-200/60 dark:border-zinc-800 flex flex-col hover:-translate-y-1"
                >
                  {/* Image & Badges */}
                  <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-gray-100 dark:bg-zinc-800">
                    <img
                      src={food.image || "/default-food.jpg"}
                      alt={food.title || "Food item"}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80";
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Category Pill */}
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold bg-black/60 backdrop-blur-md text-white shadow-xs">
                      {food.category || "Food"}
                    </span>

                    {/* Expiry Badge */}
                    {expiryInfo && (
                      <span
                        className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-bold backdrop-blur-md shadow-xs ${expiryInfo.badgeClass}`}
                      >
                        {expiryInfo.label}
                      </span>
                    )}
                  </div>

                  {/* Body Info */}
                  <div className="p-5 flex flex-col flex-grow">
                    <h2
                      title={food.title}
                      className="text-base sm:text-lg font-bold text-gray-900 dark:text-zinc-100 mb-2 truncate group-hover:text-[#ff6347] dark:group-hover:text-[#ffa500] transition-colors"
                    >
                      {food.title || "Untitled Item"}
                    </h2>

                    <div className="space-y-1.5 text-xs text-gray-500 dark:text-zinc-400 mb-4 flex-grow">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />
                          <span>Quantity:</span>
                        </span>
                        <span className="font-semibold text-gray-700 dark:text-zinc-300">
                          {food.quantity || 1}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />
                          <span>Expiry:</span>
                        </span>
                        <span className="font-medium text-gray-700 dark:text-zinc-300">
                          {formatDate(food.expiryDate)}
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      type="button"
                      onClick={() => navigate(`/food-details/${food._id}`)}
                      className="w-full mt-auto py-2.5 rounded-xl bg-[#ff6347] hover:bg-[#e5533d] text-white dark:bg-[#ffa500] dark:hover:bg-[#cc8400] dark:text-black font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                    >
                      <span>See Details</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FridgePage;

