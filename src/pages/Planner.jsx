import { useMemo, useState } from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock,
  Plus,
} from "lucide-react";
import toast from "react-hot-toast";

import PageShell, { PageHeader } from "../components/PageShell";
import TaskModal from "../components/planner/TaskModal";
import { primaryBtn } from "../components/card/ui";
import { getPlannerAgenda, getPlannerTasks, setPlannerTaskDone } from "../api/plannerApi";
import {
  STATUS_STYLES,
  WEEKDAYS,
  addDays,
  addMonths,
  formatLongDate,
  formatMonth,
  formatTime,
  formatWeek,
  fromKey,
  groupByDate,
  monthDays,
  taskStatus,
  toKey,
  weekDays,
} from "../lib/planner";
import { getErrorMessage } from "../lib/validation";

const VIEW_KEY = "tasksphere-planner-view";
const MAX_CHIPS = 3;

const readView = () => {
  try {
    return localStorage.getItem(VIEW_KEY) === "week" ? "week" : "month";
  } catch {
    return "month";
  }
};

// One task as a row: tick to finish, click to edit
function TaskRow({ task, now, onOpen, onToggle, showDate = false }) {
  const status = taskStatus(task, now);
  const style = STATUS_STYLES[status];

  return (
    <div className={`flex items-start gap-2.5 rounded-xl border p-2.5 ${style.chip}`}>
      <button
        onClick={() => onToggle(task)}
        aria-label={task.isDone ? "Mark as not done" : "Mark as done"}
        className="mt-0.5 shrink-0 cursor-pointer rounded-full transition hover:scale-110"
      >
        {task.isDone ? (
          <CheckCircle2 size={18} className="text-green-600" />
        ) : (
          <Circle size={18} className="opacity-60" />
        )}
      </button>

      <button
        onClick={() => onOpen(task)}
        className="min-w-0 flex-1 cursor-pointer text-left"
        title="Edit task"
      >
        <span className="block break-words text-sm font-semibold leading-snug">
          {task.title}
        </span>

        <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs opacity-80 no-underline">
          {showDate && (
            <span>
              {fromKey(task.date).toLocaleDateString("en-IN", {
                weekday: "short",
                day: "numeric",
                month: "short",
              })}
            </span>
          )}
          {task.time && (
            <span className="inline-flex items-center gap-1">
              <Clock size={11} />
              {formatTime(task.time)}
            </span>
          )}
          {status === "overdue" && (
            <span className="font-bold uppercase tracking-wide">Overdue</span>
          )}
        </span>

        {task.description && (
          <span className="mt-1 line-clamp-2 block text-xs opacity-75">
            {task.description}
          </span>
        )}
      </button>
    </div>
  );
}

// A small clickable label inside a month cell
function Chip({ task, now, onOpen }) {
  const style = STATUS_STYLES[taskStatus(task, now)];

  return (
    <button
      onClick={(event) => {
        event.stopPropagation();
        onOpen(task);
      }}
      title={`${task.time ? `${formatTime(task.time)} · ` : ""}${task.title}`}
      className={`hidden w-full cursor-pointer items-center gap-1 truncate rounded-md border px-1.5 py-0.5 text-left text-[11px] font-semibold sm:flex ${style.chip}`}
    >
      {task.time && <span className="shrink-0 opacity-75">{formatTime(task.time)}</span>}
      <span className="truncate">{task.title}</span>
    </button>
  );
}

const SectionHeading = ({ children, count, tone = "text-slate-500" }) => (
  <h3 className={`mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] ${tone}`}>
    {children}
    <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">
      {count}
    </span>
  </h3>
);

