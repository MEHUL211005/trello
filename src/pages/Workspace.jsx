import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  addBoard,
  editBoard,
  deleteBoard,
} from "../redux/workspaceSlice";

import { FaEdit, FaTrash, FaFolderOpen } from "react-icons/fa";
import ProfileMenu from "../components/ProfileMenu";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { FaRegStar } from "react-icons/fa";
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
  const dispatch = useDispatch();
  const [search, setSearch] = useState("");

  const { user } = useSelector((state) => state.auth);

  const workspace = useSelector((state) => {
    if (!user) return null;

    return (
      state.workspace.users?.[user.id]?.workspaces?.find(
        (w) => String(w.id) === String(workspaceId)
      ) || null
    );
  });

  const [boardName, setBoardName] = useState("");
const [showCreateModal, setShowCreateModal] = useState(false);

  const [editBoardId, setEditBoardId] = useState(null);
  const [editBoardName, setEditBoardName] = useState("");

  const [deleteBoardId, setDeleteBoardId] = useState(null);

  // ---------------- CHECKS ----------------
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white text-xl">
        Please login first
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white text-xl">
        Workspace Not Found
      </div>
    );
  }

  // ---------------- CREATE BOARD ----------------
  const handleCreateBoard = () => {
    if (!boardName.trim()) return;

    dispatch(
      addBoard({
        userId: user.id,
        workspaceId,
        board: { name: boardName },
      })
    );

    setBoardName("");
    setShowCreateModal(false);
  };

  // ---------------- EDIT BOARD ----------------
  const handleEditBoard = () => {
    if (!editBoardName.trim()) return;

    dispatch(
      editBoard({
        userId: user.id,
        workspaceId,
        boardId: editBoardId,
        name: editBoardName,
      })
    );

    setEditBoardId(null);
    setEditBoardName("");
  };

  // ---------------- DELETE BOARD ----------------
  const handleDeleteBoard = () => {
    dispatch(
      deleteBoard({
        userId: user.id,
        workspaceId,
        boardId: deleteBoardId,
      })
    );

    setDeleteBoardId(null);
  };
  const filteredBoards = workspace.boards.filter((board)=>
  board.name.toLowerCase().includes(search.toLowerCase()))
  return (
    <div className="min-h-screen bg-white text-slate-600">

      {/* HEADER */}
     <Navbar
  search={search}
  setSearch={setSearch}
  placeholder="Search boards..."
/>
<div className="flex gap-30">

  <Sidebar />

 <main className="flex-1 overflow-auto pt-8 px-6">

      {/* MAIN */}
      <div className="mb-10 ml-8 flex items-center gap-5">

  {/* Workspace Avatar */}
  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-blue-600 text-2xl font-bold text-white">
    {workspace.name.charAt(0).toUpperCase()}
  </div>

  {/* Workspace Details */}
  <div>
    <h1 className="text-3xl font-bold text-slate-800">
      {workspace.name}
    </h1>

    <div className="mt-1 flex items-center gap-2">
      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
      Private Workspace
      </span>
      <span className="text-sm text-slate-500">
        {workspace.boards.length} Boards
      </span>
    </div>
  </div>
</div>
<div className="mt-20 border-t border-slate-200"></div>
      <div className="mx-auto max-w-7xl px-6 ">
    <div className="pt-4 pb-6 flex items-center gap-3">
  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
    <FaFolderOpen className="text-lg text-blue-600" />
  </div>

  <div>
    <h1 className="text-2xl font-semibold text-slate-800">
      Your Boards
    </h1>

   <p className="text-sm text-slate-500">
      {workspace.boards.length} boards
    </p>
  </div>
</div>
        
        {/* BOARDS */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

  {/* BOARD CARDS */}
  {filteredBoards.map((board,index) => (
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
          className="w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-800"
          />

          <div className="mt-2 flex gap-2">
            <button
            onClick={(e) => {
           e.stopPropagation();
          handleEditBoard();
          }}
          className="flex-1 rounded-lg bg-sky-600 py-2 text-white hover:bg-sky-500 cursor-pointer"
         >
          Save
        </button>

           <button
           onClick={(e) => {
          e.stopPropagation();
          setEditBoardId(null);
          setEditBoardName("");
          }}
          className="flex-1 rounded-lg bg-slate-200 text-slate-700 py-2 hover:bg-slate-300 cursor-pointer"
          >
          Cancel
          </button>
          </div>
        </div>
      ) : (
        <h2 className="text-lg font-semibold">
          {board.name}
        </h2>
      )}

     <p className="mt-1 text-xs text-gray-500">
        {board.lists?.length || 0} Lists
      </p>

     <div className="absolute right-3 top-3 hidden gap-2 group-hover:flex">
<button
  onClick={(e) => e.stopPropagation()}
  className="rounded-md bg-white/90 p-2 text-gray-700 shadow hover:bg-gray-100 cursor-pointer"
>
  <FaRegStar size={14} />
</button>
      

        <button
          onClick={(e) => {
            e.stopPropagation();
            setEditBoardId(board.id);
            setEditBoardName(board.name);
          }}
          className="rounded-md bg-white/90 p-2 text-gray-700 shadow hover:bg-gray-100 cursor-pointer"
        >
          <FaEdit />
        </button>

        <button
          onClick={(e) => {
  e.stopPropagation();
  setDeleteBoardId(board.id);
}}
          className="rounded-md bg-white/90 p-2 text-red-500 shadow hover:bg-gray-100 cursor-pointer"
        >
          <FaTrash />
        </button>

      </div>

    </div>
    </div>
  ))}

  {/* CREATE BOARD CARD (LAST) */}
  <div
    onClick={() => setShowCreateModal(true)}
    className="flex min-h-[190px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2  border-slate-300 bg-slate-200 transition hover:border-sky-400 hover:bg-slate-300"
  >
    {/* <div className="text-5xl text-slate-500">+</div> */}

    <p className="mt-4 text-lg font-semibold text-slate-700">
      Create new Board
    </p>
  </div>

