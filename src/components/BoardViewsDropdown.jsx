import { useState, useEffect, useRef } from "react";
import {
  ChevronDown,
  LayoutGrid,
  Table2,
  Calendar,
  GanttChartSquare,
  BarChart3,
  Map,
  Crown,
} from "lucide-react";
import { FaTrello } from "react-icons/fa";

const BoardViewsDropdown = () => {
  const dropdownRef = useRef(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-md px-3 py-1.5 hover:bg-white/10 transition text-white cursor-pointer"
      >
        <FaTrello className="text-sky-400" size={16} />

        <span className="text-sm font-medium">
          Board
        </span>

        <ChevronDown size={16} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-80 rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-2xl z-[100000] overflow-hidden">

          {/* Header */}

          <div className="border-b border-slate-200 px-4 py-3">

            <div className="flex items-center gap-2">

              <Crown className="text-yellow-500" size={18} />

              <h3 className="font-semibold text-slate-800">
                Upgrade for Views
              </h3>

            </div>

          </div>

          {/* Views */}

          <div className="p-2 space-y-1">

            {/* Board - active */}

            <button className="w-full flex items-center gap-3 rounded-lg bg-slate-100 px-3 py-2 text-left hover:bg-slate-200 transition cursor-pointer">

              <LayoutGrid size={18} className="text-sky-500" />

              <div>

                <p className="text-sm font-medium text-slate-800">
                  Board
                </p>

                <p className="text-xs text-slate-500">
                  Current view
                </p>

              </div>

            </button>

            {/* Disabled views */}

            <div className="w-full flex items-center gap-3 rounded-lg bg-slate-100 px-3 py-2 opacity-60 cursor-not-allowed">
              <Table2 size={18} className="text-slate-500" />
              <span className="text-sm text-slate-700">Table</span>
            </div>

            <div className="w-full flex items-center gap-3 rounded-lg bg-slate-100 px-3 py-2 opacity-60 cursor-not-allowed">
              <Calendar size={18} className="text-slate-500" />
              <span className="text-sm text-slate-700">Calendar</span>
            </div>

            <div className="w-full flex items-center gap-3 rounded-lg bg-slate-100 px-3 py-2 opacity-60 cursor-not-allowed">
              <GanttChartSquare size={18} className="text-slate-500" />
              <span className="text-sm text-slate-700">Timeline</span>
            </div>

            <div className="w-full flex items-center gap-3 rounded-lg bg-slate-100 px-3 py-2 opacity-60 cursor-not-allowed">
              <BarChart3 size={18} className="text-slate-500" />
              <span className="text-sm text-slate-700">Dashboard</span>
            </div>

            <div className="w-full flex items-center gap-3 rounded-lg bg-slate-100 px-3 py-2 opacity-60 cursor-not-allowed">
              <Map size={18} className="text-slate-500" />
              <span className="text-sm text-slate-700">Map</span>
            </div>

          </div>

          {/* Footer */}

          <div className="border-t border-slate-200 px-4 py-4">

            <p className="text-sm font-medium text-slate-800">
              See your work in new ways
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              View key timelines, assignments, data, and more directly from your
              Trello board with Trello Premium.
            </p>

            <button className="mt-4 w-full rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 transition cursor-pointer">
              Upgrade Workspace to Premium
            </button>

          </div>

        </div>
      )}
    </div>
  );
};

export default BoardViewsDropdown;