function Planner() {
  const queryClient = useQueryClient();
  const now = new Date();
  const todayKey = toKey(now);

  const [view, setViewState] = useState(readView);
  const [cursor, setCursor] = useState(() => new Date());
  const [selected, setSelected] = useState(todayKey);
  const [modal, setModal] = useState(null); // { task?, date }

  const setView = (next) => {
    setViewState(next);
    try {
      localStorage.setItem(VIEW_KEY, next);
    } catch {
      /* the choice just isn't remembered */
    }
  };

  const days = useMemo(
    () => (view === "month" ? monthDays(cursor) : weekDays(cursor)),
    [view, cursor],
  );
  const from = toKey(days[0]);
  const to = toKey(days[days.length - 1]);

  const range = useQuery({
    queryKey: ["planner", "range", from, to],
    queryFn: () => getPlannerTasks(from, to),
    placeholderData: keepPreviousData,
  });

  const agenda = useQuery({
    queryKey: ["planner", "agenda", todayKey],
    queryFn: () => getPlannerAgenda(todayKey, 30),
  });

  const toggle = useMutation({
    mutationFn: (task) => setPlannerTaskDone(task.id, !task.isDone),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["planner"] }),
    onError: (error) => toast.error(getErrorMessage(error, "Could not update the task")),
  });

  const byDate = useMemo(() => groupByDate(range.data?.tasks || []), [range.data]);

  // ---- agenda groups ----
  const allAgenda = [...(agenda.data?.overdue || []), ...(agenda.data?.upcoming || [])];
  const overdue = allAgenda.filter((task) => taskStatus(task, now) === "overdue");
  const today = allAgenda.filter(
    (task) => task.date === todayKey && taskStatus(task, now) !== "overdue",
  );
  const upcomingByDate = groupByDate(allAgenda.filter((task) => task.date > todayKey));
  const upcomingDates = Object.keys(upcomingByDate).sort();
  const upcomingCount = upcomingDates.reduce((n, key) => n + upcomingByDate[key].length, 0);

  const dayLabel = (key) => {
    if (key === toKey(addDays(now, 1))) return "Tomorrow";
    return fromKey(key).toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "short",
    });
  };

  // ---- navigation ----
  const step = (direction) =>
    setCursor((current) =>
      view === "month" ? addMonths(current, direction) : addDays(current, 7 * direction),
    );

  const goToday = () => {
    setCursor(new Date());
    setSelected(todayKey);
  };

  const title = view === "month" ? formatMonth(cursor) : formatWeek(days);
  const openNew = (date) => setModal({ date: date || selected });
  const openTask = (task) => setModal({ task, date: task.date });
  const rowProps = { now, onOpen: openTask, onToggle: (task) => toggle.mutate(task) };

  const selectedTasks = byDate[selected] || [];

  return (
    <PageShell width="max-w-7xl">
      <PageHeader
        icon={CalendarDays}
        title="Planner"
        subtitle="Schedule tasks and keep track of what's coming up"
        action={
          <button onClick={() => openNew()} className={`${primaryBtn} inline-flex items-center gap-1.5`}>
            <Plus size={16} />
            New task
          </button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_21rem]">
        {/* ================= CALENDAR ================= */}
        <section className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={goToday}
                className="cursor-pointer rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Today
              </button>
              <div className="flex items-center rounded-xl border border-slate-200 bg-white">
                <button
                  onClick={() => step(-1)}
                  aria-label={view === "month" ? "Previous month" : "Previous week"}
                  className="cursor-pointer rounded-l-xl p-2 text-slate-600 transition hover:bg-slate-50"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => step(1)}
                  aria-label={view === "month" ? "Next month" : "Next week"}
                  className="cursor-pointer rounded-r-xl p-2 text-slate-600 transition hover:bg-slate-50"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
              <h2 className="ml-1 text-lg font-extrabold tracking-tight text-slate-900" aria-live="polite">
                {title}
              </h2>
            </div>

            <div role="tablist" aria-label="Calendar view" className="flex rounded-xl border border-slate-200 bg-white p-1">
              {["month", "week"].map((key) => (
                <button
                  key={key}
                  role="tab"
                  aria-selected={view === key}
                  onClick={() => setView(key)}
                  className={`cursor-pointer rounded-lg px-3.5 py-1.5 text-sm font-semibold capitalize transition ${
                    view === key
                      ? "bg-brand-50 text-brand-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>

          {range.isError && !range.data && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-6 text-center text-sm text-red-700">
              {getErrorMessage(range.error, "Could not load your tasks")}
              <button onClick={() => range.refetch()} className="ml-2 cursor-pointer font-semibold underline">
                Try again
              </button>
            </div>
          )}

          {/* ----- MONTH ----- */}
          {view === "month" && !(range.isError && !range.data) && (
            <div
              data-testid="month-grid"
              className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-opacity ${
                range.isFetching ? "opacity-80" : ""
              }`}
            >
              <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
                {WEEKDAYS.map((day) => (
                  <div key={day} className="px-1 py-2 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7">
                {days.map((day, index) => {
                  const key = toKey(day);
                  const tasks = byDate[key] || [];
                  const inMonth = day.getMonth() === cursor.getMonth();
                  const isToday = key === todayKey;
                  const isSelected = key === selected;
                  const dots = tasks.slice(0, 3);

                  return (
                    <div
                      key={key}
                      data-date={key}
                      onClick={() => setSelected(key)}
                      onDoubleClick={() => openNew(key)}
                      className={`min-h-[4.5rem] cursor-pointer border-slate-100 p-1 transition sm:min-h-[6.75rem] sm:p-1.5 ${
                        index % 7 !== 6 ? "border-r" : ""
                      } ${index < days.length - 7 ? "border-b" : ""} ${
                        isSelected ? "bg-brand-50/60" : "hover:bg-slate-50"
                      } ${inMonth ? "" : "bg-slate-50/50"}`}
                    >
                      <div className="flex items-center justify-between">
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelected(key);
                          }}
                          aria-label={formatLongDate(key)}
                          aria-current={isToday ? "date" : undefined}
                          className={`flex h-6 min-w-6 cursor-pointer items-center justify-center rounded-full px-1 text-xs font-bold ${
                            isToday
                              ? "bg-brand-gradient text-white shadow"
                              : inMonth
                                ? "text-slate-700"
                                : "text-slate-300"
                          } ${isSelected && !isToday ? "ring-2 ring-brand-300" : ""}`}
                        >
                          {day.getDate()}
                        </button>
                        {tasks.length > 0 && (
                          <span className="hidden text-[10px] font-semibold text-slate-400 sm:inline">
                            {tasks.length}
                          </span>
                        )}
                      </div>

                      <div className="mt-1 space-y-0.5">
                        {tasks.slice(0, MAX_CHIPS).map((task) => (
                          <Chip key={task.id} task={task} now={now} onOpen={openTask} />
                        ))}
                        {tasks.length > MAX_CHIPS && (
                          <p className="hidden px-1 text-[11px] font-semibold text-slate-500 sm:block">
                            +{tasks.length - MAX_CHIPS} more
                          </p>
                        )}

                        {/* Phones: just coloured dots, details below */}
                        {tasks.length > 0 && (
                          <div className="flex justify-center gap-0.5 pt-1 sm:hidden">
                            {dots.map((task) => (
                              <span
                                key={task.id}
                                className={`h-1.5 w-1.5 rounded-full ${STATUS_STYLES[taskStatus(task, now)].dot}`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Selected day (month view) */}
          {view === "month" && (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-extrabold text-slate-900">
                  {selected === todayKey ? "Today · " : ""}
                  {formatLongDate(selected)}
                </h3>
                <button
                  onClick={() => openNew(selected)}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-brand-50 px-2.5 py-1.5 text-xs font-bold text-brand-700 transition hover:bg-brand-100"
                >
                  <Plus size={14} />
                  Add task
                </button>
              </div>

              {selectedTasks.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-200 py-5 text-center text-sm text-slate-400">
                  Nothing planned for this day.
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedTasks.map((task) => (
                    <TaskRow key={task.id} task={task} {...rowProps} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ----- WEEK ----- */}
          {view === "week" && !(range.isError && !range.data) && (
            <div
              data-testid="week-grid"
              className={`grid gap-3 transition-opacity lg:grid-cols-7 ${range.isFetching ? "opacity-80" : ""}`}
            >
              {days.map((day) => {
                const key = toKey(day);
                const tasks = byDate[key] || [];
                const isToday = key === todayKey;

                return (
                  <div
                    key={key}
                    data-date={key}
                    className={`flex min-w-0 flex-col rounded-2xl border bg-white p-2.5 shadow-sm ${
                      isToday ? "border-brand-300 ring-2 ring-brand-100" : "border-slate-200"
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between gap-2 lg:block">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        {WEEKDAYS[(day.getDay() + 6) % 7]}
                      </p>
                      <p
                        className={`text-lg font-extrabold leading-tight ${
                          isToday ? "text-brand-600" : "text-slate-900"
                        }`}
                      >
                        {day.getDate()}{" "}
                        <span className="text-xs font-semibold text-slate-400">
                          {day.toLocaleDateString("en-IN", { month: "short" })}
                        </span>
                      </p>
                    </div>

                    <div className="min-h-[3rem] flex-1 space-y-1.5">
                      {tasks.length === 0 && (
                        <p className="py-2 text-center text-xs text-slate-300">No tasks</p>
                      )}
                      {tasks.map((task) => (
                        <TaskRow key={task.id} task={task} {...rowProps} />
                      ))}
                    </div>

                    <button
                      onClick={() => openNew(key)}
                      className="mt-2 cursor-pointer rounded-lg py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-brand-700"
                    >
                      + Add
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ================= AGENDA ================= */}
        <aside className="min-w-0 space-y-5" aria-label="Upcoming tasks">
          {agenda.isError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
              {getErrorMessage(agenda.error, "Could not load upcoming tasks")}
              <button onClick={() => agenda.refetch()} className="ml-2 cursor-pointer font-semibold underline">
                Try again
              </button>
            </div>
          )}

          {agenda.isLoading && (
            <p className="rounded-2xl border border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-400">
              Loading your tasks...
            </p>
          )}

          {agenda.data && (
            <>
              {overdue.length > 0 && (
                <div className="rounded-2xl border border-rose-200 bg-white p-4 shadow-sm">
                  <SectionHeading count={overdue.length} tone="text-rose-600">
                    Overdue
                  </SectionHeading>
                  <div className="space-y-2">
                    {overdue.map((task) => (
                      <TaskRow key={task.id} task={task} showDate {...rowProps} />
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-brand-200 bg-white p-4 shadow-sm">
                <SectionHeading count={today.length} tone="text-brand-600">
                  Today
                </SectionHeading>
                {today.length === 0 ? (
                  <p className="py-2 text-sm text-slate-400">Nothing else planned for today.</p>
                ) : (
                  <div className="space-y-2">
                    {today.map((task) => (
                      <TaskRow key={task.id} task={task} {...rowProps} />
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <SectionHeading count={upcomingCount}>Coming up · next 30 days</SectionHeading>
                {upcomingCount === 0 ? (
                  <p className="py-2 text-sm text-slate-400">
                    No upcoming tasks. Add one with &ldquo;New task&rdquo;.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {upcomingDates.map((key) => (
                      <div key={key}>
                        <p className="mb-1.5 text-xs font-bold text-slate-500">{dayLabel(key)}</p>
                        <div className="space-y-2">
                          {upcomingByDate[key].map((task) => (
                            <TaskRow key={task.id} task={task} {...rowProps} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </aside>
      </div>

      {modal && (
        <TaskModal
          key={modal.task?.id ?? "new"}
          task={modal.task}
          defaultDate={modal.date}
          onClose={() => setModal(null)}
        />
      )}
    </PageShell>
  );
}

export default Planner;
