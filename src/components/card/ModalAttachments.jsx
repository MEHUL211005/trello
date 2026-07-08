import { Paperclip } from "lucide-react";

function ModalAttachments() {
  return (
    <section className="mt-8">
      <div className="flex items-center gap-3">
        <Paperclip
          size={20}
          className="text-slate-600"
        />

        <h2 className="text-lg font-semibold text-slate-800">
          Attachments
        </h2>
      </div>

      <div className="mt-4 rounded-lg border border-dashed border-slate-300 p-6">
        <p className="text-sm text-slate-500">
          No attachments yet
        </p>
      </div>
    </section>
  );
}

export default ModalAttachments;