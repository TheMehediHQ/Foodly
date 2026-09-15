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
  MdChevronLeft,
  MdChevronRight,
} from "react-icons/md";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../context/firebase/firebase.config";
import Switch from "../Components/DarkModeSidebar";
import navLogo from "../assets/nav-logo.png";

// ── nav config ────────────────────────────────────────────────────────────────

const mainNav = [
  { to: "/dashboard",            label: "Overview",     icon: MdOutlineDashboard, end: true },
  { to: "/dashboard/all-foods",  label: "All Foods",    icon: MdOutlineListAlt   },
  { to: "/dashboard/add-food",   label: "Add Food",     icon: MdOutlineAddBox    },
  { to: "/dashboard/my-foods",   label: "My Foods",     icon: MdOutlineInventory },
  { to: "/dashboard/user-profile", label: "Profile",   icon: MdOutlinePerson    },
];

// ── NavItem ───────────────────────────────────────────────────────────────────

const NavItem = ({ to, label, icon: Icon, end, collapsed, onClick }) => (
  <NavLink
    to={to}
    end={end}
    onClick={onClick}
    title={collapsed ? label : undefined}
    className={({ isActive }) =>
      `relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
      ${isActive
        ? "bg-[#ff6347] dark:bg-[#ffa500] text-white dark:text-[#1a1a1a] shadow-sm"
        : "text-[#4b5563] dark:text-[#9ca3af] hover:bg-[#ff6347]/10 dark:hover:bg-[#ffa500]/10 hover:text-[#ff6347] dark:hover:text-[#ffa500]"
      }
      ${collapsed ? "justify-center" : ""}`
    }
  >
    <Icon size={20} className="shrink-0" />
    {!collapsed && <span className="truncate">{label}</span>}

    {/* Tooltip when collapsed */}
    {collapsed && (
      <span className="
        pointer-events-none absolute left-full ml-3 z-50
        px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap
        bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a]
        opacity-0 group-hover:opacity-100
        translate-x-1 group-hover:translate-x-0
        transition-all duration-150 shadow-lg
      ">
        {label}
      </span>
    )}
  </NavLink>
);

// ── SidebarContent ────────────────────────────────────────────────────────────

const SidebarContent = ({ collapsed, onClose }) => {
  const [user] = useAuthState(auth);
  const location = useLocation();

  useEffect(() => {
    if (onClose) onClose();
  }, [location.pathname, onClose]);

  return (
    <div className="flex flex-col h-full">

      {/* ── Logo area ── */}
      <div className={`flex items-center border-b border-[#f0e8e2] dark:border-[#252525] shrink-0
        ${collapsed ? "h-16 justify-center px-3" : "h-16 px-4"}`}
      >
        <Link to="/" className="flex items-center gap-2.5 min-w-0">
          {collapsed ? (
            /* Collapsed: just the "F" icon mark */
            <img
              src="/icon.png"
              alt="Foodly"
              className="w-8 h-8 rounded-lg object-cover"
            />
          ) : (
            /* Expanded: full horizontal logo */
            <img
              src={navLogo}
              alt="Foodly"
              className="h-9 w-auto object-contain select-none"
            />
          )}
        </Link>

        {/* Mobile close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto p-1.5 rounded-lg text-[#9ca3af] hover:text-[#ff6347] dark:hover:text-[#ffa500] hover:bg-[#ff6347]/10 dark:hover:bg-[#ffa500]/10 transition"
          >
            <MdClose size={20} />
          </button>
        )}
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 space-y-0.5">
        {/* Home */}
        <NavItem to="/" label="Home" icon={MdHome} collapsed={collapsed} onClick={onClose} />

        {/* Divider */}
        {!collapsed
          ? <p className="px-3 pt-4 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-[#c4b5a0] dark:text-[#4b5563]">
              Dashboard
            </p>
          : <div className="my-3 mx-2 h-px bg-[#f0e8e2] dark:bg-[#252525]" />
        }

        {mainNav.map((item) => (
          <NavItem key={item.to} {...item} collapsed={collapsed} onClick={onClose} />
        ))}
      </nav>

      {/* ── Bottom: user card ── */}
      <div className="shrink-0 border-t border-[#f0e8e2] dark:border-[#252525] p-3">
        {!collapsed && user ? (
          <Link
            to="/dashboard/user-profile"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#ff6347]/10 dark:hover:bg-[#ffa500]/10 transition group"
            onClick={onClose}
          >
            <img
              src={user?.photoURL || "https://i.ibb.co/5r5C1fJ/user.png"}
              alt="avatar"
              className="w-8 h-8 rounded-full border-2 border-[#ff6347] dark:border-[#ffa500] object-cover shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[#111827] dark:text-[#e5e7eb] truncate group-hover:text-[#ff6347] dark:group-hover:text-[#ffa500] transition-colors">
                {user?.displayName || "User"}
              </p>
              <p className="text-[10px] text-[#9ca3af] dark:text-[#6b7280] truncate">
                {user?.email}
              </p>
            </div>
            <MdChevronRight size={16} className="text-[#d1d5db] dark:text-[#4b5563] group-hover:text-[#ff6347] dark:group-hover:text-[#ffa500] transition-colors shrink-0" />
          </Link>
        ) : (
          user && (
            <Link
              to="/dashboard/user-profile"
              title="Profile"
              className="flex justify-center"
              onClick={onClose}
            >
              <img
                src={user?.photoURL || "https://i.ibb.co/5r5C1fJ/user.png"}
                alt="avatar"
                className="w-8 h-8 rounded-full border-2 border-[#ff6347] dark:border-[#ffa500] object-cover hover:opacity-80 transition"
              />
            </Link>
          )
        )}
      </div>
    </div>
  );
};

