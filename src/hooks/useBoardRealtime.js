import { useCallback, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { connectSocket } from "../lib/socket";

// Data that can change when someone edits the board
const BOARD_QUERY_KEYS = new Set([
  "board",
  "comments",
  "activities",
  "attachments",
  "cardLabels",
  "boardLabels",
  "boardMembers",
  "boardSharing",
]);

// Keeps the open board in step with what other people do.
//
// The server only says "this board changed"; we then refetch through the
// normal API, so permissions are checked as usual. While the user is
// dragging, updates wait until the drop so nothing jumps under their cursor.
//
// Returns a function to call when a drag ends, to apply any waiting update.
export const useBoardRealtime = (boardId, isDraggingRef) => {
  const queryClient = useQueryClient();
  const waiting = useRef(false);
  const timer = useRef(null);

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({
      predicate: (query) => BOARD_QUERY_KEYS.has(query.queryKey[0]),
    });
  }, [queryClient]);

  useEffect(() => {
    if (!boardId) return undefined;

    const id = Number(boardId);
    const socket = connectSocket();
    let dropped = false;

    const join = () => socket.emit("board:join", { boardId: id });

    const onChanged = (event) => {
      if (event.boardId !== id) return;

      if (isDraggingRef.current) {
        waiting.current = true;
        return;
      }

      // Several changes in a burst become one refetch
      clearTimeout(timer.current);
      timer.current = setTimeout(refresh, 250);
    };

    const onConnect = () => {
      join();
      // After a dropped connection we may have missed events
      if (dropped) {
        dropped = false;
        refresh();
      }
    };

    const onDisconnect = () => {
      dropped = true;
    };

    socket.on("board:changed", onChanged);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    if (socket.connected) join();

    return () => {
      socket.off("board:changed", onChanged);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.emit("board:leave", { boardId: id });
      clearTimeout(timer.current);
    };
  }, [boardId, isDraggingRef, refresh]);

  return useCallback(() => {
    if (waiting.current) {
      waiting.current = false;
      refresh();
    }
  }, [refresh]);
};
