import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Circle, Eye, ImageOff, Layers, X } from "lucide-react";
import toast from "react-hot-toast";

import { useBoardPermissions } from "../../context/boardPermissions";
import CoverImage from "../CoverImage";
import { getErrorMessage } from "../../lib/validation";
import { toggleCardCompletedApi, updateCard } from "../../api/cardApi";

const MAX_TITLE = 120;

function ModalHeader({ card, list, title, setTitle, onClose, cardContext }) {
  const queryClient = useQueryClient();
  const titleRef = useRef(null);
  const { canEdit } = useBoardPermissions();

  const refreshBoard = () => {
    queryClient.invalidateQueries({
      queryKey: ["board", cardContext.boardId],
    });
    queryClient.invalidateQueries({
      queryKey: ["board", cardContext.boardId, "filters"],
    });
  };

  // Grow the title box with its content
  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [title]);

  const handleToggleComplete = async () => {
    try {
      await toggleCardCompletedApi(card.id);
      refreshBoard();
      toast.success(
        card.isCompleted ? "Marked as not complete" : "Nice! Marked complete",
      );
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not update the card"));
    }
  };

  // The picture stays among the attachments; only the cover is cleared
  const handleRemoveCover = async () => {
    try {
      await updateCard(card.id, { coverImage: null });
      refreshBoard();
      toast.success("Cover removed");
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not remove the cover"));
    }
  };

  // Save the title when the box loses focus
  const handleTitleBlur = async () => {
    const next = title.trim();

    if (!next) {
      setTitle(card.title);
      toast.error("A card needs a title");
      return;
    }

    if (next === card.title) return;

    try {
      await updateCard(card.id, { title: next });
      setTitle(next);
      refreshBoard();
      toast.success("Title updated");
    } catch (error) {
      setTitle(card.title);
      toast.error(getErrorMessage(error, "Could not rename the card"));
    }
  };

  return (
    <header className="relative shrink-0">
      {/* Cover image, or a brand strip when there is none */}
      {card.coverImage ? (
        <div className="relative h-44 overflow-hidden bg-slate-900 sm:h-52">
          <CoverImage
            src={card.coverImage}
            alt=""
            maxHeight="max-h-none"
            className="!rounded-none h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/20" />

          {canEdit && (
            <button
              onClick={handleRemoveCover}
              aria-label="Remove cover"
              className="absolute bottom-3 left-4 z-10 inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-black/45 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur transition hover:bg-black/65"
            >
              <ImageOff size={14} />
              Remove cover
            </button>
          )}
        </div>
      ) : (
        <div className="bg-brand-gradient h-2" />
      )}

      <button
        onClick={onClose}
        aria-label="Close card"
        className={`absolute right-4 top-4 z-10 rounded-xl p-2 transition ${
          card.coverImage
            ? "bg-black/35 text-white backdrop-blur hover:bg-black/55"
            : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        }`}
      >
        <X size={20} />
      </button>

      <div className="border-b border-slate-200 bg-white px-6 pb-5 pt-5 sm:px-8">
        <div className="flex items-start gap-4 pr-10">
          <span className="mt-1 hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 sm:flex">
            <Layers size={20} />
          </span>

          <div className="min-w-0 flex-1">
            <textarea
              ref={titleRef}
              rows={1}
              value={title}
              maxLength={MAX_TITLE}
              readOnly={!canEdit}
              onChange={(e) => setTitle(e.target.value.replace(/\n/g, " "))}
              onBlur={handleTitleBlur}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.currentTarget.blur();
                }
              }}
              aria-label="Card title"
              className={`-ml-2 w-full resize-none overflow-hidden rounded-lg bg-transparent px-2 py-1 font-display text-2xl font-extrabold leading-snug tracking-tight outline-none transition hover:bg-slate-50 focus:bg-white focus:ring-4 focus:ring-brand-100 ${
                card.isCompleted
                  ? "text-slate-400 line-through decoration-2"
                  : "text-slate-900"
              }`}
            />

            <div className="mt-2 flex flex-wrap items-center gap-2.5">
              <span className="text-sm text-slate-500">in list</span>
              <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700 ring-1 ring-brand-100">
                {list.name || list.title}
              </span>

              <button
                onClick={handleToggleComplete}
                disabled={!canEdit}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition disabled:cursor-default ${
                  card.isCompleted
                    ? "bg-accent-50 text-accent-700 ring-1 ring-accent-200 enabled:hover:bg-accent-100"
                    : "bg-slate-100 text-slate-600 enabled:hover:bg-accent-50 enabled:hover:text-accent-700"
                }`}
              >
                {card.isCompleted ? (
                  <CheckCircle2 size={14} />
                ) : (
                  <Circle size={14} />
                )}
                {card.isCompleted ? "Completed" : "Mark complete"}
              </button>

              {!canEdit && (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                  <Eye size={13} />
                  View only
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default ModalHeader;
