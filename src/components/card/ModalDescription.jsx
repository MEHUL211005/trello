import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { AlignLeft } from "lucide-react";
import { updateCard } from "../../redux/workspaceSlice";

function ModalDescription({card, cardContext}) {
    
    const [description, setDescription] = useState(
  card.description || ""
);

const [isEditing, setIsEditing] = useState(false);
const dispatch = useDispatch();

const handleSaveDescription = () => {
  dispatch(
    updateCard({
      ...cardContext,
      cardId: card.id,
      updates: {
        description,
      },
    })
  );

  setIsEditing(false);
};
useEffect(() => {
  setDescription(card.description || "");
  setIsEditing(false);
}, [card]);

  return (
    <section className="mt-6">
      <div className="flex items-center gap-3">
        <AlignLeft
          size={20}
          className="text-slate-600"
        />

        <h2 className="text-lg font-semibold text-slate-800">
          Description
        </h2>
      </div>

     {isEditing ? (
  <>
    <textarea
      value={description}
      onChange={(e) => setDescription(e.target.value)}
      className="
        mt-4
        min-h-[120px]
        w-full
        rounded-lg
        border
        border-slate-300
        bg-white
        p-4
        text-sm
        outline-none
        focus:border-sky-500
      "
      autoFocus
    />

    <div className="mt-3 flex gap-2">
        <button
        onClick={handleSaveDescription}
        className="rounded bg-sky-600 px-4 py-2 text-white hover:bg-sky-700"
        >
        Save
        </button>

      <button
        onClick={() => {
          setDescription(card.description || "");
          setIsEditing(false);
        }}
        className="rounded bg-slate-200 px-4 py-2 hover:bg-slate-300"
      >
        Cancel
      </button>
    </div>
  </>
) : (
  <div
    onClick={() => setIsEditing(true)}
    className="
      mt-4
      min-h-[120px]
      cursor-pointer
      rounded-lg
      bg-[#EAECF0]
      p-4
      text-sm
      text-slate-600
      hover:bg-[#DFE1E6]
    "
  >
    {card.description || "Add a more detailed description..."}
  </div>
)}
    </section>
  );
}

export default ModalDescription;