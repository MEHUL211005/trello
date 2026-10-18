import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  getBoards,
  createBoard,
  updateBoard,
  deleteBoard,
  searchBoards,
} from "../api/boardApi";
import { getWorkspaceById } from "../api/workspaceApi";
import {
  ArrowRight,
  ChevronLeft,
  LayoutGrid,
  Lock,
  Pencil,
  Plus,
  Star,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import SharedBoards from "../components/SharedBoards";
import { getErrorMessage } from "../lib/validation";
import { coverFor } from "../lib/theme";
import BackgroundPicker from "../components/BackgroundPicker";
import { useTheme } from "../context/theme";
import { useToggleStar } from "../hooks/useToggleStar";
import { DEFAULT_BACKGROUND, backgroundStyle } from "../lib/boardBackgrounds";

const Workspace = () => {
  const { workspaceId } = useParams();

  const navigate = useNavigate();
  const { isDark } = useTheme();
  const star = useToggleStar();

  const { user } = useSelector((state) => state.auth);

  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  const [boardName, setBoardName] = useState("");
  const [boardBackground, setBoardBackground] = useState(DEFAULT_BACKGROUND);

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [editBoardId, setEditBoardId] = useState(null);

  const [editBoardName, setEditBoardName] = useState("");

  const [deleteBoardId, setDeleteBoardId] = useState(null);

  const { data: workspaceData, isLoading: workspaceLoading } = useQuery({
    queryKey: ["workspace", workspaceId],

    queryFn: () => getWorkspaceById(workspaceId),
  });

  const workspaceName = workspaceData?.workspace?.name || "";
  // GET BOARDS
  const { data, isLoading: isLoadingBoards } = useQuery({
    queryKey: ["boards", workspaceId],

    queryFn: () => getBoards(workspaceId),

    enabled: !!user,
  });

  const boards = data?.boards || [];
  const starredBoards = boards.filter((board) => board.isStarred);

  const searchQuery = debouncedSearch;

  const { data: searchedBoardsData, isLoading: isSearchingBoards } = useQuery({
    queryKey: ["boardSearch", workspaceId, searchQuery],
    queryFn: () => searchBoards(searchQuery),
    enabled: !!user && !!workspaceId && searchQuery.length > 0,
  });

  const displayedBoards = searchQuery
    ? searchedBoardsData?.boards || searchedBoardsData?.results || []
    : boards;

  const isLoading = !searchQuery && isLoadingBoards;
  const isSearching = searchQuery && isSearchingBoards;

  // ==========================
  // CREATE BOARD
  // ==========================
  const createMutation = useMutation({
    mutationFn: createBoard,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["boards", workspaceId],
      });

      setBoardName("");
      setBoardBackground(DEFAULT_BACKGROUND);

      setShowCreateModal(false);

      toast.success("Board created");
    },

    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not create the board"));
    },
  });
  const handleCreateBoard = () => {
    if (!boardName.trim()) {
      toast.error("Please enter a board name");
      return;
    }

    createMutation.mutate({
      name: boardName,
      background: boardBackground,

      workspaceId,
    });
  };

  // ==========================
  // UPDATE BOARD
  // ==========================
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateBoard(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["boards", workspaceId],
      });

      toast.success("Board renamed");
    },

    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not rename the board"));
    },
  });
  const handleEditBoard = () => {
    if (!editBoardName.trim()) {
      toast.error("Board name cannot be empty");
      return;
    }

    updateMutation.mutate({
      id: editBoardId,

      data: {
        name: editBoardName,
      },
    });

    setEditBoardId(null);

    setEditBoardName("");
  };
  // ==========================
  // DELETE BOARD
  // ==========================
  const deleteMutation = useMutation({
    mutationFn: deleteBoard,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["boards", workspaceId],
      });

      toast.success("Board deleted");
    },

    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not delete the board"));
    },
  });

  const handleDeleteBoard = () => {
    deleteMutation.mutate(deleteBoardId);
    setDeleteBoardId(null);
  };
  // Stars are personal; the hook flips it everywhere on screen at once
  const handleStarClick = (e, board) => {
    e.stopPropagation();
    star.mutate({ boardId: board.id, starred: !board.isStarred });
  };

  // One board tile, used for both the starred row and the full list
  const renderBoardCard = (board, { allowEdit }) => (
    <div
      key={board.id}
      onClick={() => navigate(`/workspace/${workspaceId}/board/${board.id}`)}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-700/10"
    >
      <div
        className="relative h-24"
        style={backgroundStyle(board.background, board.id, isDark)}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)",
            backgroundSize: "18px 18px",
          }}
        />
        {/* Faux lists, so a tile reads as a board */}
        <div className="absolute bottom-0 left-4 flex items-end gap-1.5">
          {[26, 38, 20].map((height, i) => (
            <span
              key={i}
              className="w-6 rounded-t-md bg-white/35"
              style={{ height }}
            />
          ))}
        </div>
        {board.isStarred && (
          <Star
            size={16}
            className="absolute bottom-2.5 right-3 fill-sun-400 text-sun-400"
          />
        )}
      </div>

      <div className="p-4">
        {allowEdit && editBoardId === board.id ? (
          <div>
            <input
              value={editBoardName}
              autoFocus
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => setEditBoardName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleEditBoard();
                if (e.key === "Escape") {
                  setEditBoardId(null);
                  setEditBoardName("");
                }
              }}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
            />

            <div className="mt-2 flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditBoard();
                }}
                className="flex-1 rounded-lg bg-brand-600 py-1.5 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Save
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditBoardId(null);
                  setEditBoardName("");
                }}
                className="flex-1 rounded-lg bg-slate-100 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-200"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <h2 className="truncate text-base font-bold text-slate-900">
            {board.name}
          </h2>
        )}

        <p className="mt-1 flex items-center gap-1 text-xs font-medium text-brand-600 opacity-0 transition group-hover:opacity-100">
          Open board <ArrowRight size={13} />
        </p>
      </div>

      <div className="absolute right-3 top-3 hidden gap-1.5 group-hover:flex">
        <button
          onClick={(e) => handleStarClick(e, board)}
          aria-label="Star board"
          className="rounded-lg bg-white/95 p-2 shadow transition hover:bg-white"
        >
          <Star
            size={14}
            className={
              board.isStarred
                ? "fill-sun-400 text-sun-400"
                : "text-slate-500"
            }
          />
        </button>

        {allowEdit && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditBoardId(board.id);
                setEditBoardName(board.name);
              }}
              aria-label="Rename board"
              className="rounded-lg bg-white/95 p-2 text-slate-700 shadow transition hover:bg-white hover:text-brand-700"
            >
              <Pencil size={14} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setDeleteBoardId(board.id);
              }}
              aria-label="Delete board"
              className="rounded-lg bg-white/95 p-2 text-rose-500 shadow transition hover:bg-rose-50"
            >
              <Trash2 size={14} />
            </button>
          </>
        )}
      </div>
    </div>
  );

  // ==========================
  // CHECKS
  // ==========================
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        Please log in to continue
      </div>
    );
  }

  if (workspaceLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-100 border-t-brand-600" />
      </div>
    );
  }

  if (!workspaceData?.workspace) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50">
        <p className="text-xl font-bold text-slate-800">Workspace not found</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-brand-gradient rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
        >
          Back to dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-600">
      {/* HEADER */}
      <Navbar
        search={search}
        setSearch={setSearch}
        placeholder="Search boards..."
      />

      <div className="flex">
        <Sidebar />

        <main className="min-w-0 flex-1">
          <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
            <button
              onClick={() => navigate("/dashboard")}
              className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition hover:text-brand-700"
            >
              <ChevronLeft size={16} />
              All workspaces
            </button>

            {/* WORKSPACE HEADER */}
            <section className="flex flex-col gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-5">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-extrabold text-white shadow-lg"
                  style={{ background: coverFor(workspaceId) }}
                >
                  {workspaceName.charAt(0).toUpperCase()}
                </div>

                <div>
                  <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                    {workspaceName}
                  </h1>

                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      <Lock size={11} />
                      Private workspace
                    </span>

                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                      <LayoutGrid size={11} />
                      {boards.length} {boards.length === 1 ? "board" : "boards"}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-brand-gradient flex items-center justify-center gap-1.5 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-md shadow-brand-600/25 transition hover:brightness-110"
              >
                <Plus size={16} />
                New board
              </button>
            </section>

            {/* STARRED BOARDS */}
            {starredBoards.length > 0 && !searchQuery && (
              <section className="mt-10">
                <div className="mb-5 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-sun-500">
                    <Star size={20} className="fill-sun-400" />
                  </span>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Starred boards
                    </h2>
                    <p className="text-sm text-slate-500">
                      Your favourites, one click away
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {starredBoards.map((board) =>
                    renderBoardCard(board, { allowEdit: false }),
                  )}
                </div>
              </section>
            )}

            {/* YOUR BOARDS */}
            <section className="mt-10">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                  <LayoutGrid size={20} />
                </span>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {searchQuery ? "Search results" : "Your boards"}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {searchQuery
                      ? `Showing matches for "${searchQuery}"`
                      : `${boards.length} ${boards.length === 1 ? "board" : "boards"} in this workspace`}
                  </p>
                </div>
              </div>

              {isSearching ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {[0, 1, 2].map((n) => (
                    <div
                      key={n}
                      className="h-40 animate-pulse rounded-2xl bg-slate-200/70"
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {displayedBoards.map((board) =>
                    renderBoardCard(board, { allowEdit: true }),
                  )}

                  {/* CREATE BOARD TILE */}
                  {!searchQuery && (
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="group flex min-h-40 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-white/60 p-6 text-slate-500 transition hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700"
                    >
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 transition group-hover:bg-brand-100">
                        <Plus size={20} />
                      </span>
                      <span className="text-base font-semibold">
                        Create new board
                      </span>
                    </button>
                  )}
                </div>
              )}

              {!isSearching && searchQuery && displayedBoards.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
                  <p className="text-lg font-bold text-slate-800">
                    No boards found
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Try a different name or clear the search.
                  </p>
                </div>
              )}
            </section>

            {/* BOARDS SHARED BY OTHERS */}
            {!searchQuery && <SharedBoards />}
          </div>
        </main>
      </div>

      {/* CREATE MODAL */}

      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm"
          onClick={() => {
            setShowCreateModal(false);
            setBoardName("");
          }}
        >
          <div
            className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-7 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="bg-brand-gradient mb-4 flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg shadow-brand-600/30">
              <LayoutGrid size={22} />
            </span>

            <h2 className="text-xl font-bold text-slate-900">
              Create a board
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Boards hold the lists and cards for a project.
            </p>

            <input
              value={boardName}
              autoFocus
              onChange={(e) => setBoardName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateBoard()}
              placeholder="e.g. Website redesign"
              className="mt-5 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-[15px] outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
            />

            <div
              className="relative mt-5 flex h-24 items-end overflow-hidden rounded-xl p-3 ring-1 ring-black/10"
              style={backgroundStyle(boardBackground, 0, isDark)}
            >
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)",
                  backgroundSize: "16px 16px",
                }}
              />
              <p className="relative truncate text-base font-bold text-white drop-shadow">
                {boardName.trim() || "Your board"}
              </p>
            </div>

            <p className="mb-2 mt-5 text-sm font-semibold text-slate-700">
              Background
            </p>
            <BackgroundPicker
              value={boardBackground}
              onChange={setBoardBackground}
            />

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setBoardName("");
                  setBoardBackground(DEFAULT_BACKGROUND);
                }}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBoard}
                disabled={createMutation.isPending}
                className="bg-brand-gradient rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-600/25 transition hover:brightness-110 disabled:opacity-70"
              >
                {createMutation.isPending ? "Creating..." : "Create board"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteBoardId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm"
          onClick={() => setDeleteBoardId(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <Trash2 size={22} />
            </span>

            <h2 className="text-lg font-bold text-slate-900">Delete board?</h2>
            <p className="mt-1 text-sm text-slate-500">
              All lists and cards on this board will be removed. This action
              cannot be undone.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setDeleteBoardId(null)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBoard}
                className="flex-1 rounded-xl bg-rose-600 py-2.5 text-sm font-semibold text-white shadow-md shadow-rose-600/25 hover:bg-rose-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workspace;
