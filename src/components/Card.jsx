import { memo, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FaEdit } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { toggleCardCompletedApi } from "../api/cardApi";
import { useBoardPermissions } from "../context/boardPermissions";
import { cardDndId } from "../lib/boardDnd";
import CoverImage from "./CoverImage";
import {
  imageErrorMessage,
  imageFromClipboard,
  uploadCardImage,
} from "../lib/imageUpload";
import { getErrorMessage } from "../lib/validation";
import { getCardLabels } from "../api/labelApi";
import {
  AlignLeft,
  Archive,
  CheckSquare,
  Clock,
  Paperclip,
  MessageSquare,
  Circle,
  CheckCircle2,
} from "lucide-react";
import { useArchive } from "../hooks/useArchive";
import { getInitials } from "../lib/user";

const MAX_AVATARS = 3;

function Card({ card, onDelete, onEdit, onOpen, cardContext }) {
  //  console.log("CARD DATA:", card);
  const queryClient = useQueryClient();
  const { canEdit, canDrag } = useBoardPermissions();
  const { archive } = useArchive(cardContext.boardId);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(card.title);
  const [editedImage, setEditedImage] = useState(card.coverImage || "");
  // SIMPLE DELETE MODAL
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const handleToggleComplete = async () => {
    try {
      await toggleCardCompletedApi(card.id);

      queryClient.invalidateQueries({
        queryKey: ["board", cardContext.boardId],
      });
      queryClient.invalidateQueries({
        queryKey: ["board", cardContext.boardId, "filters"],
      });
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not update the card"));
    }
  };
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: cardDndId(card.id),
    // Viewers (and filtered views) can open cards but not drag them
    disabled: !canDrag,
    transition: { duration: 220, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" },
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
  // Translate only: scaling would squash cards of different heights
  const style = {
    transform: CSS.Translate.toString(transform),
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

  const members = card.members || [];
  const attachmentCount = card.Attachments?.length || 0;
  const commentCount = card.Comments?.length || 0;
  const hasDescription = !!card.description?.trim();
  const hasBadges =
    !!card.dueDate ||
    hasDescription ||
    totalChecklistItems > 0 ||
    attachmentCount > 0 ||
    commentCount > 0 ||
    members.length > 0;

  // Due date colours: done, overdue, due today, or just a date
  const dueDate = card.dueDate ? new Date(card.dueDate) : null;
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const dueDay = dueDate ? new Date(dueDate) : null;
  dueDay?.setHours(0, 0, 0, 0);
  const dueTone = card.isCompleted
    ? "bg-green-100 text-green-700"
    : dueDay && dueDay < startOfToday
      ? "bg-rose-100 text-rose-700"
      : dueDay && dueDay.getTime() === startOfToday.getTime()
        ? "bg-amber-100 text-amber-800"
        : "bg-slate-100 text-slate-700";
  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...(canDrag ? listeners : {})}
        {...(canDrag ? attributes : {})}
        className={`
 animate-card-in
 relative
 group
 overflow-hidden
 rounded-xl
 border
 border-transparent
 bg-white
 p-2
 shadow-sm
 ${canDrag ? "cursor-grab" : "cursor-pointer"}
 ${
   isDragging
     ? "border-dashed !border-brand-400 bg-brand-50/70 shadow-none ring-0 [&>*]:invisible"
     : ""
 }
 transition-all
 duration-200
 hover:-translate-y-0.5
 hover:shadow-md
 hover:border-sky-500
 hover:ring-2
 hover:ring-sky-500/30
 `}
      >
        {/* EDIT MODE */}
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onPaste={async (e) => {
                const file = imageFromClipboard(e);

                if (!file) return;

                e.preventDefault();
                setUploading(true);

                try {
                  // Stored on the server, so it is still there after saving
                  setEditedImage(await uploadCardImage(file));
                  toast.success("Image added");
                } catch (error) {
                  toast.error(imageErrorMessage(error));
                } finally {
                  setUploading(false);
                }
              }}
              rows={3}
              className="w-full rounded-lg border border-slate-300 bg-white text-slate-800"
            />

            {uploading && (
              <p className="text-xs font-medium text-slate-500">Uploading image...</p>
            )}

            {editedImage && (
              <div className="relative">
                <CoverImage src={editedImage} alt="Cover preview" maxHeight="max-h-40" />
                <button
                  type="button"
                  onClick={() => setEditedImage("")}
                  className="absolute right-1.5 top-1.5 rounded-md bg-black/55 px-2 py-0.5 text-xs font-semibold text-white hover:bg-black/70"
                >
                  Remove
                </button>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={uploading}
                className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-500 cursor-pointer disabled:opacity-60"
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
              <CoverImage src={card.coverImage} alt={card.title} className="mb-2" />
            )}
            {/* LABELS */}
            {labels.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1">
                {labels.map((label) => (
                  <div
                    key={label.id}
                    title={label.name}
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
                    disabled={!canEdit}
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
                  <p
                    className={`break-words whitespace-normal text-[14px] font-medium leading-5 ${
                      card.isCompleted
                        ? "text-slate-400 line-through decoration-slate-400"
                        : "text-slate-800"
                    }`}
                  >
                    {card.title}
                  </p>

                  {/* Everything set in the card dialog shows up here */}
                  {hasBadges && (
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      {/* Due date */}
                      {card.dueDate && (
                        <span
                          title={`Due ${dueDate.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`}
                          className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium ${dueTone}`}
                        >
                          <Clock size={12} className="shrink-0" />
                          {dueDate.toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      )}

                      {/* Description */}
                      {hasDescription && (
                        <span
                          title="This card has a description"
                          className="inline-flex items-center rounded-md px-1 py-0.5 text-slate-500"
                        >
                          <AlignLeft size={14} />
                        </span>
                      )}

                      {/* Checklist */}
                      {totalChecklistItems > 0 && (
                        <span
                          title="Checklist items done"
                          className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium ${
                            completedChecklistItems === totalChecklistItems
                              ? "bg-green-100 text-green-700"
                              : "text-slate-600"
                          }`}
                        >
                          <CheckSquare size={13} className="shrink-0" />
                          {completedChecklistItems}/{totalChecklistItems}
                        </span>
                      )}

                      {/* Attachments */}
                      {attachmentCount > 0 && (
                        <span
                          title={`${attachmentCount} attachment${attachmentCount === 1 ? "" : "s"}`}
                          className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium text-slate-600"
                        >
                          <Paperclip size={13} className="shrink-0" />
                          {attachmentCount}
                        </span>
                      )}

                      {/* Comments */}
                      {commentCount > 0 && (
                        <span
                          title={`${commentCount} comment${commentCount === 1 ? "" : "s"}`}
                          className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium text-slate-600"
                        >
                          <MessageSquare size={13} className="shrink-0" />
                          {commentCount}
                        </span>
                      )}

                      {/* Members */}
                      {members.length > 0 && (
                        <span className="ml-auto flex shrink-0 pl-1">
                          {members.slice(0, MAX_AVATARS).map((member, index) => (
                            <span
                              key={member.id}
                              className={`flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-blue-500 text-[10px] font-semibold text-white ${
                                index !== 0 ? "-ml-2" : ""
                              }`}
                              title={member.name}
                            >
                              {getInitials(member.name)}
                            </span>
                          ))}
                          {members.length > MAX_AVATARS && (
                            <span
                              className="-ml-2 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-white bg-slate-200 px-1 text-[10px] font-semibold text-slate-600"
                              title={members
                                .slice(MAX_AVATARS)
                                .map((member) => member.name)
                                .join(", ")}
                            >
                              +{members.length - MAX_AVATARS}
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {canEdit && (
                <div className="absolute right-1 top-1 z-10 flex gap-0.5 rounded-lg bg-white/95 p-0.5 opacity-0 shadow-sm ring-1 ring-slate-200 transition-opacity duration-150 focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100">
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
                      archive("card", card.id);
                    }}
                    aria-label="Archive card"
                    title="Archive card"
                    className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                  >
                    <Archive size={14} />
                  </button>

                  <button
                    aria-label="Delete card"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteModal(true);
                    }}
                    className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-red-600 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                )}
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

// Re-render only when this card's own data changes (the handlers passed in
// only depend on things that never change while the board is open)
export default memo(Card, (previous, next) => previous.card === next.card);
