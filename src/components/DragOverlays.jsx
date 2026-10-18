import { CheckSquare, Paperclip } from "lucide-react";

import CoverImage from "./CoverImage";

// What floats under the pointer while dragging. They are plain copies (no
// hooks, no data fetching) so the drag stays light and smooth.

export function CardOverlay({ card, width }) {
  const checklistItems =
    card.Checklists?.flatMap((checklist) => checklist.ChecklistItems || []) ||
    [];
  const doneItems = checklistItems.filter((item) => item.completed).length;

  return (
    <div
      style={{ width }}
      className="rotate-[2.5deg] cursor-grabbing rounded-xl bg-white p-2 shadow-2xl shadow-slate-900/30 ring-2 ring-brand-400"
    >
      {card.coverImage && <CoverImage src={card.coverImage} alt="" className="mb-2" maxHeight="max-h-32" />}

      <p className="break-words text-[14px] font-medium leading-5 text-slate-800">
        {card.title}
      </p>

      {(checklistItems.length > 0 || card.Attachments?.length > 0) && (
        <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
          {checklistItems.length > 0 && (
            <span className="inline-flex items-center gap-1">
              <CheckSquare size={13} />
              {doneItems}/{checklistItems.length}
            </span>
          )}
          {card.Attachments?.length > 0 && (
            <span className="inline-flex items-center gap-1">
              <Paperclip size={13} />
              {card.Attachments.length}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export function ListOverlay({ list, width }) {
  const visible = list.cards.slice(0, 4);

  return (
    <div
      style={{ width }}
      className="rotate-[1.5deg] cursor-grabbing rounded-2xl bg-slate-100 shadow-2xl shadow-slate-900/35 ring-2 ring-brand-400"
    >
      <div className="flex items-center justify-between px-3 py-2.5">
        <h2 className="text-sm font-semibold text-slate-800">{list.name}</h2>
        <span className="rounded-md bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">
          {list.cards.length}
        </span>
      </div>

      <div className="space-y-2 px-2 pb-3">
        {visible.map((card) => (
          <div
            key={card.id}
            className="truncate rounded-xl bg-white px-3 py-2 text-[14px] font-medium text-slate-700 shadow-sm"
          >
            {card.title}
          </div>
        ))}

        {list.cards.length > visible.length && (
          <p className="px-1 text-xs font-medium text-slate-400">
            +{list.cards.length - visible.length} more
          </p>
        )}
      </div>
    </div>
  );
}
