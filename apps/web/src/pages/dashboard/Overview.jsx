import { useEffect, useState, useMemo } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../context/firebase/firebase.config";
import { motion as Motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  MdOutlineAddBox,
  MdOutlineInventory,
  MdOutlineListAlt,
  MdOutlinePerson,
  MdTrendingUp,
  MdTrendingDown,
  MdOutlineRestaurantMenu,
  MdCheckCircleOutline,
  MdOutlineWarningAmber,
} from "react-icons/md";
import { GiFruitBowl } from "react-icons/gi";
import {
  Package,
  User,
  LayoutGrid,
  Leaf,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import axiosSecure from "../../api/axios";

// ── helpers ──────────────────────────────────────────────────────────────────

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const isExpired = (dateStr) => {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
};

const isExpiringSoon = (dateStr) => {
  if (!dateStr) return false;
  const diff = new Date(dateStr) - new Date();
  return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000; // 7 days
};

// ── animation variants ────────────────────────────────────────────────────────

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: "easeOut", delay },
});

// ── sub-components ────────────────────────────────────────────────────────────

const StatCard = ({ icon, label, value, sub, trend, color, delay }) => (
  <Motion.div
    {...fadeUp(delay)}
    whileHover={{ y: -3, transition: { duration: 0.2 } }}
    className="bg-white dark:bg-[#1c1c1c] rounded-2xl p-5 border border-[#f0e8e2] dark:border-[#2a2a2a] shadow-sm hover:shadow-md transition-shadow"
  >
    <div className="flex items-start justify-between mb-4">
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center text-white ${color}`}
      >
        {icon}
      </div>
      {trend !== undefined && (
        <span
          className={`flex items-center gap-0.5 text-xs font-medium px-2 py-1 rounded-full ${
            trend >= 0
              ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400"
              : "text-red-500 bg-red-50 dark:bg-red-950/40 dark:text-red-400"
          }`}
        >
          {trend >= 0 ? <MdTrendingUp size={13} /> : <MdTrendingDown size={13} />}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <p className="text-3xl font-bold text-[#111827] dark:text-[#e5e7eb]">{value}</p>
    <p className="mt-1 text-sm font-medium text-[#374151] dark:text-[#d1d5db]">{label}</p>
    {sub && <p className="mt-0.5 text-xs text-[#9ca3af] dark:text-[#6b7280]">{sub}</p>}
  </Motion.div>
);

const QuickAction = ({ to, icon, label, description, color, delay }) => (
  <Motion.div {...fadeUp(delay)} whileHover={{ y: -2, transition: { duration: 0.2 } }}>
    <Link
      to={to}
      className="flex items-center gap-4 p-4 bg-white dark:bg-[#1c1c1c] rounded-2xl border border-[#f0e8e2] dark:border-[#2a2a2a] hover:border-[#ff6347]/40 dark:hover:border-[#ffa500]/40 hover:shadow-md transition-all group"
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 ${color}`}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[#111827] dark:text-[#e5e7eb] group-hover:text-[#ff6347] dark:group-hover:text-[#ffa500] transition-colors">
          {label}
        </p>
        <p className="text-xs text-[#9ca3af] dark:text-[#6b7280] truncate">{description}</p>
      </div>
      <ChevronRight
        size={16}
        className="text-[#d1d5db] dark:text-[#4b5563] group-hover:text-[#ff6347] dark:group-hover:text-[#ffa500] transition-colors shrink-0"
      />
    </Link>
  </Motion.div>
);

const StatusBadge = ({ item }) => {
  if (isExpired(item.expiryDate)) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">
        <AlertTriangle size={10} /> Expired
      </span>
    );
  }
  if (isExpiringSoon(item.expiryDate)) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
        <Clock size={10} /> Expiring soon
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
      <CheckCircle2 size={10} /> Fresh
    </span>
  );
};

// ── main component ────────────────────────────────────────────────────────────

