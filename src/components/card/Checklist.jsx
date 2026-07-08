import { CheckSquare } from "lucide-react";

function Checklist() {
  return (
    <section className="mt-8">
      <div className="flex items-center gap-3">
        <CheckSquare
          size={20}
          className="text-slate-600"
        />

        <h2 className="text-lg font-semibold text-slate-800">
          Checklist
        </h2>
      </div>

      <div className="mt-4 rounded-lg border border-dashed border-slate-300 p-6">
        <p className="text-sm text-slate-500">
          No checklist yet
        </p>
      </div>
    </section>
  );
}

export default Checklist;