import { Clock3 } from "lucide-react";

function Activity() {
  return (
    <section className="mt-8">
      <div className="flex items-center gap-3">
        <Clock3
          size={20}
          className="text-slate-600"
        />

        <h2 className="text-lg font-semibold text-slate-800">
          Activity
        </h2>
      </div>

      <div className="mt-4 rounded-lg border border-dashed border-slate-300 p-6">
        <p className="text-sm text-slate-500">
          No activity yet
        </p>
      </div>
    </section>
  );
}

export default Activity;