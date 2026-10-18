// Filtering cards on the board, done in the browser.
//
// The board already holds every card with its labels, due date and status,
// so filtering needs no server round trip. That is what makes it instant: the
// old server-side version showed a half-filtered board until the answer
// arrived. The rules are the same as the server's /boards/:id/filter.

export const EMPTY_FILTERS = {
  keyword: "",
  completed: false,
  incomplete: false,
  overdue: false,
  nextWeek: false,
  nextMonth: false,
  labels: [],
};

export const hasActiveFilters = (filters) =>
  !!filters.keyword?.trim() ||
  filters.completed ||
  filters.incomplete ||
  filters.overdue ||
  filters.nextWeek ||
  filters.nextMonth ||
  (filters.labels?.length ?? 0) > 0;

const startOfDay = (date) => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const endOfDay = (date) => {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy;
};

// A function that says whether one card passes the filters + search text
export const buildCardMatcher = (filters, search = "", now = new Date()) => {
  const today = startOfDay(now);
  const weekAhead = endOfDay(now);
  weekAhead.setDate(weekAhead.getDate() + 7);
  const monthAhead = endOfDay(now);
  monthAhead.setMonth(monthAhead.getMonth() + 1);

  const keyword = (filters.keyword || "").trim().toLowerCase();
  const titleSearch = search.trim().toLowerCase();
  const wantedLabels = new Set((filters.labels || []).map(Number));

  return (card) => {
    if (titleSearch && !card.title?.toLowerCase().includes(titleSearch)) {
      return false;
    }

    if (keyword) {
      const inTitle = card.title?.toLowerCase().includes(keyword);
      const inDescription = card.description?.toLowerCase().includes(keyword);
      if (!inTitle && !inDescription) return false;
    }

    if (filters.completed && !card.isCompleted) return false;
    if (filters.incomplete && card.isCompleted) return false;

    const due = card.dueDate ? new Date(card.dueDate) : null;

    if (filters.overdue && !(due && due < today && !card.isCompleted)) {
      return false;
    }

    if (filters.nextWeek && !(due && due >= today && due <= weekAhead)) {
      return false;
    }

    if (filters.nextMonth && !(due && due > weekAhead && due <= monthAhead)) {
      return false;
    }

    if (wantedLabels.size > 0) {
      const has = (card.Labels || []).some((label) => wantedLabels.has(label.id));
      if (!has) return false;
    }

    return true;
  };
};

// Lists with only the matching cards. Every list stays (even with no
// matches), so columns never pop in and out and the board does not jump.
// With nothing to filter the very same array comes back, which keeps
// unchanged lists from re-rendering.
export const filterBoardLists = (lists, filters, search = "", now = new Date()) => {
  if (!hasActiveFilters(filters) && !search.trim()) return lists;

  const matches = buildCardMatcher(filters, search, now);

  return lists.map((list) => ({
    ...list,
    totalCards: list.cards.length,
    cards: list.cards.filter(matches),
  }));
};

export const countCards = (lists) =>
  lists.reduce((sum, list) => sum + list.cards.length, 0);
