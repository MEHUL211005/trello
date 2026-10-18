import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, BarChart3, CalendarClock, CheckCircle2, ListChecks } from "lucide-react";

import { computeInsights } from "../lib/boardInsights";

const Tile = ({ label, value, tone = "text-slate-900", icon, hint }) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
    <div className="flex items-center justify-between">
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      {icon}
    </div>
    <p className={`mt-1 text-2xl font-extrabold ${tone}`}>{value}</p>
    {hint && <p className="text-xs text-slate-400">{hint}</p>}
  </div>
);

const dayLabel = (days) => {
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  if (days > 1) return `Due in ${days} days`;
  return days === -1 ? "1 day overdue" : `${-days} days overdue`;
};

// "Insights" in the board toolbar: how far along the board is, what is late
// and what is coming up. It reads the cards already on screen.
function BoardInsights({ lists }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const onMouseDown = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const insights = useMemo(() => (open ? computeInsights(lists) : null), [open, lists]);
  const maxCount = insights ? Math.max(1, ...insights.perList.map((list) => list.count)) : 1;

  return (
    <div className="relative max-sm:static" ref={wrapperRef}>
      <button
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-label="Insights"
        className={`flex cursor-pointer items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-white transition hover:bg-white/10 ${
          open ? "bg-white/15" : ""
        }`}
      >
        <BarChart3 size={16} className="text-brand-300" />
        <span className="hidden sm:inline">Insights</span>
      </button>

      {open && insights && (
        <div
          role="dialog"
          aria-label="Board insights"
          className="animate-fade-up absolute left-0 top-full z-[10000] mt-2 max-h-[80vh] max-sm:max-h-[calc(100dvh-11rem)] w-[22rem] max-sm:inset-x-3 max-sm:w-auto overflow-y-auto rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-2xl shadow-black/25"
        >
          <div className="border-b border-slate-100 px-4 py-3">
            <h3 className="text-sm font-bold text-slate-900">Board insights</h3>
            <p className="text-xs text-slate-500">
              A quick read on how this board is going
            </p>
          </div>

          {insights.total === 0 ? (
            <div className="px-6 py-10 text-center">
              <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                <BarChart3 size={22} />
              </span>
              <p className="text-sm font-bold text-slate-800">Nothing to measure yet</p>
              <p className="mt-1 text-xs text-slate-500">
                Add some cards and their progress will show up here.
              </p>
            </div>
          ) : (
            <div className="space-y-5 p-4">
              {/* Progress */}
              <div>
                <div className="mb-1.5 flex items-end justify-between">
                  <p className="text-sm font-semibold text-slate-700">Progress</p>
                  <p className="text-sm text-slate-500">
                    <b className="text-lg font-extrabold text-slate-900">
                      {insights.percentDone}%
                    </b>{" "}
                    · {insights.done} of {insights.total} done
                  </p>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      insights.percentDone === 100
                        ? "bg-accent-500"
                        : "bg-gradient-to-r from-brand-500 to-fuchsia-500"
                    }`}
                    style={{ width: `${insights.percentDone}%` }}
                  />
                </div>
              </div>

              {/* Tiles */}
              <div className="grid grid-cols-2 gap-3">
                <Tile
                  label="In progress"
                  value={insights.open}
                  hint="cards still open"
                />
                <Tile
                  label="Completed"
                  value={insights.done}
                  tone="text-accent-600"
                  icon={<CheckCircle2 size={15} className="text-accent-500" />}
                />
                <Tile
                  label="Overdue"
                  value={insights.overdue}
                  tone={insights.overdue > 0 ? "text-rose-600" : "text-slate-900"}
                  icon={
                    <AlertTriangle
                      size={15}
                      className={insights.overdue > 0 ? "text-rose-500" : "text-slate-300"}
                    />
                  }
                />
                <Tile
                  label="Due this week"
                  value={insights.dueThisWeek}
                  icon={<CalendarClock size={15} className="text-brand-500" />}
                />
              </div>

              {insights.checklist.total > 0 && (
                <div className="flex items-center gap-3 rounded-xl bg-slate-50/60 px-3 py-2.5 ring-1 ring-slate-200">
                  <ListChecks size={18} className="text-brand-500" />
                  <p className="text-sm text-slate-600">
                    Checklist items{" "}
                    <b className="text-slate-900">
                      {insights.checklist.done}/{insights.checklist.total}
                    </b>{" "}
                    done
                  </p>
                </div>
              )}

              {/* Cards per list */}
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Cards per list
                </p>
                <ul className="space-y-2">
                  {insights.perList.map((list) => (
                    <li key={list.id}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="truncate font-medium text-slate-700">{list.name}</span>
                        <span className="shrink-0 text-slate-500">{list.count}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-brand-400"
                          style={{ width: `${(list.count / maxCount) * 100}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {insights.needsAttention.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-rose-500">
                    Needs attention
                  </p>
                  <ul className="space-y-1.5">
                    {insights.needsAttention.map((card) => (
                      <li
                        key={card.id}
                        className="flex items-center justify-between gap-3 rounded-lg bg-rose-50 px-3 py-2 text-sm"
                      >
                        <span className="min-w-0">
                          <span className="block truncate font-medium text-slate-800">{card.title}</span>
                          <span className="block truncate text-xs text-slate-500">in {card.listName}</span>
                        </span>
                        <span className="shrink-0 text-xs font-bold text-rose-600">
                          {dayLabel(card.days)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {insights.comingUp.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Coming up
                  </p>
                  <ul className="space-y-1.5">
                    {insights.comingUp.map((card) => (
                      <li
                        key={card.id}
                        className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 text-sm ring-1 ring-slate-100"
                      >
                        <span className="min-w-0">
                          <span className="block truncate font-medium text-slate-800">{card.title}</span>
                          <span className="block truncate text-xs text-slate-500">in {card.listName}</span>
                        </span>
                        <span className="shrink-0 text-xs font-bold text-brand-600">
                          {dayLabel(card.days)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default BoardInsights;
