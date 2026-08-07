import React, { useEffect, useMemo, useState } from "react";
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
import { updateCard, searchCards } from "../api/cardApi";
import { reorderCards } from "../api/cardApi";
import { reorderLists } from "../api/listApi";
import { updateBoard } from "../api/boardApi";
import BoardViewsDropdown from "./BoardViewsDropdown";
import { toggleStarBoard } from "../api/boardApi";
import BoardFilterDropdown from "./BoardFilterDropdown";
import { filterBoardCards } from "../api/boardApi";

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
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { user } = useSelector((state) => state.auth);
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState("");
  const [filters, setFilters] = useState({
    keyword: "",
    completed: false,
    incomplete: false,
    overdue: false,
    nextWeek: false,
    nextMonth: false,
    labels: [],
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(filters.keyword || "");
    }, 400);

    return () => clearTimeout(timer);
  }, [filters.keyword]);
  const searchQuery = debouncedSearch;

  const { data: boardData, isLoading } = useQuery({
    queryKey: ["board", boardId],
    queryFn: () => getBoardById(boardId),
    enabled: !!user && !!boardId,
  });

  const { data: searchData } = useQuery({
    queryKey: ["cardSearch", searchQuery],
    queryFn: () => searchCards(searchQuery),
    enabled: !!user && searchQuery.length > 0,
  });
  // ================= FILTER QUERY =================
  const hasActiveFilters =
    !!debouncedKeyword.trim() ||
    filters.completed ||
    filters.incomplete ||
    filters.overdue ||
    filters.nextWeek ||
    filters.nextMonth ||
    filters.labels.length > 0;

  const activeFilterPayload = useMemo(
    () => ({
      ...filters,
      keyword: debouncedKeyword,
    }),
    [filters, debouncedKeyword],
  );

  
const { data: filteredBoardData, isFetching: isFiltering } = useQuery({
  queryKey: ['board', boardId, 'filters', activeFilterPayload],
  queryFn: () => filterBoardCards(boardId, activeFilterPayload),
  enabled: !!user && !!boardId && hasActiveFilters,
  placeholderData: (previousData) => previousData,
});

  // ================= BOARD SOURCE =================

  const board = boardData?.board ?? null;

  useEffect(() => {
    if (board?.name) {
      setTitle(board.name);
    }
  }, [board]);

  const lists = [...(board?.lists || [])]
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .map((list) => ({
      ...list,
      cards: [...(list.cards || [])].sort(
        (a, b) => (a.position ?? 0) - (b.position ?? 0),
      ),
    }));
  const availableLabels = useMemo(
    () =>
      Array.from(
        new Map(
          (boardData?.board?.lists || [])
            .flatMap((list) => list.cards || [])
            .flatMap((card) => card.Labels || [])
            .map((label) => [label.id, label]),
        ).values(),
      ),
    [boardData?.board?.lists],
  );
  // console.log(board?.lists?.[0]?.cards?.[0]);
  // console.log(board?.lists?.flatMap(l => l.cards).flatMap(c => c.Labels));
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

  // if (hasActiveFilters && isFiltering && !filteredBoardData) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white text-xl">
  //       Loading filtered board...
  //     </div>
  //   );
  // }

  if (!board) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white text-xl">
        Board Not Found
      </div>
    );
  }

  const listIds = lists.map((list) => String(list.id));

  const searchResultCards = Array.isArray(searchData?.cards)
    ? searchData.cards
    : Array.isArray(searchData?.results)
    ? searchData.results
    : Array.isArray(searchData?.data)
    ? searchData.data
    : [];

  const matchingCardIds = new Set(
    searchResultCards.map((card) => String(card.id)),
  );

 // ================= FILTERED LISTS =================

