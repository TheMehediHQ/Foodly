import { Outlet, NavLink, Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  MdOutlineDashboard,
  MdOutlineListAlt,
  MdOutlineAddBox,
  MdOutlineInventory,
  MdOutlinePerson,
  MdHome,
  MdMenu,
  MdClose,
} from "react-icons/md";
import { GiFoodTruck } from "react-icons/gi";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../context/firebase/firebase.config";
import Switch from "../Components/DarkModeSidebar";

const navItems = [
  { to: "/dashboard", label: "Overview", icon: <MdOutlineDashboard size={20} /> },
  { to: "/dashboard/all-foods", label: "All Foods", icon: <MdOutlineListAlt size={20} /> },
  { to: "/dashboard/add-food", label: "Add Food", icon: <MdOutlineAddBox size={20} /> },
  { to: "/dashboard/my-foods", label: "My Foods", icon: <MdOutlineInventory size={20} /> },
  { to: "/dashboard/user-profile", label: "User Profile", icon: <MdOutlinePerson size={20} /> },
];

const SidebarContent = ({ collapsed, onClose }) => {
  const [user] = useAuthState(auth);
  const location = useLocation();

  // Close mobile drawer on route change
  useEffect(() => {
    if (onClose) onClose();
  }, [location.pathname]);

  return (
    <div className="flex flex-col h-full">
      {/* Logo + Collapse */}
      <div className="flex items-center justify-between p-5 border-b border-[#ff6347]/20 dark:border-[#ffa500]/20">
        <Link
          to="/"
          className="flex items-center gap-2 text-[#ff6347] dark:text-[#ffa500]"
        >
          <GiFoodTruck size={26} />
          {!collapsed && (
            <span className="text-xl font-bold tracking-wide select-none">
              Foodly
            </span>
          )}
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="text-[#ff6347] dark:text-[#ffa500] p-1 rounded-lg hover:bg-[#ff6347]/10 dark:hover:bg-[#ffa500]/10 transition"
          >
            <MdClose size={22} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {/* Home */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              isActive
                ? "bg-[#ff6347] dark:bg-[#ffa500] text-white dark:text-[#1a1a1a] shadow-sm"
                : "text-[#4b5563] dark:text-[#9ca3af] hover:bg-[#ff6347]/10 dark:hover:bg-[#ffa500]/10 hover:text-[#ff6347] dark:hover:text-[#ffa500]"
            }`
          }
        >
          <MdHome size={20} />
          {!collapsed && <span>Home</span>}
        </NavLink>

        {/* Divider */}
        {!collapsed && (
          <p className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-[#9ca3af] dark:text-[#6b7280]">
            Dashboard
          </p>
        )}

        {navItems.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/dashboard"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-[#ff6347] dark:bg-[#ffa500] text-white dark:text-[#1a1a1a] shadow-sm"
                  : "text-[#4b5563] dark:text-[#9ca3af] hover:bg-[#ff6347]/10 dark:hover:bg-[#ffa500]/10 hover:text-[#ff6347] dark:hover:text-[#ffa500]"
              }`
            }
          >
            {icon}
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom: User Card + Dark Mode */}
      <div className="p-3 border-t border-[#ff6347]/20 dark:border-[#ffa500]/20 space-y-3">
        {/* Dark mode toggle */}
        <div className={`flex ${collapsed ? "justify-center" : "justify-start px-2"}`}>
          <Switch />
        </div>

        {/* User card */}
        {!collapsed && user && (
          <Link
            to="/dashboard/user-profile"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#ff6347]/10 dark:hover:bg-[#ffa500]/10 transition group"
          >
            <img
              src={user?.photoURL || "https://i.ibb.co/5r5C1fJ/user.png"}
              alt="avatar"
              className="w-8 h-8 rounded-full border-2 border-[#ff6347] dark:border-[#ffa500] object-cover shrink-0"
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#111827] dark:text-[#e5e7eb] truncate group-hover:text-[#ff6347] dark:group-hover:text-[#ffa500] transition">
                {user?.displayName || "User"}
              </p>
              <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] truncate">
                {user?.email}
              </p>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
};

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user] = useAuthState(auth);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen flex bg-[#f8f4f0] dark:bg-[#141414] transition-colors duration-300">

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-white dark:bg-[#1c1c1c]
          border-r border-[#fee2d5] dark:border-[#2a2a2a]
          shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <SidebarContent collapsed={false} onClose={() => setMobileOpen(false)} />
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col sticky top-0 h-screen
          bg-white dark:bg-[#1c1c1c]
          border-r border-[#fee2d5] dark:border-[#2a2a2a]
          transition-all duration-300
          ${collapsed ? "w-[72px]" : "w-64"}`}
      >
        <SidebarContent collapsed={collapsed} />

        {/* Desktop collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 z-10
            w-6 h-6 rounded-full
            bg-[#ff6347] dark:bg-[#ffa500]
            text-white dark:text-[#1a1a1a]
            flex items-center justify-center
            text-xs font-bold shadow-md
            hover:scale-110 transition-transform"
          aria-label="Toggle sidebar"
        >
          {collapsed ? "›" : "‹"}
        </button>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 bg-white/80 dark:bg-[#1c1c1c]/80 backdrop-blur-md border-b border-[#fee2d5] dark:border-[#2a2a2a] px-4 lg:px-6 py-3 flex items-center justify-between gap-4">
          {/* Left: hamburger (mobile) + greeting */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl text-[#ff6347] dark:text-[#ffa500] hover:bg-[#ff6347]/10 dark:hover:bg-[#ffa500]/10 transition"
              aria-label="Open menu"
            >
              <MdMenu size={22} />
            </button>
            <div className="min-w-0">
              <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] hidden sm:block">
                {getGreeting()},
              </p>
              <p className="text-sm lg:text-base font-semibold text-[#111827] dark:text-[#e5e7eb] truncate">
                {user?.displayName || user?.email?.split("@")[0] || "Welcome!"}
              </p>
            </div>
          </div>

          {/* Right: avatar */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/dashboard/user-profile"
              className="flex items-center gap-2 hover:opacity-80 transition"
            >
              <img
                src={user?.photoURL || "https://i.ibb.co/5r5C1fJ/user.png"}
                alt="avatar"
                className="w-8 h-8 rounded-full border-2 border-[#ff6347] dark:border-[#ffa500] object-cover"
              />
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto text-[#111827] dark:text-[#e5e7eb] transition-colors duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
