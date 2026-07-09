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
        <div className="max-h-[220px] overflow-hidden bg-slate-100">
          <img
            src={card.image}
            alt={card.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* Header */}
      <div className="
        flex
        items-start
        justify-between
        border-b
        border-slate-200
        bg-white
        px-8
        py-5
      ">
        <div className="flex flex-1 gap-4">

          <div className="
            mt-1
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-lg
            bg-slate-100
          ">
            <SquareKanban
              size={20}
              className="text-slate-600"
            />
          </div>


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
                text-xl
                font-bold
                text-slate-800
                outline-none
                placeholder:text-slate-400
              "
            />

            <p className="
              mt-1
              text-sm
              text-slate-500
            ">
              in list{" "}
              <span className="font-semibold text-slate-700">
                {list.title}
              </span>
            </p>

          </div>

        </div>


        <button
          onClick={onClose}
          className="
            rounded-lg
            p-2
            text-slate-500
            transition
            hover:bg-slate-100
            hover:text-slate-800
          "
        >
          <X size={22} />
        </button>

      </div>
    </>
  );
}

export default ModalHeader;