import api from "./axios";

// GET COMMENTS
export const getComments = async (cardId) => {
  const res = await api.get(`/comments/cards/${cardId}`);
  return res.data;
};

// ADD COMMENT
export const addComment = async ({ cardId, text }) => {
  const res = await api.post(`/comments/cards/${cardId}`, { text });
  return res.data;
};

// DELETE COMMENT
export const deleteComment = async (commentId) => {
  const res = await api.delete(`/comments/${commentId}`);
  return res.data;
};

// UPDATE COMMENT
export const updateComment = async ({ commentId, text }) => {
  const res = await api.patch(`/comments/${commentId}`, { text });
  return res.data;
};