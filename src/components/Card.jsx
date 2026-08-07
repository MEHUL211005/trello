import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FaEdit } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { toggleCardCompletedApi } from "../api/cardApi";
import { getCardLabels } from "../api/labelApi";
import {
  CheckSquare,
  Paperclip,
  MessageSquare,
  Circle,
  CheckCircle2,
} from "lucide-react";

function Card({ card, onDelete, onEdit, onOpen, cardContext }) {
  //  console.log("CARD DATA:", card);
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(card.title);
  const [editedImage, setEditedImage] = useState(card.coverImage || "");
  // SIMPLE DELETE MODAL
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const handleToggleComplete = async (e) => {
    try {
      await toggleCardCompletedApi(card.id);

      queryClient.invalidateQueries({
        queryKey: ["board", cardContext.boardId],
      });
      queryClient.invalidateQueries({
        queryKey: ["board", cardContext.boardId, "filters"],
      });
    } catch (error) {
      console.log(error);
    }
  };
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: card.id,
    data: {
      type: "card",
      cardId: card.id,
      listId: card.listId,
    },
  });
  const { data: labelsData } = useQuery({
    queryKey: ["cardLabels", card.id],

    queryFn: () => getCardLabels(card.id),

    enabled: !!card.id,
  });

  const labels = labelsData?.labels || [];
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSave = () => {
    if (!editedTitle.trim()) return;

    onEdit(card.id, editedTitle, editedImage);
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDelete(card.id);
    setShowDeleteModal(false);
  };
  const totalChecklistItems =
    card.Checklists?.reduce(
      (total, checklist) => total + (checklist.ChecklistItems?.length || 0),
      0,
    ) || 0;

  const completedChecklistItems =
    card.Checklists?.reduce(
      (total, checklist) =>
        total +
        (checklist.ChecklistItems?.filter((item) => item.completed).length ||
          0),
      0,
    ) || 0;
  // console.log("CARD ATTACHMENTS:", card.Attachments);
  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        className="
 relative
 group
 overflow-hidden
 rounded-xl
 border
 border-transparent
 bg-white
 p-2
 shadow-sm
 cursor-grab
 transition-all
 duration-200
 hover:-translate-y-0.5
 hover:shadow-md
 hover:border-sky-500
 hover:ring-2
 hover:ring-sky-500/30
 "
      >
        {/* EDIT MODE */}
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onPaste={(e) => {
                const items = e.clipboardData.items;

                for (const item of items) {
                  if (item.type.startsWith("image/")) {
                    e.preventDefault();

                    const file = item.getAsFile();

                    if (!file) return;

                    const imageUrl = URL.createObjectURL(file);

                    setEditedImage(imageUrl);

                    return;
                  }
                }
              }}
              rows={3}
              className="w-full rounded-lg border border-slate-300 bg-white text-slate-800"
            />

            {editedImage && (
              <img
                src={editedImage}
                alt="preview"
                className="h-32 w-full rounded-lg object-contain"
              />
            )}

            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-500 cursor-pointer"
              >
                Save
              </button>

              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditedTitle(card.title);
                  setEditedImage(card.coverImage || "");
                }}
                className="rounded-lg bg-slate-600 px-3 py-2 text-sm text-white hover:bg-slate-500 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* IMAGE */}
            {card.coverImage && (
              <div className="mb-2 flex h-28 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
                <img
                  src={
                    card.coverImage.startsWith("http")
                      ? card.coverImage
                      : `http://localhost:5000${card.coverImage}`
                  }
                  alt={card.title}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            )}
            {/* LABELS */}
            {labels.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1">
                {labels.map((label) => (
                  <div
                    key={label.id}
                    className="h-3 w-16 rounded-sm"
                    style={{
                      backgroundColor: label.color,
                    }}
                  />
                ))}
              </div>
            )}

            {/* CONTENT */}
            <div className="flex min-w-0 items-start justify-between gap-2">
              <div onClick={() => onOpen(card)} className="flex min-w-0 flex-1">
                <div
                  className={`
    mr-2
    mt-0.5
    transition-all
    duration-200
    ${
      card.isCompleted
        ? "opacity-100 translate-x-0"
        : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
    }
  `}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleComplete(e);
                    }}
                    className="
    cursor-pointer
    rounded-full
    transition-transform
    hover:scale-110
  "
                  >
                    {card.isCompleted ? (
                      <CheckCircle2 size={18} className="text-green-600" />
                    ) : (
                      <Circle
                        size={18}
                        className="text-slate-400 hover:text-green-600"
                      />
                    )}
                  </button>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="break-words whitespace-normal text-[14px] font-medium leading-5 text-slate-800">
                    {card.title}
                  </p>

                  <div className="mt-2 flex items-center justify-between">
                    {/* Due Date */}
                    {card.dueDate ? (
                      <div className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700">
                        📅{" "}
                        {new Date(card.dueDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </div>
                    ) : (
                      <div />
                    )}
                    {totalChecklistItems > 0 && (
                      <div
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs ${
                          completedChecklistItems === totalChecklistItems
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        <CheckSquare size={13} />{" "}
                        <span>
                          {completedChecklistItems}/{totalChecklistItems}
                        </span>
                      </div>
                    )}
                    {card.Attachments?.length > 0 && (
                      <div className="flex items-center gap-1 text-xs text-slate-600 ml-2">
                        <Paperclip size={14} />
                        {card.Attachments.length}
                      </div>
                    )}
                    {card.comments?.length > 0 && (
                      <div className="flex items-center gap-2 text-xs text-slate-600 ml-2">
                        <MessageSquare size={14} />
                        {card.comments.length}
                      </div>
                    )}
                    {/* Members */}
                    {/* console.log("CARD MEMBERS:", card.members); */}
                    {card.members?.length > 0 && (
                      <div className="ml-auto flex">
                        {card.members.map((member, index) => (
                          <div
                            key={member.id}
                            className={`flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-blue-500 text-[10px] font-semibold text-white ${
                              index !== 0 ? "-ml-2" : ""
                            }`}
                            title={member.name}
                          >
                            {member.name?.charAt(0).toUpperCase()}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-1 opacity-0 transition-all duration-150 group-hover:opacity-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditing(true);
                    }}
                    className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                  >
                    <FaEdit />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteModal(true);
                    }}
                    className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-red-600 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* SIMPLE DELETE MODAL (LIKE LIST.JSX) */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-[90%] max-w-sm rounded-xl bg-slate-900 p-6">
            <h2 className="text-xl font-semibold text-white">Delete Card</h2>

            <p className="mt-2 text-sm text-slate-400">
              Are you sure you want to delete this card?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="rounded-lg bg-slate-700 px-4 py-2 text-white hover:bg-slate-600 cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-500 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Card;
