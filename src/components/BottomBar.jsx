import {
  Inbox,
  CalendarDays,
  LayoutGrid,
  ArrowRightLeft,
} from "lucide-react";

const BottomBar = () => {
  return (
    <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-white px-2 py-2 shadow-2xl">

        {/* Inbox */}
        <button className="flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200">
          <Inbox size={18} />
          <span>Inbox</span>
        </button>

        {/* Planner */}
        <button className="flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200">
          <CalendarDays size={18} />
          <span>Planner</span>
        </button>

        {/* Board (Active) */}
        <button className="flex cursor-pointer items-center gap-2 rounded-xl bg-sky-100 px-4 py-2 text-sm font-semibold text-sky-700">
          <LayoutGrid size={18} />
          <span>Board</span>
        </button>

        {/* Switch Boards */}
        <button className="flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200">
          <ArrowRightLeft size={18} />
          <span>Switch Boards</span>
        </button>

      </div>
    </div>
  );
};

export default BottomBar;