import { Filter, Search, Check } from "lucide-react";
import { useEffect, useRef } from "react";

const BoardFilterDropdown = ({
  filters,
  setFilters,
  availableLabels = [],
  open,
  setOpen,
}) => { 
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const toggleFilter = (key) => {
    setFilters((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleLabel = (labelId) => {
    setFilters((prev) => ({
      ...prev,
      labels: prev.labels.includes(labelId)
        ? prev.labels.filter((id) => id !== labelId)
        : [...prev.labels, labelId],
    }));
  };

  const clearFilters = () => {
    setFilters({
      keyword: "",
      completed: false,
      incomplete: false,
      overdue: false,
      nextWeek: false,
      nextMonth: false,
      labels: [],
    });
  };

  return (
    <div className="relative" ref={wrapperRef}>
     <button
  onClick={() => setOpen(!open)}
  className="flex items-center justify-center p-2 rounded-md hover:bg-white/10 cursor-pointer"
>
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="15" y2="12" />
    <line x1="3" y1="18" x2="10" y2="18" />
  </svg>
</button>

      {open && (
<div className="absolute right-0 top-full mt-2 w-80 max-h-[80vh] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl z-[10000]">          {/* Header */}
          <div className="border-b border-slate-100 px-4 py-3">
            <h3 className="text-sm font-semibold text-slate-800">Filter</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Narrow down cards on this board
            </p>
          </div>

<div className="max-h-[65vh] overflow-y-auto px-4 py-4 custom-scrollbar">            
            <div className="mb-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Keyword
              </p>

              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={filters.keyword || ""}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      keyword: e.target.value,
                    }))
                  }
                  placeholder="Enter a keyword..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Card Status */}
            <div className="mb-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Card status
              </p>

              <div className="space-y-2">
                <label className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={filters.completed}
                    onChange={() => toggleFilter("completed")}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />

                  <span className="text-sm text-slate-700">
                    Marked as complete
                  </span>
                </label>

                <label className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={filters.incomplete}
                    onChange={() => toggleFilter("incomplete")}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />

                  <span className="text-sm text-slate-700">
                    Not marked as complete
                  </span>
                </label>
              </div>
            </div>

            {/* Due dates */}
            <div className="mb-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Due dates
              </p>

              <div className="space-y-2">
                <label className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={filters.overdue}
                    onChange={() => toggleFilter("overdue")}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />

                  <span className="text-sm text-slate-700">Overdue</span>
                </label>

                <label className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={filters.nextWeek}
                    onChange={() => toggleFilter("nextWeek")}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />

                  <span className="text-sm text-slate-700">
                    Due in the next week
                  </span>
                </label>

                <label className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={filters.nextMonth}
                    onChange={() => toggleFilter("nextMonth")}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />

                  <span className="text-sm text-slate-700">
                    Due in the next month
                  </span>
                </label>
              </div>
            </div>

            {/* Labels */}
            <div className="mb-2">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Labels
              </p>

              <div className="space-y-2">
                {availableLabels.map((label) => {
                  const selected = filters.labels.includes(label.id);

                  return (
                    <button
                      key={label.id}
                      type="button"
                      onClick={() => toggleLabel(label.id)}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition ${
                        selected
                          ? "bg-slate-50 ring-2 ring-blue-100"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="h-4 w-4 rounded-full border border-black/10"
                          style={{ backgroundColor: label.color }}
                        />

                        <span className="text-sm font-medium text-slate-700">
                          {label.name}
                        </span>
                      </div>

                      {selected && (
                        <Check size={16} className="text-blue-600" />
                      )}
                    </button>
                  );
                })}

                {availableLabels.length === 0 && (
                  <p className="rounded-xl bg-slate-50 px-3 py-3 text-sm text-slate-500">
                    No labels found
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 p-4">
            <button
              onClick={clearFilters}
              className="w-full rounded-xl bg-slate-100 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
            >
              Clear all filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardFilterDropdown;
