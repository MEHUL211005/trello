// Uploaded files are served by the API server (e.g. /uploads/123.png).
// The origin comes from VITE_FILE_URL, or from VITE_API_URL without "/api".
const FILE_ORIGIN = (
  import.meta.env.VITE_FILE_URL ||
  (import.meta.env.VITE_API_URL || "").replace(/\/api\/?$/, "")
).replace(/\/$/, "");

export const fileUrl = (path) => {
  if (!path) return "";
  // Absolute, blob: and data: URLs are used as they are
  if (!path.startsWith("/")) return path;
  return `${FILE_ORIGIN}${path}`;
};
