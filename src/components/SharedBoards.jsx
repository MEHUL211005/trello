import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Star, Users } from "lucide-react";

import RoleBadge from "./RoleBadge";
import { getSharedBoards } from "../api/boardApi";
import { useTheme } from "../context/theme";
import { useToggleStar } from "../hooks/useToggleStar";
import { backgroundStyle } from "../lib/boardBackgrounds";
import { timeAgo } from "../lib/time";

// "Shared with you": boards other people invited the user to. They are the
// owner's real boards (not copies), opened through the normal board route.
function SharedBoards({ showWhenEmpty = false }) {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const star = useToggleStar();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["sharedBoards"],
    queryFn: getSharedBoards,
  });

  const boards = data?.boards || [];

  if (!isLoading && !isError && boards.length === 0 && !showWhenEmpty) {
    return null;
  }

  return (
    <section className="mt-10">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-100 text-accent-700">
          <Users size={20} />
        </span>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Shared with you</h2>
          <p className="text-sm text-slate-500">
            Boards other people invited you to collaborate on
          </p>
        </div>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1].map((n) => (
            <div
              key={n}
              className="h-40 animate-pulse rounded-2xl bg-slate-200/70"
            />
          ))}
        </div>
      )}

      {isError && (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          Couldn't load shared boards. Please refresh the page.
        </p>
      )}

      {!isLoading && !isError && boards.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 px-6 py-10 text-center">
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Users size={22} />
          </span>
          <p className="text-base font-bold text-slate-800">
            Nothing shared with you yet
          </p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
            When someone invites you to their board it will show up here, ready
            to open.
          </p>
        </div>
      )}

      {boards.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => (
            <div
              key={board.id}
              role="link"
              tabIndex={0}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                navigate(`/workspace/${board.workspaceId}/board/${board.id}`)
              }
              onClick={() =>
                navigate(`/workspace/${board.workspaceId}/board/${board.id}`)
              }
              className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-700/10"
            >
              <div
                className="relative h-20"
                style={backgroundStyle(board.background, board.id, isDark)}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    star.mutate({ boardId: board.id, starred: !board.isStarred });
                  }}
                  aria-label={board.isStarred ? "Remove from starred" : "Star this board"}
                  title={board.isStarred ? "Remove from starred" : "Star this board"}
                  className="absolute left-3 top-3 rounded-lg bg-white/95 p-1.5 shadow transition hover:scale-110"
                >
                  <Star
                    size={14}
                    className={
                      board.isStarred ? "fill-sun-400 text-sun-400" : "text-slate-500"
                    }
                  />
                </button>
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)",
                    backgroundSize: "18px 18px",
                  }}
                />
                <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-brand-700 shadow-sm">
                  <Users size={11} />
                  Shared
                </span>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="truncate text-base font-bold text-slate-900">
                    {board.name}
                  </h3>
                  <RoleBadge role={board.role} />
                </div>

                <p className="mt-1.5 truncate text-sm text-slate-500">
                  Shared by{" "}
                  <span className="font-semibold text-slate-700">
                    {board.owner?.name || "a former member"}
                  </span>
                </p>
                {board.owner?.email && (
                  <p className="truncate text-xs text-slate-400">
                    {board.owner.email}
                  </p>
                )}

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    {timeAgo(board.sharedAt)}
                  </span>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 transition group-hover:gap-2">
                    Open board <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default SharedBoards;
