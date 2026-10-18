// Numbers for the board's "Insights" panel. All worked out from the lists and
// cards the board already holds, so it is instant and always up to date.

const startOfDay = (date) => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const DAY = 24 * 60 * 60 * 1000;

// Whole days from today to a date (negative = in the past)
const daysFrom = (date, today) =>
  Math.round((startOfDay(date) - today) / DAY);

export const computeInsights = (lists, now = new Date()) => {
  const today = startOfDay(now);

  const cards = lists.flatMap((list) =>
    list.cards.map((card) => ({ ...card, listName: list.name })),
  );

  const total = cards.length;
  const done = cards.filter((card) => card.isCompleted).length;
  const open = cards.filter((card) => !card.isCompleted);

  const withDue = open
    .filter((card) => card.dueDate)
    .map((card) => ({ ...card, days: daysFrom(card.dueDate, today) }));

  const overdue = withDue
    .filter((card) => card.days < 0)
    .sort((a, b) => a.days - b.days);

  const upcoming = withDue
    .filter((card) => card.days >= 0)
    .sort((a, b) => a.days - b.days);

  const checklistItems = cards.flatMap((card) =>
    (card.Checklists || []).flatMap((checklist) => checklist.ChecklistItems || []),
  );

  return {
    total,
    done,
    open: open.length,
    percentDone: total === 0 ? 0 : Math.round((done / total) * 100),
    overdue: overdue.length,
    dueThisWeek: upcoming.filter((card) => card.days <= 7).length,
    noDueDate: open.length - withDue.length,
    checklist: {
      total: checklistItems.length,
      done: checklistItems.filter((item) => item.completed).length,
    },
    perList: lists.map((list) => ({
      id: list.id,
      name: list.name,
      count: list.cards.length,
      done: list.cards.filter((card) => card.isCompleted).length,
    })),
    // The few cards that need a look first
    needsAttention: overdue.slice(0, 3),
    comingUp: upcoming.slice(0, 3),
  };
};
