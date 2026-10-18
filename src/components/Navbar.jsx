import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Search, Plus, Megaphone } from "lucide-react";

import CreateMenuModal from "./CreateMenuModal";
import CreateBoardPopover from "./CreateBoardPopover";
import Logo from "./Logo";
import ProfileMenu from "./ProfileMenu";
import MobileNav from "./MobileNav";
import FeedbackModal from "./FeedbackModal";

const Navbar = ({
  search = "",
  setSearch,
  showSearch = true,
  placeholder = "Search...",
  className = "",
  dark = false,
}) => {
  const navigate = useNavigate();

  const [focus, setFocus] = useState(false);

  const [showCreate, setShowCreate] = useState(false);

  const [showCreateBoard, setShowCreateBoard] = useState(false);

  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  return (
    <>
      <header
        className={`sticky top-0 z-50 border-b ${
          className || "bg-white/90 border-slate-200 shadow-sm backdrop-blur-md"
        }`}
      >
        <div className="h-14 flex items-center justify-between px-3 sm:px-6">
          {/* LEFT SECTION */}

          <div className="flex shrink-0 items-center gap-1 sm:min-w-45 sm:gap-2">
            <MobileNav dark={dark} />

            <button
              onClick={() => navigate("/dashboard")}
              aria-label="TaskSphere home"
              className="flex items-center gap-2 cursor-pointer"
            >
              {/* Just the mark on phones, to leave room for search */}
              <span className="sm:hidden">
                <Logo size={30} showText={false} />
              </span>
              <span className="hidden sm:inline">
                <Logo size={30} light={dark} />
              </span>
            </button>
          </div>

          {/* CENTER */}

          {showSearch && (
            <div className="flex min-w-0 flex-1 items-center justify-center px-2 sm:px-4">
              {/* SEARCH */}

              <div
                className={`flex w-full min-w-0 max-w-2xl items-center gap-2 rounded-md border px-3 py-1.5 transition ${
                  dark
                    ? focus
                      ? "border-white/60 bg-black/40 ring-4 ring-white/20"
                      : "border-white/20 bg-white/10"
                    : focus
                      ? "border-brand-500 bg-white shadow-sm ring-4 ring-brand-100"
                      : "border-transparent bg-slate-100"
                }`}
              >
                <Search
                  size={16}
                  className={`shrink-0 ${dark ? "text-white" : "text-slate-500"}`}
                />

                <input
                  value={search}
                  onChange={(e) => setSearch?.(e.target.value)}
                  onFocus={() => setFocus(true)}
                  onBlur={() => setFocus(false)}
                  placeholder={placeholder}
                  className={`w-full min-w-0 bg-transparent outline-none text-sm ${
                    dark
                      ? "text-white placeholder:text-white/70"
                      : "text-slate-700"
                  }`}
                />
              </div>

              {/* CREATE BUTTON + DROPDOWNS */}

              <div className="relative ml-2 shrink-0 max-sm:static">
                <button
                  aria-label="Create"
                  onClick={() => {
                    setShowCreate((prev) => !prev);
                    setShowCreateBoard(false);
                  }}
                  className="bg-brand-gradient flex cursor-pointer items-center gap-1 rounded-lg px-3.5 py-1.5 text-sm font-semibold text-white shadow-md shadow-brand-600/25 transition hover:brightness-110"
                >
                  <Plus size={16} />
                  <span className="hidden sm:inline">Create</span>
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

          <div className="ml-1 flex shrink-0 items-center justify-end gap-1 sm:ml-6 sm:min-w-[150px] sm:gap-2">
            <button
              onClick={() => setShowFeedbackModal(true)}
              aria-label="Send feedback"
              title="Send feedback"
              className={`cursor-pointer rounded p-2 transition ${
                dark
                  ? "text-white hover:bg-white/10"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              <Megaphone size={18} />
            </button>

            <ProfileMenu />
          </div>
        </div>
      </header>

      {showFeedbackModal && (
        <FeedbackModal onClose={() => setShowFeedbackModal(false)} />
      )}
    </>
  );
};

export default Navbar;
