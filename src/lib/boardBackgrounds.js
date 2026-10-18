// The backgrounds a board can use. The server stores only the key and accepts
// nothing outside its own copy of this list
// (trello_backend/utils/boardBackgrounds.js), so keep the keys in sync.
//
// Every option is dark enough to read white text on, because the board's
// toolbar and "add list" buttons use white text.

export const GRADIENT_BACKGROUNDS = [
  { key: "g-violet", label: "Violet", css: "linear-gradient(135deg, #1f1450 0%, #4a2fb8 55%, #8a4df2 100%)" },
  { key: "g-teal", label: "Teal", css: "linear-gradient(135deg, #0b2a3d 0%, #0c6a7a 55%, #14b8a6 100%)" },
  { key: "g-sunset", label: "Sunset", css: "linear-gradient(135deg, #3a1250 0%, #9b2d8e 55%, #ff5c8a 100%)" },
  { key: "g-ocean", label: "Ocean", css: "linear-gradient(135deg, #0f1b4d 0%, #1d4ed8 55%, #38bdf8 100%)" },
  { key: "g-amber", label: "Amber", css: "linear-gradient(135deg, #3b1d0e 0%, #b4491b 55%, #ffb84d 100%)" },
  { key: "g-forest", label: "Forest", css: "linear-gradient(135deg, #0c2f24 0%, #137a55 55%, #7ae0a8 100%)" },
  { key: "g-midnight", label: "Midnight", css: "linear-gradient(135deg, #0b0b1e 0%, #1b1f4b 55%, #3a4a9f 100%)" },
  { key: "g-rose", label: "Rose", css: "linear-gradient(135deg, #5b1030 0%, #c2255c 55%, #ff8787 100%)" },
  { key: "g-lavender", label: "Lavender", css: "linear-gradient(135deg, #3d2c8d 0%, #7c5cd6 55%, #c4a1ff 100%)" },
  { key: "g-mint", label: "Mint", css: "linear-gradient(135deg, #0b4f4a 0%, #12a37f 55%, #63e6be 100%)" },
  { key: "g-peach", label: "Peach", css: "linear-gradient(135deg, #7a2e1d 0%, #e8590c 55%, #ffa94d 100%)" },
  { key: "g-fog", label: "Fog", css: "linear-gradient(135deg, #2b3446 0%, #526079 55%, #8a97b1 100%)" },
  { key: "g-candy", label: "Candy", css: "linear-gradient(135deg, #2a2a86 0%, #7048e8 50%, #f06595 100%)" },
  { key: "g-neon", label: "Neon", css: "linear-gradient(135deg, #1a1363 0%, #4c3df0 50%, #22d3ee 100%)" },
  { key: "g-cherry", label: "Cherry", css: "linear-gradient(135deg, #4a0d16 0%, #c92a2a 55%, #ff922b 100%)" },
  { key: "g-emerald", label: "Emerald", css: "linear-gradient(135deg, #052e2b 0%, #0f766e 50%, #34d399 100%)" },
];

export const SOLID_BACKGROUNDS = [
  { key: "s-indigo", label: "Indigo", css: "#4f46e5" },
  { key: "s-violet", label: "Violet", css: "#7c3aed" },
  { key: "s-pink", label: "Pink", css: "#db2777" },
  { key: "s-red", label: "Red", css: "#dc2626" },
  { key: "s-orange", label: "Orange", css: "#ea580c" },
  { key: "s-green", label: "Green", css: "#16a34a" },
  { key: "s-teal", label: "Teal", css: "#0d9488" },
  { key: "s-blue", label: "Blue", css: "#2563eb" },
  { key: "s-slate", label: "Slate", css: "#475569" },
  { key: "s-charcoal", label: "Charcoal", css: "#1f2937" },
];

const ALL = [...GRADIENT_BACKGROUNDS, ...SOLID_BACKGROUNDS];
const BY_KEY = new Map(ALL.map((option) => [option.key, option]));

export const DEFAULT_BACKGROUND = "g-violet";

// Boards made before backgrounds could be chosen have none. They keep a
// colour picked from their id, so each looks the same as it always did.
const LEGACY_FALLBACK = GRADIENT_BACKGROUNDS.slice(0, 6);

export const resolveBackground = (key, boardId) => {
  const chosen = BY_KEY.get(key);
  if (chosen) return chosen;

  return LEGACY_FALLBACK[Math.abs(Number(boardId) || 0) % LEGACY_FALLBACK.length];
};

// Inline style for anything that shows a board's background. In dark mode a
// soft shade goes over it so a bright board does not glare.
export const backgroundStyle = (key, boardId, isDark = false) => {
  const { css } = resolveBackground(key, boardId);

  return {
    background: isDark
      ? `linear-gradient(rgba(8, 8, 22, 0.4), rgba(8, 8, 22, 0.4)), ${css}`
      : css,
  };
};
