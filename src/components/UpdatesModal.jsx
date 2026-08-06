import { X, CheckCircle2 } from "lucide-react";

const UpdatesModal = ({ onClose }) => {
  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-800">
            Latest updates
          </h2>

          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sky-100">
            <CheckCircle2 className="text-sky-600" size={32} />
          </div>

          <h3 className="text-xl font-semibold text-slate-800">
            You're up to date!
          </h3>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Your Trello Clone is running the latest version. Future updates and
            improvements will appear here.
          </p>

          <button
            onClick={onClose}
            className="mt-6 rounded-lg bg-sky-600 px-5 py-2 text-sm font-medium text-white hover:bg-sky-700"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdatesModal;