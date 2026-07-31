import api from "./axios";

// GET LISTS OF BOARD
export const getLists = async (boardId) => {
  const res = await api.get(`/lists/${boardId}`);
  return res.data;
};

// CREATE LIST
export const createList = async (data) => {
  const res = await api.post("/lists", data);
  return res.data;
};

// UPDATE LIST
export const updateList = async (id, data) => {
  const res = await api.put(`/lists/${id}`, data);
  return res.data;
};

// DELETE LIST
export const deleteList = async (id) => {
  const res = await api.delete(`/lists/${id}`);
  return res.data;
};

// REORDER LISTS
export const reorderLists = async (data) => {
  const res = await api.patch("/lists/reorder", data);
  return res.data;
};