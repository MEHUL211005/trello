import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState } from "react";
import { FaTrello } from "react-icons/fa";
import {
  Search,
  Plus,
  Bell,
  Info,
  Megaphone,
  Grid3X3,
} from "lucide-react";

import ProfileMenu from "./ProfileMenu";

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

  return (
    <header
      className={`sticky top-0 z-50 border-b ${
        className || "bg-white border-slate-200"
      }`}
    >
      <div className="h-14 flex items-center justify-between px-3 sm:px-6">

        {/* LEFT SECTION */}
        <div className="flex items-center gap-2 min-w-[180px]">
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

        {/* CENTER SEARCH */}
        {showSearch && (
          <div className="flex flex-1 items-center justify-center px-4">

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

            <button className="ml-2 flex items-center gap-1 rounded-md bg-sky-600 px-3 py-1.5 text-sm text-white hover:bg-sky-700 cursor-pointer">
              <Plus size={16} />
              Create
            </button>
          </div>
        )}

        {/* RIGHT SECTION */}
        <div className="ml-6 flex min-w-[150px] items-center justify-end gap-2 cursor-pointer">

          <button
            className={`cursor-pointer rounded p-2 ${
              dark
                ? "text-white hover:bg-white/10"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            <Megaphone size={18} />
          </button>

          <button
            className={`cursor-pointer rounded p-2 ${
              dark
                ? "text-white hover:bg-white/10"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            <Bell size={18} />
          </button>

          <button
            className={`cursor-pointer rounded p-2 ${
              dark
                ? "text-white hover:bg-white/10"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            <Info size={18} />
          </button>

          <ProfileMenu />
        </div>
      </div>
    </header>
  );
};

export default Navbar;