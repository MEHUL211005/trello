import api from "./axios";


// GET BOARDS OF WORKSPACE
export const getBoards = async(workspaceId)=>{

  const res = await api.get(`/boards/${workspaceId}`);

  return res.data;

};


// CREATE BOARD
export const createBoard = async(data)=>{

  const res = await api.post("/boards", data);

  return res.data;

};


// UPDATE BOARD
export const updateBoard = async(id,data)=>{

  const res = await api.put(`/boards/${id}`, data);

  return res.data;

};


// DELETE BOARD
export const deleteBoard = async(id)=>{

  const res = await api.delete(`/boards/${id}`);

  return res.data;

};

// GET SINGLE BOARD
export const getBoardById = async (id) => {
  const res = await api.get(`/boards/single/${id}`);
  return res.data;
};