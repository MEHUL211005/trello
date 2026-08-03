import React, { useState } from "react";
import List from "./List";
import { useSelector } from "react-redux";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getBoardById } from "../api/boardApi";
import { useParams } from "react-router-dom";
import {
  Eye,
  UserRound,
  Plug,
  Bot,
  Filter,
  Star,
  Lock,
  Share2,
  MoreHorizontal,
} from "lucide-react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
    closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";

import Navbar from "./Navbar";
import BottomBar from "./BottomBar";
import { createList } from "../api/listApi";
import { updateCard } from "../api/cardApi";
import { reorderCards } from "../api/cardApi";
import { reorderLists } from "../api/listApi";

const Board = () => {
  const { workspaceId, boardId } = useParams();
const queryClient = useQueryClient();

  const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: {
      distance: 5,
    },
  })
);
  const [search, setSearch] = useState("");
  const { user } = useSelector((state) => state.auth);
  
    const {
  data: boardData,
  isLoading,
} = useQuery({
  queryKey: ["board", boardId],
  queryFn: () => getBoardById(boardId),
  enabled: !!user && !!boardId,
});
const board = boardData?.board || null;
  const lists = board?.lists || [];
  console.log(
  "CARD DATA",
  JSON.stringify(
    lists.map((list)=>({
      listId:list.id,
      name:list.name,
      cards:list.cards?.map(card=>({
        id:card.id,
        title:card.title,
        position:card.position,
        listId:card.listId
      }))
    })),
    null,
    2
  )
);

  const [isAddingList, setIsAddingList] = useState(false);
  const [listTitle, setListTitle] = useState("");

  if (isLoading) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white text-xl">
      Loading Board...
    </div>
  );
}

  if (!board) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white text-xl">
        Board Not Found
      </div>
    );
  }

  const listIds = lists.map((list) => list.id);

  // ================= FILTERED LISTS =================

  const filteredLists = lists
    .map((list) => ({
      ...list,
      cards: list.cards.filter((card) =>
        card.title.toLowerCase().includes(search.toLowerCase()),
      ),
    }))
    .filter((list) => search.trim() === "" || list.cards.length > 0);

  // ================= ADD LIST =================

  const handleAddList = async () => {
  if (!listTitle.trim()) return;

  try {
    await createList({
      name: listTitle,
      boardId,
    });

    queryClient.invalidateQueries({
      queryKey: ["board", boardId],
    });

    setListTitle("");
    setIsAddingList(false);

  } catch (error) {
    console.error("Create list error:", error);
  }
};

