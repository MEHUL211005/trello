import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { LogOut, Moon, Settings, Sun, UserRound } from "lucide-react";

import LogoutDialog from "./LogoutDialog";
import { useTheme } from "../context/theme";
import { useLogout } from "../hooks/useLogout";
import { getInitials } from "../lib/user";

const ProfileMenu = () => {
  const [open, setOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const logout = useLogout();

  const { user } = useSelector((state) => state.auth);

  const menuRef = useRef(null);

  // Close on an outside click or Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
  };

  if (!user) return null;

  const go = (path) => {
    setOpen(false);
    navigate(path);
  };

  const row =
    "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100";

  return (
    <div className="relative" ref={menuRef}>
      {/* AVATAR */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Open profile menu"
        className="bg-brand-gradient flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-sm font-bold text-white shadow-md shadow-brand-600/30 ring-2 ring-white/70 transition hover:brightness-110"
      >
        {getInitials(user.name)}
      </button>

      {/* DROPDOWN */}
      {open && (
        <div className="absolute right-0 z-[1000] mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-xl shadow-brand-900/10">
          {/* USER INFO */}
          <div className="flex items-center gap-3 border-b border-slate-100 bg-brand-gradient-soft px-4 py-3.5">
            <span className="bg-brand-gradient flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white">
              {getInitials(user.name)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                {user.name}
              </p>
              <p className="truncate text-xs text-slate-500">{user.email}</p>
            </div>
          </div>

          <div className="p-1.5">
            <button onClick={() => go("/profile")} className={row}>
              <UserRound size={16} />
              My profile
            </button>

            <button onClick={() => go("/settings")} className={row}>
              <Settings size={16} />
              Settings
            </button>

            <button
              role="switch"
              aria-checked={isDark}
              onClick={toggleTheme}
              className={row}
            >
              {isDark ? <Moon size={16} /> : <Sun size={16} />}
              <span className="flex-1">Dark mode</span>
              <span
                className={`relative h-5 w-9 rounded-full transition-colors duration-200 ${
                  isDark ? "bg-brand-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all duration-200 ${
                    isDark ? "left-[18px]" : "left-0.5"
                  }`}
                />
              </span>
            </button>

            <button
              onClick={() => {
                setShowConfirm(true);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-rose-600 transition hover:bg-rose-50"
            >
              <LogOut size={16} />
              Log out
            </button>
          </div>
        </div>
      )}

      {showConfirm && (
        <LogoutDialog
          busy={loggingOut}
          onConfirm={handleLogout}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
};

export default ProfileMenu;
