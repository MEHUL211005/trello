import { createContext, useContext } from "react";

// What the signed-in user may do on the board they are looking at.
// Roles come from the API: OWNER, EDITOR or VIEWER. The server enforces
// all of this too; these flags only decide what the interface offers.
export const permissionsFor = (role) => ({
  role,
  canEdit: role === "OWNER" || role === "EDITOR",
  // Dragging is switched off while a search/filter hides some cards
  canDrag: role === "OWNER" || role === "EDITOR",
  canManage: role === "OWNER",
  isViewer: role === "VIEWER",
});

// Outside a board (nothing to restrict) everything stays available
const BoardPermissionsContext = createContext(permissionsFor("OWNER"));

export const BoardPermissionsProvider = BoardPermissionsContext.Provider;

export const useBoardPermissions = () => useContext(BoardPermissionsContext);
