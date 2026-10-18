import api from "./axios";

export const createCard = async (data) => {
  const res = await api.post("/cards", data);
  return res.data;
};

export const deleteCard = async (id) => {
  const res = await api.delete(`/cards/${id}`);
  return res.data;
};

export const updateCard = async (id, data) => {
  const res = await api.put(`/cards/${id}`, data);
  return res.data;
};
// UPDATE DUE DATE
export const updateDueDate = async (id, dueDate) => {
  const res = await api.patch(`/cards/${id}/due-date`, { dueDate });

  return res.data;
};
export const toggleCardCompletedApi = async (cardId) => {
  const response = await api.patch(`/cards/${cardId}/toggle-complete`);

  return response.data;
};
// ARCHIVE (archived = true) OR RESTORE (archived = false) A CARD
export const archiveCard = async (id, archived = true) => {
  const res = await api.patch(`/cards/${id}/archive`, { archived });

  return res.data;
};

export const reorderCards = async (data) => {
  const res = await api.patch("/cards/reorder", data);

  return res.data;
};

export const searchCards = async (query) => {
  const res = await api.get("/cards/search", {
    params: { query },
  });

  return res.data;
};
