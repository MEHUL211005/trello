import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Menu, X } from "lucide-react";

import Logo from "./Logo";
import { SidebarNav } from "./Sidebar";

// Small screens have no sidebar, so the navbar gets a menu button that opens
// the same navigation as a drawer.
function MobileNav({ dark = false }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className={`cursor-pointer rounded p-2 md:hidden ${
          dark
            ? "text-white hover:bg-white/10"
            : "text-slate-500 hover:bg-slate-100"
        }`}
      >
        <Menu size={20} />
      </button>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-[10000] md:hidden">
            <div
              className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            <aside className="animate-fade-up absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-white px-4 py-5 shadow-2xl">
              <div className="mb-5 flex items-center justify-between">
                <Logo size={32} />
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                >
                  <X size={20} />
                </button>
              </div>

              <SidebarNav onNavigate={() => setOpen(false)} />
            </aside>
          </div>,
          document.body,
        )}
    </>
  );
}

export default MobileNav;
