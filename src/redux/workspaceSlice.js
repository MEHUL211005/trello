import { createSlice } from "@reduxjs/toolkit";
import { toggleCardCompletedApi } from "../api/cardApi";
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
const getCard = (
  state,
  userId,
  workspaceId,
  boardId,
  listId,
  cardId
) => {
  const user = getUser(state, userId);

  return user.workspaces
    .find((w) => w.id === workspaceId)
    ?.boards.find((b) => b.id === boardId)
    ?.lists.find((l) => l.id === listId)
    ?.cards.find((c) => c.id === cardId);
};
const addActivity = (card, action, user = "Mehul") => {
  if (!card.activity) {
    card.activity = [];
  }

  card.activity.unshift({
    id: crypto.randomUUID(),
    user,
    action,
    createdAt: new Date().toISOString(),
  });
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
          id: crypto.randomUUID(), 
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
      id: crypto.randomUUID(),

      title: card.title,
      image: card.image || "",

      description: "",
      labels: [],
      dueDate: null,
      members: [],
      checklist: [],
      attachments: [],
      comments: [],
      activity: [],
      archived: false,
      completed:false,
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

  updateCard: (state, action) => {
  const {
    userId,
    workspaceId,
    boardId,
    listId,
    cardId,
    updates,
  } = action.payload;

  const card = getCard(
    state,
    userId,
    workspaceId,
    boardId,
    listId,
    cardId
  );

  if (!card) return;
  // Description
  if (
    updates.description !== undefined &&
    updates.description !== card.description
  ) {
    addActivity(card, "updated the description");
  }

  // Due Date
  if (updates.dueDate !== undefined) {
    if (!card.dueDate && updates.dueDate) {
      addActivity(card, "set the due date");
    } else if (card.dueDate && !updates.dueDate) {
      addActivity(card, "removed the due date");
    } else if (
      card.dueDate &&
      updates.dueDate &&
      card.dueDate !== updates.dueDate
    ) {
      addActivity(card, "changed the due date");
    }
  }

  Object.assign(card, updates);
},
//togglecompleted card
toggleCardCompleted: (state, action) => {
  const {
    userId,
    workspaceId,
    boardId,
    listId,
    cardId,
  } = action.payload;

  const card = getCard(
    state,
    userId,
    workspaceId,
    boardId,
    listId,
    cardId
  );

  if (!card) return;

  card.completed = !card.completed;

  addActivity(
    card,
    card.completed
      ? "marked this card complete"
      : "marked this card incomplete"
  );
},

//LABEL
toggleLabel: (state, action) => {
  const {
    userId,
    workspaceId,
    boardId,
    listId,
    cardId,
    label,
  } = action.payload;

  const card = getCard(
    state,
    userId,
    workspaceId,
    boardId,
    listId,
    cardId
  );

  if (!card) return;

  if (!card.labels) {
    card.labels = [];
  }

  const exists = card.labels.some(
    (item) => item.id === label.id
  );

  if (exists) {
    card.labels = card.labels.filter(
      (item) => item.id !== label.id
    );

    addActivity(
      card,
      `removed the "${label.name}" label`
    );
  } else {
    card.labels.push(label);

    addActivity(
      card,
      `added the "${label.name}" label`
    );
  }
},
//toggle member
toggleMember: (state, action) => {
  const {
    userId,
    workspaceId,
    boardId,
    listId,
    cardId,
    member,
  } = action.payload;

  const card = getCard(
    state,
    userId,
    workspaceId,
    boardId,
    listId,
    cardId
  );

  if (!card) return;

  if (!card.members) {
    card.members = [];
  }

  const exists = card.members.some(
    (item) => item.id === member.id
  );

  if (exists) {
    card.members = card.members.filter(
      (item) => item.id !== member.id
    );

    addActivity(
      card,
      `removed ${member.name} from the card`
    );
  } else {
    card.members.push(member);

    addActivity(
      card,
      `added ${member.name} to the card`
    );
  }
},

// checklist 
addChecklist: (state, action) => {
  const {
    userId,
    workspaceId,
    boardId,
    listId,
    cardId,
    title,
  } = action.payload;

  const card = getCard(
    state,
    userId,
    workspaceId,
    boardId,
    listId,
    cardId
  );

  if (!card) return;

  if (!Array.isArray(card.checklist)) {
    card.checklist = [];
  }

  card.checklist.push({
    id: crypto.randomUUID(),
    title,
    items: [],
  });

  addActivity(card, `added checklist "${title}"`);
},
//add checklist item 
addChecklistItem: (state, action) => {
  // console.log("PAYLOAD:", action.payload);
  const {
    userId,
    workspaceId,
    boardId,
    listId,
    cardId,
    checklistId,
    title,
  } = action.payload;

  const card = getCard(
    state,
    userId,
    workspaceId,
    boardId,
    listId,
    cardId
  );

  if (!card) return;

  if (!Array.isArray(card.checklist)) {
    card.checklist = [];
  }

  const checklist = card.checklist.find(
    (c) => c.id === checklistId
  );
// console.log("Checklist Found:", checklist);
  if (!checklist) return;

  if (!Array.isArray(checklist.items)) {
    checklist.items = [];
  }

  checklist.items.push({
    id: crypto.randomUUID(),
    title,
    completed: false,
  });
  addActivity(card, `added checklist item "${title}"`);
  // console.log("Items:", checklist.items);
},
//toggle checklist item 
toggleChecklistItem: (state, action) => {
  const {
    userId,
    workspaceId,
    boardId,
    listId,
    cardId,
    checklistId,
    itemId,
  } = action.payload;

  const card = getCard(
    state,
    userId,
    workspaceId,
    boardId,
    listId,
    cardId
  );

  if (!card) return;

  const checklist = card.checklist.find(
    (c) => c.id === checklistId
  );

  if (!checklist) return;

  const item = checklist.items.find(
    (i) => i.id === itemId
  );

  if (!item) return;

  item.completed = !item.completed;
  if (!wasCompleted) {
  addActivity(
    card,
    `completed checklist item "${item.title}"`
  );
} else {
  addActivity(
    card,
    `marked checklist item "${item.title}" incomplete`
  );
}
},
//delete checklist 
deleteChecklist: (state, action) => {
  const {
    userId,
    workspaceId,
    boardId,
    listId,
    cardId,
    checklistId,
  } = action.payload;

  const card = getCard(
    state,
    userId,
    workspaceId,
    boardId,
    listId,
    cardId
  );

  if (!card) return;

  if (!Array.isArray(card.checklist)) {
    card.checklist = [];
  }

  const checklist = card.checklist.find(
    (list) => list.id === checklistId
  );

  if (!checklist) return;

  addActivity(
    card,
    `deleted checklist "${checklist.title}"`
  );

  card.checklist = card.checklist.filter(
    (list) => list.id !== checklistId
  );
},
  //delete checklist item
deleteChecklistItem: (state, action) => {
  const {
    userId,
    workspaceId,
    boardId,
    listId,
    cardId,
    checklistId,
    itemId,
  } = action.payload;

  const card = getCard(
    state,
    userId,
    workspaceId,
    boardId,
    listId,
    cardId
  );

  if (!card) return;

  const checklist = card.checklist.find(
    (c) => c.id === checklistId
  );

  if (!checklist) return;

  const item = checklist.items.find(
    (item) => item.id === itemId
  );

  if (!item) return;

  addActivity(
    card,
    `deleted checklist item "${item.title}"`
  );

  checklist.items = checklist.items.filter(
    (item) => item.id !== itemId
  );
},
//add attachment
addAttachment: (state, action) => {
  const {
    userId,
    workspaceId,
    boardId,
    listId,
    cardId,
    attachment,
  } = action.payload;

  const card = getCard(
    state,
    userId,
    workspaceId,
    boardId,
    listId,
    cardId
  );

  if (!card) return;

  if (!Array.isArray(card.attachments)) {
    card.attachments = [];
  }

  card.attachments.push(attachment);

  addActivity(
    card,
    `added attachment "${attachment.name}"`
  );
},

// delete attachment
deleteAttachment: (state, action) => {
  const {
    userId,
    workspaceId,
    boardId,
    listId,
    cardId,
    attachmentId,
  } = action.payload;

  const card = getCard(
    state,
    userId,
    workspaceId,
    boardId,
    listId,
    cardId
  );

  if (!card) return;

  if (!Array.isArray(card.attachments)) return;

  const attachment = card.attachments.find(
    (file) => file.id === attachmentId
  );

  if (!attachment) return;

  addActivity(
    card,
    `deleted attachment "${attachment.name}"`
  );

  card.attachments = card.attachments.filter(
    (file) => file.id !== attachmentId
  );
},
//add comment
addComment: (state, action) => {
  const {
    userId,
    workspaceId,
    boardId,
    listId,
    cardId,
    comment,
  } = action.payload;

  const card = getCard(
    state,
    userId,
    workspaceId,
    boardId,
    listId,
    cardId
  );

  // console.log("FOUND CARD:", card);
  // console.log("CARD ID:", cardId);

  if (!card) return;

  if (!card.comments) {
    card.comments = [];
  }

  card.comments.push({
    id: crypto.randomUUID(),
    text: comment,
    user: "Mehul",
    createdAt: new Date().toISOString(),
  });
  addActivity(card, "added a comment");
},
//delete comment
// delete comment
deleteComment: (state, action) => {
  const {
    userId,
    workspaceId,
    boardId,
    listId,
    cardId,
    commentId,
  } = action.payload;

  const card = getCard(
    state,
    userId,
    workspaceId,
    boardId,
    listId,
    cardId
  );

  if (!card) return;

  const comment = card.comments.find(
    (c) => c.id === commentId
  );

  if (!comment) return;

  addActivity(
    card,
    `deleted comment "${comment.text}"`
  );

  card.comments = card.comments.filter(
    (comment) => comment.id !== commentId
  );
},

// edit comment
editComment: (state, action) => {
  const {
    userId,
    workspaceId,
    boardId,
    listId,
    cardId,
    commentId,
    text,
  } = action.payload;

  const card = getCard(
    state,
    userId,
    workspaceId,
    boardId,
    listId,
    cardId
  );

  if (!card) return;

  const comment = card.comments.find(
    (c) => c.id === commentId
  );

  if (!comment) return;

  const oldText = comment.text;

  comment.text = text;

  addActivity(
    card,
    `edited comment from "${oldText}" to "${text}"`
  );
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
  updateCard,
  toggleLabel,
  toggleMember,
  addChecklist,
  addChecklistItem,
  toggleChecklistItem,
  deleteChecklistItem,
  deleteChecklist,
  addAttachment,
  deleteAttachment,
  addComment,
  deleteComment,
  editComment,
  toggleCardCompleted,
} = workspaceSlice.actions;

export default workspaceSlice.reducer;