const filteredLists = useMemo(() => {
  let result = lists;

  // Search filter
  if (searchQuery) {
    result = result
      .map((list) => ({
        ...list,
        cards: list.cards.filter((card) =>
          matchingCardIds.has(String(card.id)),
        ),
      }))
      .filter((list) => list.cards.length > 0);
  }

  // Server filters
  if (hasActiveFilters && filteredBoardData?.board?.lists) {
    const allowedCardIds = new Set(
      filteredBoardData.board.lists.flatMap((l) =>
        l.cards.map((c) => String(c.id)),
      ),
    );

    result = result
      .map((list) => ({
        ...list,
        cards: list.cards.filter((card) =>
          allowedCardIds.has(String(card.id)),
        ),
      }))
      .filter((list) => list.cards.length > 0);
  }

  return result;
}, [
  lists,
  searchQuery,
  matchingCardIds,
  hasActiveFilters,
  filteredBoardData,
]);

  const saveBoardTitle = async () => {
    const trimmed = title.trim();

    if (!trimmed || trimmed === board.name) {
      setTitle(board.name);
      setEditingTitle(false);
      return;
    }

    try {
      await updateBoard(board.id, {
        name: trimmed,
        background: board.background,
      });

      queryClient.invalidateQueries({
        queryKey: ["board", boardId],
      });
    } catch (error) {
      setTitle(board.name);
    } finally {
      setEditingTitle(false);
    }
  };
  const handleStarClick = async () => {
    try {
      const normalizedBoardId = String(board.id);

      queryClient.setQueryData(["board", normalizedBoardId], (oldData) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          board: {
            ...oldData.board,
            isStarred: !oldData.board.isStarred,
          },
        };
      });

      queryClient.setQueryData(["boards", workspaceId], (oldData) => {
        if (!oldData || !Array.isArray(oldData.boards)) return oldData;

        return {
          ...oldData,
          boards: oldData.boards.map((item) =>
            String(item.id) === normalizedBoardId
              ? { ...item, isStarred: !item.isStarred }
              : item,
          ),
        };
      });

      await toggleStarBoard(board.id);

      queryClient.invalidateQueries({
        queryKey: ["board", normalizedBoardId],
      });
      queryClient.invalidateQueries({
        queryKey: ["boards", workspaceId],
      });
    } catch (error) {
      console.error("Star update error:", error);

      const normalizedBoardId = String(board.id);
      queryClient.invalidateQueries({
        queryKey: ["board", normalizedBoardId],
      });
      queryClient.invalidateQueries({
        queryKey: ["boards", workspaceId],
      });
    }
  };

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
      queryClient.invalidateQueries({
        queryKey: ["board", boardId, "filters"],
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
        queryClient.invalidateQueries({
          queryKey: ["board", boardId, "filters"],
        });
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
      queryClient.invalidateQueries({
        queryKey: ["board", boardId, "filters"],
      });
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
    queryClient.invalidateQueries({
      queryKey: ["board", boardId, "filters"],
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
      <div className="relative z-20 flex items-center px-4 py-2 bg-slate-700 backdrop-blur-sm border-b border-white/10 text-slate-100 overflow-visible">
        {" "}
        {/* Left */}
        <div className="flex items-center gap-3 shrink-0">
          {editingTitle ? (
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={saveBoardTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  saveBoardTitle();
                }

                if (e.key === "Escape") {
                  setTitle(board.name);
                  setEditingTitle(false);
                }
              }}
              className="rounded-md bg-white/10 px-2 py-1 text-lg font-semibold text-white outline-none ring-2 ring-sky-400"
            />
          ) : (
            <button
              onClick={() => setEditingTitle(true)}
              className="rounded-md px-2 py-1 text-lg font-semibold whitespace-nowrap hover:bg-white/10 transition cursor-pointer"
            >
              {board.name}
            </button>
          )}

          <BoardViewsDropdown />
        </div>
        {/* Spacer */}
        <div className="flex-1" />
        {/* Right */}
        <div className="flex items-center gap-1">
          <button className="p-2 rounded-md hover:bg-white/10 cursor-pointer">
            <UserRound size={16} />
          </button>

          {/* <button className="p-2 rounded-md hover:bg-white/10 cursor-pointer">
            <Plug size={16} />
          </button>

          <button className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-white/10 cursor-pointer">
            <Bot size={16} />
          </button> */}
<BoardFilterDropdown
  filters={filters}
  setFilters={setFilters}
  availableLabels={availableLabels}
  open={isFilterOpen}
  setOpen={setIsFilterOpen}
/>
{hasActiveFilters && isFiltering && (
  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
)}
          {/* {hasActiveFilters && (
            <span className="rounded-full bg-blue-500/20 px-2 py-1 text-xs text-blue-200">
              {Object.values(filters).filter(Boolean).length} active
            </span>
          )} */}
          <button
            onClick={handleStarClick}
            className="p-2 rounded-md hover:bg-white/10 cursor-pointer"
          >
            <Star
              size={16}
              fill={board.isStarred ? "currentColor" : "none"}
              className={board.isStarred ? "text-yellow-400" : ""}
            />
          </button>

          {/* <button className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-white/10 cursor-pointer">
            <Lock size={16} />
          </button> */}

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
