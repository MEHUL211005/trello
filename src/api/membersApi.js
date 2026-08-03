import axios from "./axios";


export const getBoardMembers = async (boardId) => {

  const res = await axios.get(
    `/members/boards/${boardId}`
  );

  return res.data;

};



export const toggleMember = async ({
  cardId,
  userId,
}) => {

  const res = await axios.post(
    `/members/cards/${cardId}/members/${userId}`
  );

  return res.data;

};



export const getCardMembers = async (cardId) => {

  const res = await axios.get(
    `/members/cards/${cardId}`
  );

  return res.data;

};