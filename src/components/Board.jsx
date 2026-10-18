import React, {
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import List from "./List";
import { useSelector } from "react-redux";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getBoardById } from "../api/boardApi";
import { useNavigate, useParams } from "react-router-dom";
import {
  Eye,
  ArrowRightLeft,
  Star,
  Lock,
  Users,
  Share2,
} from "lucide-react";
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";

import Navbar from "./Navbar";
import BoardMenu from "./BoardMenu";
import { useTheme } from "../context/theme";
import { useToggleStar } from "../hooks/useToggleStar";
import { backgroundStyle } from "../lib/boardBackgrounds";
import {
  EMPTY_FILTERS,
  countCards,
  filterBoardLists,
  hasActiveFilters,
} from "../lib/boardFilters";
import toast from "react-hot-toast";
import ShareBoardModal from "./ShareBoardModal";
import RoleBadge from "./RoleBadge";
import {
  BoardPermissionsProvider,
  permissionsFor,
} from "../context/boardPermissions";
import { getErrorMessage } from "../lib/validation";
import { useBoardRealtime } from "../hooks/useBoardRealtime";
import { useBoardDnd } from "../hooks/useBoardDnd";
import { CardOverlay, ListOverlay } from "./DragOverlays";
import { listDndId, sameId } from "../lib/boardDnd";
import { createList } from "../api/listApi";
import { updateBoard } from "../api/boardApi";
import BoardInsights from "./BoardInsights";
import SwitchBoardsModal from "./SwitchBoardsModal";
import BoardFilterDropdown from "./BoardFilterDropdown";

