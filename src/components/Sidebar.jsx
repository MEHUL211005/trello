import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import {
  CalendarDays,
  Home,
  LayoutGrid,
  LogOut,
  Settings,
  Share2,
  Sparkles,
  Star,
  UsersRound,
} from "lucide-react";

import LogoutDialog from "./LogoutDialog";
import { getWorkspaces } from "../api/workspaceApi";
import { useLogout } from "../hooks/useLogout";
import { sidebarQuote } from "../lib/quotes";
import { coverFor } from "../lib/theme";

const MAX_WORKSPACES = 6;

const itemClass = (active) =>
  `flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
    active
      ? "bg-brand-50 text-brand-700 shadow-sm ring-1 ring-brand-100"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  }`;

const SectionLabel = ({ children }) => (
  <p className="px-3 pb-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
    {children}
  </p>
);

// The sidebar's content. Used by the desktop sidebar and by the mobile
// drawer; `onNavigate` lets the drawer close itself after a click.
export function SidebarNav({ onNavigate }) {
  const { pathname, search } = useLocation();
  const { user } = useSelector((state) => state.auth);
  const logout = useLogout();

  const [showLogout, setShowLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const { data } = useQuery({
    queryKey: ["workspaces"],
    queryFn: getWorkspaces,
    enabled: !!user,
  });

  const workspaces = data?.workspaces || [];
  const view = new URLSearchParams(search).get("view");
  const quote = sidebarQuote();

  const items = [
    { to: "/dashboard", label: "Home", icon: Home, active: pathname === "/dashboard" },
    {
      to: "/boards",
      label: "Boards",
      icon: LayoutGrid,
      active: pathname === "/boards" && !view,
    },
    {
      to: "/boards?view=starred",
      label: "Starred",
      icon: Star,
      active: pathname === "/boards" && view === "starred",
    },
    {
      to: "/boards?view=shared",
      label: "Shared with me",
      icon: Share2,
      active: pathname === "/boards" && view === "shared",
    },
    {
      to: "/planner",
      label: "Planner",
      icon: CalendarDays,
      active: pathname === "/planner",
    },
  ];

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
  };

  return (
    <>
      <div className="flex-1 space-y-6 overflow-y-auto">
        <nav className="space-y-1">
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={itemClass(item.active)}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Workspaces */}
        <div>
          <SectionLabel>Workspaces</SectionLabel>

          <div className="space-y-1">
            {workspaces.length === 0 && (
              <p className="px-3 py-2 text-xs text-slate-400">
                No workspaces yet
              </p>
            )}

            {workspaces.slice(0, MAX_WORKSPACES).map((workspace) => (
              <Link
                key={workspace.id}
                to={`/workspace/${workspace.id}`}
                onClick={onNavigate}
                className={itemClass(
                  pathname.startsWith(`/workspace/${workspace.id}`),
                )}
              >
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-bold text-white"
                  style={{ background: coverFor(workspace.id) }}
                >
                  {workspace.name.charAt(0).toUpperCase()}
                </span>
                <span className="truncate">{workspace.name}</span>
              </Link>
            ))}

            {workspaces.length > MAX_WORKSPACES && (
              <Link
                to="/dashboard"
                onClick={onNavigate}
                className="block px-3 py-1.5 text-xs font-semibold text-brand-600 hover:underline"
              >
                View all {workspaces.length} workspaces
              </Link>
            )}
          </div>
        </div>

        {/* People + account */}
        <div>
          <SectionLabel>Account</SectionLabel>

          <div className="space-y-1">
            <Link
              to="/members"
              onClick={onNavigate}
              className={itemClass(pathname === "/members")}
            >
              <UsersRound size={18} />
              <span>Members</span>
            </Link>

            <Link
              to="/settings"
              onClick={onNavigate}
              className={itemClass(pathname === "/settings")}
            >
              <Settings size={18} />
              <span>Settings</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom: a daily quote (when there is room) and log out */}
      <div className="mt-4 shrink-0 space-y-3">
        <div className="bg-brand-gradient relative overflow-hidden rounded-2xl p-4 text-white [@media(max-height:780px)]:hidden">
          <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/15" />
          <Sparkles size={16} className="mb-2 text-accent-200" />
          <p className="text-[13px] font-medium italic leading-relaxed">
            “{quote.text}”
          </p>
          <p className="mt-2 text-xs text-white/75">— {quote.author}</p>
        </div>

        <button
          onClick={() => setShowLogout(true)}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
        >
          <LogOut size={18} />
          <span>Log out</span>
        </button>
      </div>

      {showLogout && (
        <LogoutDialog
          busy={loggingOut}
          onConfirm={handleLogout}
          onCancel={() => setShowLogout(false)}
        />
      )}
    </>
  );
}

// Desktop sidebar (hidden on small screens, where the navbar button opens
// the same content as a drawer)
const Sidebar = () => (
  <aside className="sticky top-14 hidden h-[calc(100vh-56px)] w-72 shrink-0 flex-col border-r border-slate-200 bg-white px-4 py-5 md:flex">
    <SidebarNav />
  </aside>
);

export default Sidebar;
