import { X, SquareKanban } from "lucide-react";

function ModalHeader({
  card,
  list,
  title,
  setTitle,
  onClose,
}) {
  return (
    <>
      {/* Cover */}
      {card.image && (
        <img
          src={card.image}
          alt={card.title}
          className="max-h-[260px] w-full object-contain"
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-300 px-8 py-6">
        <div className="flex gap-4 flex-1">
          <SquareKanban
            size={22}
            className="mt-1 text-slate-600 shrink-0"
          />

          <div className="flex-1">
            <textarea
              rows={1}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="
                w-full
                resize-none
                overflow-hidden
                bg-transparent
                text-2xl
                font-semibold
                text-slate-800
                outline-none
              "
            />

            <p className="mt-1 text-sm text-slate-500">
              in list{" "}
              <span className="font-medium">
                {list.title}
              </span>
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-300 hover:text-slate-700"
        >
          <X size={22} />
        </button>
      </div>
    </>
  );
}

export default ModalHeader;