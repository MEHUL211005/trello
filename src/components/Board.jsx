import React, { useState } from "react";
import List from "./List";
import { useSelector, useDispatch } from "react-redux";
import { addList, moveCard, moveList } from "../redux/workspaceSlice";
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
import { DndContext } from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";

import Navbar from "./Navbar";

const Board = () => {
  const { workspaceId, boardId } = useParams();

  const dispatch = useDispatch();
  const [search, setSearch] = useState("");
  const { user } = useSelector((state) => state.auth);

  const board = useSelector((state) => {
    if (!user) return null;

    const workspace = state.workspace.users?.[user.id]?.workspaces?.find(
      (w) => w.id === workspaceId,
    );

    return workspace?.boards?.find((b) => b.id === boardId) || null;
  });

  const lists = board?.lists || [];

  const [isAddingList, setIsAddingList] = useState(false);
  const [listTitle, setListTitle] = useState("");

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

  const handleAddList = () => {
    if (!listTitle.trim()) return;

    dispatch(
      addList({
        userId: user.id,
        workspaceId,
        boardId,
        list: {
          title: listTitle,
        },
      }),
    );

    setListTitle("");
    setIsAddingList(false);
  };

  // ================= DRAG END =================

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over) return;

    const activeList = lists.find((list) =>
      list.cards.some((card) => card.id === active.id),
    );

    // CARD MOVE
    if (activeList) {
      dispatch(
        moveCard({
          userId: user.id,
          workspaceId,
          boardId,
          cardId: active.id,
          newListId: over.id,
        }),
      );
      return;
    }

    // LIST MOVE
    dispatch(
      moveList({
        userId: user.id,
        workspaceId,
        boardId,
        activeId: active.id,
        overId: over.id,
      }),
    );
  };

  return (
    <div className="min-h-screen bg-white text-slate-600 flex flex-col">
      {/* HEADER */}

      <Navbar
        search={search}
        setSearch={setSearch}
        placeholder="Search Cards..."
      />
      <div className="flex items-center px-4 py-2 bg-slate-100 backdrop-blur-sm border-b border-white/10 text-slate-600">
        {/* Left */}
        <div className="flex items-center gap-3 shrink-0">
          <h1 className="text-lg  font-semibold whitespace-nowrap">
            {board.name}
          </h1>

          <button className="flex items-center gap-1 rounded-md px-2 py-1 hover:bg-white/10 transition cursor-pointer">
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

      <DndContext onDragEnd={handleDragEnd}>
        <SortableContext
          items={listIds}
          strategy={horizontalListSortingStrategy}
        >
          <div className="flex-1 overflow-x-auto px-3 sm:px-6 py-4 sm:py-6">
            <div className="flex min-w-max gap-3 sm:gap-6">
             {filteredLists.map((list) => (
  <List key={list.id} list={list} />
))}

              {/* ADD LIST */}

              {isAddingList ? (
                <div className="w-[280px] sm:w-72 flex-shrink-0 rounded-xl border border-slate-800 bg-slate-900 p-4">
                  <input
                    type="text"
                    value={listTitle}
                    onChange={(e) => setListTitle(e.target.value)}
                    placeholder="Enter list title..."
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 p-2 outline-none focus:border-blue-500"
                  />

                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={handleAddList}
                      className="flex-1 cursor-pointer rounded-lg bg-blue-600 py-2 hover:bg-blue-500"
                    >
                      Add
                    </button>

                    <button
                      onClick={() => {
                        setIsAddingList(false);
                        setListTitle("");
                      }}
                      className="flex-1 cursor-pointer rounded-lg bg-slate-800 py-2 hover:bg-slate-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsAddingList(true)}
                  className="w-[280px] sm:w-72 flex-shrink-0 rounded-xl border border-dashed border-slate-700 bg-slate-900 p-4 text-left transition hover:bg-slate-800 cursor-pointer"
                >
                  + Add list
                </button>
              )}
            </div>
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default Board;
