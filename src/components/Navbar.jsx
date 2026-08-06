import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { FaTrello } from "react-icons/fa";
import { Search, Plus, Bell, Info, Megaphone, Grid3X3 } from "lucide-react";

import CreateMenuModal from "./CreateMenuModal";
import CreateBoardPopover from "./CreateBoardPopover";
import ProfileMenu from "./ProfileMenu";
import FeedbackModal from "./FeedbackModal";
import UpdatesModal from "./UpdatesModal";

const Navbar = ({
  search = "",
  setSearch,
  showSearch = true,
  placeholder = "Search...",
  className = "",
  dark = false,
}) => {
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);

  const [focus, setFocus] = useState(false);

  const [showCreate, setShowCreate] = useState(false);

  const [showCreateBoard, setShowCreateBoard] = useState(false);

  const [showFeedback, setShowFeedback] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const [showUpdates, setShowUpdates] = useState(false);
  const [showUpdatesModal, setShowUpdatesModal] = useState(false);
  useEffect(() => {
    const handleClickOutside = () => {
      setShowFeedback(false);
      setShowUpdates(false);
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);
  return (
    <>
      <header
        className={`sticky top-0 z-50 border-b ${
          className || "bg-white border-slate-200"
        }`}
      >
        <div className="h-14 flex items-center justify-between px-3 sm:px-6">
          {/* LEFT SECTION */}

          <div className="flex items-center gap-2 min-w-45">
            <button
              className={`cursor-pointer p-2 rounded ${
                dark
                  ? "text-white hover:bg-white/10"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              <Grid3X3 size={18} />
            </button>

            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 cursor-pointer"
            >
              <FaTrello className="text-xl text-sky-600" />

              <span
                className={`hidden text-sm font-semibold sm:block ${
                  dark ? "text-white" : "text-slate-800"
                }`}
              >
                Trello Clone
              </span>
            </button>
          </div>

          {/* CENTER */}

          {showSearch && (
            <div className="flex flex-1 items-center justify-center px-4">
              {/* SEARCH */}

              <div
                className={`flex w-full max-w-2xl items-center gap-2 rounded-md border px-3 py-1.5 transition ${
                  focus
                    ? "border-sky-500 shadow-sm"
                    : dark
                      ? "border-white/20 bg-white/10"
                      : "border-slate-300"
                }`}
              >
                <Search
                  size={16}
                  className={dark ? "text-white" : "text-slate-500"}
                />

                <input
                  value={search}
                  onChange={(e) => setSearch?.(e.target.value)}
                  onFocus={() => setFocus(true)}
                  onBlur={() => setFocus(false)}
                  placeholder={placeholder}
                  className={`w-full bg-transparent outline-none text-sm ${
                    dark
                      ? "text-white placeholder:text-white/70"
                      : "text-slate-700"
                  }`}
                />
              </div>

              {/* CREATE BUTTON + DROPDOWNS */}

              <div className="relative ml-2">
                <button
                  onClick={() => {
                    setShowCreate((prev) => !prev);
                    setShowCreateBoard(false);
                  }}
                  className="flex items-center gap-1 rounded-md bg-sky-600 px-3 py-1.5 text-sm text-white hover:bg-sky-700 cursor-pointer"
                >
                  <Plus size={16} />
                  Create
                </button>

                {showCreate && (
                  <CreateMenuModal
                    onClose={() => setShowCreate(false)}
                    onCreateBoard={() => {
                      setShowCreate(false);
                      setShowCreateBoard(true);
                    }}
                  />
                )}

                {showCreateBoard && (
                  <CreateBoardPopover
                    onClose={() => setShowCreateBoard(false)}
                  />
                )}
              </div>
            </div>
          )}

          {/* RIGHT SECTION */}

          <div className="ml-6 flex min-w-[150px] items-center justify-end gap-2 cursor-pointer">
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFeedback((prev) => !prev);
                  setShowUpdates(false);
                }}
                className={`cursor-pointer rounded p-2 ${
                  dark
                    ? "text-white hover:bg-white/10"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                <Megaphone size={18} />
              </button>

              {showFeedback && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white shadow-lg z-[9999]">
                  <button
                    onClick={() => {
                      setShowFeedback(false);
                      setShowFeedbackModal(true);
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 rounded-xl"
                  >
                    Share your thoughts on Trello
                  </button>
                </div>
              )}
            </div>

            <button
              className={`cursor-pointer rounded p-2 ${
                dark
                  ? "text-white hover:bg-white/10"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              <Bell size={18} />
            </button>

            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowUpdates((prev) => !prev);
                  setShowFeedback(false);
                }}
                className={`relative cursor-pointer rounded p-2 ${
                  dark
                    ? "text-white hover:bg-white/10"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                <Info size={18} />

                {/* Blue notification dot */}
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-sky-500" />
              </button>

              {showUpdates && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl z-[9999]">
                  <h3 className="text-sm font-semibold text-slate-800">
                    Discover what's new on Trello
                  </h3>

                  <p className="mt-2 text-sm leading-5 text-slate-500">
                    Get more out of Trello with our latest features.
                  </p>

                  <button
                    onClick={() => {
                      setShowUpdates(false);
                      setShowUpdatesModal(true);
                    }}
                    className="mt-4 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
                  >
                    View updates
                  </button>
                </div>
              )}
            </div>

            <ProfileMenu />
          </div>
        </div>
      </header>

      {showFeedbackModal && (
        <FeedbackModal onClose={() => setShowFeedbackModal(false)} />
      )}
      {showUpdatesModal && (
        <UpdatesModal onClose={() => setShowUpdatesModal(false)} />
      )}
    </>
  );
};

export default Navbar;
