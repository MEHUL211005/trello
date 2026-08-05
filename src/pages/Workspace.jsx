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
import { FaEdit, FaTrash, FaFolderOpen, FaRegStar } from "react-icons/fa";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const covers = [
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800",
  "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800",
  "https://images.unsplash.com/photo-1511300636408-a63a89df3482?w=800",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800",
];

const Workspace = () => {
  const { workspaceId } = useParams();

  const navigate = useNavigate();

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

      setShowCreateModal(false);
    },
  });
  const handleCreateBoard = () => {
    if (!boardName.trim()) return;

    createMutation.mutate({
      name: boardName,

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
    },
  });
  const handleEditBoard = () => {
    if (!editBoardName.trim()) return;

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
    },
  });

  const handleDeleteBoard = () => {
    deleteMutation.mutate(deleteBoardId);
    setDeleteBoardId(null);
  };
  // ==========================
  // CHECKS
  // ==========================
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        Please login first
      </div>
    );
  }

  if (workspaceLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading ...
      </div>
    );
  }

  if (!workspaceData?.workspace) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Workspace Not Found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-600">
      {/* HEADER */}
      <Navbar
        search={search}
        setSearch={setSearch}
        placeholder="Search boards..."
      />

      <div className="flex">
        <Sidebar />

        <main className="flex-1 overflow-auto pt-8 px-6">
          <div className="mb-10 ml-8 flex items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-blue-600 text-2xl font-bold text-white">
              {workspaceName.charAt(0).toUpperCase()}
            </div>

            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                {workspaceName}
              </h1>

              <div className="mt-1 flex items-center gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium">
                  Private Workspace
                </span>

                <span className="text-sm text-slate-500">
                  {displayedBoards.length} Boards
                </span>
              </div>
            </div>
          </div>
          <div className="mt-20 border-t border-slate-200"></div>
          <div className="mx-auto max-w-7xl px-6">
            <div className="pt-4 pb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <FaFolderOpen className="text-lg text-blue-600" />
              </div>

              <div>
                <h1 className="text-2xl font-semibold text-slate-800">
                  Your Boards
                </h1>
                <p className="text-sm text-slate-500">{boards.length} boards</p>
              </div>
            </div>

            {isSearching && (
              <div className="mb-4 text-sm text-sky-700">
                Searching boards...
              </div>
            )}

            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedBoards.map((board, index) => (
                <div
                  key={board.id}
                  onClick={() =>
                    navigate(`/workspace/${workspaceId}/board/${board.id}`)
                  }
                  className="group relative overflow-hidden rounded-xl bg-white border border-gray-200 hover:shadow-lg transition-all duration-200 cursor-pointer"
                >
                  <img
                    src={covers[index % covers.length]}
                    alt={board.name}
                    className="h-24 w-full object-cover"
                  />

                  <div className="p-3">
                    {editBoardId === board.id ? (
                      <div>
                        <input
                          value={editBoardName}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => setEditBoardName(e.target.value)}
                          className="w-full rounded-lg border p-2"
                        />

                        <div className="mt-2 flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();

                              handleEditBoard();
                            }}
                            className="flex-1 rounded-lg bg-sky-600 py-2 text-white"
                          >
                            Save
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();

                              setEditBoardId(null);

                              setEditBoardName("");
                            }}
                            className="flex-1 rounded-lg bg-slate-200 py-2"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <h2 className="text-lg font-semibold">{board.name}</h2>
                    )}

                    <p className="mt-1 text-xs text-gray-500">
                      {board.lists?.length || 0} Lists
                    </p>

                    <div className="absolute right-3 top-3 hidden gap-2 group-hover:flex">
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="rounded-md bg-white p-2 shadow"
                      >
                        <FaRegStar size={14} />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();

                          setEditBoardId(board.id);

                          setEditBoardName(board.name);
                        }}
                        className="rounded-md bg-white p-2 shadow"
                      >
                        <FaEdit />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();

                          setDeleteBoardId(board.id);
                        }}
                        className="rounded-md bg-white p-2 text-red-500 shadow"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* CREATE BOARD CARD */}

              <div
                onClick={() => setShowCreateModal(true)}
                className="flex min-h-[190px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-slate-300 bg-slate-200"
              >
                <p className="text-lg font-semibold">Create new Board</p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* CREATE MODAL */}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-[90%] max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-semibold">Create Board</h2>
            <input
              value={boardName}
              onChange={(e) => setBoardName(e.target.value)}
              placeholder="Board name..."
              className="mt-5 w-full rounded-lg border p-3"
            />
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setBoardName("");
                }}
                className="rounded-lg bg-slate-200 px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBoard}
                className="rounded-lg bg-sky-600 px-4 py-2 text-white"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteBoardId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-[350px] rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-red-600">
              Delete Board?
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              This action cannot be undone.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={handleDeleteBoard}
                className="flex-1 rounded-lg bg-red-600 py-2 text-white"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteBoardId(null)}
                className="flex-1 rounded-lg bg-slate-200 py-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workspace;
