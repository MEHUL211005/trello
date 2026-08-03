import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  addChecklistItem,
  toggleChecklistItem,
  deleteChecklistItem,
  deleteChecklist,
} from "../../api/checklistApi";

import { Trash2 } from "lucide-react";
import DeleteChecklistPopover from "./DeleteChecklistPopover";

function Checklist({ card }) {
  const [activeChecklistId, setActiveChecklistId] = useState(null);
  const [itemTitle, setItemTitle] = useState("");
  const [deleteChecklistId, setDeleteChecklistId] = useState(null);

  const queryClient = useQueryClient();

  const refreshCard = () => {
    queryClient.invalidateQueries({
      queryKey: ["card", card.id],
    });
  };

  // ADD ITEM

  const addItemMutation = useMutation({
    mutationFn: ({ checklistId, text }) => addChecklistItem(checklistId, text),
onSuccess:(data)=>{

 console.log("ITEM CREATED:",data);

 queryClient.invalidateQueries();

}
  });

  // TOGGLE ITEM
const toggleItemMutation = useMutation({

 mutationFn:(itemId)=>
   toggleChecklistItem(itemId),

 onSuccess:()=>{

   queryClient.invalidateQueries();

 }

});

  // DELETE ITEM
const deleteItemMutation = useMutation({

 mutationFn:(itemId)=>
   deleteChecklistItem(itemId),

 onSuccess:()=>{

   queryClient.invalidateQueries();

 }

});

  // DELETE CHECKLIST
const deleteChecklistMutation = useMutation({

  mutationFn:(checklistId)=>{

    console.log("API CALLING WITH ID:", checklistId);

    return deleteChecklist(checklistId);

  },

  onSuccess:(data)=>{

    console.log("DELETE SUCCESS:", data);

    queryClient.invalidateQueries();

  },

  onError:(error)=>{

    console.log("DELETE ERROR:", error);

  }

});
  const checklists = card.Checklists || [];

  if (!checklists.length) return null;

  const handleAddItem = (checklistId) => {
    if (!itemTitle.trim()) return;

    addItemMutation.mutate({
      checklistId,

      text: itemTitle,
    });

    setItemTitle("");

    setActiveChecklistId(null);
  };

  const handleToggleItem = (itemId) => {
    toggleItemMutation.mutate(itemId);
  };

  const handleDeleteItem = (itemId) => {
    deleteItemMutation.mutate(itemId);
  };

 const handleDeleteChecklist=(checklistId)=>{

 console.log("MUTATE ID:", checklistId);

 deleteChecklistMutation.mutate(checklistId);

};

  return (
    <div className="mt-6 space-y-6">
      {checklists.map((list) => {
        const items = list.ChecklistItems || [];

        const totalItems = items.length;

        const completedItems = items.filter((item) => item.completed).length;

        const progress =
          totalItems === 0 ? 0 : (completedItems / totalItems) * 100;

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
            <div className="flex justify-between items-center">
              <h3
                className="
text-base
font-semibold
text-slate-800
"
              >
                {list.title}
              </h3>

              <div className="relative">
                <button
                  onClick={() =>
                    setDeleteChecklistId(
                      deleteChecklistId === list.id ? null : list.id,
                    )
                  }
                  className="
rounded-md
px-3
py-1.5
text-sm
text-slate-500
hover:bg-red-50
hover:text-red-600
"
                >
                  Delete
                </button>

                {deleteChecklistId === list.id && (
                  <DeleteChecklistPopover

onDelete={()=>{

console.log("DELETE CLICKED", list.id);

handleDeleteChecklist(list.id);

setDeleteChecklistId(null);

}}

onClose={()=>setDeleteChecklistId(null)}

/>
                )}
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <span className="w-10 text-xs text-slate-500">
                {completedItems}/{totalItems}
              </span>

              <div
                className="
h-2
flex-1
overflow-hidden
rounded-full
bg-slate-200
"
              >
                <div
                  className="
h-full
rounded-full
bg-green-500
"
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {items.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No checklist items yet.
                </p>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="
group
flex
justify-between
items-center
rounded-lg
px-3
py-2
hover:bg-slate-100
"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => handleToggleItem(item.id)}
                        className="h-4 w-4 cursor-pointer"
                      />

                      <span
                        className={
                          item.completed
                            ? "text-sm text-slate-500 line-through"
                            : "text-sm text-slate-800"
                        }
                      >
                        {item.text}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="
opacity-0
group-hover:opacity-100
"
                    >
                      <Trash2
                        size={16}
                        className="text-slate-500 hover:text-red-500"
                      />
                    </button>
                  </div>
                ))
              )}
            </div>

            {activeChecklistId === list.id ? (
              <div className="mt-4">
                <input
                  value={itemTitle}
                  onChange={(e) => setItemTitle(e.target.value)}
                  placeholder="Add an item"
                  className="
w-full
rounded-md
border
px-3
py-2
text-sm
"
                />

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => handleAddItem(list.id)}
                    className="
rounded-md
bg-blue-600
px-4
py-2
text-sm
text-white
"
                  >
                    Add
                  </button>

                  <button
                    onClick={() => {
                      setActiveChecklistId(null);

                      setItemTitle("");
                    }}
                    className="
rounded-md
bg-slate-200
px-4
py-2
text-sm
"
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
"
              >
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
