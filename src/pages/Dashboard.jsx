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
  FaRegUserCircle,
} from "react-icons/fa";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
const covers = [
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800",
  "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800",
  "https://images.unsplash.com/photo-1511300636408-a63a89df3482?w=800",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800",
];
const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { user } = useSelector((state) => state.auth);
  const [showCreateModal, setShowCreateModal] = useState(false);
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
  setShowCreateModal(false);
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
const filteredWorkspaces = workspaces.filter((workspace) =>
  workspace.name.toLowerCase().includes(search.toLowerCase())
);
  return (

    <div className="min-h-screen bg-white text-slate-600">

      {/* HEADER */}
      
      <Navbar
      search={search}
      setSearch={setSearch}
      placeholder="Search workspaces..."
      />
      <div className="flex">

  <Sidebar />

  <main className="flex-1 overflow-auto">

      {/* MAIN */}
      <div className="mx-auto max-w-7xl px-6 py-8">
            <div className="mb-8 flex items-center gap-3">
  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 cursor-pointer">
    <FaRegUserCircle className="text-xl text-slate-600" />
  </div>

  <h2 className="text-xl font-semibold text-slate-800">
    Your Workspaces
  </h2>
</div>      
        
                {/* WORKSPACES */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

         

          {/* EXISTING WORKSPACES */}
          {filteredWorkspaces.map((ws,index) => (
            <div
  key={ws.id}
  onClick={() => navigate(`/workspace/${ws.id}`)}
  className="group relative cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
>
  <img
  src={covers[index % covers.length]}
  alt={ws.name}
  className="h-32 w-full object-cover"
/>
<div className="p-3">
              {/* TITLE */}
              {editingId === ws.id ? (
  <div className="space-y-2">

    <input
      value={editingName}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => setEditingName(e.target.value)}
      className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-800 outline-none focus:border-sky-500"
    />

    <div className="flex gap-2">

      <button
        onClick={(e) => {
          e.stopPropagation();
          handleEdit();
        }}
        className="rounded-lg bg-sky-600 px-3 py-1 text-sm text-white hover:bg-sky-500 cursor-pointer"
      >
        Save
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          setEditingId(null);
          setEditingName("");
        }}
        className="rounded-lg bg-slate-200 px-3 py-1 text-sm text-slate-700 hover:bg-slate-300 cursor-pointer"
      >
        Cancel
      </button>

    </div>

  </div>
) : (
  <h2 className="text-[15px] font-semibold text-slate-800">
    {ws.name}
  </h2>
)}

              <p className="mt-1 text-xs text-gray-500">
                {ws.boards.length} Boards
              </p>

              {/* ACTIONS */}
              <div className="absolute right-3 top-3 hidden gap-2 group-hover:flex">

  <button
    onClick={(e) => {
      e.stopPropagation();
      setEditingId(ws.id);
      setEditingName(ws.name);
    }}
    className="rounded-md bg-white p-2 text-slate-600 shadow hover:bg-slate-100 cursor-pointer"
  >
    <FaEdit />
  </button>


  <button
    onClick={(e) => {
      e.stopPropagation();
      setDeleteTarget(ws);
    }}
    className="rounded-md bg-white p-2 text-red-500 shadow hover:bg-red-50 cursor-pointer"
  >
    <FaTrash />
  </button>

</div>
            </div>
            </div>
          ))}

          {/* CREATE WORKSPACE CARD */}
          <div
            onClick={() => setShowCreateModal(true)}
            className="cursor-pointer rounded-2xl border-2  border-slate-700 bg-slate-200 p-6 hover:border-blue-500 hover:bg-slate-300 transition flex flex-col items-center justify-center min-h-[190px]"
          >
            {/* <div className="text-5xl text-slate-500">+</div> */}

            <p className="mt-4 text-lg font-semibold">
            Create Workspace
            </p>
          </div>
        </div>
      </div>
      </main>
      </div>

      {/* CREATE WORKSPACE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">

          <div className="w-[90%] max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">

            <h2 className="text-xl font-semibold text-slate-800">
              Create Workspace
            </h2>
            <input
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              placeholder="Workspace name..."
              className="mt-5 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none focus:border-sky-500"
            />

            <div className="mt-6 flex justify-end gap-3">

              <button
                onClick={() => {
                  setWorkspaceName("");
                  setShowCreateModal(false);
                }}
               className="rounded-lg bg-slate-200 px-4 py-2 text-slate-700 hover:bg-slate-300 cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleCreate}
                className="rounded-lg bg-sky-600 px-4 py-2 text-white hover:bg-sky-700 cursor-pointer"
              >
                Create
              </button>

            </div>
            
          </div>

        </div>
    
      )}

      {/* DELETE MODAL */}
      {deleteTarget && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">

    <div className="w-[350px] rounded-xl border border-slate-200 bg-white p-6 shadow-xl">

      <h2 className="text-lg font-semibold text-red-600">
        Delete Workspace?
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        This action cannot be undone.
      </p>

      <div className="mt-5 flex gap-3">

        <button
          onClick={() => setDeleteTarget(null)}
          className="flex-1 rounded-lg bg-slate-200 py-2 text-slate-700 hover:bg-slate-300 cursor-pointer"
        >
          Cancel
        </button>

        <button
          onClick={handleDelete}
          className="flex-1 rounded-lg bg-red-600 py-2 text-white hover:bg-red-700 cursor-pointer"
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