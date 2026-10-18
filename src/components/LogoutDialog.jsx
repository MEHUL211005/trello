import { useEffect } from "react";
import { createPortal } from "react-dom";
import { LogOut } from "lucide-react";

// "Log out of TaskSphere?" confirmation, used by the profile menu, the
// sidebar and the settings page.
function LogoutDialog({ onConfirm, onCancel, busy = false }) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") onCancel();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onCancel]);

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-label="Log out"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <LogOut size={22} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Log out of TaskSphere?
            </h2>
            <p className="text-sm text-slate-500">
              You'll need to sign in again to access your boards.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Stay signed in
          </button>

          <button
            onClick={onConfirm}
            disabled={busy}
            className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-rose-600/25 transition hover:bg-rose-500 disabled:opacity-70"
          >
            {busy ? "Logging out..." : "Log out"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default LogoutDialog;
