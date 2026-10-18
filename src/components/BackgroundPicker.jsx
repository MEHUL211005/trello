import { Check } from "lucide-react";

import {
  GRADIENT_BACKGROUNDS,
  SOLID_BACKGROUNDS,
} from "../lib/boardBackgrounds";

const Swatch = ({ option, selected, disabled, onSelect, round = false }) => (
  <button
    type="button"
    role="radio"
    aria-checked={selected}
    aria-label={option.label}
    title={option.label}
    disabled={disabled}
    onClick={() => onSelect(option.key)}
    className={`group relative aspect-[4/3] w-full overflow-hidden transition duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
      round ? "rounded-full" : "rounded-lg"
    } ${
      selected
        ? "ring-2 ring-brand-600 ring-offset-2 scale-[1.03]"
        : "ring-1 ring-black/10 enabled:hover:scale-105"
    }`}
    style={{ background: option.css }}
  >
    {selected && (
      <span className="absolute inset-0 flex items-center justify-center bg-black/15">
        <Check size={16} className="text-white drop-shadow" strokeWidth={3} />
      </span>
    )}
  </button>
);

// Grid of background choices: gradients first, then plain colours.
// `value` is the chosen key; `onChange(key)` is called on a pick.
function BackgroundPicker({ value, onChange, disabled = false }) {
  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.1em] text-slate-400">
          Gradients
        </p>
        <div
          role="radiogroup"
          aria-label="Gradient backgrounds"
          className="grid grid-cols-4 gap-2"
        >
          {GRADIENT_BACKGROUNDS.map((option) => (
            <Swatch
              key={option.key}
              option={option}
              selected={value === option.key}
              disabled={disabled}
              onSelect={onChange}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.1em] text-slate-400">
          Colours
        </p>
        <div
          role="radiogroup"
          aria-label="Colour backgrounds"
          className="grid grid-cols-5 gap-2"
        >
          {SOLID_BACKGROUNDS.map((option) => (
            <Swatch
              key={option.key}
              option={option}
              selected={value === option.key}
              disabled={disabled}
              onSelect={onChange}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default BackgroundPicker;
