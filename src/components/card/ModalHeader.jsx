import {
  X,
  SquareKanban,
  Circle,
  CheckCircle2,
} from "lucide-react";

import { useQueryClient } from "@tanstack/react-query";
import { toggleCardCompletedApi } from "../../api/cardApi";
function ModalHeader({
  card,
  list,
  title,
  setTitle,
  onClose,
  cardContext,
}) {
const queryClient = useQueryClient();

const handleToggleComplete = async () => {
  try {

    await toggleCardCompletedApi(card.id);

    queryClient.invalidateQueries({
      queryKey:["board", cardContext.boardId],
    });

  } catch(error) {

    console.log(error);

  }
};

  return (
    <>
      {/* Cover */}
     {card.coverImage && (
  <div className="max-h-[220px] overflow-hidden bg-slate-100 flex items-center justify-center">
    <img
      src={
        card.coverImage.startsWith("http")
          ? card.coverImage
          : `http://localhost:5000${card.coverImage}`
      }
      alt={card.title}
      className="max-h-[220px] w-auto object-contain"
    />
  </div>
)}

      {/* Header */}
      <div
        className="
          flex
          items-start
          justify-between
          border-b
          border-slate-200
          bg-white
          px-8
          py-5
        "
      >
        <div className="flex flex-1 gap-4">
          {/* Complete / Incomplete */}
          <button
  onClick={handleToggleComplete}
            className="
              mt-1
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              transition
              hover:bg-slate-100
              hover:scale-105
              cursor-pointer
            "
          >
            {card.isCompleted ? (
              <CheckCircle2
                size={24}
                className="text-green-600"
              />
            ) : (
              <Circle
                size={24}
                className="text-slate-500 hover:text-green-600"
              />
            )}
          </button>

          {/* Card Icon */}
          <div
            className="
              mt-1
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              bg-slate-100
            "
          >
            <SquareKanban
              size={20}
              className="text-slate-600"
            />
          </div>

          {/* Title */}
          <div className="flex-1">
            <textarea
              rows={1}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`
                w-full
                resize-none
                overflow-hidden
                bg-transparent
                text-xl
                font-bold
                outline-none
                placeholder:text-slate-400
                ${
                  card.isCompleted
                    ? "text-slate-500"
                    : "text-slate-800"
                }
              `}
            />

            <p
              className="
                mt-1
                text-sm
                text-slate-500
              "
            >
              in list{" "}
              <span className="font-semibold text-slate-700">
                {list.title}
              </span>
            </p>
          </div>
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="
            cursor-pointer
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