import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  getWorkspaces,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  searchWorkspaces,
} from "../api/workspaceApi";

import {
  Pencil,
  Trash2,
  Plus,
  FolderKanban,
  LayoutGrid,
  Quote,
} from "lucide-react";
import toast from "react-hot-toast";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import SharedBoards from "../components/SharedBoards";
import StarredBoards from "../components/StarredBoards";
import { getErrorMessage } from "../lib/validation";
import { coverFor, greeting } from "../lib/theme";
import { quoteOfTheDay } from "../lib/quotes";

const Dashboard = () => {
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

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [workspaceName, setWorkspaceName] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [editingName, setEditingName] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null);

  // ================= GET WORKSPACES =================

  const { data, isLoading: isLoadingWorkspaces } = useQuery({
    queryKey: ["workspaces"],

    queryFn: getWorkspaces,

    enabled: !!user,
  });

  const workspaces = data?.workspaces || [];

  const searchQuery = debouncedSearch;

  const { data: searchData, isLoading: isSearchingWorkspaces } = useQuery({
    queryKey: ["workspaceSearch", searchQuery],
    queryFn: () => searchWorkspaces(searchQuery),
    enabled: !!user && searchQuery.length > 0,
  });

  const displayedWorkspaces = searchQuery
    ? searchData?.workspaces || searchData?.results || []
    : workspaces;

  const isLoading = !searchQuery && isLoadingWorkspaces;
  const isSearching = searchQuery && isSearchingWorkspaces;

  // ================= CREATE =================

  const createMutation = useMutation({
    mutationFn: createWorkspace,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspaces"],
      });

      setWorkspaceName("");

      setShowCreateModal(false);

      toast.success("Workspace created");
    },

    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not create the workspace"));
    },
  });

  const handleCreate = () => {
    if (!workspaceName.trim()) {
      toast.error("Please enter a workspace name");
      return;
    }

    if (workspaceName.trim().length > 60) {
      toast.error("Workspace name must be 60 characters or fewer");
      return;
    }

    createMutation.mutate({
      name: workspaceName,
    });
  };

  // ================= UPDATE =================

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateWorkspace(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspaces"],
      });

      toast.success("Workspace renamed");
    },

    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not rename the workspace"));
    },
  });

  const handleEdit = () => {
    if (!editingName.trim()) {
      toast.error("Workspace name cannot be empty");
      return;
    }

    updateMutation.mutate({
      id: editingId,

      data: {
        name: editingName,
      },
    });

    setEditingId(null);

    setEditingName("");
  };

  // ================= DELETE =================

  const deleteMutation = useMutation({
    mutationFn: deleteWorkspace,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspaces"],
      });

      toast.success("Workspace deleted");
    },

    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not delete the workspace"));
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate(deleteTarget.id);

    setDeleteTarget(null);
  };

  const totalBoards = workspaces.reduce(
    (sum, ws) => sum + (ws.boards?.length || 0),
    0,
  );
  const quote = quoteOfTheDay();
  const firstName = user?.name?.split(" ")[0] || "there";

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        Please log in to continue
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-600">
      <Navbar
        search={search}
        setSearch={setSearch}
        placeholder="Search workspaces..."
      />

      <div className="flex">
        <Sidebar />

        <main className="min-w-0 flex-1">
          <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
            {/* HERO */}
            <section className="bg-brand-gradient relative overflow-hidden rounded-3xl p-7 text-white shadow-xl shadow-brand-700/20 sm:p-9">
              <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10" />
              <div className="pointer-events-none absolute -bottom-24 right-24 h-56 w-56 rounded-full bg-accent-400/25 blur-2xl" />

              <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-sm font-medium text-white/75">
                    {greeting()},
                  </p>
                  <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">
                    {firstName} 👋
                  </h1>
                  <figure className="mt-4 max-w-xl border-l-2 border-accent-300 pl-4">
                    <blockquote className="flex gap-2 text-[15px] italic leading-relaxed text-white/95">
                      <Quote
                        size={16}
                        className="mt-1 shrink-0 text-accent-200"
                      />
                      {quote.text}
                    </blockquote>
                    <figcaption className="mt-1 text-sm text-white/70">
                      — {quote.author}
                    </figcaption>
                  </figure>
                </div>

                <div className="flex gap-3">
                  <div className="min-w-28 rounded-2xl bg-white/15 px-5 py-4 ring-1 ring-white/25 backdrop-blur">
                    <p className="text-3xl font-extrabold">
                      {workspaces.length}
                    </p>
                    <p className="text-xs font-medium text-white/80">
                      Workspaces
                    </p>
                  </div>
                  <div className="min-w-28 rounded-2xl bg-white/15 px-5 py-4 ring-1 ring-white/25 backdrop-blur">
                    <p className="text-3xl font-extrabold">{totalBoards}</p>
                    <p className="text-xs font-medium text-white/80">Boards</p>
                  </div>
                </div>
              </div>
            </section>

            {/* STARRED BOARDS (mine and shared with me) */}
            {!searchQuery && <StarredBoards />}

            {/* HEADING */}
            <div className="mb-5 mt-9 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                  <FolderKanban size={20} />
                </span>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {searchQuery ? "Search results" : "Your workspaces"}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {searchQuery
                      ? `Showing matches for "${searchQuery}"`
                      : "Pick a workspace to open its boards"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-brand-gradient hidden items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-600/25 transition hover:brightness-110 sm:flex"
              >
                <Plus size={16} />
                New workspace
              </button>
            </div>

            {(isLoading || isSearching) && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[0, 1, 2].map((n) => (
                  <div
                    key={n}
                    className="h-52 animate-pulse rounded-2xl bg-slate-200/70"
                  />
                ))}
              </div>
            )}

            {!isLoading && !isSearching && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {displayedWorkspaces.map((ws) => (
                  <div
                    key={ws.id}
                    onClick={() => navigate(`/workspace/${ws.id}`)}
                    className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-700/10"
                  >
                    {/* Cover */}
                    <div
                      className="relative h-28"
                      style={{ background: coverFor(ws.id) }}
                    >
                      <div
                        className="absolute inset-0 opacity-20"
                        style={{
                          backgroundImage:
                            "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)",
                          backgroundSize: "18px 18px",
                        }}
                      />
                      <span className="absolute -bottom-5 left-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-xl font-extrabold text-brand-700 shadow-lg">
                        {ws.name.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    <div className="px-4 pb-4 pt-8">
                      {editingId === ws.id ? (
                        <div className="space-y-2">
                          <input
                            value={editingName}
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleEdit();
                              if (e.key === "Escape") {
                                setEditingId(null);
                                setEditingName("");
                              }
                            }}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                          />

                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit();
                              }}
                              className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-700"
                            >
                              Save
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingId(null);
                                setEditingName("");
                              }}
                              className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-200"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <h2 className="truncate text-base font-bold text-slate-900">
                          {ws.name}
                        </h2>
                      )}

                      <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                        <LayoutGrid size={13} />
                        {ws.boards?.length || 0}{" "}
                        {(ws.boards?.length || 0) === 1 ? "board" : "boards"}
                      </p>
                    </div>

                    <div className="absolute right-3 top-3 hidden gap-1.5 group-hover:flex">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingId(ws.id);
                          setEditingName(ws.name);
                        }}
                        aria-label="Rename workspace"
                        className="rounded-lg bg-white/95 p-2 text-slate-700 shadow transition hover:bg-white hover:text-brand-700"
                      >
                        <Pencil size={14} />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(ws);
                        }}
                        aria-label="Delete workspace"
                        className="rounded-lg bg-white/95 p-2 text-rose-500 shadow transition hover:bg-rose-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}

                {/* CREATE TILE */}
                {!searchQuery && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="group flex min-h-52 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 bg-white/60 p-6 text-slate-500 transition hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 transition group-hover:bg-brand-100">
                      <Plus size={22} />
                    </span>
                    <span className="text-base font-semibold">
                      Create workspace
                    </span>
                    <span className="text-xs text-slate-400">
                      A home for your team's boards
                    </span>
                  </button>
                )}
              </div>
            )}

            {!isLoading &&
              !isSearching &&
              searchQuery &&
              displayedWorkspaces.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
                  <p className="text-lg font-bold text-slate-800">
                    No workspaces found
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Try a different name or clear the search.
                  </p>
                </div>
              )}

            {/* BOARDS SHARED BY OTHERS */}
            {!searchQuery && <SharedBoards showWhenEmpty />}
          </div>
        </main>
      </div>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm"
          onClick={() => {
            setWorkspaceName("");
            setShowCreateModal(false);
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="bg-brand-gradient mb-4 flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg shadow-brand-600/30">
              <FolderKanban size={22} />
            </span>

            <h2 className="text-xl font-bold text-slate-900">
              Create a workspace
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Workspaces group related boards for a team or project.
            </p>

            <input
              value={workspaceName}
              autoFocus
              onChange={(e) => setWorkspaceName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="e.g. Marketing Team"
              className="mt-5 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-[15px] outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
            />

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setWorkspaceName("");
                  setShowCreateModal(false);
                }}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={handleCreate}
                disabled={createMutation.isPending}
                className="bg-brand-gradient rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-600/25 transition hover:brightness-110 disabled:opacity-70"
              >
                {createMutation.isPending ? "Creating..." : "Create workspace"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <Trash2 size={22} />
            </span>

            <h2 className="text-lg font-bold text-slate-900">
              Delete "{deleteTarget.name}"?
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              All boards, lists and cards inside it will be removed. This
              action cannot be undone.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
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

export default Dashboard;
