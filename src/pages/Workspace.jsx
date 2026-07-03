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

const Workspace = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

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

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* HEADER */}
      <div className="border-b border-slate-800 bg-slate-900/70 backdrop-blur">
  
  <div className="mx-auto max-w-7xl px-6 py-6 flex items-center justify-between">

    {/* LEFT SIDE */}
    <div>
      <h1 className="text-3xl font-bold">
        {workspace.name}
      </h1>

      <p className="text-sm text-slate-400 mt-1">
        Manage all boards inside this workspace
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

        {/* CREATE BOARD */}
        <div className="flex gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-5">

          <input
            value={boardName}
            onChange={(e) => setBoardName(e.target.value)}
            placeholder="Enter board name..."
            className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-blue-500"
          />

          <button
            onClick={handleCreateBoard}
            className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl font-medium cursor-pointer"
          >
            + Create
          </button>
        </div>

        {/* BOARDS */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {workspace?.boards?.length > 0 ? (
            workspace.boards.map((board) => (
              <div
                key={board.id}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-5 hover:border-blue-500 transition"
              >

                {/* TITLE / EDIT */}
                {editBoardId === board.id ? (
                  <div>
                    <input
                      value={editBoardName}
                      onChange={(e) => setEditBoardName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2"
                    />

                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={handleEditBoard}
                        className="flex-1 bg-blue-600 py-2 rounded-lg cursor-pointer"
                      >
                        Save
                      </button>

                      <button
                        onClick={() => setEditBoardId(null)}
                        className="flex-1 bg-slate-700 py-2 rounded-lg cursor-pointer"
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

                <p className="text-sm text-slate-400 mt-2">
                  {board.lists?.length || 0} Lists
                </p>

                {/* ACTIONS (same style as Dashboard) */}
                <div className="mt-5 flex gap-2">

                  {/* OPEN */}
                  <button
                    onClick={() =>
                      navigate(`/workspace/${workspaceId}/board/${board.id}`)
                    }
                    className="flex-1 flex items-center justify-center gap-2 border border-slate-700 bg-slate-800 py-2 rounded-xl hover:bg-blue-600 cursor-pointer"
                  >
                    <FaFolderOpen />
                    Open
                  </button>

                  {/* EDIT */}
                  <button
                    onClick={() => {
                      setEditBoardId(board.id);
                      setEditBoardName(board.name);
                    }}
                    className="px-3 bg-slate-800 rounded-xl text-blue-400 hover:bg-slate-700 cursor-pointer"
                  >
                    <FaEdit />
                  </button>

                  {/* DELETE */}
                  <button
                    onClick={() => setDeleteBoardId(board.id)}
                    className="px-3 bg-slate-800 rounded-xl text-red-400 hover:bg-slate-700 cursor-pointer"
                  >
                    <FaTrash />
                  </button>

                </div>

              </div>
            ))
          ) : (
            <div className="col-span-full text-center p-10 border border-dashed border-slate-700 rounded-2xl">
              No Boards Yet
            </div>
          )}

        </div>
      </div>

      {/* DELETE MODAL */}
      {deleteBoardId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="bg-slate-900 p-6 rounded-xl w-[350px] border border-slate-700">

            <h2 className="text-lg font-semibold">
              Delete Board?
            </h2>

            <p className="text-sm text-slate-400 mt-2">
              This action cannot be undone.
            </p>

            <div className="flex gap-3 mt-5">

              <button
                onClick={handleDeleteBoard}
                className="flex-1 bg-red-600 py-2 rounded-lg"
              >
                Delete
              </button>

              <button
                onClick={() => setDeleteBoardId(null)}
                className="flex-1 bg-slate-700 py-2 rounded-lg"
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