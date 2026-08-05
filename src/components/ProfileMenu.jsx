import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/authSlice";
import { useNavigate } from "react-router-dom";
import { FaUserCircle, FaSignOutAlt } from "react-icons/fa";

const ProfileMenu = () => {
  const [open, setOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);

  const menuRef = useRef(null);

  // ---------------- OUTSIDE CLICK CLOSE ----------------
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        setShowConfirm(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = showConfirm ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [showConfirm]);

  const closeConfirmModal = () => {
    setShowConfirm(false);
  };

  // ---------------- LOGOUT ----------------
  const handleLogout = () => {
    dispatch(logout());
    setShowConfirm(false);
    setOpen(false);
    navigate("/login");
  };

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      {/* ICON */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="text-2xl text-slate-200 hover:text-blue-400 transition cursor-pointer"
      >
        <FaUserCircle />
      </button>

      {/* DROPDOWN */}
      {open && (
        <div className="absolute right-0 mt-2 w-44 rounded-xl bg-slate-900 border border-slate-700 shadow-lg overflow-hidden z-[1000]">
          {/* USER INFO */}
          <div className="px-3 py-2 text-sm text-slate-300 border-b border-slate-700">
            👤 {user.name}
          </div>

          {/* LOGOUT */}
          <button
            onClick={() => {
              setShowConfirm(true);
              setOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-red-400 hover:bg-slate-800 transition "
          >
            Logout
          </button>
        </div>
      )}

      {showConfirm &&
        createPortal(
          <div
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/65 px-4 backdrop-blur-sm"
            onClick={closeConfirmModal}
          >
            <div
              className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl shadow-slate-950/70"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/15 text-red-400">
                  <FaSignOutAlt size={20} />
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-white">
                    Confirm logout
                  </h2>
                  <p className="text-sm text-slate-400">
                    Are you sure you want to sign out of your account?
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={closeConfirmModal}
                  className="rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-slate-700"
                >
                  Cancel
                </button>

                <button
                  onClick={handleLogout}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default ProfileMenu;
