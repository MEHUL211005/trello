import {
  Paperclip,
  Tag,
  Calendar,
  CheckSquare,
  UserPlus,
} from "lucide-react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { toggleLabel } from "../../redux/workspaceSlice";
import DatePicker from "./DatePicker";
import MembersPopover from "./MembersPopover";
import ChecklistPopover from "./ChecklistPopover";
import AttachmentPopover from "./AttachmentPopover";

function ModalActions({
  userId,
  workspaceId,
  boardId,
  listId,
  cardId,
}) {
const [showLabels, setShowLabels] = useState(false);
const [showDates, setShowDates] = useState(false);
const [showMembers, setShowMembers] = useState(false);
const [showChecklist, setShowChecklist] = useState(false);
const [showAttachments, setShowAttachments] = useState(false);
const availableLabels = [
  {
    id: "red",
    name: "Bug",
    color: "#ef4444",
  },
  {
    id: "yellow",
    name: "Priority",
    color: "#eab308",
  },
  {
    id: "green",
    name: "Feature",
    color: "#22c55e",
  },
  {
    id: "blue",
    name: "Design",
    color: "#3b82f6",
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
const dispatch = useDispatch();
 return (
  <div className="mb-8">
    <div className="flex flex-wrap gap-3">
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
            className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm hover:bg-slate-100"
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

              <div className="space-y-2">
                {availableLabels.map((label) => (
                  <div
                    key={label.id}
                    onClick={() =>
                      dispatch(
                        toggleLabel({
                          userId,
                          workspaceId,
                          boardId,
                          listId,
                          cardId,
                          label,
                        })
                      )
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