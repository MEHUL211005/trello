import { useEffect, useState } from "react";
import { AlignLeft, Pencil } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { useBoardPermissions } from "../../context/boardPermissions";
import { updateCard as updateCardApi } from "../../api/cardApi";
import { getErrorMessage } from "../../lib/validation";
import { SectionTitle, primaryBtn, ghostBtn } from "./ui";

const MAX_DESCRIPTION = 5000;

function ModalDescription({ card, cardContext }) {
  const { canEdit } = useBoardPermissions();
  const [description, setDescription] = useState(card.description || "");

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  const handleSaveDescription = async () => {
    if (description.length > MAX_DESCRIPTION) {
      toast.error(`Description must be ${MAX_DESCRIPTION} characters or fewer`);
      return;
    }

    setSaving(true);

    try {
      await updateCardApi(card.id, {
        description,
      });

      queryClient.invalidateQueries({
        queryKey: ["board", cardContext.boardId],
      });
      queryClient.invalidateQueries({
        queryKey: ["activities", cardContext.cardId],
      });

      setIsEditing(false);
      toast.success("Description saved");
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not save the description"));
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    setDescription(card.description || "");
    setIsEditing(false);
  }, [card]);

  return (
    <section>
      <SectionTitle
        icon={AlignLeft}
        title="Description"
        action={
          canEdit &&
          card.description &&
          !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-brand-700"
            >
              <Pencil size={13} />
              Edit
            </button>
          )
        }
      />

      {isEditing ? (
        <>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                handleSaveDescription();
              }
            }}
            placeholder="Add context, links, acceptance criteria..."
            className="min-h-[150px] w-full resize-y rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
            autoFocus
          />

          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={handleSaveDescription}
              disabled={saving}
              className={primaryBtn}
            >
              {saving ? "Saving..." : "Save"}
            </button>

            <button
              onClick={() => {
                setDescription(card.description || "");
                setIsEditing(false);
              }}
              className={ghostBtn}
            >
              Cancel
            </button>

            <span className="ml-auto text-xs text-slate-400">
              Ctrl + Enter to save
            </span>
          </div>
        </>
      ) : (
        <div
          onClick={() => canEdit && setIsEditing(true)}
          className={`min-h-[84px] ${
            canEdit ? "cursor-pointer" : "cursor-default"
          } whitespace-pre-wrap rounded-xl border p-4 text-sm leading-6 transition ${
            card.description
              ? "border-transparent bg-slate-50 text-slate-700 hover:border-slate-200 hover:bg-white"
              : "border-dashed border-slate-300 bg-slate-50/60 text-slate-400 hover:border-brand-300 hover:bg-brand-50/50 hover:text-brand-600"
          }`}
        >
          {card.description ||
            (canEdit
              ? "Add a more detailed description..."
              : "No description yet.")}
        </div>
      )}
    </section>
  );
}

export default ModalDescription;
