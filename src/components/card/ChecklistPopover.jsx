import { useState } from "react";

function ChecklistPopover() {
  const [title, setTitle] = useState("Checklist");

  return (
    <div className="absolute left-0 top-full z-50 mt-2 w-72 rounded-lg border border-slate-200 bg-white p-4 shadow-xl">
      <h3 className="mb-4 text-center text-sm font-semibold">
        Add Checklist
      </h3>

      <label className="mb-1 block text-xs font-medium text-slate-600">
        Title
      </label>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none"
      />

      <button
        className="mt-4 w-full rounded-md bg-blue-600 py-2 text-sm text-white hover:bg-blue-500"
      >
        Add
      </button>
    </div>
  );
}

export default ChecklistPopover;