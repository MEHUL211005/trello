// Pure helpers for dragging lists and cards. No React in here, so the logic
// can be tested on its own.

// dnd-kit needs every draggable/droppable id to be unique in one DndContext,
// but a card and a list can share the same database id. Prefix them.
export const listDndId = (id) => `list:${id}`;
export const cardDndId = (id) => `card:${id}`;
export const cardsDropId = (id) => `cards:${id}`;

export const sameId = (a, b) => String(a) === String(b);

export const cloneLists = (lists) =>
  lists.map((list) => ({ ...list, cards: [...list.cards] }));

export const findListOfCard = (lists, cardId) =>
  lists.find((list) => list.cards.some((card) => sameId(card.id, cardId))) ||
  null;

// Move a card to `index` of another list (live preview while dragging).
// Returns the same array when nothing would change.
export const moveCardToList = (lists, cardId, toListId, index) => {
  const from = findListOfCard(lists, cardId);
  const to = lists.find((list) => sameId(list.id, toListId));

  if (!from || !to || sameId(from.id, to.id)) return lists;

  const card = from.cards.find((item) => sameId(item.id, cardId));
  const at = Math.max(0, Math.min(index, to.cards.length));

  return lists.map((list) => {
    if (sameId(list.id, from.id)) {
      return {
        ...list,
        cards: list.cards.filter((item) => !sameId(item.id, cardId)),
      };
    }

    if (sameId(list.id, to.id)) {
      const cards = [...list.cards];
      cards.splice(at, 0, { ...card, listId: list.id });
      return { ...list, cards };
    }

    return list;
  });
};

// Re-order a card inside the list it is in
export const reorderCardInList = (lists, cardId, overCardId) => {
  const list = findListOfCard(lists, cardId);
  if (!list) return lists;

  const from = list.cards.findIndex((card) => sameId(card.id, cardId));
  const to = list.cards.findIndex((card) => sameId(card.id, overCardId));

  if (from === -1 || to === -1 || from === to) return lists;

  return lists.map((item) => {
    if (!sameId(item.id, list.id)) return item;
    const cards = [...item.cards];
    const [moved] = cards.splice(from, 1);
    cards.splice(to, 0, moved);
    return { ...item, cards };
  });
};

// Put a card at the end of its own list
export const moveCardToEnd = (lists, cardId) => {
  const list = findListOfCard(lists, cardId);
  if (!list) return lists;

  const index = list.cards.findIndex((card) => sameId(card.id, cardId));
  if (index === list.cards.length - 1) return lists;

  return lists.map((item) => {
    if (!sameId(item.id, list.id)) return item;
    const cards = [...item.cards];
    const [moved] = cards.splice(index, 1);
    cards.push(moved);
    return { ...item, cards };
  });
};

// Re-order whole lists
export const reorderLists = (lists, listId, overListId) => {
  const from = lists.findIndex((list) => sameId(list.id, listId));
  const to = lists.findIndex((list) => sameId(list.id, overListId));

  if (from === -1 || to === -1 || from === to) return lists;

  const next = [...lists];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
};

// Cards whose list or position differs between two arrangements. This is
// exactly what the server needs to be told.
export const diffCardPlacements = (before, after) => {
  const original = new Map();

  before.forEach((list) =>
    list.cards.forEach((card, index) =>
      original.set(String(card.id), {
        listId: list.id,
        position: index,
      }),
    ),
  );

  const changes = [];

  after.forEach((list) =>
    list.cards.forEach((card, index) => {
      const was = original.get(String(card.id));

      if (!was || !sameId(was.listId, list.id) || was.position !== index) {
        changes.push({ id: card.id, listId: list.id, position: index });
      }
    }),
  );

  return changes;
};

export const diffListPositions = (before, after) => {
  const original = new Map(
    before.map((list, index) => [String(list.id), index]),
  );

  return after
    .map((list, index) => ({ id: list.id, position: index }))
    .filter((item) => original.get(String(item.id)) !== item.position);
};

// The arrangement of lists/cards, written back into React Query's cached
// board so the UI is already correct before the server answers.
export const applyLayoutToBoardData = (data, layout) => {
  if (!data?.board) return data;

  const byId = new Map(layout.map((list, index) => [String(list.id), [list, index]]));

  return {
    ...data,
    board: {
      ...data.board,
      lists: data.board.lists.map((list) => {
        const entry = byId.get(String(list.id));
        if (!entry) return list;

        const [placed, listIndex] = entry;

        return {
          ...list,
          position: listIndex,
          cards: placed.cards.map((card, index) => ({
            ...card,
            listId: list.id,
            position: index,
          })),
        };
      }),
    },
  };
};