const findCardList = (cardId) => {
  return lists.find((list) =>
    list.cards.some((card) => card.id === cardId)
  );
};
  // ================= DRAG END =================

 const handleDragEnd = async (event) => {
  
  const { active, over } = event;
  console.log("ACTIVE", active.id);
  console.log("OVER", over?.id);
  if (!over) return;


  const activeId = active.id;
  const overId = over.id;


  // =====================
  // CHECK CARD DRAG
  // =====================

  const sourceList = findCardList(activeId);

if(sourceList){

 let destinationList;

 const cardTargetList = findCardList(overId);

 if(cardTargetList){
   destinationList = cardTargetList;
 }
 else{
   destinationList = lists.find(
      (list)=>list.id === overId
   );
 }


 if(!destinationList) return;


 console.log(
   "CARD MOVE",
   activeId,
   sourceList.id,
   destinationList.id
 );


 // SAME LIST DROP
 if(sourceList.id === destinationList.id){

 const cards = [...sourceList.cards];

 const oldIndex = cards.findIndex(
   (card)=>card.id === activeId
 );

 const newIndex = cards.findIndex(
   (card)=>card.id === overId
 );


 if(oldIndex === -1 || newIndex === -1) return;


 const [movedCard] = cards.splice(oldIndex,1);

 cards.splice(newIndex,0,movedCard);


 const updatedCards = cards.map(
   (card,index)=>({
     id:card.id,
     position:index
   })
 );


 await reorderCards({
   cards:updatedCards
 });


 queryClient.invalidateQueries({
   queryKey:["board",boardId],
 });


 return;
}


const newPosition = destinationList.cards.length;


await updateCard(activeId,{
   listId: destinationList.id,
   position: newPosition,
});


 queryClient.invalidateQueries({
   queryKey:["board", boardId],
 });


 return;
}



  // =====================
// LIST DRAG
// =====================

const oldIndex = lists.findIndex(
  (list) => list.id === activeId
);

const newIndex = lists.findIndex(
  (list) => list.id === overId
);

if (oldIndex === -1 || newIndex === -1) return;


// frontend reorder

const updatedLists = [...lists];

const [movedList] = updatedLists.splice(oldIndex,1);

updatedLists.splice(newIndex,0,movedList);


// backend data

const payload = updatedLists.map((list,index)=>({
  id:list.id,
  position:index,
}));

console.log("LIST REORDER DATA",payload);


// API call

await reorderLists({
  lists: payload,
});

console.log("AFTER REORDER", updatedLists);

queryClient.setQueryData(
  ["board", boardId],
  (oldData) => {
    if (!oldData) return oldData;

    return {
      ...oldData,
      board: {
        ...oldData.board,
        lists: updatedLists,
      },
    };
  }
);

queryClient.invalidateQueries({
  queryKey:["board",boardId],
});
};
// console.log("LISTS DATA", lists);
  return (
<div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950">
      <Navbar
        search={search}
        setSearch={setSearch}
        placeholder="Search Cards..."
        className="bg-slate-800/80 border-white/10 backdrop-blur-md text-white"
        dark
      />
      <div className="flex items-center px-4 py-2 bg-slate-700 backdrop-blur-sm border-b border-white/10 text-slate-100">
        {/* Left */}
        <div className="flex items-center gap-3 shrink-0">
          <h1 className="text-lg  font-semibold whitespace-nowrap">
            {board.name}
          </h1>

          <button className="flex items-center gap-1 rounded-md px-2 py-1 hover:bg-white/10 transition cursor-pointer text-slate-100">
            <Eye size={16} />
          </button>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right */}
        <div className="flex items-center gap-1">
          <button className="p-2 rounded-md hover:bg-white/10 cursor-pointer">
            <UserRound size={16} />
          </button>

          <button className="p-2 rounded-md hover:bg-white/10 cursor-pointer">
            <Plug size={16} />
          </button>

          <button className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-white/10 cursor-pointer">
            <Bot size={16} />
          </button>

          <button className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-white/10 cursor-pointer">
            <Filter size={16} />
          </button>

          <button className="p-2 rounded-md hover:bg-white/10 cursor-pointer">
            <Star size={16} />
          </button>

          <button className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-white/10 cursor-pointer">
            <Lock size={16} />
          </button>

          <button className="flex items-center gap-1 bg-white text-slate-900 rounded-md px-3 py-1.5 hover:bg-slate-200 cursor-pointer">
            <Share2 size={15} />
            <span>Share</span>
          </button>

          <button className="p-2 rounded-md hover:bg-white/10 cursor-pointer">
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>
      {/* BOARD */}

      <DndContext
  sensors={sensors}
    collisionDetection={closestCenter}
  onDragEnd={handleDragEnd}
>
        <SortableContext
          items={listIds}
          strategy={horizontalListSortingStrategy}
        >
          <div className="flex-1 overflow-x-auto px-3 sm:px-6 py-4 sm:py-6">
            <div className="flex min-w-max items-start gap-3 sm:gap-6">
       {lists.map((list) => (
  <List key={list.id} list={list} />
))}

              {/* ADD LIST */}

              {isAddingList ? (
                <div className="w-[272px] flex-shrink-0 rounded-xl bg-white/20 backdrop-blur-md p-3 shadow-sm">
                  <input
                    type="text"
                    value={listTitle}
                    onChange={(e) => setListTitle(e.target.value)}
                    placeholder="Enter list title..."
                    className="w-full rounded-lg border border-white/30 bg-white p-2 text-slate-800 outline-none focus:border-sky-500"
                  />

                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={handleAddList}
                      className="flex-1 cursor-pointer rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700"
                    >
                      Add
                    </button>

                    <button
                      onClick={() => {
                        setIsAddingList(false);
                        setListTitle("");
                      }}
                      className="flex-1 cursor-pointer rounded-lg bg-slate-300 py-2 text-slate-700 hover:bg-slate-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsAddingList(true)}
                  className="w-[272px] flex-shrink-0 rounded-xl bg-white/20 backdrop-blur-sm p-3 text-left text-sm font-medium text-white transition hover:bg-white/30 cursor-pointer"
                >
                  + Add list
                </button>
              )}
            </div>
          </div>
        </SortableContext>
      </DndContext>
      <BottomBar />
    </div>
  );
};

export default Board;
