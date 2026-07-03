import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { FaEdit } from "react-icons/fa";

function Card({ card, onDelete, onEdit }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(card.title);
  const [editedImage, setEditedImage] = useState(card.image || "");

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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group rounded-xl border border-slate-700 bg-slate-700 p-3 shadow-sm transition-all duration-200 hover:bg-slate-600 hover:shadow-lg"
    >
      {/* EDIT MODE */}
      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-lg border border-slate-600 bg-slate-800 p-2 text-slate-100 outline-none focus:border-blue-500"
          />

          <input
            type="url"
            value={editedImage}
            onChange={(e) => setEditedImage(e.target.value)}
            placeholder="Paste image URL (optional)"
            className="w-full rounded-lg border border-slate-600 bg-slate-800 p-2 text-slate-100 outline-none focus:border-blue-500"
          />

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="cursor-pointer rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium transition-all duration-200 hover:bg-blue-500"
            >
              Save
            </button>

            <button
              onClick={() => {
                setIsEditing(false);
                setEditedTitle(card.title);
                setEditedImage(card.image || "");
              }}
              className="cursor-pointer rounded-lg bg-slate-600 px-3 py-2 text-sm transition-all duration-200 hover:bg-slate-500"
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
              className="mb-3 h-40 w-full rounded-lg object-cover"
            />
          )}

          {/* CONTENT */}
          <div className="flex items-start justify-between gap-2">
            <p
              {...listeners}
              {...attributes}
              className="flex-1 cursor-grab select-none text-sm font-medium text-slate-100"
              onClick={() => setIsEditing(true)}
            >
              {card.title}
            </p>

            {/* ACTIONS */}
            <div className="flex items-center gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <button
                onClick={() => setIsEditing(true)}
                className="cursor-pointer text-blue-400 transition-all duration-200 hover:text-blue-300"
              >
                <FaEdit />
              </button>

              <button
                onClick={() => onDelete(card.id)}
                className="cursor-pointer text-red-400 transition-all duration-200 hover:text-red-300"
              >
                ✕
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Card;