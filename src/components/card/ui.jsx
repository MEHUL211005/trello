import { createElement } from "react";
import { X } from "lucide-react";

import { getInitials } from "../../lib/user";

// Soft gradient pairs so every person keeps the same colour everywhere
const AVATAR_GRADIENTS = [
  "from-brand-500 to-fuchsia-500",
  "from-sky-500 to-cyan-400",
  "from-emerald-500 to-teal-400",
  "from-amber-500 to-orange-400",
  "from-rose-500 to-pink-400",
  "from-indigo-500 to-violet-400",
];

export const Avatar = ({ name, id, size = 32, className = "" }) => (
  <span
    title={name}
    style={{ width: size, height: size, fontSize: Math.max(10, size * 0.38) }}
    className={`inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-bold text-white ring-2 ring-white ${
      AVATAR_GRADIENTS[Math.abs(Number(id) || 0) % AVATAR_GRADIENTS.length]
    } ${className}`}
  >
    {getInitials(name)}
  </span>
);

// Section heading: tinted icon tile + title (+ optional right-side action)
export const SectionTitle = ({ icon, title, count, action }) => (
  <div className="mb-3 flex items-center justify-between gap-3">
    <div className="flex items-center gap-2.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
        {createElement(icon, { size: 17 })}
      </span>
      <h3 className="text-[15px] font-bold text-slate-900">{title}</h3>
      {count !== undefined && (
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
          {count}
        </span>
      )}
    </div>
    {action}
  </div>
);

// Small caption above a piece of card metadata
export const MetaLabel = ({ children }) => (
  <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">
    {children}
  </p>
);

// Floating panel used by every toolbar popover
export const Popover = ({
  title,
  onClose,
  children,
  align = "left",
  width = "w-80",
}) => (
  <div
    onClick={(e) => e.stopPropagation()}
    className={`absolute top-full z-50 mt-2 ${width} max-sm:inset-x-0 max-sm:w-auto ${
      align === "right" ? "right-0" : "left-0"
    } animate-fade-up rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl shadow-brand-900/15`}
  >
    <div className="mb-3 flex items-center justify-between">
      <h3 className="text-sm font-bold text-slate-900">{title}</h3>
      <button
        onClick={onClose}
        aria-label="Close"
        className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
      >
        <X size={16} />
      </button>
    </div>
    {children}
  </div>
);

// "Are you sure?" popover for destructive actions
export const ConfirmPopover = ({
  title,
  message,
  confirmLabel = "Delete",
  onConfirm,
  onClose,
  className = "right-0 top-full mt-2",
}) => (
  <div
    onClick={(e) => e.stopPropagation()}
    className={`absolute z-50 w-72 animate-fade-up rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl shadow-brand-900/15 ${className}`}
  >
    <h3 className="text-sm font-bold text-slate-900">{title}</h3>
    <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{message}</p>

    <div className="mt-4 flex justify-end gap-2">
      <button
        onClick={onClose}
        className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        Cancel
      </button>
      <button
        onClick={onConfirm}
        className="rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-semibold text-white shadow-md shadow-rose-600/25 transition hover:bg-rose-500"
      >
        {confirmLabel}
      </button>
    </div>
  </div>
);

export const primaryBtn =
  "bg-brand-gradient rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-md shadow-brand-600/25 transition hover:brightness-110 disabled:opacity-60";

export const ghostBtn =
  "rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100";

export const inputCls =
  "w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100";