const Board = () => {
  const { workspaceId, boardId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const sensors = useSensors(
    // Mouse: drag after moving 5px. Touch: press and hold briefly, so a
    // normal swipe still scrolls the board and the lists.
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 220,
        tolerance: 8,
      },
    }),
  );
  const [search, setSearch] = useState("");
  const { user } = useSelector((state) => state.auth);
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState("");
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showSwitch, setShowSwitch] = useState(false);
  const {
    data: boardData,
    isLoading,
    error: boardError,
  } = useQuery({
    queryKey: ["board", boardId],
    queryFn: () => getBoardById(boardId),
    enabled: !!user && !!boardId,
    // Live updates arrive over the socket (useBoardRealtime). These are
    // only a safety net in case the connection is down.
    refetchInterval: 120000,
    refetchOnWindowFocus: true,
  });

  // True while a card or list is being dragged, so updates wait for the drop
  const isDraggingRef = useRef(false);
  const applyWaitingUpdate = useBoardRealtime(boardId, isDraggingRef);

  // Filtering happens in the browser (see lib/boardFilters.js): instant, and
  // the board never shows a half-filtered state while waiting for a server.
  const deferredSearch = useDeferredValue(search);
  const deferredFilters = useDeferredValue(filters);
  const filtersOn = hasActiveFilters(filters) || !!search.trim();

  const { isDark } = useTheme();
  const star = useToggleStar();

  // ================= BOARD SOURCE =================

  const board = boardData?.board ?? null;

  // Fail closed: until the server says otherwise the user is a viewer
  const permissions = useMemo(
    () => permissionsFor(boardData?.role || "VIEWER"),
    [boardData?.role],
  );
  const noAccess = boardError?.response?.status === 403;

  const backgroundMutation = useMutation({
    mutationFn: (background) => updateBoard(boardId, { background }),

    // Show the new background immediately
    onMutate: async (background) => {
      await queryClient.cancelQueries({ queryKey: ["board", boardId] });
      const previous = queryClient.getQueryData(["board", boardId]);

      queryClient.setQueryData(["board", boardId], (old) =>
        old ? { ...old, board: { ...old.board, background } } : old,
      );

      return { previous };
    },

    onError: (error, _background, context) => {
      queryClient.setQueryData(["board", boardId], context?.previous);
      toast.error(getErrorMessage(error, "Could not change the background"));
    },

    // Board tiles elsewhere show the background too
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
      queryClient.invalidateQueries({ queryKey: ["boards"] });
      queryClient.invalidateQueries({ queryKey: ["sharedBoards"] });
      queryClient.invalidateQueries({ queryKey: ["starredBoards"] });
    },
  });

  useEffect(() => {
    if (board?.name) {
      setTitle(board.name);
    }
  }, [board]);

  const lists = useMemo(
    () =>
      [...(board?.lists || [])]
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
        .map((list) => ({
          ...list,
          cards: [...(list.cards || [])].sort(
            (a, b) => (a.position ?? 0) - (b.position ?? 0),
          ),
        })),
    [board?.lists],
  );
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

  const [isAddingList, setIsAddingList] = useState(false);
  const [listTitle, setListTitle] = useState("");

  // Every list stays, only its cards are narrowed down. Columns never pop in
  // and out, which is what made the board jump before.
  const filteredLists = useMemo(
    () => filterBoardLists(lists, deferredFilters, deferredSearch),
    [lists, deferredFilters, deferredSearch],
  );

  // Cards can't be dragged while a search or filter hides some of them:
  // the saved order would not match what is on screen.
  const isFiltered = filtersOn;
  const dndEnabled = permissions.canEdit && !isFiltered;

  const dragPermissions = useMemo(
    () => ({ ...permissions, canDrag: dndEnabled }),
    [permissions, dndEnabled],
  );

  const {
    displayLists,
    activeItem,
    collisionDetection,
    dropAnimation,
    handlers: dragHandlers,
  } = useBoardDnd({
    boardId,
    lists: filteredLists,
    enabled: dndEnabled,
    isDraggingRef,
    onSettled: applyWaitingUpdate,
  });

  const listIds = displayLists.map((list) => listDndId(list.id));
  const draggedList =
    activeItem?.type === "list"
      ? displayLists.find((list) => sameId(list.id, activeItem.id))
      : null;
  const draggedCard =
    activeItem?.type === "card"
      ? displayLists
          .flatMap((list) => list.cards)
          .find((card) => sameId(card.id, activeItem.id))
      : null;

  if (noAccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-6 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
          <Lock size={28} />
        </span>
        <h1 className="text-2xl font-extrabold text-slate-900">
          You don't have access to this board
        </h1>
        <p className="max-w-md text-slate-500">
          It may have been unshared, or the link is wrong. Ask the owner to
          invite you again.
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-brand-gradient rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-600/25"
        >
          Back to dashboard
        </button>
      </div>
    );
  }

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
        This board could not be found
      </div>
    );
  }

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
      toast.error(getErrorMessage(error, "Could not rename the board"));
    } finally {
      setEditingTitle(false);
    }
  };
  const handleStarClick = () =>
    star.mutate({ boardId: board.id, starred: !board.isStarred });

  // ================= ADD LIST =================

  const handleAddList = async () => {
    if (!listTitle.trim()) {
      toast.error("Give the list a name");
      return;
    }

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
      toast.error(getErrorMessage(error, "Could not create the list"));
    }
  };

  return (
    <BoardPermissionsProvider value={dragPermissions}>
    <div
      className="min-h-screen flex flex-col"
      style={backgroundStyle(board.background, board.id, isDark)}
    >
      <Navbar
        search={search}
        setSearch={setSearch}
        placeholder="Search Cards..."
        className="bg-black/30 border-white/10 backdrop-blur-md text-white"
        dark
      />
      <div className="relative z-20 flex flex-wrap items-center gap-y-1 px-3 py-2 sm:px-4 bg-black/25 backdrop-blur-md border-b border-white/10 text-white overflow-visible">
        {" "}
        {/* Left */}
        <div className="flex min-w-0 max-w-full items-center gap-1 sm:gap-3">
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
              className="w-full min-w-0 rounded-md bg-white/10 px-2 py-1 text-lg font-semibold text-white outline-none ring-2 ring-white/60"
            />
          ) : (
            <button
              onClick={() => permissions.canManage && setEditingTitle(true)}
              disabled={!permissions.canManage}
              className="min-w-0 truncate rounded-md px-2 py-1 text-lg font-semibold whitespace-nowrap transition enabled:cursor-pointer enabled:hover:bg-white/10 disabled:cursor-default"
            >
              {board.name}
            </button>
          )}

          <button
            onClick={() => setShowSwitch(true)}
            className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-white transition hover:bg-white/10"
          >
            <ArrowRightLeft size={16} className="text-brand-300" />
            <span className="hidden sm:inline">Switch board</span>
          </button>

          <BoardInsights lists={lists} />

          {boardData.isShared && (
            <div className="flex items-center gap-2">
              <RoleBadge role={permissions.role} onDark />
              <span
                className="hidden items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold text-white ring-1 ring-white/25 md:inline-flex"
                title={boardData.owner?.email}
              >
                <Users size={12} />
                Shared by {boardData.owner?.name || "the owner"}
              </span>
            </div>
          )}
        </div>
        {/* Spacer */}
        <div className="flex-1" />
        {/* Right */}
        <div className="flex items-center gap-1">
