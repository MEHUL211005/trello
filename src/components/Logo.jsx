import { useId } from "react";

// TaskSphere mark: a rounded tile holding an orbit and a check
export const LogoMark = ({ size = 36, className = "" }) => {
  const id = useId();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5b3be0" />
          <stop offset="0.55" stopColor="#7f4df2" />
          <stop offset="1" stopColor="#c04df0" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill={`url(#${id})`} />
      <ellipse
        cx="32"
        cy="32"
        rx="22"
        ry="9"
        fill="none"
        stroke="#fff"
        strokeOpacity=".45"
        strokeWidth="2.5"
        transform="rotate(-24 32 32)"
      />
      <path
        d="M21 33.5l7.5 7.5L44 25"
        fill="none"
        stroke="#fff"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="49" cy="17" r="4" fill="#22dcba" />
    </svg>
  );
};

// Mark + wordmark. `light` is for dark or coloured backgrounds.
const Logo = ({
  size = 36,
  light = false,
  large = false,
  showText = true,
  className = "",
}) => (
  <span className={`inline-flex items-center gap-2.5 ${className}`}>
    <LogoMark size={size} />
    {showText && (
      <span
        className={`font-display font-extrabold tracking-tight ${
          large ? "text-[1.75rem]" : "text-[1.15rem]"
        } ${
          light ? "text-white" : "text-slate-900"
        }`}
        style={{ fontFamily: "var(--font-display)" }}
      >
        Task<span className={light ? "text-accent-300" : "text-brand-600"}>Sphere</span>
      </span>
    )}
  </span>
);

export default Logo;
