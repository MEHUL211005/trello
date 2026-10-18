import { createElement } from "react";
import { Loader2 } from "lucide-react";

// Full-width gradient submit button with a spinner while `loading`
const PrimaryButton = ({
  loading = false,
  loadingText,
  icon,
  children,
  className = "",
  ...props
}) => (
  <button
    disabled={loading}
    className={`bg-brand-gradient group flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[15px] font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:brightness-110 hover:shadow-brand-600/40 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 ${className}`}
    {...props}
  >
    {loading && <Loader2 size={18} className="animate-spin" />}
    {!loading && icon && createElement(icon, { size: 18 })}
    {loading ? loadingText || children : children}
  </button>
);

export default PrimaryButton;
