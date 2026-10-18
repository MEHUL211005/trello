import { memo, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useDroppable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  deleteList as deleteListApi,
  updateList as updateListApi,
} from "../api/listApi";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useBoardPermissions } from "../context/boardPermissions";
import { cardDndId, cardsDropId, listDndId } from "../lib/boardDnd";
import CoverImage from "./CoverImage";
import {
  imageErrorMessage,
  imageFromClipboard,
  uploadCardImage,
} from "../lib/imageUpload";
import { getErrorMessage } from "../lib/validation";
import { useQueryClient } from "@tanstack/react-query";
import { Archive, Pencil } from "lucide-react";
import { useArchive } from "../hooks/useArchive";
import {
  createCard,
  deleteCard as deleteCardApi,
  updateCard,
} from "../api/cardApi";

import Card from "./Card";
import CardModal from "./CardModal";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
const MAX_LIST_NAME = 100;

function List({ list }) {
  const { workspaceId, boardId } = useParams();
  const { canEdit, canDrag } = useBoardPermissions();

  const queryClient = useQueryClient();
  const { user } = useSelector((state) => state.auth);

  const [selectedCardId, setSelectedCardId] = useState(null);
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: cardsDropId(list.id),
    data: {
      type: "cards",
      listId: list.id,
    },
  });

  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: listDndId(list.id),
    // Viewers (and filtered views) can look but not rearrange
    disabled: !canDrag,
    transition: { duration: 220, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" },
    data: {
      type: "list",
      listId: list.id,
    },
  });

  // Translate only: scaling would squash lists of different heights
  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const [isAddingCard, setIsAddingCard] = useState(false);
  const composerRef = useRef(null);

  // Opening the composer scrolls the list so the new-card box is on screen
  useEffect(() => {
    if (isAddingCard) {
      composerRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [isAddingCard]);
  const [cardTitle, setCardTitle] = useState("");
  const [cardImage, setCardImage] = useState(null);
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  // Upload a picked or pasted image; the stored path becomes the card cover
  const attachImage = async (file) => {
    setUploading(true);

    try {
      setCardImage(await uploadCardImage(file));
    } catch (error) {
      toast.error(imageErrorMessage(error));
    } finally {
      setUploading(false);
    }
  };
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const { archive } = useArchive(boardId);

  // ================= RENAME LIST =================
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(list.name);
  const cancelNameEdit = useRef(false);

  const startNameEdit = () => {
    cancelNameEdit.current = false;
    setNameDraft(list.name);
    setEditingName(true);
  };

  // Runs when the box loses focus: Enter and clicking away save, Escape cancels
  const saveName = async () => {
    const name = nameDraft.trim();
    setEditingName(false);

    if (cancelNameEdit.current || name === list.name) return;

    if (!name) {
      toast.error("A list needs a name");
      return;
    }

    try {
      await updateListApi(list.id, { name });

      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
      queryClient.invalidateQueries({ queryKey: ["boards"] });
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not rename the list"));
    }
  };

  // ================= ARCHIVE LIST =================
  const handleArchiveList = async () => {
    setArchiving(true);
    await archive("list", list.id);
    setArchiving(false);
    setShowArchiveModal(false);
  };

  // ================= ADD CARD =================
  const handleAddCard = async () => {
    if (!cardTitle.trim()) {
      toast.error("Give the card a title");
      return;
    }

    try {
      await createCard({
        title: cardTitle,
        coverImage: cardImage,
        listId: list.id,
      });

      queryClient.invalidateQueries({
        queryKey: ["board", boardId],
      });
      queryClient.invalidateQueries({
        queryKey: ["board", boardId, "filters"],
      });

      setCardTitle("");
      setCardImage(null);
      setIsAddingCard(false);
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not add the card"));
    }
  };

  // ================= DELETE CARD =================
  const handleDeleteCard = async (cardId) => {
    try {
      await deleteCardApi(cardId);

      queryClient.invalidateQueries({
        queryKey: ["board", boardId],
      });
      queryClient.invalidateQueries({
        queryKey: ["board", boardId, "filters"],
      });
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not delete the card"));
    }
  };

  // ================= DELETE LIST =================
  const handleDeleteList = async () => {
    try {
      await deleteListApi(list.id);

      queryClient.invalidateQueries({
        queryKey: ["board", boardId],
      });
      queryClient.invalidateQueries({
        queryKey: ["board", boardId, "filters"],
      });

      setShowDeleteModal(false);
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not delete the list"));
    }
  };

  // ================= EDIT CARD =================
  const handleEditCard = async (cardId, newTitle, newImage) => {
    if (!newTitle.trim()) return;

    try {
      await updateCard(cardId, {
        title: newTitle,
        coverImage: newImage,
      });

      queryClient.invalidateQueries({
        queryKey: ["board", boardId],
      });
      queryClient.invalidateQueries({
        queryKey: ["board", boardId, "filters"],
      });
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not update the card"));
    }
  };

  const sortedCards = [...(list.cards || [])].sort(
    (a, b) => (a.position ?? 0) - (b.position ?? 0),
  );
  const selectedCard = list.cards.find((c) => c.id === selectedCardId);
  // console.log("SELECTED CARD:", selectedCard);

  return (
    <>
      <div
        ref={setSortableRef}
        style={style}
        className={`flex max-h-[calc(100vh-220px)] w-[340px] max-w-[calc(100vw-2.5rem)] flex-shrink-0 flex-col rounded-2xl backdrop-blur transition-shadow duration-200 ${
          isDragging
            ? "border-2 border-dashed border-white/60 bg-white/15 shadow-none [&>*]:invisible"
            : `bg-slate-100/95 shadow-lg shadow-black/10 ring-1 ${
                isOver ? "ring-2 ring-brand-400" : "ring-black/5"
              }`
        }`}
      >
        {/* HEADER */}
        {/* HEADER */}
        <div className="flex items-center justify-between px-3 py-2">
          {/* Left */}
          {editingName ? (
            <input
              autoFocus
              value={nameDraft}
              maxLength={MAX_LIST_NAME}
              aria-label="List name"
              onChange={(e) => setNameDraft(e.target.value)}
              onBlur={saveName}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
                if (e.key === "Escape") {
                  cancelNameEdit.current = true;
                  e.currentTarget.blur();
                }
              }}
              className="mr-2 min-w-0 flex-1 rounded-md border border-brand-400 bg-white px-2 py-1 text-sm font-semibold text-slate-800 outline-none ring-2 ring-brand-100"
            />
          ) : (
            <h2
              {...(canDrag ? attributes : {})}
              {...(canDrag ? listeners : {})}
              onDoubleClick={canEdit ? startNameEdit : undefined}
              title={canEdit ? "Double-click to rename" : undefined}
              className={`min-w-0 select-none truncate text-sm font-semibold text-slate-800 ${
                canDrag ? "cursor-grab" : "cursor-default"
              }`}
            >
              {list.name}
            </h2>
          )}

          {/* Right */}
          <div className="flex shrink-0 items-center gap-1">
            {/* Number of cards */}
            <span
              className="flex h-7 min-w-7 items-center justify-center rounded-md px-2 text-xs font-medium text-slate-600"
              title="Cards in this list"
            >
              {list.totalCards !== undefined
                ? `${list.cards.length}/${list.totalCards}`
                : list.cards.length}
            </span>

            {/* Rename */}
            {canEdit && (
              <button
                onClick={startNameEdit}
                aria-label="Rename list"
                title="Rename list"
                className="cursor-pointer rounded-md p-1.5 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
              >
                <Pencil size={14} />
              </button>
            )}

            {/* Archive */}
            {canEdit && (
              <button
                onClick={() => setShowArchiveModal(true)}
                aria-label="Archive list"
                title="Archive list"
                className="cursor-pointer rounded-md p-1.5 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
              >
                <Archive size={14} />
              </button>
            )}

            {/* Delete */}
            {canEdit && (
              <button
                onClick={() => setShowDeleteModal(true)}
                aria-label="Delete list"
                className="rounded-md p-1.5 text-red-500 hover:bg-red-100 hover:text-red-600 transition cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* CARDS */}
        {/* CARDS */}
        <div ref={setDropRef} className="flex min-h-0 flex-1 flex-col">
        <div
          className={`min-h-0 flex-1 overflow-y-auto px-2 ${
            list.cards.length || isAddingCard ? "pb-2 pt-2" : ""
          }`}
        >
          <SortableContext
            items={sortedCards.map((card) => cardDndId(card.id))}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {sortedCards.map((card) => (
                  <Card
                    key={card.id}
                    card={card}
                    onDelete={handleDeleteCard}
                    onEdit={handleEditCard}
                    onOpen={(card) => setSelectedCardId(card.id)}
                    cardContext={{
                      userId: user.id,
                      workspaceId,
                      boardId,
                      listId: list.id,
                      cardId: card.id,
                    }}
                  />
                ))}
            </div>
          </SortableContext>

          {/* New card: part of the scrolling area, so it can never squeeze the
              cards above it out of sight */}
          {canEdit && isAddingCard && (
            <div ref={composerRef} className="pt-2">
            {/* Image Preview */}
            {uploading && (
              <p className="mb-2 text-xs font-medium text-slate-500">
                Uploading image...
              </p>
            )}

            {cardImage && (
              <div className="relative mb-2">
                <CoverImage src={cardImage} alt="Preview" maxHeight="max-h-48" />
                <button
                  type="button"
                  onClick={() => setCardImage(null)}
                  className="absolute right-1.5 top-1.5 rounded-md bg-black/55 px-2 py-0.5 text-xs font-semibold text-white hover:bg-black/70"
                >
                  Remove
                </button>
              </div>
            )}
            {/* Card composer */}
            <div className="rounded-xl bg-white shadow-sm border border-slate-200">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files[0];
                  e.target.value = "";

                  if (file) attachImage(file);
                }}
              />
              <textarea
                value={cardTitle}
                onChange={(e) => setCardTitle(e.target.value)}
                onPaste={(e) => {
                  const file = imageFromClipboard(e);

                  if (!file) return; // plain text pastes as usual

                  e.preventDefault();
                  attachImage(file);
                }}
                placeholder="Enter a title or paste a link"
                autoFocus
                className="min-h-[20px] w-full resize-none rounded-xl border-none bg-transparent p-3 text-sm text-slate-800 placeholder:text-slate-500 outline-none"
              />
            </div>

            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={handleAddCard}
                disabled={uploading}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-60"
              >
                Add card
              </button>

              <button
                onClick={() => {
                  setIsAddingCard(false);
                  setCardTitle("");
                  setCardImage(null);
                }}
                className="rounded-md p-2 text-slate-600 hover:bg-slate-300"
              >
                ✕
              </button>
            </div>
          </div>
          )}

          {list.totalCards > 0 && list.cards.length === 0 && (
            <p className="px-1 py-3 text-center text-xs font-medium text-slate-400">
              No matching cards
            </p>
          )}
        </div>

        {/* ADD CARD */}
        {/* ADD CARD button (the composer itself lives with the cards) */}
        {canEdit && !isAddingCard && (
          <button
            onClick={() => setIsAddingCard(true)}
            className="mx-2 mb-2 mt-1 w-[calc(100%-1rem)] cursor-pointer rounded-lg px-3 py-2 text-left text-sm text-slate-600 transition hover:bg-slate-300"
          >
            + Add Card
          </button>
        )}
        </div>
      </div>

      {/* ARCHIVE LIST MODAL */}
      {showArchiveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div
            role="dialog"
            aria-label="Archive list"
            className="w-[90%] max-w-sm rounded-xl border border-slate-700 bg-slate-900 p-6"
          >
            <h2 className="text-xl font-semibold text-white">Archive List</h2>

            <p className="mt-2 text-sm text-slate-400">
              Archive &ldquo;{list.name}&rdquo;?
              <br />
              <span className="text-slate-300">
                It leaves the board with its {list.totalCards ?? list.cards.length}{" "}
                card(s). Nothing is deleted, and you can restore it any time
                from the board menu.
              </span>
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowArchiveModal(false)}
                className="rounded-lg bg-slate-700 px-4 py-2 text-white hover:bg-slate-600 cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleArchiveList}
                disabled={archiving}
                className="rounded-lg bg-brand-600 px-4 py-2 text-white hover:bg-brand-500 cursor-pointer disabled:opacity-60"
              >
                {archiving ? "Archiving..." : "Archive"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE LIST MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-[90%] max-w-sm rounded-xl border border-slate-700 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold text-white">Delete List</h2>

            <p className="mt-2 text-sm text-slate-400">
              Are you sure you want to delete this list?
              <br />
              <span className="text-red-400">
                All cards inside this list will also be deleted.
              </span>
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="rounded-lg bg-slate-700 px-4 py-2 text-white hover:bg-slate-600 cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteList}
                className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-500 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {selectedCard && (
        <CardModal
          card={selectedCard}
          list={list}
          cardContext={{
            userId: user.id,
            workspaceId,
            boardId,
            listId: list.id,
            cardId: selectedCard.id,
          }}
          onClose={() => setSelectedCardId(null)}
        />
      )}
    </>
  );
}

// Re-render only when this list (or its cards) actually changed, so
// dragging in one list does not redraw every other list
export default memo(List, (previous, next) => previous.list === next.list);
