import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { toggleStarBoard } from "../api/boardApi";
import { getErrorMessage } from "../lib/validation";

// Every cached list that can contain a board's star
const LIST_KEYS = [["boards"], ["boardSearch"], ["sharedBoards"], ["starredBoards"]];

const setStar = (board, id, starred) =>
  String(board.id) === id ? { ...board, isStarred: starred } : board;

// Star or un-star a board. The star flips everywhere on screen at once, and
// is put back if the server refuses.
//
//   const star = useToggleStar();
//   star.mutate({ boardId: board.id, starred: !board.isStarred });
export const useToggleStar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ boardId, starred }) => toggleStarBoard(boardId, starred),

    onMutate: async ({ boardId, starred }) => {
      const id = String(boardId);
      const keys = [...LIST_KEYS, ["board", id]];

      // Remember what was there, to restore on failure
      const snapshots = keys.flatMap((queryKey) =>
        queryClient.getQueriesData({ queryKey }),
      );

      for (const queryKey of LIST_KEYS) {
        queryClient.setQueriesData({ queryKey }, (old) => {
          if (!old || !Array.isArray(old.boards)) return old;

          // Un-starring removes the board from the starred list
          const boards =
            queryKey[0] === "starredBoards" && !starred
              ? old.boards.filter((board) => String(board.id) !== id)
              : old.boards.map((board) => setStar(board, id, starred));

          return { ...old, boards };
        });
      }

      queryClient.setQueryData(["board", id], (old) =>
        old?.board
          ? { ...old, board: { ...old.board, isStarred: starred } }
          : old,
      );

      return { snapshots };
    },

    onError: (error, _variables, context) => {
      context?.snapshots.forEach(([queryKey, data]) =>
        queryClient.setQueryData(queryKey, data),
      );

      toast.error(getErrorMessage(error, "Could not update the star"));
    },

    onSuccess: (_data, { starred }) => {
      toast.success(starred ? "Added to starred boards" : "Removed from starred");
    },

    onSettled: (_data, _error, { boardId }) => {
      // The starred list also needs boards that were not on screen before
      queryClient.invalidateQueries({ queryKey: ["starredBoards"] });
      queryClient.invalidateQueries({ queryKey: ["board", String(boardId)] });
    },
  });
};
