// Generates src/dark.css: the dark-mode colour for every light-mode colour
// class the app uses (bg-white, text-slate-800, border-slate-200, ...).
//
// Why generate: the components are written with plain light-mode Tailwind
// classes. Instead of adding a dark: twin to thousands of class names, the
// colours that matter are re-pointed under `.dark` in one stylesheet.
//
// Run:  node scripts/generate-dark-theme.mjs
// Re-run it after adding a colour class that is missing from the tables below.
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import nodePath from "node:path";

const here = nodePath.dirname(fileURLToPath(import.meta.url));
const OUT = nodePath.join(here, "..", "src", "dark.css");

// ---- Dark palette ---------------------------------------------------------
const PALETTE = {
  "--d-page": "#0e0e1a",
  "--d-surface": "#171727",
  "--d-surface-2": "#1e1e33",
  "--d-surface-3": "#26263f",
  "--d-surface-4": "#30304d",
  "--d-surface-5": "#3b3b5c",
  "--d-border": "#2c2c47",
  "--d-border-strong": "#3b3b5d",
  "--d-text": "#ecebf9",
  "--d-text-2": "#d2d1e8",
  "--d-text-3": "#adacc9",
  "--d-text-4": "#8a89aa",
  "--d-text-5": "#6e6d8f",
};

const mix = (color, percent, base = "var(--d-surface)") =>
  `color-mix(in srgb, ${color} ${percent}%, ${base})`;
const alpha = (color, percent) =>
  `color-mix(in srgb, ${color} ${percent}%, transparent)`;

const BRAND = "var(--color-brand-500)";
const ACCENT = "var(--color-accent-500)";

// ---- Tables: tailwind token -> dark value ----------------------------------
const BG = {
  white: "var(--d-surface)",
  "white/95": alpha("var(--d-surface)", 95),
  "white/90": alpha("var(--d-surface)", 90),
  "white/70": alpha("var(--d-surface)", 70),
  "white/60": alpha("var(--d-surface)", 60),
  "slate-50": "var(--d-page)",
  "slate-50/60": "var(--d-surface-2)",
  "slate-50/70": "var(--d-surface-2)",
  "slate-100": "var(--d-surface-3)",
  "slate-100/95": alpha("#1b1b2f", 94),
  "slate-200": "var(--d-surface-4)",
  "slate-200/70": alpha("var(--d-surface-4)", 70),
  "slate-200/80": alpha("var(--d-surface-4)", 80),
  "slate-300": "var(--d-surface-5)",
  "brand-50": mix(BRAND, 14),
  "brand-50/50": mix(BRAND, 8),
  "brand-50/60": mix(BRAND, 9),
  "brand-50/70": mix(BRAND, 10),
  "brand-100": mix(BRAND, 24),
  "brand-100/60": mix(BRAND, 18),
  "brand-100/80": mix(BRAND, 22),
  "brand-200/70": mix(BRAND, 30),
  "sky-100": mix(BRAND, 24),
  "accent-50": mix(ACCENT, 14),
  "accent-100": mix(ACCENT, 22),
  "rose-50": mix("#ff5c8a", 14),
  "amber-50": mix("#ffb84d", 14),
  "amber-100": mix("#ffb84d", 22),
  "green-100": mix("#22c55e", 20),
  "red-100": mix("#ef4444", 20),
};

const TEXT = {
  "slate-900": "var(--d-text)",
  "slate-800": "var(--d-text)",
  "slate-700": "var(--d-text-2)",
  "slate-600": "var(--d-text-3)",
  "slate-500": "var(--d-text-4)",
  "slate-400": "var(--d-text-5)",
  "brand-600": "#ac98ff",
  "brand-700": "#bdaeff",
  "brand-800": "#d0c6ff",
  "sky-500": "#ac98ff",
  "sky-600": "#ac98ff",
  "sky-700": "#bdaeff",
  "blue-600": "#ac98ff",
  "accent-600": "#3fe3c4",
  "accent-700": "#54f2d1",
  "rose-500": "#ff8aa8",
  "rose-600": "#ff8aa8",
  "rose-700": "#ffa3ba",
  "red-500": "#ff7b7b",
  "green-600": "#4ade80",
  "green-700": "#4ade80",
  "amber-600": "#fbbf24",
  "amber-700": "#fbbf24",
};

