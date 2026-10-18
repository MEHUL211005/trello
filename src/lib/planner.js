// Date helpers for the Planner. Days are plain local calendar days, written
// "YYYY-MM-DD" (the same format the server stores), so there are no time
// zone surprises.

const pad = (n) => String(n).padStart(2, "0");

export const toKey = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const fromKey = (key) => {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const addDays = (date, days) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

// Weeks start on Monday
export const startOfWeek = (date) => addDays(date, -((date.getDay() + 6) % 7));

export const startOfMonth = (date) =>
  new Date(date.getFullYear(), date.getMonth(), 1);

export const addMonths = (date, months) =>
  new Date(date.getFullYear(), date.getMonth() + months, 1);

// The days shown for a month: whole weeks, 5 or 6 of them
export const monthDays = (cursor) => {
  const first = startOfMonth(cursor);
  const start = startOfWeek(first);
  const last = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
  const weeks = Math.ceil(((last - start) / 86400000 + 1) / 7);

  return Array.from({ length: weeks * 7 }, (_, i) => addDays(start, i));
};

export const weekDays = (cursor) => {
  const start = startOfWeek(cursor);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
};

export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const formatMonth = (date) =>
  date.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

export const formatWeek = (days) => {
  const [first, last] = [days[0], days[6]];
  const sameMonth = first.getMonth() === last.getMonth();
  const short = { day: "numeric", month: "short" };

  return `${first.toLocaleDateString("en-IN", sameMonth ? { day: "numeric" } : short)} – ${last.toLocaleDateString("en-IN", { ...short, year: "numeric" })}`;
};

export const formatLongDate = (key) =>
  fromKey(key).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

// "14:30" -> "2:30 pm"
export const formatTime = (time) => {
  if (!time) return "";
  const [hours, minutes] = time.split(":").map(Number);
  return new Date(2000, 0, 1, hours, minutes)
    .toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })
    .toLowerCase();
};

// Where a task stands right now: "done", "overdue", "today" or "upcoming".
// A task for today whose time has passed counts as overdue.
export const taskStatus = (task, now = new Date()) => {
  if (task.isDone) return "done";

  const today = toKey(now);
  if (task.date < today) return "overdue";

  if (task.date === today) {
    const nowTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    return task.time && task.time < nowTime ? "overdue" : "today";
  }

  return "upcoming";
};

// Group tasks by day: { "2026-11-03": [task, ...] }
export const groupByDate = (tasks) =>
  tasks.reduce((groups, task) => {
    (groups[task.date] ||= []).push(task);
    return groups;
  }, {});

// Colours for each status: a calendar chip, and a small dot
export const STATUS_STYLES = {
  overdue: {
    chip: "border-rose-200 bg-rose-50 text-rose-700",
    dot: "bg-rose-500",
    label: "Overdue",
  },
  today: {
    chip: "border-brand-200 bg-brand-50 text-brand-700",
    dot: "bg-brand-500",
    label: "Today",
  },
  upcoming: {
    chip: "border-slate-200 bg-white text-slate-700",
    dot: "bg-slate-400",
    label: "Upcoming",
  },
  done: {
    chip: "border-slate-200 bg-slate-50 text-slate-400 line-through",
    dot: "bg-slate-300",
    label: "Done",
  },
};
