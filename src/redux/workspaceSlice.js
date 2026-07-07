import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  users: {},
};

// SAFE getter (NO mutation side effects outside reducers)
const getUser = (state, userId) => {
  if (!state.users[userId]) {
    state.users[userId] = { workspaces: [] };
  }
  return state.users[userId];
};

const workspaceSlice = createSlice({
  name: "workspace",
  initialState,

  reducers: {
    // ================= WORKSPACE =================

    addWorkspace: (state, action) => {
      const { userId, name } = action.payload;

      const user = getUser(state, userId);

      user.workspaces.push({
        id: crypto.randomUUID(), // ✅ FIXED ID
        name,
        boards: [],
      });
    },

    deleteWorkspace: (state, action) => {
      const { userId, workspaceId } = action.payload;

      const user = getUser(state, userId);

      user.workspaces = user.workspaces.filter(
        (w) => w.id !== workspaceId
      );
    },

    editWorkspace: (state, action) => {
      const { userId, id, name } = action.payload;

      const user = getUser(state, userId);

      const workspace = user.workspaces.find((w) => w.id === id);

      if (workspace) workspace.name = name;
    },

    // ================= BOARD =================

    addBoard: (state, action) => {
      const { userId, workspaceId, board } = action.payload;

      const user = getUser(state, userId);

      const workspace = user.workspaces.find(
        (w) => w.id === workspaceId
      );

      if (workspace) {
        workspace.boards.push({
          ...board,
          id: crypto.randomUUID(), // ✅ FIXED
          lists: [],
        });
      }
    },

    // ================= LIST =================

    addList: (state, action) => {
      const { userId, workspaceId, boardId, list } = action.payload;

      const user = getUser(state, userId);

      const board = user.workspaces
        .find((w) => w.id === workspaceId)
        ?.boards.find((b) => b.id === boardId);

      if (board) {
        board.lists.push({
          ...list,
          id: crypto.randomUUID(), // ✅ FIXED
          cards: [],
        });
      }
    },

    deleteList: (state, action) => {
      const { userId, workspaceId, boardId, listId } = action.payload;

      const user = getUser(state, userId);

      const board = user.workspaces
        .find((w) => w.id === workspaceId)
        ?.boards.find((b) => b.id === boardId);

      if (board) {
        board.lists = board.lists.filter((l) => l.id !== listId);
      }
    },

    // ================= CARD =================

    addCard: (state, action) => {
      const { userId, workspaceId, boardId, listId, card } =
        action.payload;

      const user = getUser(state, userId);

      const list = user.workspaces
        .find((w) => w.id === workspaceId)
        ?.boards.find((b) => b.id === boardId)
        ?.lists.find((l) => l.id === listId);

      if (list) {
        list.cards.push({
          ...card,
          id: crypto.randomUUID(), // ✅ FIXED
        });
      }
    },

    deleteCard: (state, action) => {
      const { userId, workspaceId, boardId, listId, cardId } =
        action.payload;

      const user = getUser(state, userId);

      const list = user.workspaces
        .find((w) => w.id === workspaceId)
        ?.boards.find((b) => b.id === boardId)
        ?.lists.find((l) => l.id === listId);

      if (list) {
        list.cards = list.cards.filter((c) => c.id !== cardId);
      }
    },

    editCard: (state, action) => {
      const { userId, workspaceId, boardId, listId, cardId, title, image } =
        action.payload;

      const user = getUser(state, userId);

      const card = user.workspaces
        .find((w) => w.id === workspaceId)
        ?.boards.find((b) => b.id === boardId)
        ?.lists.find((l) => l.id === listId)
        ?.cards.find((c) => c.id === cardId);

      if (card) {
        card.title = title;
        card.image = image;
      }
    },

    // ================= MOVE CARD =================

    moveCard: (state, action) => {
      const { userId, workspaceId, boardId, cardId, newListId } =
        action.payload;

      const user = getUser(state, userId);

      const board = user.workspaces
        .find((w) => w.id === workspaceId)
        ?.boards.find((b) => b.id === boardId);

      if (!board) return;

      let movedCard = null;

      board.lists.forEach((list) => {
        const index = list.cards.findIndex((c) => c.id === cardId);

        if (index !== -1) {
          movedCard = list.cards[index];
          list.cards.splice(index, 1);
        }
      });

      const targetList = board.lists.find(
        (list) => list.id === newListId
      );

      if (targetList && movedCard) {
        targetList.cards.push(movedCard);
      }
    },

    // ================= MOVE LIST =================

    moveList: (state, action) => {
      const { userId, workspaceId, boardId, activeId, overId } =
        action.payload;

      const user = getUser(state, userId);

      const board = user.workspaces
        .find((w) => w.id === workspaceId)
        ?.boards.find((b) => b.id === boardId);

      if (!board) return;

      const oldIndex = board.lists.findIndex((l) => l.id === activeId);
      const newIndex = board.lists.findIndex((l) => l.id === overId);

      if (oldIndex === -1 || newIndex === -1) return;

      const [moved] = board.lists.splice(oldIndex, 1);
      board.lists.splice(newIndex, 0, moved);
    },
    editBoard: (state, action) => {
  const { userId, workspaceId, boardId, name } = action.payload;

  const user = getUser(state, userId);

  const workspace = user.workspaces.find(
    (w) => w.id === workspaceId
  );

  if (!workspace) return;

  const board = workspace.boards.find(
    (b) => b.id === boardId
  );

  if (board) {
    board.name = name;
  }
},
deleteBoard: (state, action) => {
  const { userId, workspaceId, boardId } = action.payload;

  const user = getUser(state, userId);

  const workspace = user.workspaces.find(
    (w) => w.id === workspaceId
  );

  if (!workspace) return;

  workspace.boards = workspace.boards.filter(
    (b) => b.id !== boardId
  );
},
  },
});

export const {
  addWorkspace,
  deleteWorkspace,
  editWorkspace,
  addBoard,
  addList,
  deleteList,
  addCard,
  deleteCard,
  editCard,
  moveCard,
  moveList,
  editBoard,
  deleteBoard,
} = workspaceSlice.actions;

export default workspaceSlice.reducer;