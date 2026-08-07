import api from "./axios";

// GET BOARDS OF WORKSPACE
export const getBoards = async (workspaceId) => {
  const res = await api.get(`/boards/${workspaceId}`);

  return res.data;
};

// CREATE BOARD
export const createBoard = async (data) => {
  const res = await api.post("/boards", data);

  return res.data;
};

// UPDATE BOARD
export const updateBoard = async (id, data) => {
  const res = await api.put(`/boards/${id}`, data);

  return res.data;
};

// DELETE BOARD
export const deleteBoard = async (id) => {
  const res = await api.delete(`/boards/${id}`);

  return res.data;
};

// SEARCH BOARDS
export const searchBoards = async (query) => {
  const res = await api.get("/boards/search", {
    params: { query },
  });
  return res.data;
};

// GET SINGLE BOARD
export const getBoardById = async (id) => {
  const res = await api.get(`/boards/single/${id}`);
  return res.data;
};
export const toggleStarBoard = async (boardId) => {
  const response = await api.patch(
    `/boards/${boardId}/star`
  );

  return response.data;
};
export const filterBoardCards = async (boardId, filters) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, v));
    } else if (value) {
      params.append(key, value);
    }
  });

  const response = await api.get(
    `/boards/${boardId}/filter?${params.toString()}`
  );

  return response.data;
};