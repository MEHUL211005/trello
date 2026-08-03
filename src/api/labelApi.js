import api from "./axios";


// GET BOARD LABELS
export const getBoardLabels = async (boardId) => {

  const res = await api.get(
    `/labels/boards/${boardId}`
  );

  return res.data;

};



// GET CARD LABELS
export const getCardLabels = async (cardId) => {

  const res = await api.get(
    `/labels/cards/${cardId}`
  );

  return res.data;

};



// TOGGLE LABEL
export const toggleLabel = async ({
  cardId,
  labelId,
}) => {

  const res = await api.post(
    `/labels/cards/${cardId}/labels/${labelId}`
  );

  return res.data;

};



// CREATE LABEL
export const createLabel = async (data) => {

  const res = await api.post(
    "/labels",
    data
  );

  return res.data;

};