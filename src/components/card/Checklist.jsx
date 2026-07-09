import { useState } from "react";
import { useDispatch } from "react-redux";
import { addChecklistItem , toggleChecklistItem, deleteChecklistItem , deleteChecklist} from "../../redux/workspaceSlice";
import { Trash2 } from "lucide-react";
import DeleteChecklistPopover from "./DeleteChecklistPopover";

function Checklist({ card, cardContext }) {
  const [activeChecklistId, setActiveChecklistId] = useState(null);
  const [itemTitle, setItemTitle] = useState("");
  const [deleteChecklistId, setDeleteChecklistId] = useState(null);
  const dispatch = useDispatch();

  if (!card.checklist?.length) return null;

  const handleAddItem = (checklistId) => {
      // console.log("Checklist ID:", checklistId);
    if (!itemTitle.trim()) return;

    dispatch(
      addChecklistItem({
        ...cardContext,
        checklistId,
        title: itemTitle,
      })
    );

    setItemTitle("");
    setActiveChecklistId(null);
  };
const handleToggleItem = (checklistId, itemId) => {
  dispatch(
    toggleChecklistItem({
      ...cardContext,
      checklistId,
      itemId,
    })
  );
};
const handleDeleteItem = (checklistId, itemId) => {
  dispatch(
    deleteChecklistItem({
      ...cardContext,
      checklistId,
      itemId,
    })
  );
};
const handleDeleteChecklist = (checklistId) => {
  dispatch(
    deleteChecklist({
      ...cardContext,
      checklistId,
    })
  );
};
  return (
    <div className="mt-6 space-y-6">
      {card.checklist.map((list) => {
  const totalItems = list.items.length;

  const completedItems = list.items.filter(
    (item) => item.completed
  ).length;

  const progress =
    totalItems === 0
      ? 0
      : (completedItems / totalItems) * 100;

  return (
        <div
          key={list.id}
          className="
          rounded-xl
          border
          border-slate-200
          bg-white
          p-5
          shadow-sm
          "
          >
          {/* Header */}
          <div className="flex items-center justify-between">
          <h3 className="
          text-base
          font-semibold
          text-slate-800
          ">
            {list.title}
          </h3>

            <div className="relative">
  <button
  onClick={() =>
    setDeleteChecklistId(
      deleteChecklistId === list.id ? null : list.id
    )
  }
  className="
    rounded-md
    px-3
    py-1.5
    text-sm
    text-slate-500
    transition
    hover:bg-red-50
    hover:text-red-600
  "
>
  Delete
</button>

  {deleteChecklistId === list.id && (
    <DeleteChecklistPopover
      onDelete={() => {
        handleDeleteChecklist(list.id);
        setDeleteChecklistId(null);
      }}
      onClose={() => setDeleteChecklistId(null)}
    />
  )}
</div>

{/* progress bar  */}
          </div>
          <div className="mt-4 flex items-center gap-3">
          <span className="w-10 text-xs text-slate-500">
          {completedItems}/{totalItems}
          </span>

          <div className="
            h-2
            flex-1
            overflow-hidden
            rounded-full
            bg-slate-200
            ">
          <div
           className="h-full rounded-full bg-green-500 transition-all duration-300"
          style={{
          width: `${progress}%`,
          }}
          />
         </div>
        </div>

          {/* Checklist Items */}
          {list.items.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              No checklist items yet.
            </p>
          ) : (
            <div className="mt-4 space-y-2">
              {list.items.map((item) => (
                <div
              key={item.id}
              className="
              group
              flex
              items-center
              justify-between
              rounded-lg
              px-3
              py-2
              transition
              hover:bg-slate-100
              ">
  <div className="flex items-center gap-3">
    <input
      type="checkbox"
      checked={item.completed}
      onChange={() =>
        handleToggleItem(list.id, item.id)
      }
      className="h-4 w-4 cursor-pointer"
    />

    <span
      className={
        item.completed
          ? "text-sm text-slate-500 line-through"
          : "text-sm text-slate-800"
      }
    >
      {item.title}
    </span>
  </div>

  <button
    onClick={() =>
      handleDeleteItem(list.id, item.id)
    }
    className="opacity-0 transition-opacity group-hover:opacity-100"
  >
    <Trash2
      size={16}
      className="text-slate-500 hover:text-red-500"
    />
  </button>
</div>
              ))}
            </div>
          )}

          {/* Add Item */}
          {activeChecklistId === list.id ? (
            <div className="mt-4">
              <input
                value={itemTitle}
                onChange={(e) => setItemTitle(e.target.value)}
                placeholder="Add an item"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none"
                autoFocus
              />

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => handleAddItem(list.id)}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500"
                >
                  Add
                </button>

                <button
                  onClick={() => {
                    setActiveChecklistId(null);
                    setItemTitle("");
                  }}
                  className="rounded-md bg-slate-200 px-4 py-2 text-sm hover:bg-slate-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                setActiveChecklistId(list.id);
                setItemTitle("");
              }}
              className="
              mt-4
              rounded-lg
              bg-slate-100
              px-4
              py-2
              text-sm
              font-medium
              text-slate-700
              transition
              hover:bg-slate-200
              ">
              Add an item
            </button>
          )}
        </div>
  );
})}
    </div>
  );
}

export default Checklist;