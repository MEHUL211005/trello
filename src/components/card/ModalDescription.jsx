import { useEffect, useState } from "react";
import { AlignLeft } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query"; 
import { updateCard as updateCardApi } from "../../api/cardApi";

function ModalDescription({ card, cardContext }) {
  const [description, setDescription] = useState(
    card.description || ""
  );

  const [isEditing, setIsEditing] = useState(false);
 const queryClient = useQueryClient();

 const handleSaveDescription = async () => {
  try {
    await updateCardApi(card.id, {
      description,
    });

    queryClient.invalidateQueries({
      queryKey: ["board", cardContext.boardId],
    });

    setIsEditing(false);

  } catch (error) {
    console.error("Update description error:", error);
  }
};

  useEffect(() => {
    setDescription(card.description || "");
    setIsEditing(false);
  }, [card]);

  return (
    <section className="mt-6">

      {/* Header */}
      <div className="mb-3 flex items-center gap-3">
        <AlignLeft
          size={21}
          className="text-slate-700"
        />

        <h2 className="text-base font-semibold text-slate-800">
          Description
        </h2>
      </div>


      {isEditing ? (
        <>
          <textarea
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
            className="
              min-h-[140px]
              w-full
              resize-none
              rounded-xl
              border
              border-slate-300
              bg-white
              p-4
              text-sm
              text-slate-700
              outline-none
              shadow-sm
              focus:border-blue-500
              focus:ring-2
              focus:ring-blue-100
            "
            autoFocus
          />

          <div className="mt-3 flex gap-2">

            <button
              onClick={handleSaveDescription}
              className="
                rounded-lg
                bg-blue-600
                px-4
                py-2
                text-sm
                font-medium
                text-white
                transition
                hover:bg-blue-700
              "
            >
              Save
            </button>


            <button
              onClick={() => {
                setDescription(card.description || "");
                setIsEditing(false);
              }}
              className="
                rounded-lg
                bg-slate-200
                px-4
                py-2
                text-sm
                font-medium
                text-slate-700
                transition
                hover:bg-slate-300
              "
            >
              Cancel
            </button>

          </div>
        </>
      ) : (

        <div
          onClick={() => setIsEditing(true)}
          className="
            min-h-[100px]
            cursor-pointer
            rounded-xl
            bg-slate-100
            p-4
            text-sm
            leading-6
            text-slate-700
            transition
            hover:bg-slate-200
          "
        >
          {card.description || (
            <span className="text-slate-500">
              Add a more detailed description...
            </span>
          )}
        </div>

      )}

    </section>
  );
}

export default ModalDescription;