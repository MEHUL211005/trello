import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useDroppable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useParams } from "react-router-dom";
import {
  PanelLeftClose,
  MoreHorizontal,
} from "lucide-react";
import {
  addCard,
  deleteList,
  deleteCard,
  editCard,
} from "../redux/workspaceSlice";

import Card from "./Card";

function List({ list }) {
  const { workspaceId, boardId } = useParams();

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const { setNodeRef: setDropRef } = useDroppable({
    id: list.id,
  });

  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
  } = useSortable({
    id: list.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [isAddingCard, setIsAddingCard] = useState(false);
  const [cardTitle, setCardTitle] = useState("");
  const [cardImage, setCardImage] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // ================= ADD CARD =================
  const handleAddCard = () => {
    if (!cardTitle.trim()) return;

    dispatch(
      addCard({
        userId: user.id,
        workspaceId,
        boardId,
        listId: list.id,
        card: {
          title: cardTitle,
          image: cardImage,
        },
      })
    );

    setCardTitle("");
    setCardImage(null);
    setIsAddingCard(false);
  };

  // ================= DELETE CARD =================
  const handleDeleteCard = (cardId) => {
    dispatch(
      deleteCard({
        userId: user.id,
        workspaceId,
        boardId,
        listId: list.id,
        cardId,
      })
    );
  };

  // ================= DELETE LIST =================
  const handleDeleteList = () => {
    dispatch(
      deleteList({
        userId: user.id,
        workspaceId,
        boardId,
        listId: list.id,
      })
    );

    setShowDeleteModal(false);
  };

  // ================= EDIT CARD =================
  const handleEditCard = (cardId, newTitle, newImage) => {
    if (!newTitle.trim()) return;

    dispatch(
      editCard({
        userId: user.id,
        workspaceId,
        boardId,
        listId: list.id,
        cardId,
        title: newTitle,
        image: newImage,
      })
    );
  };

  return (
    <>
      <div
        ref={(node) => {
          setDropRef(node);
          setSortableRef(node);
        }}
        style={style}
        className="w-[100px] sm:w-[340px] flex-shrink-0 rounded-xl bg-[#F1F2F4] shadow-sm"
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
    {list.title}
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
       <div
  className={`space-y-2 px-2 ${
    list.cards.length ? "pt-2 pb-2" : "py-0"
  }`}
>
  {list.cards.map((card) => (
    <Card
      key={card.id}
      card={card}
      onDelete={handleDeleteCard}
      onEdit={handleEditCard}
    />
  ))}
</div>

        {/* ADD CARD */}
        {isAddingCard ? (
          <div className="px-4 pb-4">
            <textarea
              value={cardTitle}
              onChange={(e) => setCardTitle(e.target.value)}
              placeholder="Enter card title..."
              className="w-full resize-none rounded-lg border border-slate-300 bg-white text-slate-800 outline-none focus:border-blue-500"
            />
<label className="mt-2 flex cursor-pointer items-center justify-center rounded-lg border border-slate-600 bg-slate-700 p-3 text-slate-100 hover:bg-slate-600">
  Choose Image
  <input
    type="file"
    accept="image/*"
    className="hidden"
    onChange={(e) => {
      const file = e.target.files[0];
      if (file) {
        const url = URL.createObjectURL(file);
        setCardImage(url);
      }
    }}
  />
</label>

            {cardImage && (
              <img
                src={cardImage}
                alt="Preview"
                className="mt-3 h-32 w-full rounded-lg object-cover"
              />
            )}

            <div className="mt-3 flex gap-2">
              <button
                onClick={handleAddCard}
                className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 hover:bg-blue-500 text-slate-100"
              >
                Add a Card
              </button>

              <button
                onClick={() => {
                  setIsAddingCard(false);
                  setCardTitle("");
                  setCardImage(null);
                }}
                className="cursor-pointer rounded-lg bg-slate-700 px-4 py-2 hover:bg-slate-600 text-slate-100"
              >
                X
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
            <h2 className="text-xl font-semibold text-white">
              Delete List
            </h2>

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
                className="rounded-lg bg-slate-700 px-4 py-2 text-white hover:bg-slate-600"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteList}
                className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-500"
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

export default List;