const Overview = () => {
  const [user] = useAuthState(auth);
  const [allFoods, setAllFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;
    const fetchFoods = async () => {
      try {
        const res = await axiosSecure.get("/foods");
        if (res.data.ok) setAllFoods(res.data.data);
      } catch (err) {
        console.error("Error fetching foods:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFoods();
  }, [user?.email]);

  const myFoods = useMemo(
    () =>
      allFoods.filter(
        (f) => f.userEmail?.toLowerCase() === user?.email?.toLowerCase()
      ),
    [allFoods, user?.email]
  );

  const stats = useMemo(() => {
    const categories = [...new Set(myFoods.map((f) => f.category).filter(Boolean))];
    const fresh = myFoods.filter((f) => !isExpired(f.expiryDate)).length;
    const freshnessScore =
      myFoods.length > 0 ? Math.round((fresh / myFoods.length) * 100) : 0;
    return {
      total: allFoods.length,
      mine: myFoods.length,
      categories: categories.length,
      freshnessScore,
    };
  }, [allFoods, myFoods]);

  // Last 5 of my foods
  const recentFoods = useMemo(() => [...myFoods].slice(-5).reverse(), [myFoods]);

  // Profile completion
  const profileItems = useMemo(() => [
    { label: "Display Name", done: !!user?.displayName },
    { label: "Profile Photo", done: !!user?.photoURL },
    { label: "Email Verified", done: !!user?.emailVerified },
    { label: "Added a food item", done: myFoods.length > 0 },
  ], [user, myFoods]);

  const profileCompletion = useMemo(
    () => Math.round((profileItems.filter((i) => i.done).length / profileItems.length) * 100),
    [profileItems]
  );

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 rounded-full border-4 border-gray-200 dark:border-zinc-700 border-t-[#ff6347] dark:border-t-[#ffa500] animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 py-6 lg:px-8 lg:py-8 space-y-8 max-w-6xl mx-auto">

      {/* ── Welcome header ── */}
      <Motion.div {...fadeUp(0)}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-[#111827] dark:text-[#e5e7eb]">
              {getGreeting()},{" "}
              <span className="text-[#ff6347] dark:text-[#ffa500]">
                {user?.displayName?.split(" ")[0] || "there"} 👋
              </span>
            </h1>
            <p className="mt-1 text-sm text-[#6b7280] dark:text-[#9ca3af]">{today}</p>
          </div>
          <Link
            to="/dashboard/add-food"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#ff6347] hover:bg-[#e5533d] dark:bg-[#ffa500] dark:hover:bg-[#cc8400] text-white dark:text-[#1a1a1a] rounded-xl text-sm font-semibold transition-colors shadow-sm self-start sm:self-auto"
          >
            <MdOutlineAddBox size={18} />
            Add Food
          </Link>
        </div>
      </Motion.div>

      {/* ── Stats grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          delay={0.05}
          icon={<GiFruitBowl size={20} />}
          label="Total Foods"
          value={stats.total}
          sub="All foods in the system"
          trend={12}
          color="bg-[#ff6347] dark:bg-[#cc4a33]"
        />
        <StatCard
          delay={0.1}
          icon={<Package size={20} />}
          label="My Foods"
          value={stats.mine}
          sub="Foods added by you"
          trend={stats.mine > 0 ? 8 : 0}
          color="bg-[#ffa500] dark:bg-[#cc8400]"
        />
        <StatCard
          delay={0.15}
          icon={<LayoutGrid size={20} />}
          label="Categories"
          value={stats.categories}
          sub="Unique food categories"
          color="bg-violet-500 dark:bg-violet-700"
        />
        <StatCard
          delay={0.2}
          icon={<Leaf size={20} />}
          label="Freshness"
          value={`${stats.freshnessScore}%`}
          sub={`${myFoods.filter((f) => !isExpired(f.expiryDate)).length} of ${stats.mine} items fresh`}
          trend={stats.freshnessScore >= 70 ? 5 : -5}
          color={
            stats.freshnessScore >= 70
              ? "bg-emerald-500 dark:bg-emerald-700"
              : "bg-red-500 dark:bg-red-700"
          }
        />
      </div>

      {/* ── Middle row: Quick actions + Profile completion ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Quick Actions (2/3 width) */}
        <div className="lg:col-span-2 space-y-3">
          <Motion.h2 {...fadeUp(0.25)} className="text-base font-semibold text-[#374151] dark:text-[#d1d5db]">
            Quick Actions
          </Motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <QuickAction
              delay={0.28}
              to="/dashboard/add-food"
              icon={<MdOutlineAddBox size={20} />}
              label="Add New Food"
              description="Track a new item in your fridge"
              color="bg-[#ff6347] dark:bg-[#cc4a33]"
            />
            <QuickAction
              delay={0.31}
              to="/dashboard/my-foods"
              icon={<MdOutlineInventory size={20} />}
              label="My Foods"
              description="View & manage your items"
              color="bg-[#ffa500] dark:bg-[#cc8400]"
            />
            <QuickAction
              delay={0.34}
              to="/dashboard/all-foods"
              icon={<MdOutlineListAlt size={20} />}
              label="Browse All Foods"
              description="Explore all community items"
              color="bg-violet-500 dark:bg-violet-700"
            />
            <QuickAction
              delay={0.37}
              to="/dashboard/user-profile"
              icon={<MdOutlinePerson size={20} />}
              label="Edit Profile"
              description="Update your account info"
              color="bg-sky-500 dark:bg-sky-700"
            />
          </div>
        </div>

        {/* Profile Completion (1/3 width) */}
        <Motion.div
          {...fadeUp(0.3)}
          className="bg-white dark:bg-[#1c1c1c] rounded-2xl p-5 border border-[#f0e8e2] dark:border-[#2a2a2a] shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[#374151] dark:text-[#d1d5db]">
              Profile Setup
            </h2>
            <span className="text-sm font-bold text-[#ff6347] dark:text-[#ffa500]">
              {profileCompletion}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-[#f3f4f6] dark:bg-[#2a2a2a] rounded-full overflow-hidden mb-5">
            <Motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#ff6347] to-[#ffa500]"
              initial={{ width: 0 }}
              animate={{ width: `${profileCompletion}%` }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
            />
          </div>

          <ul className="space-y-2.5">
            {profileItems.map(({ label, done }) => (
              <li key={label} className="flex items-center gap-3">
                {done ? (
                  <MdCheckCircleOutline className="text-emerald-500 shrink-0" size={18} />
                ) : (
                  <MdOutlineWarningAmber className="text-[#9ca3af] dark:text-[#6b7280] shrink-0" size={18} />
                )}
                <span
                  className={`text-sm ${
                    done
                      ? "text-[#111827] dark:text-[#e5e7eb]"
                      : "text-[#9ca3af] dark:text-[#6b7280] line-through"
                  }`}
                >
                  {label}
                </span>
              </li>
            ))}
          </ul>

          {profileCompletion < 100 && (
            <Link
              to="/dashboard/user-profile"
              className="mt-5 block text-center text-xs font-semibold text-[#ff6347] dark:text-[#ffa500] hover:underline"
            >
              Complete your profile →
            </Link>
          )}
        </Motion.div>
      </div>

      {/* ── Recent Foods table ── */}
      <Motion.div {...fadeUp(0.4)}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-[#374151] dark:text-[#d1d5db]">
            Recent Foods
          </h2>
          <Link
            to="/dashboard/my-foods"
            className="text-xs font-semibold text-[#ff6347] dark:text-[#ffa500] hover:underline flex items-center gap-1"
          >
            View all <ChevronRight size={12} />
          </Link>
        </div>

        <div className="bg-white dark:bg-[#1c1c1c] rounded-2xl border border-[#f0e8e2] dark:border-[#2a2a2a] shadow-sm overflow-hidden">
          {recentFoods.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <MdOutlineRestaurantMenu className="text-[#d1d5db] dark:text-[#4b5563] mb-3" size={40} />
              <p className="text-sm font-medium text-[#6b7280] dark:text-[#9ca3af]">
                No food items yet
              </p>
              <Link
                to="/dashboard/add-food"
                className="mt-3 text-xs font-semibold text-[#ff6347] dark:text-[#ffa500] hover:underline"
              >
                Add your first food →
              </Link>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#f0e8e2] dark:border-[#2a2a2a] bg-[#fdf8f5] dark:bg-[#1a1a1a]">
                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#9ca3af] dark:text-[#6b7280]">
                        Food Item
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#9ca3af] dark:text-[#6b7280]">
                        Category
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#9ca3af] dark:text-[#6b7280]">
                        Qty
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#9ca3af] dark:text-[#6b7280]">
                        Expiry
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#9ca3af] dark:text-[#6b7280]">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentFoods.map((item, i) => (
                      <Motion.tr
                        key={item._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.45 + i * 0.07 }}
                        className="border-b border-[#f0e8e2] dark:border-[#252525] last:border-0 hover:bg-[#fdf8f5] dark:hover:bg-[#252525] transition-colors"
                      >
                        <td className="px-5 py-3.5 font-medium text-[#111827] dark:text-[#e5e7eb]">
                          {item.title}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[#ff6347]/10 dark:bg-[#ffa500]/10 text-[#ff6347] dark:text-[#ffa500] font-medium">
                            {item.category || "—"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-[#6b7280] dark:text-[#9ca3af]">
                          {item.quantity ?? "—"}
                        </td>
                        <td className="px-5 py-3.5 text-[#6b7280] dark:text-[#9ca3af]">
                          {formatDate(item.expiryDate)}
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusBadge item={item} />
                        </td>
                      </Motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-[#f0e8e2] dark:divide-[#2a2a2a]">
                {recentFoods.map((item) => (
                  <div key={item._id} className="px-4 py-3.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-[#111827] dark:text-[#e5e7eb] truncate">
                        {item.title}
                      </p>
                      <p className="text-xs text-[#9ca3af] dark:text-[#6b7280] mt-0.5">
                        {item.category} · {formatDate(item.expiryDate)}
                      </p>
                    </div>
                    <StatusBadge item={item} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </Motion.div>

    </div>
  );
};

export default Overview;
