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