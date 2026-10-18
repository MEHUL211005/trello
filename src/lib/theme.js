// Gradients used for workspace covers (kept in step with .board-bg-N in index.css)
const COVERS = [
  "linear-gradient(135deg, #5b3be0 0%, #8a4df2 100%)",
  "linear-gradient(135deg, #0c6a7a 0%, #14b8a6 100%)",
  "linear-gradient(135deg, #9b2d8e 0%, #ff5c8a 100%)",
  "linear-gradient(135deg, #1d4ed8 0%, #38bdf8 100%)",
  "linear-gradient(135deg, #b4491b 0%, #ffb84d 100%)",
  "linear-gradient(135deg, #137a55 0%, #7ae0a8 100%)",
];

export const COVER_COUNT = COVERS.length;

// Stable pick from an id, so a workspace/board keeps its colour
export const coverFor = (id) => COVERS[Math.abs(Number(id) || 0) % COVERS.length];
export const boardBgClass = (id) =>
  `board-bg-${Math.abs(Number(id) || 0) % COVERS.length}`;

export const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};
