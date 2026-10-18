import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { createChecklist } from "../../api/checklistApi";
import { getErrorMessage } from "../../lib/validation";
import { inputCls, primaryBtn } from "./ui";

const MAX_TITLE = 60;

function ChecklistPopover({ cardContext, onClose }) {
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("Checklist");
  const [saving, setSaving] = useState(false);

  const handleAddChecklist = async () => {
    if (!title.trim()) {
      toast.error("Give the checklist a title");
      return;
    }

    setSaving(true);

    try {
      await createChecklist(cardContext.cardId, title.trim());

      await queryClient.invalidateQueries({
        queryKey: ["board", cardContext.boardId],
      });

      toast.success("Checklist added");
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not add the checklist"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold text-slate-600">
        Title
      </label>

      <input
        value={title}
        maxLength={MAX_TITLE}
        autoFocus
        onFocus={(e) => e.target.select()}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleAddChecklist()}
        placeholder="e.g. Launch tasks"
        className={inputCls}
      />

      <button
        onClick={handleAddChecklist}
        disabled={saving}
        className={`${primaryBtn} mt-4 w-full`}
      >
        {saving ? "Adding..." : "Add checklist"}
      </button>
    </div>
  );
}

export default ChecklistPopover;