const BORDER = {
  "slate-100": "var(--d-border)",
  "slate-200": "var(--d-border)",
  "slate-200/70": alpha("var(--d-border)", 70),
  "slate-300": "var(--d-border-strong)",
  "brand-100": mix(BRAND, 28),
  "brand-200": mix(BRAND, 38),
  "brand-300": mix(BRAND, 55),
  "rose-200": mix("#ff5c8a", 40),
};

const RING = {
  white: "var(--d-surface)",
  "slate-200": "var(--d-border)",
  "brand-50/60": mix(BRAND, 12),
  "brand-100": mix(BRAND, 28),
  "brand-200": mix(BRAND, 38),
  "blue-100": mix(BRAND, 28),
  "sky-100": mix(BRAND, 28),
  "accent-50/60": mix(ACCENT, 14),
  "accent-200": mix(ACCENT, 40),
  "amber-200": mix("#ffb84d", 40),
  "rose-200": mix("#ff5c8a", 40),
  "red-100": mix("#ef4444", 28),
};

const PLACEHOLDER = { "slate-400": "var(--d-text-5)", "slate-500": "var(--d-text-5)" };

// Which pseudo-state each class prefix belongs to
const VARIANTS = [
  ["", ""],
  ["hover:", ":hover"],
  ["focus:", ":focus"],
  ["enabled:hover:", ":enabled:hover"],
  ["group-hover:", ":is(:where(.group):hover *)"],
];

const esc = (token) => token.replace(/[:/.[\]#%]/g, (c) => `\\${c}`);

const rules = [];
const add = (prefix, state, kind, token, declarations) => {
  const className = esc(`${prefix}${kind}-${token}`);
  rules.push(`.dark .${className}${state} { ${declarations} }`);
};

for (const [prefix, state] of VARIANTS) {
  for (const [token, value] of Object.entries(BG)) {
    // Glass over photos / gradients keeps its look; only real surfaces flip
    add(prefix, state, "bg", token, `background-color: ${value};`);
  }
  for (const [token, value] of Object.entries(TEXT)) {
    add(prefix, state, "text", token, `color: ${value};`);
  }
  for (const [token, value] of Object.entries(BORDER)) {
    add(prefix, state, "border", token, `border-color: ${value};`);
  }
  for (const [token, value] of Object.entries(RING)) {
    add(prefix, state, "ring", token, `--tw-ring-color: ${value};`);
  }
}

for (const [token, value] of Object.entries(PLACEHOLDER)) {
  rules.push(
    `.dark .${esc(`placeholder:text-${token}`)}::placeholder { color: ${value}; }`,
  );
}

rules.push(
  `.dark .${esc("divide-slate-100")} > :not(:last-child) { border-color: var(--d-border); }`,
);

const css = `/* GENERATED by scripts/generate-dark-theme.mjs - do not edit by hand. */

:root.dark {
${Object.entries(PALETTE)
  .map(([name, value]) => `  ${name}: ${value};`)
  .join("\n")}
  color-scheme: dark;
}

.dark body {
  background: var(--d-page);
  color: var(--d-text);
}

.dark * {
  scrollbar-color: var(--d-surface-5) transparent;
}

.dark ::selection {
  background: color-mix(in srgb, var(--color-brand-500) 45%, transparent);
  color: #fff;
}

.dark .bg-brand-gradient-soft {
  background: linear-gradient(135deg, #1d1a3a 0%, #261836 100%);
}

.dark .bg-\\[\\#f7f7fd\\] {
  background-color: var(--d-page);
}

.dark input,
.dark textarea,
.dark select {
  color-scheme: dark;
}

${rules.join("\n")}
`;

fs.writeFileSync(OUT, css);
console.log(`Wrote ${rules.length} rules to ${OUT}`);
