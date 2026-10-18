import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArchiveRestore, Loader2 } from "lucide-react";

import { getArchivedItems } from "../api/boardApi";
import { useArchive } from "../hooks/useArchive";
import { getErrorMessage } from "../lib/validation";

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
    : "";

// Archived cards and lists of a board, with a Restore button for people who
// can edit it. Lives inside the board menu.
function ArchivedItems({ boardId, canEdit }) {
  const [tab, setTab] = useState("cards");
  const [busyKey, setBusyKey] = useState(null);
  const { restore } = useArchive(boardId);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["board", boardId, "archived"],
    queryFn: () => getArchivedItems(boardId),
  });

  const cards = data?.cards || [];
  const lists = data?.lists || [];
  const items = tab === "cards" ? cards : lists;

  const handleRestore = async (kind, id) => {
    setBusyKey(`${kind}-${id}`);
    await restore(kind, id);
    setBusyKey(null);
  };

  return (
    <div>
      <div role="tablist" className="flex gap-1 border-b border-slate-100 px-3 pt-2">
        {[
          ["cards", `Cards (${cards.length})`],
          ["lists", `Lists (${lists.length})`],
        ].map(([key, label]) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={`cursor-pointer rounded-t-lg px-3 py-2 text-xs font-bold transition ${
              tab === key
                ? "border-b-2 border-brand-600 text-brand-700"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="max-h-[50vh] overflow-y-auto p-3">
        {isLoading && (
          <p className="flex items-center justify-center gap-2 py-8 text-xs font-medium text-slate-500">
            <Loader2 size={14} className="animate-spin" />
            Loading archived items...
          </p>
        )}

        {isError && (
          <div className="rounded-lg bg-red-50 px-3 py-3 text-xs text-red-700">
            {getErrorMessage(error, "Could not load archived items")}
            <button
              onClick={() => refetch()}
              className="ml-2 cursor-pointer font-semibold underline"
            >
              Try again
            </button>
          </div>
        )}

        {!isLoading && !isError && items.length === 0 && (
          <p className="py-8 text-center text-xs font-medium text-slate-400">
            {tab === "cards" ? "No archived cards" : "No archived lists"}
          </p>
        )}

        {!isLoading && !isError && (
          <ul className="space-y-2">
            {items.map((item) => {
              const kind = tab === "cards" ? "card" : "list";
              const key = `${kind}-${item.id}`;

              return (
                <li
                  key={key}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {kind === "card" ? item.title : item.name}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {kind === "card"
                        ? `in ${item.listName}`
                        : `${item.cardCount} card${item.cardCount === 1 ? "" : "s"}`}
                      {item.archivedAt && ` · archived ${formatDate(item.archivedAt)}`}
                    </p>
                  </div>

                  {canEdit && (
                    <button
                      onClick={() => handleRestore(kind, item.id)}
                      disabled={busyKey === key}
                      aria-label={`Restore ${kind === "card" ? item.title : item.name}`}
                      className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-lg bg-brand-50 px-2.5 py-1.5 text-xs font-bold text-brand-700 transition hover:bg-brand-100 disabled:opacity-60"
                    >
                      {busyKey === key ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <ArchiveRestore size={13} />
                      )}
                      Restore
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {!canEdit && items.length > 0 && (
          <p className="mt-3 text-center text-[11px] text-slate-400">
            Only editors can restore items.
          </p>
        )}
      </div>
    </div>
  );
}

export default ArchivedItems;
