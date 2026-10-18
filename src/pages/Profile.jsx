import { createElement } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarDays,
  FolderKanban,
  KeyRound,
  LayoutGrid,
  Mail,
  Pencil,
  Share2,
  ShieldCheck,
  Star,
} from "lucide-react";

import PageShell from "../components/PageShell";
import { getWorkspaces } from "../api/workspaceApi";
import { getAllBoards } from "../api/boardApi";
import { getInitials } from "../lib/user";

const formatDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const Stat = ({ icon, label, value }) => (
  <div className="rounded-2xl bg-brand-gradient-soft p-4 ring-1 ring-brand-100">
    <span className="text-brand-600">{createElement(icon, { size: 18 })}</span>
    <p className="mt-2 text-3xl font-extrabold text-slate-900">{value}</p>
    <p className="text-sm font-medium text-slate-500">{label}</p>
  </div>
);

const Detail = ({ icon, label, children }) => (
  <div className="flex items-start gap-4 py-4">
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
      {createElement(icon, { size: 18 })}
    </span>
    <div className="min-w-0">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <div className="mt-0.5 break-words text-[15px] font-medium text-slate-800">
        {children}
      </div>
    </div>
  </div>
);

function Profile() {
  const { user } = useSelector((state) => state.auth);

  const { data: workspaceData } = useQuery({
    queryKey: ["workspaces"],
    queryFn: getWorkspaces,
    enabled: !!user,
  });

  const { data: boardData } = useQuery({
    queryKey: ["boards", "all"],
    queryFn: getAllBoards,
    enabled: !!user,
  });

  const boards = boardData?.boards || [];
  const memberSince = formatDate(user?.createdAt);

  if (!user) return null;

  return (
    <PageShell width="max-w-4xl">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {/* Banner. Its soft blobs stay inside it (overflow-hidden) */}
        <div className="bg-brand-gradient relative h-28 overflow-hidden sm:h-36">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)",
              backgroundSize: "20px 20px",
            }}
          />
          <div className="absolute -right-10 -top-16 h-48 w-48 rounded-full bg-white/10" />
          <div className="absolute -bottom-20 right-1/4 h-44 w-44 rounded-full bg-accent-400/30 blur-2xl" />
        </div>

        <div className="px-6 pb-7 sm:px-8">
          {/* Sits above the banner (z-10), pulled up a little so the avatar overlaps its edge */}
          <div className="relative z-10 -mt-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <span className="bg-brand-gradient flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl text-3xl font-extrabold text-white shadow-xl ring-4 ring-white sm:h-28 sm:w-28 sm:text-4xl">
                {getInitials(user.name)}
              </span>

              <div className="sm:pb-1">
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                  {user.name}
                </h1>
                <p className="text-sm text-slate-500">{user.email}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 sm:pb-1">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-50 px-3 py-1.5 text-xs font-bold text-accent-700">
                <ShieldCheck size={14} />
                Verified account
              </span>

              <Link
                to="/settings"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-1.5 text-sm font-semibold text-slate-700 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
              >
                <Pencil size={14} />
                Edit profile
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Stat
              icon={FolderKanban}
              label="Workspaces"
              value={workspaceData?.workspaces?.length ?? 0}
            />
            <Stat icon={LayoutGrid} label="Boards" value={boards.length} />
            <Stat
              icon={Star}
              label="Starred"
              value={boards.filter((board) => board.isStarred).length}
            />
            <Stat
              icon={Share2}
              label="Shared with you"
              value={boards.filter((board) => board.isShared).length}
            />
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Account details</h2>
          <div className="mt-2 divide-y divide-slate-100">
            <Detail icon={Mail} label="Email">
              {user.email}
            </Detail>
            {memberSince && (
              <Detail icon={CalendarDays} label="Member since">
                {memberSince}
              </Detail>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Security</h2>
          <p className="mt-1 text-sm text-slate-500">
            Keep your account safe with a strong, unique password.
          </p>

          <Link
            to="/settings"
            className="mt-5 flex w-full items-center gap-3 rounded-2xl border border-slate-200 p-4 text-left transition hover:border-brand-300 hover:bg-brand-50"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
              <KeyRound size={18} />
            </span>
            <span>
              <span className="block text-sm font-semibold text-slate-900">
                Change password
              </span>
              <span className="block text-xs text-slate-500">
                Update it any time from Settings
              </span>
            </span>
          </Link>
        </section>
      </div>
    </PageShell>
  );
}

export default Profile;
