import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { archiveCard } from "../api/cardApi";
import { archiveList } from "../api/listApi";
import { getErrorMessage } from "../lib/validation";

const CALLS = { card: archiveCard, list: archiveList };

// Archive or restore a card / list of the open board. Archiving shows a toast
// with an Undo button, because nothing is lost and it is one click to reverse.
export const useArchive = (boardId) => {
  const queryClient = useQueryClient();

  const refresh = useCallback(
    // Prefix match: covers the board, its filtered views and the archive list
    () => queryClient.invalidateQueries({ queryKey: ["board", boardId] }),
    [queryClient, boardId],
  );

  const setArchived = useCallback(
    async (kind, id, archived) => {
      await CALLS[kind](id, archived);
      await refresh();
    },
    [refresh],
  );

  const archive = useCallback(
    async (kind, id) => {
      const noun = kind === "list" ? "List" : "Card";

      try {
        await setArchived(kind, id, true);
      } catch (error) {
        toast.error(getErrorMessage(error, `Could not archive the ${noun.toLowerCase()}`));
        return false;
      }

      toast(
        (t) => (
          <span className="flex items-center gap-3 text-sm">
            {noun} archived
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await setArchived(kind, id, false);
                } catch (error) {
                  toast.error(getErrorMessage(error, `Could not restore the ${noun.toLowerCase()}`));
                }
              }}
              className="cursor-pointer font-semibold text-brand-600 hover:underline"
            >
              Undo
            </button>
          </span>
        ),
        { duration: 6000 },
      );

      return true;
    },
    [setArchived],
  );

  const restore = useCallback(
    async (kind, id) => {
      const noun = kind === "list" ? "List" : "Card";

      try {
        await setArchived(kind, id, false);
        toast.success(`${noun} restored`);
        return true;
      } catch (error) {
        toast.error(getErrorMessage(error, `Could not restore the ${noun.toLowerCase()}`));
        return false;
      }
    },
    [setArchived],
  );

  return { archive, restore };
};
