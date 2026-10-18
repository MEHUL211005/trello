import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, X } from "lucide-react";
import toast from "react-hot-toast";

import {
  createPlannerTask,
  deletePlannerTask,
  updatePlannerTask,
} from "../../api/plannerApi";
import FieldError from "../FieldError";
import { inputCls, primaryBtn } from "../card/ui";
import { addDays, toKey } from "../../lib/planner";
import { getErrorMessage } from "../../lib/validation";

const MAX_TITLE = 120;
const MAX_DESCRIPTION = 2000;

const QUICK_DATES = [
  { label: "Today", offset: 0 },
  { label: "Tomorrow", offset: 1 },
  { label: "Next week", offset: 7 },
];

const validate = (values) => {
  const errors = {};
  const title = values.title.trim();

  if (!title) errors.title = "Give the task a title";
  else if (title.length > MAX_TITLE) {
    errors.title = `Keep the title under ${MAX_TITLE} characters`;
  }

  if (!values.date) errors.date = "Choose a date";
  if (values.description.length > MAX_DESCRIPTION) {
    errors.description = `Keep the description under ${MAX_DESCRIPTION} characters`;
  }

  return errors;
};

// Create a task (no `task`) or edit / reschedule / delete one.
function TaskModal({ task, defaultDate, onClose }) {
  const queryClient = useQueryClient();
  const isEditing = !!task;

  const [values, setValues] = useState({
    title: task?.title || "",
    date: task?.date || defaultDate,
    time: task?.time || "",
    description: task?.description || "",
  });
  const [errors, setErrors] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Validation messages tell you what is wrong, then fade away
  useEffect(() => {
    if (Object.keys(errors).length === 0) return undefined;
    const timer = setTimeout(() => setErrors({}), 4000);
    return () => clearTimeout(timer);
  }, [errors]);

  useEffect(() => {
    const onKeyDown = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const set = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const finish = (message) => {
    queryClient.invalidateQueries({ queryKey: ["planner"] });
    toast.success(message);
    onClose();
  };

  const save = useMutation({
    mutationFn: () => {
      const data = {
        title: values.title.trim(),
        date: values.date,
        time: values.time || null,
        description: values.description.trim(),
      };
      return isEditing
        ? updatePlannerTask(task.id, data)
        : createPlannerTask(data);
    },
    onSuccess: () => finish(isEditing ? "Task updated" : "Task added"),
    onError: (error) =>
      toast.error(getErrorMessage(error, "Could not save the task")),
  });

  const remove = useMutation({
    mutationFn: () => deletePlannerTask(task.id),
    onSuccess: () => finish("Task deleted"),
    onError: (error) =>
      toast.error(getErrorMessage(error, "Could not delete the task")),
  });

  const handleSubmit = (event) => {
    event.preventDefault();

    const found = validate(values);
    setErrors(found);

    if (Object.keys(found).length === 0) save.mutate();
  };

  const busy = save.isPending || remove.isPending;
  const err = (field) => (errors[field] ? { message: errors[field] } : null);
  const invalid = (field) =>
    errors[field] ? "!border-red-400 !ring-4 !ring-red-100" : "";

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-start justify-center overflow-y-auto bg-slate-950/50 p-3 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-label={isEditing ? "Edit task" : "New task"}
        onClick={(event) => event.stopPropagation()}
        className="animate-fade-up w-full min-w-0 max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="bg-brand-gradient relative px-6 py-5 text-white">
          <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/10" />
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 z-10 cursor-pointer rounded-lg p-1.5 text-white/80 transition hover:bg-white/15 hover:text-white"
          >
            <X size={20} />
          </button>
          <h2 className="relative text-lg font-extrabold">
            {isEditing ? "Edit task" : "New task"}
          </h2>
          <p className="relative mt-0.5 text-sm text-white/80">
            {isEditing
              ? "Change the details or move it to another day."
              : "Plan something for a day, with or without a time."}
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4 px-6 py-5">
          <div>
            <label htmlFor="task-title" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Title
            </label>
            <input
              id="task-title"
              autoFocus
              value={values.title}
              onChange={set("title")}
              maxLength={MAX_TITLE + 20}
              placeholder="e.g. Send the weekly report"
              className={`${inputCls} ${invalid("title")}`}
            />
            <FieldError error={err("title")} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="task-date" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Date
              </label>
              <input
                id="task-date"
                type="date"
                value={values.date}
                onChange={set("date")}
                className={`${inputCls} ${invalid("date")}`}
              />
              <FieldError error={err("date")} />
            </div>

            <div>
              <label htmlFor="task-time" className="mb-1.5 flex items-center justify-between text-sm font-semibold text-slate-700">
                <span>
                  Time <span className="font-normal text-slate-400">(optional)</span>
                </span>
                {values.time && (
                  <button
                    type="button"
                    onClick={() => setValues((current) => ({ ...current, time: "" }))}
                    className="text-xs font-semibold text-brand-600 hover:underline"
                  >
                    Clear
                  </button>
                )}
              </label>
              <input
                id="task-time"
                type="time"
                value={values.time}
                onChange={set("time")}
                className={inputCls}
              />
            </div>
          </div>

          {/* Reschedule in one tap */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Move to
            </span>
            {QUICK_DATES.map(({ label, offset }) => {
              const key = toKey(addDays(new Date(), offset));
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    setValues((current) => ({ ...current, date: key }));
                    setErrors((current) => ({ ...current, date: undefined }));
                  }}
                  aria-pressed={values.date === key}
                  className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition ${
                    values.date === key
                      ? "border-brand-300 bg-brand-50 text-brand-700"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div>
            <label htmlFor="task-description" className="mb-1.5 flex items-center justify-between text-sm font-semibold text-slate-700">
              <span>
                Description <span className="font-normal text-slate-400">(optional)</span>
              </span>
              <span className={`text-xs font-normal ${values.description.length > MAX_DESCRIPTION ? "text-red-500" : "text-slate-400"}`}>
                {values.description.length}/{MAX_DESCRIPTION}
              </span>
            </label>
            <textarea
              id="task-description"
              rows={3}
              value={values.description}
              onChange={set("description")}
              placeholder="Add any details you want to remember"
              className={`${inputCls} resize-none ${invalid("description")}`}
            />
            <FieldError error={err("description")} />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            {isEditing ? (
              confirmDelete ? (
                <span className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-slate-600">Delete this task?</span>
                  <button
                    type="button"
                    onClick={() => remove.mutate()}
                    disabled={busy}
                    className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-500 disabled:opacity-60"
                  >
                    {remove.isPending ? "Deleting..." : "Yes, delete"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100"
                  >
                    Keep
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                >
                  <Trash2 size={15} />
                  Delete
                </button>
              )
            ) : (
              <span />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
              >
                Cancel
              </button>
              <button type="submit" disabled={busy} className={primaryBtn}>
                {save.isPending ? "Saving..." : isEditing ? "Save changes" : "Add task"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}

export default TaskModal;
