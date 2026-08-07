import { Paperclip, Tag, Calendar, CheckSquare, UserPlus } from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleLabel } from "../../api/labelApi";
import { getCardLabels } from "../../api/labelApi";
import DatePicker from "./DatePicker";
import MembersPopover from "./MembersPopover";
import ChecklistPopover from "./ChecklistPopover";
import AttachmentPopover from "./AttachmentPopover";

function ModalActions({ userId, workspaceId, boardId, listId, cardId }) {
  const queryClient = useQueryClient();
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
  const [showLabels, setShowLabels] = useState(false);
  const [showDates, setShowDates] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const availableLabels = [
    {
      id: 1,
      name: "Bug",
      color: "#ef4444",
    },
    {
      id: 2,
      name: "Feature",
      color: "#3b82f6",
    },
    {
      id: 3,
      name: "Urgent",
      color: "#eab308",
    },
  ];
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
                  {availableLabels.map((label) => (
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
                        className="h-6 flex-1 rounded"
                        style={{ backgroundColor: label.color }}
                      />
                      <span className="text-sm">{label.name}</span>
                    </div>
                  ))}
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
