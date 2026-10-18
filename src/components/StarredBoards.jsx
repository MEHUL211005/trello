import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Star, Users } from "lucide-react";

import RoleBadge from "./RoleBadge";
import { getStarredBoards } from "../api/boardApi";
import { useTheme } from "../context/theme";
import { useToggleStar } from "../hooks/useToggleStar";
import { backgroundStyle } from "../lib/boardBackgrounds";

// "Starred boards": the user's favourites from every workspace, including
// boards other people shared with them. Shown only when there are some.
function StarredBoards() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const star = useToggleStar();

  const { data, isLoading } = useQuery({
    queryKey: ["starredBoards"],
    queryFn: getStarredBoards,
  });

  const boards = data?.boards || [];

  // Nothing to show until we know there is something: no heading that
  // appears and then vanishes for people without stars
  if (isLoading || boards.length === 0) return null;

  return (
    <section className="mt-10">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-sun-500">
          <Star size={20} className="fill-sun-400" />
        </span>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Starred boards</h2>
          <p className="text-sm text-slate-500">Your favourites, one click away</p>
        </div>
      </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => (
            <div
              key={board.id}
              role="link"
              tabIndex={0}
              onClick={() => navigate(`/workspace/${board.workspaceId}/board/${board.id}`)}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                navigate(`/workspace/${board.workspaceId}/board/${board.id}`)
              }
              className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-700/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <div
                className="relative h-20"
                style={backgroundStyle(board.background, board.id, isDark)}
              >
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)",
                    backgroundSize: "18px 18px",
                  }}
                />
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  star.mutate({ boardId: board.id, starred: false });
                }}
                aria-label={`Remove ${board.name} from starred`}
                title="Remove from starred"
                className="absolute right-3 top-3 rounded-lg bg-white/95 p-2 shadow transition hover:scale-110"
              >
                <Star size={15} className="fill-sun-400 text-sun-400" />
              </button>

              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="truncate text-base font-bold text-slate-900">
                    {board.name}
                  </h3>
                  {board.isShared && <RoleBadge role={board.role} />}
                </div>

                <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-slate-500">
                  {board.isShared ? (
                    <>
                      <Users size={13} className="shrink-0" />
                      Shared by {board.owner?.name || "a former member"}
                    </>
                  ) : (
                    board.workspaceName
                  )}
                </p>

                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 opacity-0 transition group-hover:opacity-100">
                  Open board <ArrowRight size={14} />
                </span>
              </div>
            </div>
          ))}
        </div>
    </section>
  );
}

export default StarredBoards;
