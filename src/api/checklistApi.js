import api from "./axios";

// CREATE CHECKLIST
export const createChecklist = async (cardId, title) => {
  const res = await api.post(
    `/checklists/cards/${cardId}`,
    { title }
  );

  return res.data;
};

// GET CHECKLISTS
export const getChecklists = async (cardId) => {
  const res = await api.get(
    `/checklists/cards/${cardId}`
  );

  return res.data;
};

// ADD ITEM
export const addChecklistItem = async (checklistId, text) => {
  const res = await api.post(
    `/checklists/${checklistId}/items`,
    { text }
  );

  return res.data;
};

// TOGGLE ITEM
export const toggleChecklistItem = async (itemId) => {
  const res = await api.patch(
    `/checklists/items/${itemId}/toggle`
  );

  return res.data;
};

// UPDATE ITEM
export const updateChecklistItem = async (itemId, text) => {
  const res = await api.put(
    `/checklists/items/${itemId}`,
    { text }
  );

  return res.data;
};

// DELETE ITEM
export const deleteChecklistItem = async (itemId) => {
  const res = await api.delete(
    `/checklists/items/${itemId}`
  );

  return res.data;
};

// UPDATE CHECKLIST
export const updateChecklist = async (checklistId, title) => {
  const res = await api.put(
    `/checklists/${checklistId}`,
    { title }
  );

  return res.data;
};

// DELETE CHECKLIST
export const deleteChecklist = async (checklistId) => {

  console.log("DELETE API HIT", checklistId);

  const res = await api.delete(
    `/checklists/${checklistId}`
  );

  console.log("RESPONSE", res);

  return res.data;
};