<BoardFilterDropdown
  filters={filters}
  setFilters={setFilters}
  availableLabels={availableLabels}
  open={isFilterOpen}
  setOpen={setIsFilterOpen}
/>
          {/* {hasActiveFilters && (
            <span className="rounded-full bg-blue-500/20 px-2 py-1 text-xs text-blue-200">
              {Object.values(filters).filter(Boolean).length} active
            </span>
          )} */}
          <button
            onClick={handleStarClick}
            aria-label={board.isStarred ? "Remove from starred" : "Star this board"}
            title={board.isStarred ? "Remove from starred" : "Star this board"}
            className="cursor-pointer rounded-md p-2 transition hover:bg-white/10"
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

          <button
            onClick={() => setShowShare(true)}
            aria-label="Share board"
            className="flex items-center gap-1 bg-white text-slate-900 rounded-md px-3 py-1.5 hover:bg-slate-200 cursor-pointer"
          >
            <Share2 size={15} />
            <span className="hidden sm:inline">Share</span>
          </button>

          <BoardMenu
            board={board}
            canManage={permissions.canManage}
            canEdit={permissions.canEdit}
            saving={backgroundMutation.isPending}
            onChangeBackground={(key) => backgroundMutation.mutate(key)}
          />
        </div>
      </div>
      {permissions.isViewer && (
        <div className="flex items-center justify-center gap-2 bg-slate-900/50 px-4 py-2 text-center text-sm font-medium text-white backdrop-blur-md">
          <Eye size={15} className="shrink-0 text-accent-300" />
          You have view-only access to this board. Ask the owner for Editor
          access to make changes.
        </div>
      )}

      {filtersOn && (
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-black/25 px-4 py-2 text-center text-sm font-medium text-white backdrop-blur-md">
          <span>
            Showing {countCards(filteredLists)} of {countCards(lists)} cards
          </span>
          {permissions.canEdit && (
            <span className="text-white/70">
              Drag &amp; drop is paused while filtering
            </span>
          )}
          <button
            onClick={() => {
              setFilters(EMPTY_FILTERS);
              setSearch("");
            }}
            className="cursor-pointer rounded-md bg-white/15 px-2.5 py-0.5 text-xs font-semibold transition hover:bg-white/25"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* BOARD */}

      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        {...dragHandlers}
      >
        <SortableContext
          items={listIds}
          strategy={horizontalListSortingStrategy}
        >
          <div className="flex-1 overflow-x-auto px-3 sm:px-6 py-4 sm:py-6">
            <div className="flex min-w-max items-start gap-3 sm:gap-6">
              {displayLists.map((list) => (
                <List key={list.id} list={list} />
              ))}

              {/* ADD LIST */}

              {!permissions.canEdit ? (
                lists.length === 0 && (
                  <div className="w-[272px] rounded-xl bg-white/15 p-4 text-sm font-medium text-white backdrop-blur-md">
                    This board has no lists yet.
                  </div>
                )
              ) : isAddingList ? (
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

        {/* The copy that follows the pointer */}
        <DragOverlay dropAnimation={dropAnimation} zIndex={60}>
          {draggedCard && (
            <CardOverlay card={draggedCard} width={activeItem.width} />
          )}
          {draggedList && (
            <ListOverlay list={draggedList} width={activeItem.width} />
          )}
        </DragOverlay>
      </DndContext>
      {showSwitch && (
        <SwitchBoardsModal
          currentWorkspaceId={workspaceId}
          onClose={() => setShowSwitch(false)}
        />
      )}

      {showShare && (
        <ShareBoardModal board={board} onClose={() => setShowShare(false)} />
      )}
    </div>
    </BoardPermissionsProvider>
  );
};

export default Board;
