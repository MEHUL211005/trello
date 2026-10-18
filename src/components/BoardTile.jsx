import { useNavigate } from "react-router-dom";
import { ArrowRight, Star, Users } from "lucide-react";

import RoleBadge from "./RoleBadge";
import { useTheme } from "../context/theme";
import { useToggleStar } from "../hooks/useToggleStar";
import { backgroundStyle } from "../lib/boardBackgrounds";

// One board in a grid: its background, name, where it lives (or who shared
// it) and a star. Used by the Boards page.
function BoardTile({ board }) {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const star = useToggleStar();

  const open = () => navigate(`/workspace/${board.workspaceId}/board/${board.id}`);

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={open}
      onKeyDown={(e) => e.key === "Enter" && open()}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-700/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
    >
      <div
        className="relative h-24"
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

        <button
          onClick={(e) => {
            e.stopPropagation();
            star.mutate({ boardId: board.id, starred: !board.isStarred });
          }}
          aria-label={board.isStarred ? "Remove from starred" : "Star this board"}
          title={board.isStarred ? "Remove from starred" : "Star this board"}
          className="absolute right-3 top-3 rounded-lg bg-white/95 p-2 shadow transition hover:scale-110"
        >
          <Star
            size={15}
            className={
              board.isStarred ? "fill-sun-400 text-sun-400" : "text-slate-500"
            }
          />
        </button>
      </div>

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
  );
}

export default BoardTile;
