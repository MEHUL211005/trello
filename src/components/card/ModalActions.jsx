import { Paperclip, Tag, Calendar, CheckSquare, UserPlus, Check } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  toggleLabel,
  getCardLabels,
  getBoardLabels,
  createLabel,
} from "../../api/labelApi";
import DatePicker from "./DatePicker";
import MembersPopover from "./MembersPopover";
import ChecklistPopover from "./ChecklistPopover";
import AttachmentPopover from "./AttachmentPopover";

function ModalActions({ userId, workspaceId, boardId, listId, cardId }) {
  const queryClient = useQueryClient();

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
    (cardLabelsData?.labels || []).map((label) => label.id)
  );

  const toggleLabelMutation = useMutation({
    mutationFn: ({ cardId, labelId }) =>
      toggleLabel({
        cardId,
        labelId,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["cardLabels", cardId],
      });
      queryClient.invalidateQueries({
        queryKey: ["board", boardId, "filters"],
      });
      queryClient.invalidateQueries({
        queryKey: ["board", boardId],
      });
    },

    onError: (error) => {
      console.log("LABEL TOGGLE ERROR:", error);
    },
  });

  const labelColorPalette = [
    "#22c55e",
    "#3b82f6",
    "#eab308",
    "#ef4444",
    "#a855f7",
    "#ec4899",
    "#f97316",
    "#14b8a6",
  ];

  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState(labelColorPalette[0]);

  const createLabelMutation = useMutation({
    mutationFn: () =>
      createLabel({
        name: newLabelName,
        color: newLabelColor,
        boardId,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["boardLabels", boardId],
      });

      setNewLabelName("");
    },

    onError: (error) => {
      console.log("CREATE LABEL ERROR:", error);
    },
  });

  const [showLabels, setShowLabels] = useState(false);
  const [showDates, setShowDates] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const buttons = [
    {
      icon: <Paperclip size={16} />,
      label: "Attachments",
    },
    {
      icon: <Tag size={16} />,
      label: "Labels",
    },
    {
      icon: <Calendar size={16} />,
      label: "Dates",
    },
    {
      icon: <CheckSquare size={16} />,
      label: "Checklist",
    },
    {
      icon: <UserPlus size={16} />,
      label: "Members",
    },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2">
        {buttons.map((btn) => (
          <div key={btn.label} className="relative">
            <button
              onClick={() => {
                if (btn.label === "Labels") {
                  setShowLabels((prev) => !prev);
                  setShowDates(false);
                  setShowMembers(false);
                  setShowChecklist(false);
                  setShowAttachments(false);
                }

                if (btn.label === "Dates") {
                  setShowDates((prev) => !prev);
                  setShowLabels(false);
                  setShowMembers(false);
                  setShowChecklist(false);
                  setShowAttachments(false);
                }

                if (btn.label === "Members") {
                  setShowMembers((prev) => !prev);
                  setShowLabels(false);
                  setShowDates(false);
                  setShowChecklist(false);
                  setShowAttachments(false);
                }
                if (btn.label === "Checklist") {
                  setShowChecklist((prev) => !prev);

                  setShowLabels(false);
                  setShowDates(false);
                  setShowMembers(false);
                  setShowAttachments(false);
                }
                if (btn.label === "Attachments") {
                  setShowAttachments((prev) => !prev);
                  setShowLabels(false);
                  setShowDates(false);
                  setShowMembers(false);
                  setShowChecklist(false);
                }
              }}
              className="
              flex
              items-center
              gap-1.5
              rounded-md
              border
              border-slate-300
              bg-white
              px-3
              py-2
              text-sm
              hover:bg-slate-100
            "
            >
              {btn.icon}
              {btn.label}
            </button>

            {/* LABELS */}
            {btn.label === "Labels" && showLabels && (
              <div className="absolute left-0 top-full z-50 mt-2 w-72 rounded-lg border border-slate-200 bg-white p-4 shadow-xl">
                <h3 className="mb-3 text-center text-sm font-semibold">
                  Labels
                </h3>

                <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                  {availableLabels.length === 0 && (
                    <p className="text-center text-xs text-slate-400">
                      No labels on this board yet
                    </p>
                  )}

                  {availableLabels.map((label) => {
                    const isSelected = cardLabelIds.has(label.id);

                    return (
                      <div
                        key={label.id}
                        onClick={() =>
                          toggleLabelMutation.mutate({
                            cardId,
                            labelId: label.id,
                          })
                        }
                        className="flex cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-slate-100"
                      >
                        <div
                          className="flex h-6 flex-1 items-center rounded px-2"
                          style={{ backgroundColor: label.color }}
                        >
                          {isSelected && (
                            <Check size={14} className="text-white" />
                          )}
                        </div>
                        <span className="text-sm">{label.name}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-3 border-t border-slate-200 pt-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Create a label
                  </p>

                  <input
                    value={newLabelName}
                    onChange={(e) => setNewLabelName(e.target.value)}
                    placeholder="Label name..."
                    className="mb-2 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-blue-500"
                  />

                  <div className="mb-3 flex flex-wrap gap-2">
                    {labelColorPalette.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewLabelColor(color)}
                        style={{ backgroundColor: color }}
                        className={`h-6 w-6 rounded-full ${
                          newLabelColor === color
                            ? "ring-2 ring-offset-2 ring-slate-500"
                            : ""
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => createLabelMutation.mutate()}
                    disabled={
                      !newLabelName.trim() || createLabelMutation.isPending
                    }
                    className="w-full rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-500 disabled:opacity-50"
                  >
                    {createLabelMutation.isPending ? "Creating..." : "Create"}
                  </button>
                </div>
              </div>
            )}

            {/* DATES */}
            {btn.label === "Dates" && showDates && (
              <DatePicker
                cardContext={{
                  userId,
                  workspaceId,
                  boardId,
                  listId,
                  cardId,
                }}
                onClose={() => setShowDates(false)}
              />
            )}

            {/* MEMBERS */}
            {btn.label === "Members" && showMembers && (
              <MembersPopover
                cardContext={{
                  userId,
                  workspaceId,
                  boardId,
                  listId,
                  cardId,
                }}
                onClose={() => setShowMembers(false)}
              />
            )}

            {/*Checklist*/}
            {btn.label === "Checklist" && showChecklist && (
              <ChecklistPopover
                cardContext={{
                  userId,
                  workspaceId,
                  boardId,
                  listId,
                  cardId,
                }}
                onClose={() => setShowChecklist(false)}
              />
            )}
            {/* Attachments */}
            {btn.label === "Attachments" && showAttachments && (
              <AttachmentPopover
                cardContext={{
                  userId,
                  workspaceId,
                  boardId,
                  listId,
                  cardId,
                }}
                onClose={() => setShowAttachments(false)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ModalActions;
