import React, { useState } from "react";
import List from "./List";
import { useSelector, useDispatch } from "react-redux";
import { addList, moveCard, moveList } from "../redux/workspaceSlice";
import { useParams } from "react-router-dom";

import { DndContext } from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import ProfileMenu from "./ProfileMenu";

const Board = () => {
  const { workspaceId, boardId } = useParams();

  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);

  const board = useSelector((state) => {
    if (!user) return null;

    const workspace =
      state.workspace.users?.[user.id]?.workspaces?.find(
        (w) => w.id === workspaceId
      );

    return (
      workspace?.boards?.find((b) => b.id === boardId) || null
    );
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
      })
    );

    setListTitle("");
    setIsAddingList(false);
  };

  // ================= DRAG END =================

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over) return;

    const activeList = lists.find((list) =>
      list.cards.some((card) => card.id === active.id)
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
        })
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
      })
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">

      {/* HEADER */}

     <div className="border-b border-slate-800 bg-slate-900/60 backdrop-blur">

  <div className="px-4 sm:px-6 py-4 flex items-center justify-between">

    {/* LEFT SIDE */}
    <div>
      <h1 className="text-xl sm:text-2xl font-bold">
        {board.name}
      </h1>

      <p className="text-sm text-slate-400">
        Drag & Drop your tasks easily
      </p>
    </div>

    {/* RIGHT SIDE */}
    <div>
      <ProfileMenu />
    </div>

  </div>

</div>

      {/* BOARD */}

      <DndContext onDragEnd={handleDragEnd}>

        <SortableContext
          items={listIds}
          strategy={horizontalListSortingStrategy}
        >

          <div className="flex-1 overflow-x-auto px-4 sm:px-6 py-6">

            <div className="flex gap-4 sm:gap-6 min-w-max">

              {lists.map((list) => (
                <List
                  key={list.id}
                  list={list}
                />
              ))}

              {/* ADD LIST */}

              {isAddingList ? (
                <div className="w-72 flex-shrink-0 rounded-xl bg-slate-900 border border-slate-800 p-4">

                  <input
                    type="text"
                    value={listTitle}
                    onChange={(e) =>
                      setListTitle(e.target.value)
                    }
                    placeholder="Enter list title..."
                    className="w-full rounded-lg bg-slate-800 border border-slate-700 p-2 outline-none focus:border-blue-500"
                  />

                  <div className="flex gap-2 mt-3">

                    <button
                      onClick={handleAddList}
                      className="cursor-pointer flex-1 bg-blue-600 hover:bg-blue-500 py-2 rounded-lg"
                    >
                      Add
                    </button>

                    <button
                      onClick={() => {
                        setIsAddingList(false);
                        setListTitle("");
                      }}
                      className="cursor-pointer flex-1 bg-slate-800 hover:bg-slate-700 py-2 rounded-lg"
                    >
                      Cancel
                    </button>

                  </div>

                </div>
              ) : (
                <button
                  onClick={() => setIsAddingList(true)}
                  className="w-72 flex-shrink-0 rounded-xl border border-dashed border-slate-700 bg-slate-900 hover:bg-slate-800 transition p-4 text-left cursor-pointer"
                >
                  + Add another list
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