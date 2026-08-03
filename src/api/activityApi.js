import api from "./axios";

export const getCardActivities = async (cardId) => {

  const res = await api.get(`/activities/cards/${cardId}`);

  return res.data;

};