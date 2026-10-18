import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { updateDueDate } from "../../api/cardApi";
import { getErrorMessage } from "../../lib/validation";
import { addDays, toInputDate } from "../../lib/time";
import { inputCls, primaryBtn } from "./ui";

const QUICK_PICKS = [
  { label: "Today", days: 0 },
  { label: "Tomorrow", days: 1 },
  { label: "Next week", days: 7 },
];

function DatePicker({ cardContext, dueDate, onClose }) {
  const [date, setDate] = useState(toInputDate(dueDate));

  const queryClient = useQueryClient();

  const updateDueDateMutation = useMutation({
    mutationFn: ({ cardId, dueDate }) => updateDueDate(cardId, dueDate),

    onSuccess: (_data, { dueDate }) => {
      queryClient.invalidateQueries({
        queryKey: ["board", cardContext.boardId],
      });
      queryClient.invalidateQueries({
        queryKey: ["board", cardContext.boardId, "filters"],
      });
      queryClient.invalidateQueries({
        queryKey: ["activities", cardContext.cardId],
      });

      toast.success(dueDate ? "Due date saved" : "Due date removed");
      onClose();
    },

    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not update the due date"));
    },
  });

  const handleSave = () => {
    if (!date) {
      toast.error("Pick a date first");
      return;
    }

    updateDueDateMutation.mutate({
      cardId: cardContext.cardId,
      dueDate: date,
    });
  };

  const handleRemove = () => {
    updateDueDateMutation.mutate({
      cardId: cardContext.cardId,
      dueDate: null,
    });
  };

  return (
    <div>
      <div className="mb-3 flex gap-2">
        {QUICK_PICKS.map((pick) => (
          <button
            key={pick.label}
            onClick={() => setDate(addDays(pick.days))}
            className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-semibold transition ${
              date === addDays(pick.days)
                ? "border-brand-300 bg-brand-50 text-brand-700"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {pick.label}
          </button>
        ))}
      </div>

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className={inputCls}
      />

      <div className="mt-4 flex gap-2">
        <button
          onClick={handleSave}
          disabled={updateDueDateMutation.isPending}
          className={`${primaryBtn} flex-1`}
        >
          {updateDueDateMutation.isPending ? "Saving..." : "Save"}
        </button>

        {dueDate && (
          <button
            onClick={handleRemove}
            disabled={updateDueDateMutation.isPending}
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}

export default DatePicker;
