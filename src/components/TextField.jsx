import { forwardRef, useId } from "react";

import FieldError from "./FieldError";
import { invalidClass } from "../lib/validation";

// Labelled text input with an optional leading icon and an inline error.
// `error` is the (possibly auto-hidden) react-hook-form error object.
const TextField = forwardRef(function TextField(
  { label, icon: Icon, error, className = "", id, ...props },
  ref,
) {
  const autoId = useId();
  const inputId = id || autoId;

  return (
    <div>
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-sm font-semibold text-slate-700"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <Icon
            size={17}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
        )}

        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error || undefined}
          className={`w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 pr-4 text-[15px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100 ${
            Icon ? "pl-11" : "pl-4"
          } ${invalidClass(error)} ${className}`}
          {...props}
        />
      </div>

      <FieldError error={error} />
    </div>
  );
});

export default TextField;
