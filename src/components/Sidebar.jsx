import {
  Home,
  LayoutGrid,
  FileText,
  Users,
  Settings,
  CreditCard,
  Grid3X3,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const Sidebar = () => {
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);

  const workspace = useSelector(
    (state) => state.workspace.users?.[user?.id]?.workspaces?.[0]
  );

  const sidebarBtn =
    "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all duration-200";

  return (
    <aside className="h-[calc(100vh-64px)] w-72 bg-white border-r border-slate-200 px-4 py-5 flex flex-col">
      {/* TOP MENU */}
      <div className="space-y-2">
        <button
          className={sidebarBtn} 
          onClick={() => navigate("/dashboard")}
        >
          <Home size={18} />
          <span>Home</span>
        </button>

        <button className={sidebarBtn}>
          <LayoutGrid size={18} />
          <span>Boards</span>
        </button>

        <button className={sidebarBtn}>
          <FileText size={18} />
          <span>Templates</span>
        </button>
      </div>

      {/* Divider */}
      <div className="my-5 border-t border-slate-200"></div>

      {/* Workspace */}
      <div className="space-y-2">
        <p className="px-3 text-xs font-semibold tracking-wider text-slate-500 uppercase">
          Workspace
        </p>

        <div className="px-3 py-2 rounded-lg bg-slate-100 text-sm font-semibold text-slate-800">
          {workspace?.name || "My Workspace"}
        </div>

        <button className={sidebarBtn}>
          <Grid3X3 size={18} />
          <span>Boards</span>
        </button>

        <button className={sidebarBtn}>
          <Users size={18} />
          <span>Members</span>
        </button>

        <button className={sidebarBtn}>
          <Settings size={18} />
          <span>Settings</span>
        </button>

        <button className={sidebarBtn}>
          <CreditCard size={18} />
          <span>Billing</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;