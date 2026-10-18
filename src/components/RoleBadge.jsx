import { createElement } from "react";
import { Crown, Eye, Pencil } from "lucide-react";

const STYLES = {
  OWNER: {
    label: "Owner",
    icon: Crown,
    tone: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  EDITOR: {
    label: "Editor",
    icon: Pencil,
    tone: "bg-brand-50 text-brand-700 ring-brand-200",
  },
  VIEWER: {
    label: "Viewer",
    icon: Eye,
    tone: "bg-slate-100 text-slate-600 ring-slate-200",
  },
};

// Small pill showing a board role. `onDark` is for the board toolbar.
const RoleBadge = ({ role, onDark = false, className = "" }) => {
  const style = STYLES[role];
  if (!style) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ${
        onDark ? "bg-white/15 text-white ring-white/25" : style.tone
      } ${className}`}
    >
      {createElement(style.icon, { size: 12 })}
      {style.label}
    </span>
  );
};

export default RoleBadge;