// ── DashboardLayout ───────────────────────────────────────────────────────────

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user] = useAuthState(auth);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen flex bg-[#f8f4f0] dark:bg-[#141414] transition-colors duration-300">

      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile sidebar drawer ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-[#1c1c1c]
          border-r border-[#f0e8e2] dark:border-[#252525] shadow-2xl
          transform transition-transform duration-300 ease-in-out lg:hidden
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <SidebarContent collapsed={false} onClose={() => setMobileOpen(false)} />
      </aside>

      {/* ── Desktop sidebar ── */}
      <aside
        className={`hidden lg:flex flex-col sticky top-0 h-screen shrink-0
          bg-white dark:bg-[#1c1c1c]
          border-r border-[#f0e8e2] dark:border-[#252525]
          transition-all duration-300 ease-in-out
          ${collapsed ? "w-[68px]" : "w-60"}`}
      >
        <SidebarContent collapsed={collapsed} />

        {/* Desktop collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={`absolute -right-3.5 top-[4.5rem] z-10
            w-7 h-7 rounded-full shadow-md
            bg-white dark:bg-[#2a2a2a]
            border border-[#f0e8e2] dark:border-[#333]
            text-[#9ca3af] dark:text-[#6b7280]
            hover:text-[#ff6347] dark:hover:text-[#ffa500]
            hover:border-[#ff6347]/40 dark:hover:border-[#ffa500]/40
            flex items-center justify-center
            transition-all duration-200`}
        >
          {collapsed
            ? <MdChevronRight size={16} />
            : <MdChevronLeft size={16} />
          }
        </button>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* ── Topbar ── */}
        <header className="sticky top-0 z-20
          bg-white/80 dark:bg-[#1c1c1c]/80 backdrop-blur-md
          border-b border-[#f0e8e2] dark:border-[#252525]
          px-4 lg:px-6 h-16 flex items-center justify-between gap-4 shrink-0"
        >
          {/* Left: hamburger (mobile) + greeting */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl text-[#6b7280] dark:text-[#9ca3af] hover:bg-[#ff6347]/10 dark:hover:bg-[#ffa500]/10 hover:text-[#ff6347] dark:hover:text-[#ffa500] transition"
              aria-label="Open menu"
            >
              <MdMenu size={22} />
            </button>

            <div className="min-w-0 hidden sm:block">
              <p className="text-xs text-[#9ca3af] dark:text-[#6b7280]">
                {getGreeting()},
              </p>
              <p className="text-sm font-semibold text-[#111827] dark:text-[#e5e7eb] truncate">
                {user?.displayName || user?.email?.split("@")[0] || "Welcome!"}
              </p>
            </div>
          </div>

          {/* Right: theme toggle + avatar → profile */}
          <div className="flex items-center gap-3 shrink-0">
            <Switch />
            <div className="h-5 w-px bg-[#f0e8e2] dark:bg-[#252525]" />
            <Link
              to="/dashboard/user-profile"
              className="flex items-center gap-2.5 hover:opacity-80 transition shrink-0"
            >
              <img
                src={user?.photoURL || "https://i.ibb.co/5r5C1fJ/user.png"}
                alt="avatar"
                className="w-8 h-8 rounded-full border-2 border-[#ff6347] dark:border-[#ffa500] object-cover"
              />
              <div className="hidden md:block text-right">
                <p className="text-xs font-semibold text-[#111827] dark:text-[#e5e7eb] leading-tight">
                  {user?.displayName?.split(" ")[0] || "User"}
                </p>
                <p className="text-[10px] text-[#9ca3af] dark:text-[#6b7280]">View profile</p>
              </div>
            </Link>
          </div>
        </header>

        {/* ── Page content ── */}
        <main className="flex-1 overflow-y-auto text-[#111827] dark:text-[#e5e7eb] transition-colors duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
