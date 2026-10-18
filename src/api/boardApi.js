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
// ARCHIVED LISTS AND CARDS OF A BOARD
export const getArchivedItems = async (boardId) => {
  const res = await api.get(`/boards/${boardId}/archived`);
  return res.data;
};

// Star (or un-star) a board for the signed-in user. Stars are personal.
export const toggleStarBoard = async (boardId, starred) => {
  const response = await api.patch(
    `/boards/${boardId}/star`,
    typeof starred === "boolean" ? { starred } : {}
  );

  return response.data;
};

// Every board I starred, mine and shared with me
export const getStarredBoards = async () => {
  const response = await api.get("/boards/starred");
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

// ---------------- SHARING ----------------

// People with access + pending invitations (role: OWNER | EDITOR | VIEWER)
export const getBoardSharing = async (boardId) => {
  const res = await api.get(`/boards/${boardId}/members`);
  return res.data;
};

export const inviteToBoard = async (boardId, { email, role }) => {
  const res = await api.post(`/boards/${boardId}/invite`, { email, role });
  return res.data;
};

export const updateBoardMemberRole = async (boardId, userId, role) => {
  const res = await api.patch(`/boards/${boardId}/members/${userId}`, { role });
  return res.data;
};

export const removeBoardMember = async (boardId, userId) => {
  const res = await api.delete(`/boards/${boardId}/members/${userId}`);
  return res.data;
};

export const revokeBoardInvitation = async (boardId, invitationId) => {
  const res = await api.delete(`/boards/${boardId}/invitations/${invitationId}`);
  return res.data;
};

// Boards other people have shared with me
export const getSharedBoards = async () => {
  const res = await api.get("/boards/shared");
  return res.data;
};

// Every board I can open (mine + shared with me)
export const getAllBoards = async () => {
  const res = await api.get("/boards/all");
  return res.data;
};

// Everyone I share a board with, and which boards
export const getPeople = async () => {
  const res = await api.get("/boards/people");
  return res.data;
};
