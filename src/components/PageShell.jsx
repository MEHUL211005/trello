import { createElement } from "react";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

// Frame for the account-level pages (Boards, Members, Settings, Profile):
// the top bar, the sidebar and a centred content column.
function PageShell({ children, width = "max-w-6xl" }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-600">
      <Navbar showSearch={false} />

      <div className="flex">
        <Sidebar />

        <main className="min-w-0 flex-1">
          <div className={`mx-auto ${width} px-5 py-8 sm:px-8`}>{children}</div>
        </main>
      </div>
    </div>
  );
}

// Title row at the top of a page
export function PageHeader({ icon, title, subtitle, action }) {
  return (
    <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3.5">
        <span className="bg-brand-gradient flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg shadow-brand-600/25">
          {createElement(icon, { size: 22 })}
        </span>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            {title}
          </h1>
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>
      </div>

      {action}
    </div>
  );
}

export default PageShell;
