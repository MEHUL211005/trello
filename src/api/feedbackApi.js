import api from "./axios";

// SEND FEEDBACK
export const sendFeedback = async (data) => {
  const res = await api.post("/feedback", data);
  return res.data;
};