// A round loading indicator. `tone` picks the colours for a dark or light
// background; the text is only for screen readers.
const TONES = {
  light: "border-white/20 border-t-white",
  brand: "border-brand-100 border-t-brand-600",
};

function Spinner({ size = 44, tone = "light", label = "Loading", className = "" }) {
  return (
    <span className={`inline-flex items-center justify-center ${className}`}>
      <span
        aria-hidden="true"
        style={{ width: size, height: size }}
        className={`animate-spin rounded-full border-4 ${TONES[tone]}`}
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export default Spinner;
