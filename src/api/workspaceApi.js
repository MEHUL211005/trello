import api from "./axios";


// GET ALL WORKSPACES
export const getWorkspaces = async () => {

  const res = await api.get("/workspaces");

  return res.data;

};


// GET SINGLE WORKSPACE BY ID
export const getWorkspaceById = async (id) => {

  const res = await api.get(`/workspaces/${id}`);

  return res.data;

};


// CREATE WORKSPACE
export const createWorkspace = async (data) => {

  const res = await api.post("/workspaces", data);

  return res.data;

};


// UPDATE WORKSPACE
export const updateWorkspace = async (id, data) => {

  const res = await api.put(`/workspaces/${id}`, data);

  return res.data;

};


// DELETE WORKSPACE
export const deleteWorkspace = async (id) => {

  const res = await api.delete(`/workspaces/${id}`);

  return res.data;

};