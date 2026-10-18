import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckSquare, Check, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import {
  addChecklistItem,
  toggleChecklistItem,
  deleteChecklistItem,
  deleteChecklist,
} from "../../api/checklistApi";
import { useBoardPermissions } from "../../context/boardPermissions";
import { getErrorMessage } from "../../lib/validation";
import DeleteChecklistPopover from "./DeleteChecklistPopover";
import { SectionTitle, primaryBtn, ghostBtn, inputCls } from "./ui";

const MAX_ITEM_LENGTH = 200;

function Checklist({ card, cardContext }) {
  const { canEdit } = useBoardPermissions();
  const [activeChecklistId, setActiveChecklistId] = useState(null);
  const [itemTitle, setItemTitle] = useState("");
  const [deleteChecklistId, setDeleteChecklistId] = useState(null);

  const queryClient = useQueryClient();

  // Card data comes from the board query, so refresh that (and the log)
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["board"] });
    queryClient.invalidateQueries({
      queryKey: ["activities", cardContext.cardId],
    });
  };

  const onError = (message) => (error) => {
    toast.error(getErrorMessage(error, message));
  };

  const addItemMutation = useMutation({
    mutationFn: ({ checklistId, text }) => addChecklistItem(checklistId, text),
    onSuccess: refresh,
    onError: onError("Could not add the item"),
  });

  const toggleItemMutation = useMutation({
    mutationFn: (itemId) => toggleChecklistItem(itemId),
    onSuccess: refresh,
    onError: onError("Could not update the item"),
  });

  const deleteItemMutation = useMutation({
    mutationFn: (itemId) => deleteChecklistItem(itemId),
    onSuccess: refresh,
    onError: onError("Could not delete the item"),
  });

  const deleteChecklistMutation = useMutation({
    mutationFn: (checklistId) => deleteChecklist(checklistId),
    onSuccess: () => {
      refresh();
      toast.success("Checklist deleted");
    },
    onError: onError("Could not delete the checklist"),
  });

  const checklists = card.Checklists || [];

  if (!checklists.length) return null;

  const handleAddItem = (checklistId) => {
    if (!itemTitle.trim()) {
      toast.error("Type what needs to be done first");
      return;
    }

    addItemMutation.mutate({ checklistId, text: itemTitle.trim() });

    setItemTitle("");
    // Keep the box open so several items can be added in a row
  };

  return (
    <section className="space-y-5">
      {checklists.map((list) => {
        const items = list.ChecklistItems || [];
        const totalItems = items.length;
        const completedItems = items.filter((item) => item.completed).length;
        const percent =
          totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);
        const isDone = totalItems > 0 && completedItems === totalItems;

        return (
          <div
            key={list.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <SectionTitle
              icon={CheckSquare}
              title={list.title}
              action={
                canEdit && (
                <div className="relative">
                  <button
                    onClick={() =>
                      setDeleteChecklistId(
                        deleteChecklistId === list.id ? null : list.id,
                      )
                    }
                    className="rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                  >
                    Delete
                  </button>

                  {deleteChecklistId === list.id && (
                    <DeleteChecklistPopover
                      onDelete={() => {
                        deleteChecklistMutation.mutate(list.id);
                        setDeleteChecklistId(null);
                      }}
                      onClose={() => setDeleteChecklistId(null)}
                    />
                  )}
                </div>
                )
              }
            />

            {/* Progress */}
            <div className="flex items-center gap-3">
              <span
                className={`w-10 text-xs font-bold ${
                  isDone ? "text-accent-600" : "text-slate-500"
                }`}
              >
                {percent}%
              </span>

              <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isDone
                      ? "bg-accent-500"
                      : "bg-gradient-to-r from-brand-500 to-fuchsia-500"
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>

              <span className="text-xs text-slate-400">
                {completedItems}/{totalItems}
              </span>
            </div>

            {/* Items */}
            <div className="mt-3 space-y-0.5">
              {items.length === 0 ? (
                <p className="rounded-lg bg-slate-50 py-3 text-center text-sm text-slate-400">
                  {canEdit ? "No items yet. Add the first step below." : "No items yet."}
                </p>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="group flex items-center gap-3 rounded-lg px-2 py-1.5 transition hover:bg-slate-50"
                  >
                    <button
                      onClick={() => toggleItemMutation.mutate(item.id)}
                      disabled={!canEdit}
                      aria-label={
                        item.completed ? "Mark as not done" : "Mark as done"
                      }
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition ${
                        item.completed
                          ? "border-accent-500 bg-accent-500 text-white"
                          : "border-slate-300 text-transparent enabled:hover:border-brand-400"
                      }`}
                    >
                      <Check size={13} strokeWidth={3} />
                    </button>

                    <span
                      className={`flex-1 text-sm ${
                        item.completed
                          ? "text-slate-400 line-through"
                          : "text-slate-800"
                      }`}
                    >
                      {item.text}
                    </span>

                    {canEdit && (
                    <button
                      onClick={() => deleteItemMutation.mutate(item.id)}
                      aria-label="Delete item"
                      className="rounded-md p-1 text-slate-300 opacity-0 transition hover:bg-rose-50 hover:text-rose-500 group-hover:opacity-100"
                    >
                      <Trash2 size={15} />
                    </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Add item */}
            {!canEdit ? null : activeChecklistId === list.id ? (
              <div className="mt-3">
                <input
                  value={itemTitle}
                  maxLength={MAX_ITEM_LENGTH}
                  autoFocus
                  onChange={(e) => setItemTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddItem(list.id);
                    if (e.key === "Escape") {
                      e.stopPropagation();
                      setActiveChecklistId(null);
                      setItemTitle("");
                    }
                  }}
                  placeholder="Add an item"
                  className={inputCls}
                />

                <div className="mt-2.5 flex gap-2">
                  <button
                    onClick={() => handleAddItem(list.id)}
                    className={primaryBtn}
                  >
                    Add item
                  </button>

                  <button
                    onClick={() => {
                      setActiveChecklistId(null);
                      setItemTitle("");
                    }}
                    className={ghostBtn}
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  setActiveChecklistId(list.id);
                  setItemTitle("");
                }}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-brand-50 hover:text-brand-700"
              >
                <Plus size={15} />
                Add an item
              </button>
            )}
          </div>
        );
      })}
    </section>
  );
}

export default Checklist;
