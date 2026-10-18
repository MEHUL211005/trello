import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  Check,
  CheckSquare,
  Paperclip,
  Tag,
  UserPlus,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  toggleLabel,
  getCardLabels,
  getBoardLabels,
  createLabel,
} from "../../api/labelApi";
import { getErrorMessage } from "../../lib/validation";
import DatePicker from "./DatePicker";
import MembersPopover from "./MembersPopover";
import ChecklistPopover from "./ChecklistPopover";
import AttachmentPopover from "./AttachmentPopover";
import { Popover, inputCls, primaryBtn } from "./ui";

const LABEL_COLORS = [
  "#22c55e",
  "#3b82f6",
  "#eab308",
  "#ef4444",
  "#a855f7",
  "#ec4899",
  "#f97316",
  "#14b8a6",
];

const MAX_LABEL_NAME = 30;

function ModalActions({
  userId,
  workspaceId,
  boardId,
  listId,
  cardId,
  dueDate,
  assignedIds = [],
}) {
  const queryClient = useQueryClient();
  const containerRef = useRef(null);

  // Only one popover is open at a time
  const [open, setOpen] = useState(null);

  const toggle = (name) => setOpen((current) => (current === name ? null : name));
  const close = () => setOpen(null);

  // Click anywhere else to dismiss
  useEffect(() => {
    if (!open) return undefined;

    const handleClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(null);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const { data: boardLabelsData } = useQuery({
    queryKey: ["boardLabels", boardId],
    queryFn: () => getBoardLabels(boardId),
    enabled: !!boardId,
  });

  const { data: cardLabelsData } = useQuery({
    queryKey: ["cardLabels", cardId],
    queryFn: () => getCardLabels(cardId),
    enabled: !!cardId,
  });

  const availableLabels = boardLabelsData?.labels || [];
  const cardLabelIds = new Set(
    (cardLabelsData?.labels || []).map((label) => label.id),
  );

  const toggleLabelMutation = useMutation({
    mutationFn: ({ cardId, labelId }) => toggleLabel({ cardId, labelId }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cardLabels", cardId] });
      queryClient.invalidateQueries({ queryKey: ["board", boardId, "filters"] });
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
    },

    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not update the label"));
    },
  });

  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState(LABEL_COLORS[0]);

  const createLabelMutation = useMutation({
    mutationFn: () =>
      createLabel({
        name: newLabelName.trim(),
        color: newLabelColor,
        boardId,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boardLabels", boardId] });
      setNewLabelName("");
      toast.success("Label created");
    },

    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not create the label"));
    },
  });

  const handleCreateLabel = () => {
    if (!newLabelName.trim()) {
      toast.error("Give the label a name");
      return;
    }
    createLabelMutation.mutate();
  };

  const context = { userId, workspaceId, boardId, listId, cardId };

  const buttons = [
    { name: "labels", label: "Labels", icon: Tag, align: "left" },
    { name: "dates", label: "Dates", icon: Calendar, align: "left" },
    { name: "members", label: "Members", icon: UserPlus, align: "left" },
    { name: "checklist", label: "Checklist", icon: CheckSquare, align: "right" },
    { name: "attachments", label: "Attach", icon: Paperclip, align: "right" },
  ];

  return (
    <div ref={containerRef} className="relative">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">
          Add to card
        </span>

        {buttons.map((btn) => (
          <div key={btn.name} className="relative max-sm:static">
            <button
              onClick={() => toggle(btn.name)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                open === btn.name
                  ? "border-brand-300 bg-brand-50 text-brand-700 shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:border-brand-200 hover:bg-brand-50/60 hover:text-brand-700"
              }`}
            >
              <btn.icon size={16} />
              {btn.label}
            </button>

            {/* LABELS */}
            {btn.name === "labels" && open === "labels" && (
              <Popover title="Labels" onClose={close} align={btn.align}>
                <div className="max-h-56 space-y-1.5 overflow-y-auto pr-1">
                  {availableLabels.length === 0 && (
                    <p className="rounded-lg bg-slate-50 py-4 text-center text-xs text-slate-400">
                      No labels on this board yet. Create the first one below.
                    </p>
                  )}

                  {availableLabels.map((label) => {
                    const isSelected = cardLabelIds.has(label.id);

                    return (
                      <button
                        key={label.id}
                        onClick={() =>
                          toggleLabelMutation.mutate({
                            cardId,
                            labelId: label.id,
                          })
                        }
                        className="flex w-full items-center gap-2 rounded-lg p-1 transition hover:bg-slate-50"
                      >
                        <span
                          className="flex h-8 flex-1 items-center rounded-md px-3 text-left text-sm font-bold text-white [text-shadow:0_1px_1px_rgba(0,0,0,0.25)]"
                          style={{ backgroundColor: label.color }}
                        >
                          {label.name}
                        </span>
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                            isSelected
                              ? "border-brand-600 bg-brand-600 text-white"
                              : "border-slate-300 text-transparent"
                          }`}
                        >
                          <Check size={13} />
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3 border-t border-slate-100 pt-3">
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Create a label
                  </p>

                  <input
                    value={newLabelName}
                    maxLength={MAX_LABEL_NAME}
                    onChange={(e) => setNewLabelName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreateLabel()}
                    placeholder="e.g. Urgent, Design, Bug"
                    className={`${inputCls} mb-2.5`}
                  />

                  <div className="mb-3 flex flex-wrap gap-2">
                    {LABEL_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewLabelColor(color)}
                        aria-label={`Colour ${color}`}
                        style={{ backgroundColor: color }}
                        className={`h-7 w-7 rounded-full transition hover:scale-110 ${
                          newLabelColor === color
                            ? "ring-2 ring-slate-800 ring-offset-2"
                            : ""
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={handleCreateLabel}
                    disabled={createLabelMutation.isPending}
                    className={`${primaryBtn} w-full`}
                  >
                    {createLabelMutation.isPending ? "Creating..." : "Create label"}
                  </button>
                </div>
              </Popover>
            )}

            {btn.name === "dates" && open === "dates" && (
              <Popover title="Due date" onClose={close} align={btn.align}>
                <DatePicker
                  cardContext={context}
                  dueDate={dueDate}
                  onClose={close}
                />
              </Popover>
            )}

            {btn.name === "members" && open === "members" && (
              <Popover title="Members" onClose={close} align={btn.align}>
                <MembersPopover cardContext={context} assignedIds={assignedIds} />
              </Popover>
            )}

            {btn.name === "checklist" && open === "checklist" && (
              <Popover title="Add checklist" onClose={close} align={btn.align}>
                <ChecklistPopover cardContext={context} onClose={close} />
              </Popover>
            )}

            {btn.name === "attachments" && open === "attachments" && (
              <Popover title="Attach a file" onClose={close} align={btn.align}>
                <AttachmentPopover cardContext={context} onClose={close} />
              </Popover>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ModalActions;
