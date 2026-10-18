import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";

import { connectSocket, disconnectSocket } from "../lib/socket";

// Keeps one live connection while the user is signed in and reacts to the
// personal events that are not tied to the board currently open:
//  - "shared:updated": someone shared a board with you
//  - "board:access-changed": your role changed or you were removed
// Renders nothing.
function RealtimeSync() {
  const token = useSelector((state) => state.auth.token);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const queryClient = useQueryClient();

  const signedIn = isAuthenticated && !!token;

  useEffect(() => {
    if (!signedIn) {
      disconnectSocket();
      return undefined;
    }

    const socket = connectSocket();

    const onShared = () => {
      queryClient.invalidateQueries({ queryKey: ["sharedBoards"] });
    };

    const onAccessChanged = () => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          ["sharedBoards", "board", "boardSharing", "boards"].includes(
            query.queryKey[0],
          ),
      });
    };

    socket.on("shared:updated", onShared);
    socket.on("board:access-changed", onAccessChanged);

    return () => {
      socket.off("shared:updated", onShared);
      socket.off("board:access-changed", onAccessChanged);
    };
  }, [signedIn, queryClient]);

  return null;
}

export default RealtimeSync;