</div>
</div>
</main>
</div>
{showCreateModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">

    <div className="w-[90%] max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">

      <h2 className="text-xl font-semibold text-slate-800">
      Create Board
      </h2>

      <input
        value={boardName}
        onChange={(e) => setBoardName(e.target.value)}
        placeholder="Board name..."
        className="mt-5 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none focus:border-sky-500"
      />

      <div className="mt-6 flex justify-end gap-3">

        <button
          onClick={() => {
            setShowCreateModal(false);
            setBoardName("");
          }}
          className="rounded-lg bg-slate-200 px-4 py-2 text-slate-700 hover:bg-slate-300 cursor-pointer"
        >
          Cancel
        </button>

        <button
          onClick={handleCreateBoard}
          className="rounded-lg bg-sky-600 px-4 py-2 text-white hover:bg-sky-700 cursor-pointer"
        >
          Create
        </button>

      </div>

    </div>

  </div>
)}
      {/* DELETE MODAL */}
      {deleteBoardId && (
      <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">

        <div className="bg-white p-6 rounded-xl w-[350px] border border-slate-200 shadow-xl">

            <h2 className="text-lg font-semibold text-red-600">
              Delete Board?
            </h2>

            <p className="text-sm text-slate-500 mt-2">
              This action cannot be undone.
            </p>

            <div className="flex gap-3 mt-5">

              <button
                onClick={handleDeleteBoard}
                className="flex-1 bg-red-600 py-2 rounded-lg text-white hover:bg-red-700 cursor-pointer"
              >
                Delete
              </button>

              <button
                onClick={() => setDeleteBoardId(null)}
                className="flex-1 bg-slate-200 py-2 rounded-lg text-slate-700 hover:bg-slate-300 cursor-pointer"
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