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
  arrayMove,
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
    }),
  );
  const [search, setSearch] = useState("");
  const { user } = useSelector((state) => state.auth);

  const { data: boardData, isLoading } = useQuery({
    queryKey: ["board", boardId],
    queryFn: () => getBoardById(boardId),
    enabled: !!user && !!boardId,
  });
  const board = boardData?.board || null;
  const lists = [...(board?.lists || [])]
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .map((list) => ({
      ...list,
      cards: [...(list.cards || [])].sort(
        (a, b) => (a.position ?? 0) - (b.position ?? 0),
      ),
    }));
  console.log(
    "CARD DATA",
    JSON.stringify(
      lists.map((list) => ({
        listId: list.id,
        name: list.name,
        cards: list.cards?.map((card) => ({
          id: card.id,
          title: card.title,
          position: card.position,
          listId: card.listId,
        })),
      })),
      null,
      2,
    ),
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

  const listIds = lists.map((list) => String(list.id));

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
      list.cards.some((card) => String(card.id) === String(cardId)),
    );
  };
  // ================= DRAG END =================

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    const activeType = active?.data?.current?.type;
    const overType = over?.data?.current?.type;
    const activeListId = active?.data?.current?.listId;
    const overListId = over?.data?.current?.listId;

    const normalizeListId = (id) => {
      if (typeof id !== "string") return String(id);
      return id.replace(/-cards$/, "");
    };

    const isListDrag = activeType === "list";

    if (!isListDrag) {
      const sourceList = lists.find(
        (list) =>
          String(list.id) ===
          String(activeListId ?? findCardList(activeId)?.id),
      );

      if (!sourceList) return;

      const destinationList = lists.find(
        (list) =>
          String(list.id) === String(overListId ?? normalizeListId(overId)),
      );

      if (!destinationList) return;

      if (sourceList.id === destinationList.id) {
        const cards = [...sourceList.cards].sort(
          (a, b) => (a.position ?? 0) - (b.position ?? 0),
        );

        const oldIndex = cards.findIndex(
          (card) => String(card.id) === activeId,
        );
        let newIndex;

        if (overType === "card") {
          newIndex = cards.findIndex((card) => String(card.id) === overId);
        } else {
          newIndex = cards.length - 1;
        }

        if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

        const reorderedCards = arrayMove(cards, oldIndex, newIndex);

        const updatedCards = reorderedCards.map((card, index) => ({
          id: card.id,
          position: index,
        }));

        queryClient.setQueryData(["board", boardId], (oldData) => {
          if (!oldData) return oldData;

          const nextLists = oldData.board.lists.map((list) => {
            if (String(list.id) !== String(sourceList.id)) return list;

            return {
              ...list,
              cards: reorderedCards
                .map((card, index) => ({
                  ...card,
                  listId: list.id,
                  position: index,
                }))
                .sort((a, b) => (a.position ?? 0) - (b.position ?? 0)),
            };
          });

          return {
            ...oldData,
            board: {
              ...oldData.board,
              lists: nextLists,
            },
          };
        });

        await reorderCards({ cards: updatedCards });
        queryClient.invalidateQueries({ queryKey: ["board", boardId] });
        return;
      }

      const newPosition = destinationList.cards.length;
      const movedCard = sourceList.cards.find(
        (card) => String(card.id) === String(activeId),
      );

      if (!movedCard) return;

      queryClient.setQueryData(["board", boardId], (oldData) => {
        if (!oldData) return oldData;

        const nextLists = oldData.board.lists.map((list) => {
          if (String(list.id) === String(sourceList.id)) {
            return {
              ...list,
              cards: list.cards
                .filter((card) => String(card.id) !== String(activeId))
                .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
                .map((card, index) => ({
                  ...card,
                  position: index,
                })),
            };
          }

          if (String(list.id) === String(destinationList.id)) {
            const destinationCards = [
              ...list.cards,
              {
                ...movedCard,
                listId: destinationList.id,
                position: list.cards.length,
              },
            ].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

            return {
              ...list,
              cards: destinationCards.map((card, index) => ({
                ...card,
                position: index,
              })),
            };
          }

          return list;
        });

        return {
          ...oldData,
          board: {
            ...oldData.board,
            lists: nextLists,
          },
        };
      });

      await updateCard(activeId, {
        listId: destinationList.id,
        position: newPosition,
      });

      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
      return;
    }

    const overList = lists.find(
      (list) =>
        String(list.id) === String(overListId ?? normalizeListId(overId)),
    );

    if (!overList) return;

    const oldIndex = lists.findIndex((list) => String(list.id) === activeId);
    const newIndex = lists.findIndex(
      (list) => String(list.id) === String(overList.id),
    );

    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

    const updatedLists = arrayMove([...lists], oldIndex, newIndex);

    const payload = updatedLists.map((list, index) => ({
      id: list.id,
      position: index,
    }));

    await reorderLists({
      lists: payload,
    });

    queryClient.setQueryData(["board", boardId], (oldData) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        board: {
          ...oldData.board,
          lists: updatedLists,
        },
      };
    });

    queryClient.invalidateQueries({
      queryKey: ["board", boardId],
    });
  };
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
              {filteredLists.map((list) => (
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
