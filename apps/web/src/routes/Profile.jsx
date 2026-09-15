import { useState, useMemo, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../context/firebase/firebase.config";
import { updateProfile } from "firebase/auth";
import { Navigate, Link } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/Provider/AuthProvider";
import axiosSecure from "../api/axios";
import {
  User,
  Mail,
  ImageIcon,
  Shield,
  Pencil,
  CheckCircle2,
  Loader2,
  LogOut,
  X,
  Info,
  Package,
  Leaf,
  LayoutGrid,
  AlertTriangle,
  Clock,
  ChevronRight,
  Camera,
} from "lucide-react";

// ── helpers ───────────────────────────────────────────────────────────────────

const isExpired = (d) => d && new Date(d) < new Date();
const isExpiringSoon = (d) => {
  if (!d) return false;
  const diff = new Date(d) - new Date();
  return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000;
};

const inputCls =
  "w-full px-3.5 py-2.5 rounded-xl border text-sm text-[#111827] dark:text-[#e5e7eb] bg-white dark:bg-[#1c1c1c] placeholder-[#9ca3af] dark:placeholder-[#6b7280] border-[#f0e8e2] dark:border-[#2a2a2a] focus:outline-none focus:ring-2 focus:ring-[#ff6347]/30 dark:focus:ring-[#ffa500]/30 focus:border-[#ff6347] dark:focus:border-[#ffa500] transition-all";

const errorBorder =
  "border-red-400 dark:border-red-700 focus:border-red-400 focus:ring-red-200/40 dark:focus:ring-red-900/40";

// ── Stat card ─────────────────────────────────────────────────────────────────

const StatCard = ({ icon: Icon, label, value, color, delay }) => (
  <Motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.35 }}
    className="bg-white dark:bg-[#1c1c1c] rounded-2xl border border-[#f0e8e2] dark:border-[#2a2a2a] p-4 flex items-center gap-4 shadow-sm"
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 ${color}`}>
      <Icon size={18} />
    </div>
    <div>
      <p className="text-2xl font-bold text-[#111827] dark:text-[#e5e7eb]">{value}</p>
      <p className="text-xs text-[#9ca3af] dark:text-[#6b7280]">{label}</p>
    </div>
  </Motion.div>
);

// ── Photo preview ─────────────────────────────────────────────────────────────

const PhotoPreview = ({ url, fallback }) => {
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState(false);
  const src = url || fallback;

  useEffect(() => { setOk(false); setErr(false); }, [src]);

  return (
    <div className="relative w-24 h-24 mx-auto">
      {/* Ring */}
      <div className="absolute inset-0 rounded-full ring-4 ring-[#ff6347] dark:ring-[#ffa500] ring-offset-2 dark:ring-offset-[#1c1c1c]" />
      {/* Spinner while loading */}
      {!ok && !err && (
        <div className="absolute inset-0 rounded-full bg-[#fdf8f5] dark:bg-[#1a1a1a] flex items-center justify-center">
          <Loader2 size={18} className="animate-spin text-[#ff6347] dark:text-[#ffa500]" />
        </div>
      )}
      <img
        src={src}
        alt="avatar"
        onLoad={() => { setOk(true); setErr(false); }}
        onError={() => { setErr(true); setOk(true); }}
        className={`w-24 h-24 rounded-full object-cover transition-opacity duration-300 ${ok ? "opacity-100" : "opacity-0"}`}
      />
      {/* Camera overlay */}
      <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#ff6347] dark:bg-[#ffa500] flex items-center justify-center shadow-md">
        <Camera size={13} className="text-white dark:text-[#1a1a1a]" />
      </div>
    </div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────

const Profile = () => {
  const [user, authLoading] = useAuthState(auth);
  const { logout } = useAuth();

  // Edit form state
  const [name, setName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);
  const [nameError, setNameError] = useState("");

  // Food stats
  const [myFoods, setMyFoods] = useState([]);
  const [foodsLoading, setFoodsLoading] = useState(true);

  // Logout confirm
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (!user?.email) return;
    (async () => {
      try {
        const res = await axiosSecure.get("/foods");
        if (res.data.ok) {
          setMyFoods(
            res.data.data.filter(
              (f) => f.userEmail?.toLowerCase() === user.email.toLowerCase()
            )
          );
        }
      } catch { /* silent */ } finally {
        setFoodsLoading(false);
      }
    })();
  }, [user?.email]);

  const stats = useMemo(() => ({
    total: myFoods.length,
    fresh: myFoods.filter((f) => !isExpired(f.expiryDate)).length,
    expired: myFoods.filter((f) => isExpired(f.expiryDate)).length,
    soon: myFoods.filter((f) => isExpiringSoon(f.expiryDate)).length,
  }), [myFoods]);

  const profileItems = useMemo(() => [
    { label: "Display name set", done: !!user?.displayName },
    { label: "Profile photo added", done: !!user?.photoURL },
    { label: "Email verified", done: !!user?.emailVerified },
    { label: "First food added", done: myFoods.length > 0 },
  ], [user, myFoods]);

  const completion = Math.round(
    (profileItems.filter((i) => i.done).length / profileItems.length) * 100
  );

  // auth loading check

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 rounded-full border-4 border-gray-200 dark:border-zinc-700 border-t-[#ff6347] dark:border-t-[#ffa500] animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;

  // ── save handler ────────────────────────────────────────────────────────────

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim() && !photoURL.trim()) {
      setNameError("Enter a new name or photo URL to update.");
      return;
    }
    setNameError("");
    setSaveError("");
    setSaving(true);
    try {
      await updateProfile(user, {
        displayName: name.trim() || user.displayName,
        photoURL: photoURL.trim() || user.photoURL,
      });
      setSaved(true);
      setName("");
      setPhotoURL("");
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setSaveError(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try { await logout(); } catch { setLoggingOut(false); }
  };

  const joinedDate = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString("en-US", {
        month: "long", day: "numeric", year: "numeric",
      })
    : null;

  return (
    <div className="px-4 py-6 lg:px-8 lg:py-8 max-w-6xl mx-auto space-y-6">

      {/* ── Page header ── */}
      <Motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl lg:text-3xl font-bold text-[#111827] dark:text-[#e5e7eb]">User Profile</h1>
        <p className="text-sm text-[#6b7280] dark:text-[#9ca3af] mt-0.5">Manage your account information</p>
      </Motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left column ── */}
        <div className="space-y-5">

          {/* Avatar card */}
          <Motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="bg-white dark:bg-[#1c1c1c] rounded-2xl border border-[#f0e8e2] dark:border-[#2a2a2a] shadow-sm p-6 text-center"
          >
            <PhotoPreview url={photoURL} fallback={user?.photoURL || "https://i.ibb.co/5r5C1fJ/user.png"} />

            <h2 className="mt-4 text-lg font-bold text-[#111827] dark:text-[#e5e7eb]">
              {user?.displayName || "Anonymous"}
            </h2>
            <p className="text-sm text-[#9ca3af] dark:text-[#6b7280] truncate">{user.email}</p>

            {joinedDate && (
              <p className="mt-2 text-xs text-[#9ca3af] dark:text-[#6b7280]">
                Joined {joinedDate}
              </p>
            )}

            {/* Email verified badge */}
            <div className="mt-3 flex items-center justify-center gap-1.5">
              {user?.emailVerified ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full">
                  <CheckCircle2 size={12} /> Email verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-full">
                  <AlertTriangle size={12} /> Email not verified
                </span>
              )}
            </div>
          </Motion.div>

          {/* Profile completion card */}
          <Motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white dark:bg-[#1c1c1c] rounded-2xl border border-[#f0e8e2] dark:border-[#2a2a2a] shadow-sm p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[#374151] dark:text-[#d1d5db]">Profile Setup</h3>
              <span className="text-sm font-bold text-[#ff6347] dark:text-[#ffa500]">{completion}%</span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-[#f3f4f6] dark:bg-[#2a2a2a] rounded-full mb-4 overflow-hidden">
              <Motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#ff6347] to-[#ffa500]"
                initial={{ width: 0 }}
                animate={{ width: `${completion}%` }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
              />
            </div>

            <ul className="space-y-2">
              {profileItems.map(({ label, done }) => (
                <li key={label} className="flex items-center gap-2.5 text-xs">
                  {done
                    ? <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                    : <div className="w-3.5 h-3.5 rounded-full border-2 border-[#d1d5db] dark:border-[#4b5563] shrink-0" />
                  }
                  <span className={done ? "text-[#374151] dark:text-[#d1d5db]" : "text-[#9ca3af] dark:text-[#6b7280]"}>
                    {label}
                  </span>
                </li>
              ))}
            </ul>
          </Motion.div>

          {/* Danger zone */}
          <Motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="bg-white dark:bg-[#1c1c1c] rounded-2xl border border-[#f0e8e2] dark:border-[#2a2a2a] shadow-sm p-5"
          >
            <h3 className="text-sm font-semibold text-[#374151] dark:text-[#d1d5db] mb-3">Account</h3>
            <button
              onClick={() => setConfirmLogout(true)}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-900 text-sm font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition group"
            >
              <span className="flex items-center gap-2">
                <LogOut size={15} /> Sign out
              </span>
              <ChevronRight size={14} className="text-red-300 dark:text-red-800 group-hover:text-red-500 dark:group-hover:text-red-400 transition" />
            </button>
          </Motion.div>
        </div>

        {/* ── Right column ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Stats row */}
          {!foodsLoading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <StatCard delay={0.1} icon={Package} label="Total foods" value={stats.total} color="bg-[#ff6347] dark:bg-[#cc4a33]" />
              <StatCard delay={0.15} icon={Leaf} label="Fresh items" value={stats.fresh} color="bg-emerald-500 dark:bg-emerald-700" />
              <StatCard delay={0.2} icon={AlertTriangle} label="Expired" value={stats.expired} color="bg-red-500 dark:bg-red-700" />
            </div>
          )}

          {/* Edit profile form */}
          <Motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="bg-white dark:bg-[#1c1c1c] rounded-2xl border border-[#f0e8e2] dark:border-[#2a2a2a] shadow-sm"
          >
            {/* Card header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-[#f0e8e2] dark:border-[#2a2a2a]">
              <div className="w-8 h-8 rounded-lg bg-[#ff6347]/10 dark:bg-[#ffa500]/10 flex items-center justify-center text-[#ff6347] dark:text-[#ffa500]">
                <Pencil size={15} />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[#111827] dark:text-[#e5e7eb]">Edit Profile</h2>
                <p className="text-xs text-[#9ca3af] dark:text-[#6b7280]">Update your display name and photo</p>
              </div>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              {/* Read-only email */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#9ca3af] dark:text-[#6b7280]">
                  <Mail size={12} /> Email
                </label>
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-[#f0e8e2] dark:border-[#2a2a2a] bg-[#fdf8f5] dark:bg-[#1a1a1a] text-sm text-[#6b7280] dark:text-[#9ca3af]">
                  <Shield size={14} className="text-[#d1d5db] dark:text-[#4b5563] shrink-0" />
                  <span className="truncate">{user.email}</span>
                  <span className="ml-auto text-[10px] font-medium text-[#9ca3af] dark:text-[#6b7280] bg-[#f3f4f6] dark:bg-[#2a2a2a] px-2 py-0.5 rounded-full whitespace-nowrap">
                    Read-only
                  </span>
                </div>
              </div>

              {/* Display name */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#9ca3af] dark:text-[#6b7280]">
                  <User size={12} /> Display Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setNameError(""); }}
                  placeholder={user?.displayName || "Enter display name"}
                  autoComplete="off"
                  className={`${inputCls} ${nameError ? errorBorder : ""}`}
                />
                <p className="text-[10px] text-[#9ca3af] dark:text-[#6b7280]">
                  Current: <span className="font-medium text-[#6b7280] dark:text-[#9ca3af]">{user?.displayName || "Not set"}</span>
                </p>
              </div>

              {/* Photo URL */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#9ca3af] dark:text-[#6b7280]">
                  <ImageIcon size={12} /> Profile Photo URL
                </label>
                <input
                  type="url"
                  value={photoURL}
                  onChange={(e) => setPhotoURL(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  autoComplete="off"
                  className={inputCls}
                />
                <p className="text-[10px] text-[#9ca3af] dark:text-[#6b7280]">
                  Live preview updates on the left as you type
                </p>
              </div>

              {/* Inline errors/success */}
              <AnimatePresence>
                {nameError && (
                  <Motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl px-4 py-2.5"
                  >
                    <Info size={13} /> {nameError}
                  </Motion.div>
                )}
                {saveError && (
                  <Motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl px-4 py-2.5"
                  >
                    <Info size={13} /> {saveError}
                  </Motion.div>
                )}
                {saved && (
                  <Motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-xl px-4 py-2.5"
                  >
                    <CheckCircle2 size={13} /> Profile updated successfully!
                  </Motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#ff6347] hover:bg-[#e5533d] dark:bg-[#ffa500] dark:hover:bg-[#cc8400] text-white dark:text-[#1a1a1a] text-sm font-semibold transition-all shadow-sm hover:shadow-md active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <><Loader2 size={15} className="animate-spin" /> Saving…</>
                ) : saved ? (
                  <><CheckCircle2 size={15} /> Saved!</>
                ) : (
                  <><Pencil size={15} /> Save Changes</>
                )}
              </button>
            </form>
          </Motion.div>

          {/* Quick links */}
          <Motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.18 }}
            className="bg-white dark:bg-[#1c1c1c] rounded-2xl border border-[#f0e8e2] dark:border-[#2a2a2a] shadow-sm p-5"
          >
            <h3 className="text-sm font-semibold text-[#374151] dark:text-[#d1d5db] mb-3">Quick Links</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { to: "/dashboard", label: "Dashboard", icon: LayoutGrid, color: "text-violet-500 bg-violet-50 dark:bg-violet-950/30" },
                { to: "/dashboard/my-foods", label: "My Foods", icon: Package, color: "text-[#ff6347] bg-[#ff6347]/10 dark:bg-[#ff6347]/10" },
                { to: "/dashboard/add-food", label: "Add Food", icon: Leaf, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30" },
              ].map(({ to, label, icon: Icon, color }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-[#f0e8e2] dark:border-[#2a2a2a] hover:border-[#ff6347]/30 dark:hover:border-[#ffa500]/30 hover:shadow-sm transition group"
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                    <Icon size={13} />
                  </div>
                  <span className="text-xs font-medium text-[#374151] dark:text-[#d1d5db] group-hover:text-[#ff6347] dark:group-hover:text-[#ffa500] transition">{label}</span>
                  <ChevronRight size={12} className="ml-auto text-[#d1d5db] dark:text-[#4b5563] group-hover:text-[#ff6347] dark:group-hover:text-[#ffa500] transition" />
                </Link>
              ))}
            </div>
          </Motion.div>
        </div>
      </div>

      {/* ── Logout confirm modal ── */}
      <AnimatePresence>
        {confirmLogout && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && setConfirmLogout(false)}
          >
            <Motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white dark:bg-[#1c1c1c] rounded-2xl border border-[#f0e8e2] dark:border-[#2a2a2a] shadow-2xl w-full max-w-sm p-6"
            >
              {/* Close */}
              <button
                onClick={() => setConfirmLogout(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-[#9ca3af] hover:text-[#ff6347] dark:hover:text-[#ffa500] hover:bg-[#ff6347]/10 transition"
              >
                <X size={16} />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/40 flex items-center justify-center text-red-500 mx-auto mb-4">
                <LogOut size={22} />
              </div>
              <h3 className="text-base font-semibold text-[#111827] dark:text-[#e5e7eb] text-center mb-1">
                Sign out?
              </h3>
              <p className="text-sm text-center text-[#6b7280] dark:text-[#9ca3af] mb-6">
                You'll need to sign in again to access your dashboard.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmLogout(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#f0e8e2] dark:border-[#2a2a2a] text-sm font-semibold text-[#6b7280] dark:text-[#9ca3af] hover:border-[#ff6347]/40 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition disabled:opacity-60"
                >
                  {loggingOut
                    ? <><Loader2 size={14} className="animate-spin" /> Signing out…</>
                    : <><LogOut size={14} /> Sign out</>
                  }
                </button>
              </div>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
