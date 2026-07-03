import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  addWorkspace,
  editWorkspace,
  deleteWorkspace,
} from "../redux/workspaceSlice";

import {
  FaEdit,
  FaSave,
  FaTimes,
  FaFolderOpen,
  FaTrash,
} from "react-icons/fa";
import ProfileMenu from "../components/ProfileMenu";
const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);

  const workspaces = useSelector((state) => {
    if (!user) return [];
    return state.workspace.users?.[user.id]?.workspaces || [];
  });

  const [workspaceName, setWorkspaceName] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null);

  // ---------------- LOGIN CHECK ----------------
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        Please login first
      </div>
    );
  }

  // ---------------- CREATE WORKSPACE ----------------
  const handleCreate = () => {
    if (!workspaceName.trim()) return;

    dispatch(
      addWorkspace({
        userId: user.id,
        name: workspaceName,
      })
    );

    setWorkspaceName("");
  };

  // ---------------- EDIT WORKSPACE ----------------
  const handleEdit = () => {
    if (!editingName.trim()) return;

    dispatch(
      editWorkspace({
        userId: user.id,
        id: editingId,
        name: editingName,
      })
    );

    setEditingId(null);
    setEditingName("");
  };

  // ---------------- DELETE WORKSPACE ----------------
  const handleDelete = () => {
    dispatch(
      deleteWorkspace({
        userId: user.id,
        workspaceId: deleteTarget.id,
      })
    );

    setDeleteTarget(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* HEADER */}
    <div className="border-b border-slate-800 bg-slate-900/70 backdrop-blur">
  <div className="mx-auto max-w-7xl px-6 py-6 flex items-center justify-between">

    {/* LEFT SIDE */}
    <div>
      <h1 className="text-3xl font-bold">
        Dashboard
      </h1>
      <p className="text-sm text-slate-400 mt-1">
        Manage all your workspaces
      </p>
    </div>

    {/* RIGHT SIDE */}
    <div>
      <ProfileMenu />
    </div>

  </div>
</div>

      {/* MAIN */}
      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* CREATE WORKSPACE */}
        <div className="flex gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-5">

          <input
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            placeholder="Workspace name..."
            className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-blue-500"
          />

          <button
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl cursor-pointer"
          >
            + Create
          </button>
        </div>

        {/* WORKSPACES */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {workspaces.length > 0 ? (
            workspaces.map((ws) => (
              <div
                key={ws.id}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-5 hover:border-blue-500 transition"
              >

                {/* TITLE / EDIT */}
                {editingId === ws.id ? (
                  <input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2"
                  />
                ) : (
                  <h2 className="text-lg font-semibold">
                    {ws.name}
                  </h2>
                )}

                <p className="text-sm text-slate-400 mt-2">
                  {ws.boards.length} Boards
                </p>

                {/* ACTIONS (same as Workspace style) */}
                <div className="mt-5 flex gap-2">

                  {/* OPEN */}
                  <button
                    onClick={() => navigate(`/workspace/${ws.id}`)}
                    className="flex-1 flex items-center justify-center gap-2 border border-slate-700 bg-slate-800 py-2 rounded-xl hover:bg-blue-600 cursor-pointer"
                  >
                    <FaFolderOpen />
                    Open
                  </button>

                  {/* EDIT / SAVE / CANCEL */}
                  {editingId === ws.id ? (
                    <>
                      <button
                        onClick={handleEdit}
                        className="px-3 bg-green-600 rounded-xl cursor-pointer"
                      >
                        <FaSave />
                      </button>

                      <button
                        onClick={() => {
                          setEditingId(null);
                          setEditingName("");
                        }}
                        className="px-3 bg-slate-700 rounded-xl cursor-pointer"
                      >
                        <FaTimes />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingId(ws.id);
                        setEditingName(ws.name);
                      }}
                      className="px-3 bg-slate-800 rounded-xl text-blue-400 hover:bg-slate-700 cursor-pointer"
                    >
                      <FaEdit />
                    </button>
                  )}

                  {/* DELETE */}
                  <button
                    onClick={() => setDeleteTarget(ws)}
                    className="px-3 bg-slate-800 rounded-xl text-red-400 hover:bg-slate-700 cursor-pointer"
                  >
                    <FaTrash />
                  </button>

                </div>

              </div>
            ))
          ) : (
            <div className="col-span-full text-center p-10 border border-dashed border-slate-700 rounded-2xl">
              No Workspaces Yet
            </div>
          )}

        </div>
      </div>

      {/* DELETE MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">

          <div className="bg-slate-900 p-6 rounded-xl border border-slate-700 w-[350px]">

            <h2 className="text-lg font-semibold text-red-500">
              Delete Workspace?
            </h2>

            <p className="text-sm text-slate-400 mt-2">
              This action cannot be undone.
            </p>

            <div className="flex gap-3 mt-5">

              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 bg-slate-700 py-2 rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 py-2 rounded-lg"
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