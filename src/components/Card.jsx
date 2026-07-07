import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { FaEdit } from "react-icons/fa";

function Card({ card, onDelete, onEdit }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(card.title);
  const [editedImage, setEditedImage] = useState(card.image || "");

  // SIMPLE DELETE MODAL
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: card.id,
  });

  const style = {
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px)`
      : undefined,
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

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className="group rounded-lg bg-white p-2 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
      >
        {/* EDIT MODE */}
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-slate-300 bg-white text-slate-800"
            />

            <label className="flex cursor-pointer items-center justify-center rounded-lg border border-slate-600 bg-white p-2 text-sm text-slate-800 hover:bg-slate-600">
Choose Image
  <input
    type="file"
    accept="image/*"
    className="hidden"
    onChange={(e) => {
      const file = e.target.files[0];
      if (file) {
        setEditedImage(URL.createObjectURL(file));
      }
    }}
  />
</label>

            {editedImage && (
              <img
                src={editedImage}
                alt="preview"
                className="h-32 w-full rounded-lg object-cover"
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
                  setEditedImage(card.image || "");
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
            {card.image && (
              <img
                src={card.image}
                alt={card.title}
               className="mb-2 h-28 w-full rounded-lg object-cover"
              />
            )}

            {/* CONTENT */}
            <div className="flex items-start justify-between gap-2 ">
              <p
                {...listeners}
                {...attributes}
               className="flex-1 cursor-grab text-[14px] leading-5 font-medium text-slate-800"
                onClick={() => setIsEditing(true)}
              >
                {card.title}
              </p>

              <div className="flex gap-1 opacity-0 transition-all duration-150 group-hover:opacity-100">
                <button
                  onClick={() => setIsEditing(true)}
                  className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                >
                  <FaEdit />
                </button>

                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-500 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* SIMPLE DELETE MODAL (LIKE LIST.JSX) */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-[90%] max-w-sm rounded-xl bg-slate-900 p-6">
            <h2 className="text-xl font-semibold text-white">
              Delete Card
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Are you sure you want to delete this card?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="rounded-lg bg-slate-700 px-4 py-2 text-white hover:bg-slate-600"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
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

export default Card;