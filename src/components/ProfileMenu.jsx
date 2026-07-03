import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/authSlice";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";

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

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
            className="w-full text-left px-3 py-2 text-red-400 hover:bg-slate-800 transition"
          >
            Logout
          </button>

        </div>
      )}

      {/* ---------------- CONFIRM MODAL ---------------- */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-[9999]">

          <div className="w-[90%] max-w-sm rounded-xl bg-slate-900 border border-slate-700 p-6 shadow-2xl">

            <h2 className="text-xl font-semibold text-white">
              Logout
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Are you sure you want to logout from your account?
            </p>

            {/* BUTTONS */}
            <div className="mt-6 flex justify-end gap-3">

              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white"
              >
                Cancel
              </button>

              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white"
              >
                Logout
              </button>

            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default ProfileMenu;