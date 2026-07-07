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
}) => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [focus, setFocus] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
      <div className="h-14 flex items-center justify-between px-3 sm:px-6">

        {/* LEFT SECTION */}
        <div className="flex items-center gap-2 min-w-[180px]">
          <button className="p-2 rounded text-slate-500 hover:bg-slate-100">
            <Grid3X3 size={18} />
          </button>

          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2"
          >
             <FaTrello className="text-xl text-sky-600" />
            <span className="font-semibold text-slate-800 text-sm hidden sm:block">
              Trello Clone
            </span>
          </button>
        </div>

        {/* CENTER SEARCH (MAIN FOCUS) */}
       {/* CENTER SEARCH (MAIN FOCUS) */}
{showSearch && (
  <div className="flex flex-1 items-center justify-center px-4">

    {/* Search */}
    <div
      className={`flex items-center gap-2 w-full max-w-2xl rounded-md border px-3 py-1.5 transition
      ${focus ? "border-sky-500 shadow-sm" : "border-slate-300"}`}
    >
      <Search size={16} className="text-slate-500" />

      <input
        value={search}
        onChange={(e) => setSearch?.(e.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        placeholder={placeholder}
        className="w-full outline-none text-sm text-slate-700"
      />
    </div>

    {/* Create Button */}
    <button className="ml-2 flex items-center gap-1 rounded-md bg-sky-600 px-3 py-1.5 text-sm text-white hover:bg-sky-700">
      <Plus size={16} />
      Create
    </button>

  </div>
)}
        {/* RIGHT SECTION */}
       {/* RIGHT SECTION */}
<div className="ml-6 flex min-w-[150px] items-center justify-end gap-2">

  <button className="p-2 rounded text-slate-500 hover:bg-slate-100">
    <Megaphone size={18} />
  </button>

  <button className="p-2 rounded text-slate-500 hover:bg-slate-100">
    <Bell size={18} />
  </button>

  <button className="p-2 rounded text-slate-500 hover:bg-slate-100">
    <Info size={18} />
  </button>

  <ProfileMenu />

</div>
      </div>
    </header>
  );
};

export default Navbar;