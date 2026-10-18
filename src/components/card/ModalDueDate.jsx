import { CalendarClock } from "lucide-react";

import { MetaLabel } from "./ui";
import { daysUntil } from "../../lib/time";

// Colour and wording tell the story: done, overdue, due soon, or later
const getStatus = (dueDate, isCompleted) => {
  if (isCompleted) {
    return { text: "Completed", tone: "bg-accent-50 text-accent-700 ring-accent-200" };
  }

  const days = daysUntil(dueDate);

  if (days < 0) {
    return {
      text: days === -1 ? "Overdue by 1 day" : `Overdue by ${-days} days`,
      tone: "bg-rose-50 text-rose-700 ring-rose-200",
    };
  }
  if (days === 0) {
    return { text: "Due today", tone: "bg-amber-50 text-amber-700 ring-amber-200" };
  }
  if (days <= 2) {
    return {
      text: days === 1 ? "Due tomorrow" : "Due in 2 days",
      tone: "bg-amber-50 text-amber-700 ring-amber-200",
    };
  }

  return { text: `In ${days} days`, tone: "bg-slate-100 text-slate-600 ring-slate-200" };
};

function ModalDueDate({ dueDate, isCompleted }) {
  if (!dueDate) {
    return null;
  }

  const status = getStatus(dueDate, isCompleted);

  return (
    <div>
      <MetaLabel>Due date</MetaLabel>

      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 shadow-sm">
          <CalendarClock size={16} className="text-brand-600" />
          {new Date(dueDate).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>

        <span
          className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${status.tone}`}
        >
          {status.text}
        </span>
      </div>
    </div>
  );
}

export default ModalDueDate;
