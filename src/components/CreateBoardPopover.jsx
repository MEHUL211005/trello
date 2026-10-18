import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import BackgroundPicker from "./BackgroundPicker";
import { getWorkspaces } from "../api/workspaceApi";
import { createBoard } from "../api/boardApi";
import { useTheme } from "../context/theme";
import { getErrorMessage } from "../lib/validation";
import { DEFAULT_BACKGROUND, backgroundStyle } from "../lib/boardBackgrounds";

const MAX_NAME = 60;

const CreateBoardPopover = ({ onClose }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isDark } = useTheme();
  const { workspaceId: routeWorkspaceId } = useParams();

  const [name, setName] = useState("");
  const [workspaceId, setWorkspaceId] = useState(routeWorkspaceId || "");
  const [background, setBackground] = useState(DEFAULT_BACKGROUND);
  const [error, setError] = useState("");
  const errorTimer = useRef(null);

  useEffect(() => () => clearTimeout(errorTimer.current), []);

  // Messages tell the user what is wrong, then step aside
  const showError = (message) => {
    clearTimeout(errorTimer.current);
    setError(message);
    errorTimer.current = setTimeout(() => setError(""), 4000);
  };

  const { data: workspaceData, isLoading } = useQuery({
    queryKey: ["workspaces"],
    queryFn: getWorkspaces,
  });

  const workspaces = workspaceData?.workspaces || [];

  // With a single workspace there is nothing to choose
  const selectedWorkspace =
    workspaceId || (workspaces.length === 1 ? String(workspaces[0].id) : "");

  const mutation = useMutation({
    mutationFn: createBoard,

    onSuccess: (response) => {
      const board = response.board;

      queryClient.invalidateQueries({ queryKey: ["boards", String(board.workspaceId)] });
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });

      toast.success("Board created");
      onClose();

      navigate(`/workspace/${board.workspaceId}/board/${board.id}`);
    },

    onError: (err) => {
      toast.error(getErrorMessage(err, "Failed to create board"));
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      showError("Give the board a title");
      return;
    }

    if (!selectedWorkspace) {
      showError("Choose a workspace for the board");
      return;
    }

    setError("");

    mutation.mutate({
      name: name.trim(),
      workspaceId: selectedWorkspace,
      background,
    });
  };

  return (
    <div className="absolute right-0 top-full z-[9999] mt-2 max-h-[85vh] w-[22rem] max-sm:inset-x-3 max-sm:w-auto overflow-y-auto rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-2xl shadow-black/20">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <h2 className="font-bold text-slate-900">Create board</h2>

        <button
          onClick={onClose}
          aria-label="Close"
          className="cursor-pointer rounded-lg p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
        >
          <X size={18} />
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        onKeyDown={(e) => {
          // Enter creates the board from the title, a picked background or
          // the workspace list, not only from the title box
          if (
            e.key === "Enter" &&
            (e.target.tagName === "INPUT" ||
              e.target.tagName === "SELECT" ||
              e.target.getAttribute("role") === "radio")
          ) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
        noValidate
        className="space-y-4 p-4"
      >
        {/* LIVE PREVIEW */}
        <div
          className="relative flex h-24 items-end overflow-hidden rounded-xl p-3 ring-1 ring-black/10"
          style={backgroundStyle(background, 0, isDark)}
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
            {name.trim() || "Your board"}
          </p>
        </div>

        {/* BOARD NAME */}
        <div>
          <label
            htmlFor="new-board-title"
            className="text-sm font-semibold text-slate-700"
          >
            Board title
          </label>

          <input
            id="new-board-title"
            value={name}
            maxLength={MAX_NAME}
            autoFocus
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Website redesign"
            className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
          />
        </div>

        {/* BACKGROUND */}
        <div>
          <p className="mb-2 text-sm font-semibold text-slate-700">Background</p>
          <BackgroundPicker value={background} onChange={setBackground} />
        </div>

        {/* WORKSPACE */}
        <div>
          <label
            htmlFor="new-board-workspace"
            className="text-sm font-semibold text-slate-700"
          >
            Workspace
          </label>

          <select
            id="new-board-workspace"
            value={selectedWorkspace}
            onChange={(e) => setWorkspaceId(e.target.value)}
            className="mt-1 w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
          >
            <option value="">
              {isLoading ? "Loading..." : "Select workspace"}
            </option>

            {workspaces.map((workspace) => (
              <option key={workspace.id} value={workspace.id}>
                {workspace.name}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-500">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="bg-brand-gradient w-full cursor-pointer rounded-xl py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-600/25 transition hover:brightness-110 disabled:opacity-60"
        >
          {mutation.isPending ? "Creating..." : "Create board"}
        </button>
      </form>
    </div>
  );
};

export default CreateBoardPopover;
