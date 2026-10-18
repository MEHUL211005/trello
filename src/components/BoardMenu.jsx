import { useEffect, useRef, useState } from "react";
import { Archive, ChevronLeft, ChevronRight, Image, MoonStar, MoreHorizontal, Sun } from "lucide-react";

import ArchivedItems from "./ArchivedItems";
import BackgroundPicker from "./BackgroundPicker";
import { useTheme } from "../context/theme";
import { backgroundStyle, resolveBackground } from "../lib/boardBackgrounds";

// The "..." menu in the board toolbar: change the board's background, and
// switch the whole app between light and dark.
function BoardMenu({ board, canManage, canEdit, onChangeBackground, saving }) {
  const { isDark, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("main");
  const wrapperRef = useRef(null);

  // Close on an outside click or Escape
  useEffect(() => {
    if (!open) return undefined;

    const onMouseDown = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const toggleOpen = () => {
    setOpen((current) => !current);
    setView("main");
  };

  const current = resolveBackground(board.background, board.id);

  return (
    <div className="relative max-sm:static" ref={wrapperRef}>
      <button
        onClick={toggleOpen}
        aria-label="Board menu"
        aria-expanded={open}
        className={`cursor-pointer rounded-md p-2 transition hover:bg-white/10 ${
          open ? "bg-white/15" : ""
        }`}
      >
        <MoreHorizontal size={18} />
      </button>

      {open && (
        <div className="animate-fade-up absolute right-0 top-full z-[10000] mt-2 w-80 max-sm:inset-x-3 max-sm:w-auto overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-2xl shadow-black/25">
          {view === "main" ? (
            <>
              <div className="border-b border-slate-100 px-4 py-3">
                <h3 className="text-sm font-bold text-slate-900">Board menu</h3>
                <p className="mt-0.5 truncate text-xs text-slate-500">
                  {board.name}
                </p>
              </div>

              <div className="p-2">
                <button
                  onClick={() => setView("background")}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-slate-100"
                >
                  <span
                    className="h-9 w-9 shrink-0 rounded-lg ring-1 ring-black/10"
                    style={backgroundStyle(board.background, board.id)}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                      <Image size={15} />
                      Change background
                    </span>
                    <span className="block text-xs text-slate-500">
                      Currently {current.label}
                    </span>
                  </span>
                  <ChevronRight size={16} className="text-slate-400" />
                </button>

                <button
                  onClick={() => setView("archived")}
                  className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-slate-100"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <Archive size={18} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-slate-800">
                      Archived items
                    </span>
                    <span className="block text-xs text-slate-500">
                      View and restore cards and lists
                    </span>
                  </span>
                  <ChevronRight size={16} className="text-slate-400" />
                </button>

                <button
                  role="switch"
                  aria-checked={isDark}
                  onClick={toggleTheme}
                  className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-slate-100"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    {isDark ? <MoonStar size={18} /> : <Sun size={18} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-slate-800">
                      Dark mode
                    </span>
                    <span className="block text-xs text-slate-500">
                      {isDark ? "On for the whole app" : "Off. Tap to switch"}
                    </span>
                  </span>

                  {/* Switch */}
                  <span
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
                      isDark ? "bg-brand-600" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-200 ${
                        isDark ? "left-[22px]" : "left-0.5"
                      }`}
                    />
                  </span>
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-3">
                <button
                  onClick={() => setView("main")}
                  aria-label="Back"
                  className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                >
                  <ChevronLeft size={18} />
                </button>
                <h3 className="text-sm font-bold text-slate-900">
                  {view === "archived" ? "Archived items" : "Change background"}
                </h3>
                {view === "background" && saving && (
                  <span className="ml-auto text-xs font-medium text-slate-400">
                    Saving...
                  </span>
                )}
              </div>

              {view === "archived" ? (
                <ArchivedItems boardId={board.id} canEdit={canEdit} />
              ) : (
                <div className="max-h-[60vh] overflow-y-auto p-4">
                  {!canManage && (
                    <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
                      Only the board owner can change the background.
                    </p>
                  )}

                  <BackgroundPicker
                    value={current.key}
                    onChange={onChangeBackground}
                    disabled={!canManage}
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default BoardMenu;
