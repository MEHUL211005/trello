import { forwardRef, useId, useState } from "react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";

import FieldError from "./FieldError";
import { invalidClass } from "../lib/validation";

// Password field with a lock icon and a show/hide eye button. It forwards
// its ref, so it works directly with react-hook-form's register().
// `error` is the (possibly auto-hidden) react-hook-form error object.
const PasswordInput = forwardRef(function PasswordInput(
  { label, error, className = "", id, ...props },
  ref,
) {
  const [visible, setVisible] = useState(false);
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
        <LockKeyhole
          size={17}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          ref={ref}
          id={inputId}
          type={visible ? "text" : "password"}
          aria-invalid={!!error || undefined}
          className={`w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 pl-11 pr-12 text-[15px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100 ${invalidClass(error)} ${className}`}
          {...props}
        />

        <button
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      <FieldError error={error} />
    </div>
  );
});

export default PasswordInput;
