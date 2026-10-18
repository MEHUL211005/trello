import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { LayoutGrid, Plus, Search, Share2, Star } from "lucide-react";

import PageShell, { PageHeader } from "../components/PageShell";
import BoardTile from "../components/BoardTile";
import CreateBoardPopover from "../components/CreateBoardPopover";
import { getAllBoards } from "../api/boardApi";
import { getErrorMessage } from "../lib/validation";

const VIEWS = [
  { key: "all", label: "All boards", icon: LayoutGrid },
  { key: "starred", label: "Starred", icon: Star },
  { key: "shared", label: "Shared with me", icon: Share2 },
];

const EMPTY = {
  all: {
    title: "No boards yet",
    text: "Create your first board to start planning.",
  },
  starred: {
    title: "No starred boards",
    text: "Tap the star on any board to keep it here, one click away.",
  },
  shared: {
    title: "Nothing shared with you yet",
    text: "When someone invites you to a board it will show up here.",
  },
};

function Boards() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);

  const requested = params.get("view");
  const view = VIEWS.some((v) => v.key === requested) ? requested : "all";

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["boards", "all"],
    queryFn: getAllBoards,
    // Boards are created, shared and starred elsewhere, so always look again
    refetchOnMount: "always",
  });

  const boards = useMemo(() => data?.boards || [], [data]);

  const counts = useMemo(
    () => ({
      all: boards.length,
      starred: boards.filter((b) => b.isStarred).length,
      shared: boards.filter((b) => b.isShared).length,
    }),
    [boards],
  );

  const visible = useMemo(() => {
    const text = query.trim().toLowerCase();

    return boards.filter((board) => {
      if (view === "starred" && !board.isStarred) return false;
      if (view === "shared" && !board.isShared) return false;
      if (!text) return true;

      return `${board.name} ${board.workspaceName} ${board.owner?.name || ""}`
        .toLowerCase()
        .includes(text);
    });
  }, [boards, view, query]);

  const selectView = (key) => {
    setParams(key === "all" ? {} : { view: key });
  };

  return (
    <PageShell>
      <PageHeader
        icon={LayoutGrid}
        title="Boards"
        subtitle="Every board you own or have been invited to"
        action={
          <div className="relative">
            <button
              onClick={() => setCreating((open) => !open)}
              className="bg-brand-gradient flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-600/25 transition hover:brightness-110"
            >
              <Plus size={16} />
              New board
            </button>

            {creating && <CreateBoardPopover onClose={() => setCreating(false)} />}
          </div>
        }
      />

      {/* Tabs + search */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div
          role="tablist"
          className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm"
        >
          {VIEWS.map((item) => (
            <button
              key={item.key}
              role="tab"
              aria-selected={view === item.key}
              onClick={() => selectView(item.key)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                view === item.key
                  ? "bg-brand-50 text-brand-700 shadow-sm ring-1 ring-brand-100"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              }`}
            >
              <item.icon size={15} />
              {item.label}
              <span className="rounded-full bg-slate-100 px-1.5 text-xs text-slate-500">
                {counts[item.key]}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search boards..."
            aria-label="Search boards"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
          />
        </div>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((n) => (
            <div key={n} className="h-44 animate-pulse rounded-2xl bg-slate-200/70" />
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-8 text-center">
          <p className="font-semibold text-rose-700">
            {getErrorMessage(error, "Could not load your boards")}
          </p>
          <button
            onClick={() => refetch()}
            className="mt-3 rounded-lg bg-white px-4 py-1.5 text-sm font-semibold text-rose-600 shadow-sm ring-1 ring-rose-200 hover:bg-rose-50"
          >
            Try again
          </button>
        </div>
      )}

      {!isLoading && !isError && visible.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((board) => (
            <BoardTile key={board.id} board={board} />
          ))}
        </div>
      )}

      {!isLoading && !isError && visible.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <p className="text-lg font-bold text-slate-800">
            {query.trim() ? "No boards match your search" : EMPTY[view].title}
          </p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
            {query.trim() ? "Try a different name, or clear the search." : EMPTY[view].text}
          </p>
        </div>
      )}
    </PageShell>
  );
}

export default Boards;
