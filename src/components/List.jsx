import { useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useDroppable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { deleteList as deleteListApi } from "../api/listApi";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { PanelLeftClose, MoreHorizontal } from "lucide-react";
import {
  createCard,
  deleteCard as deleteCardApi,
  updateCard,
} from "../api/cardApi";

import Card from "./Card";
import CardModal from "./CardModal";
import { uploadImage } from "../api/uploadApi";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
function List({ list }) {
  const { workspaceId, boardId } = useParams();

  const queryClient = useQueryClient();
  const { user } = useSelector((state) => state.auth);

  const [selectedCardId, setSelectedCardId] = useState(null);
  const dropZoneId = `${list.id}-cards`;
  const { setNodeRef: setDropRef } = useDroppable({
    id: dropZoneId,
    data: {
      type: "list",
      listId: list.id,
    },
  });

  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
  } = useSortable({
    id: list.id,
    data: {
      type: "list",
      listId: list.id,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [isAddingCard, setIsAddingCard] = useState(false);
  const [cardTitle, setCardTitle] = useState("");
  const [cardImage, setCardImage] = useState(null);
  const fileInputRef = useRef(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // ================= ADD CARD =================
  const handleAddCard = async () => {
    if (!cardTitle.trim()) return;

    try {
      await createCard({
        title: cardTitle,
        coverImage: cardImage,
        listId: list.id,
      });

      queryClient.invalidateQueries({
        queryKey: ["board", boardId],
      });

      setCardTitle("");
      setCardImage(null);
      setIsAddingCard(false);
    } catch (error) {
      console.error("Add card error:", error);
    }
  };

  // ================= DELETE CARD =================
  const handleDeleteCard = async (cardId) => {
    try {
      await deleteCardApi(cardId);

      queryClient.invalidateQueries({
        queryKey: ["board", boardId],
      });
    } catch (error) {
      console.error("Delete card error:", error);
    }
  };

  // ================= DELETE LIST =================
  const handleDeleteList = async () => {
    try {
      await deleteListApi(list.id);

      queryClient.invalidateQueries({
        queryKey: ["board", boardId],
      });

      setShowDeleteModal(false);
    } catch (error) {
      console.error("Delete list error:", error);
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
    } catch (error) {
      console.error("Edit card error:", error);
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
        className="flex max-h-[calc(100vh-220px)] w-[340px] flex-shrink-0 flex-col rounded-xl bg-[#F1F2F4] shadow-sm"
      >
        {/* HEADER */}
        {/* HEADER */}
        <div className="flex items-center justify-between px-3 py-2">
          {/* Left */}
          <h2
            {...attributes}
            {...listeners}
            className="cursor-grab select-none text-sm font-semibold text-slate-800"
          >
            {list.name}
          </h2>

          {/* Right */}
          <div className="flex items-center gap-1">
            {/* Number of Cards */}
            <button className="flex h-7 min-w-7 items-center justify-center rounded-md px-2 text-xs font-medium text-slate-600 hover:bg-slate-300 transition">
              {list.cards.length}
            </button>

            {/* Collapse */}
            <button className="rounded-md p-1.5 text-slate-600 hover:bg-slate-300 transition cursor-pointer">
              <PanelLeftClose size={16} />
            </button>

            {/* More Options */}
            <button className="rounded-md p-1.5 text-slate-600 hover:bg-slate-300 transition cursor-pointer">
              <MoreHorizontal size={16} />
            </button>

            {/* Delete */}
            <button
              onClick={() => setShowDeleteModal(true)}
              className="rounded-md p-1.5 text-red-500 hover:bg-red-100 hover:text-red-600 transition cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* CARDS */}
        {/* CARDS */}
        <div
          ref={setDropRef}
          className={`flex-1 overflow-y-auto px-2 pb-2 ${
            list.cards.length ? "pt-2" : "pt-0"
          }`}
        >
          <SortableContext
            items={[...(list.cards || [])]
              .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
              .map((card) => String(card.id))}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {[...(list.cards || [])]
                .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
                .map((card) => (
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
        </div>

        {/* ADD CARD */}
        {isAddingCard ? (
          <div className="px-2 pb-2">
            {/* Image Preview */}
            {cardImage && (
              <div className="mb-2 flex h-40 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
                <img
                  src={
                    cardImage?.startsWith("/uploads")
                      ? `http://localhost:5000${cardImage}`
                      : cardImage
                  }
                  alt="Preview"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            )}
            {/* Trello Composer */}
            <div className="rounded-xl bg-white shadow-sm border border-slate-200">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files[0];

                  if (!file) return;

                  try {
                    const url = await uploadImage(file);

                    setCardImage(url);
                  } catch (error) {
                    console.error("Upload error:", error);
                  }
                }}
              />
              <textarea
                value={cardTitle}
                onChange={(e) => setCardTitle(e.target.value)}
                onPaste={async (e) => {
                  const items = e.clipboardData.items;

                  for (const item of items) {
                    if (item.type.startsWith("image/")) {
                      e.preventDefault();

                      const file = item.getAsFile();

                      if (!file) return;

                      try {
                        const url = await uploadImage(file);

                        setCardImage(url);
                      } catch (error) {
                        console.error("Paste upload error:", error);
                      }

                      return;
                    }
                  }
                }}
                placeholder="Enter a title or paste a link"
                className="min-h-[20px] w-full resize-none rounded-xl border-none bg-transparent p-3 text-sm text-slate-800 placeholder:text-slate-500 outline-none"
              />
            </div>

            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={handleAddCard}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
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
        ) : (
          <button
            onClick={() => setIsAddingCard(true)}
            className="mx-2 mb-2 mt-1 w-[calc(100%-1rem)] cursor-pointer rounded-lg px-3 py-2 text-left text-sm text-slate-600 transition hover:bg-slate-300"
          >
            + Add Card
          </button>
        )}
      </div>

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

export default List;
