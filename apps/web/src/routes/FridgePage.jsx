import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosSecure from "../api/axios";
import Swal from "sweetalert2";
import Loading from "../Components/Loading";

const FridgePage = () => {
  const [searchParams] = useSearchParams();
  const [foods, setFoods] = useState([]);
  const [category, setCategory] = useState(() => searchParams.get("category") || "All");
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get("search") || "");
  const [sortBy, setSortBy] = useState("newest");
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

  const options = ["All", "Dairy", "Meat", "Vegetables", "Snacks"];

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const filteredFoods = foods.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (category === "All" ? true : item.category === category)
  );

  const sortedFoods = [...filteredFoods].sort((a, b) => {
    if (sortBy === "newest") return new Date(b.expiryDate) - new Date(a.expiryDate);
    if (sortBy === "oldest") return new Date(a.expiryDate) - new Date(b.expiryDate);
    if (sortBy === "title_asc") return a.title.localeCompare(b.title);
    if (sortBy === "title_desc") return b.title.localeCompare(a.title);
    return 0;
  });

  const resetFilters = () => {
    setSearchTerm("");
    setCategory("All");
    setSortBy("newest");
  };

  return (
    <div className="px-4 py-10 min-h-screen transition-colors duration-500 ">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-[#ff6347] dark:text-[#ffa500] mb-10 text-center">
          My Fridge
        </h1>

        {/* Filter Panel */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-6 mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Search */}
          <input
            type="search"
            placeholder="Search food..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-64 px-4 py-3 rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-[#111827] dark:text-[#d1d5db] placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ff6347] dark:focus:ring-[#ffa500]"
          />

          {/* Category */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full md:w-48 px-4 py-3 rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-[#111827] dark:text-[#d1d5db] focus:outline-none focus:ring-2 focus:ring-[#ff6347] dark:focus:ring-[#ffa500]"
          >
            {options.map((opt, idx) => (
              <option key={idx} value={opt}>
                {opt}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full md:w-48 px-4 py-3 rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-[#111827] dark:text-[#d1d5db] focus:outline-none focus:ring-2 focus:ring-[#ff6347] dark:focus:ring-[#ffa500]"
          >
            <option value="newest">Expiry: Newest First</option>
            <option value="oldest">Expiry: Oldest First</option>
            <option value="title_asc">Title: A → Z</option>
            <option value="title_desc">Title: Z → A</option>
          </select>

          {/* Reset */}
          <button
            onClick={resetFilters}
            className="btn-outline btn border-[#ff6347] text-[#ff6347] dark:border-[#ffa500] dark:text-[#ffa500] px-4 py-2 rounded-md font-medium transition-colors hover:bg-[#ff6347] hover:text-white dark:hover:bg-[#ffa500] dark:hover:text-black"
          >
            Reset Filters
          </button>
        </div>

        {/* Food Grid */}
        {loading ? (
          <Loading />
        ) : sortedFoods.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 text-lg">No food items found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sortedFoods.map((food) => (
              <div
                key={food._id}
                className="bg-white dark:bg-zinc-800 rounded-lg shadow-md overflow-hidden flex flex-col hover:shadow-lg hover:scale-[1.02] transition"
              >
                <img
                  src={food.image || "/default-food.jpg"}
                  alt={food.title}
                  className="h-40 w-full object-cover"
                />
                <div className="p-4 flex flex-col flex-grow">
                  <h2 className="text-lg font-bold text-[#111827] dark:text-[#d1d5db] mb-1 truncate">
                    {food.title || "Untitled"}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Category: {food.category || "N/A"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    Quantity: {food.quantity || 0}
                  </p>
                  {isExpired(food.expiryDate) && (
                    <span className="text-xs font-semibold bg-red-200 text-red-700 px-3 py-1 rounded-full mb-3 w-fit">
                      Expired
                    </span>
                  )}
                  <button
                    onClick={() => navigate(`/food-details/${food._id}`)}
                    className="mt-auto px-4 py-2 rounded-md bg-[#ff6347] hover:bg-[#e5533d] dark:bg-[#ffa500] dark:hover:bg-[#cc8400] text-white dark:text-black font-medium transition-colors"
                  >
                    See Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FridgePage;
