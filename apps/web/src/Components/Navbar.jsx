import { Link, NavLink } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/Provider/AuthProvider";
import { FiLogOut } from "react-icons/fi";
import { HiMenuAlt3, HiX } from "react-icons/hi";
import navLogo from "../assets/nav-logo.png";
import Switch from "./DarkModeSidebar";
import Swal from "sweetalert2";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    const isDark = document.documentElement.classList.contains("dark");
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ff6347",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, logout",
      background: isDark ? "#1f2937" : "#ffffff",
      color: isDark ? "#d1d5db" : "#111827",
    });

    if (result.isConfirmed) {
      try {
        await logout();
        Swal.fire({
          icon: "success",
          title: "Logged out successfully",
          showConfirmButton: false,
          timer: 1500,
          background: isDark ? "#1f2937" : "#ffffff",
          color: isDark ? "#d1d5db" : "#111827",
        });
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Logout Failed",
          text: error.message,
          background: isDark ? "#1f2937" : "#ffffff",
          color: isDark ? "#d1d5db" : "#111827",
        });
      }
    }
  };

  const navItems = (
    <>
      {[
        { path: "/", label: "Home" },
        { path: "/fridge", label: "Fridge" },
        { path: "/about", label: "About" },
        { path: "/contact", label: "Contact" },
      ].map(({ path, label }) => (
        <li key={path}>
          <NavLink
            to={path}
            className={({ isActive }) =>
              isActive
                ? "text-[#ff6347] dark:text-[#ffa500] font-semibold"
                : "hover:text-[#ff6347] dark:hover:text-[#ffa500] transition"
            }
          >
            {label}
          </NavLink>
        </li>
      ))}
    </>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#fffaf5] dark:bg-[#1f1f1f] shadow-md  transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center hover:opacity-80">
            <img
              src={navLogo}
              alt="Food Tracker"
              className="h-10 w-auto"
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex lg:flex-1 lg:justify-center">
            <ul className="flex space-x-8 text-lg font-medium dark:text-white">
              {navItems}
            </ul>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            <Switch />
            {!user ? (
              <div className="hidden sm:flex space-x-3">
                <Link
                  to="/login"
                  className="btn btn-outline btn-sm border-[#ff6347] text-[#ff6347] hover:bg-[#ff6347] hover:text-white dark:border-[#ffa500] dark:text-[#ffa500] dark:hover:bg-[#ffa500] dark:hover:text-black"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="btn btn-sm bg-[#ff6347] text-white hover:bg-[#e5533d] dark:bg-[#ffa500] dark:hover:bg-[#cc8400]"
                >
                  Register
                </Link>
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-3">
                <img
                  src={user.photoURL}
                  alt={user.displayName || "User"}
                  className="w-9 h-9 rounded-full ring-2 ring-[#ff6347]"
                />
                <Link
                  to="/dashboard"
                  className="btn btn-outline btn-sm border-[#ff6347] text-[#ff6347] dark:border-[#ffa500] dark:text-white hover:bg-[#ff6347] hover:text-white dark:hover:bg-[#ffa500] dark:hover:text-black"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn btn-ghost btn-circle text-red-500 dark:text-red-400"
                  aria-label="Logout"
                >
                  <FiLogOut />
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden p-2 rounded-md text-[#ff6347] dark:text-[#ffa500] hover:bg-orange-100 dark:hover:bg-[#333]"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle Menu"
            >
              {menuOpen ? <HiX size={24} /> : <HiMenuAlt3 size={24} />}
            </button>
          </div>
        </div>
      </div>

     
<div
  className={`lg:hidden transition-[max-height] duration-500 ease-in-out overflow-hidden bg-[#fffaf5] dark:bg-[#1f1f1f] ${
    menuOpen ? "max-h-screen py-4" : "max-h-0 py-0"
  }`}
>
  <ul className="space-y-2 px-4 text-lg font-medium dark:text-white">{navItems}</ul>

  {/* Mobile User Info / Login-Logout Buttons */}
  <div className="mt-4 px-4 border-t border-[#ff6347] dark:border-[#ffa500] pt-4">
    {!user ? (
      <div className="flex flex-col space-y-2">
        <Link
          to="/login"
          className="block w-full text-center py-2 rounded border border-[#ff6347] text-[#ff6347] hover:bg-[#ff6347] hover:text-white dark:border-[#ffa500] dark:text-[#ffa500] dark:hover:bg-[#ffa500] dark:hover:text-black"
        >
          Login
        </Link>
        <Link
          to="/signup"
          className="block w-full text-center py-2 rounded bg-[#ff6347] text-white hover:bg-[#e5533d] dark:bg-[#ffa500] dark:hover:bg-[#cc8400]"
        >
          Register
        </Link>
      </div>
    ) : (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 p-3 rounded-md bg-orange-50 dark:bg-[#2a2a2a]">
          <img
            src={user.photoURL}
            alt={user.displayName || "User"}
            className="w-10 h-10 rounded-full ring-2 ring-[#ff6347]"
          />
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-white">
              {user.displayName || "User"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Logged in</p>
          </div>
        </div>
        <Link
          to="/dashboard"
          className="block w-full text-center bg-[#ff6347] text-white py-2 rounded hover:bg-[#e5533d] dark:bg-[#ffa500] dark:hover:bg-[#cc8400]"
        >
          Dashboard
        </Link>
        <button
          onClick={handleLogout}
          className="block w-full text-center py-2 rounded border border-red-500 text-red-500 hover:bg-red-500 hover:text-white dark:border-red-400 dark:text-red-400 dark:hover:bg-red-400 dark:hover:text-black"
        >
          Logout
        </button>
      </div>
    )}
  </div>
</div>

    </nav>
  );
};

export default Navbar;
