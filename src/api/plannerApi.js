import api from "./axios";

// TASKS BETWEEN TWO DAYS (YYYY-MM-DD, both included)
export const getPlannerTasks = async (from, to) => {
  const res = await api.get("/planner", { params: { from, to } });
  return res.data;
};

// UNFINISHED TASKS FROM BEFORE TODAY + EVERYTHING COMING UP
export const getPlannerAgenda = async (today, days = 30) => {
  const res = await api.get("/planner/agenda", { params: { today, days } });
  return res.data;
};

// CREATE TASK  { title, date, time?, description? }
export const createPlannerTask = async (data) => {
  const res = await api.post("/planner", data);
  return res.data;
};

// EDIT / RESCHEDULE TASK
export const updatePlannerTask = async (id, data) => {
  const res = await api.put(`/planner/${id}`, data);
  return res.data;
};

// MARK DONE / NOT DONE
export const setPlannerTaskDone = async (id, isDone) => {
  const res = await api.patch(`/planner/${id}/done`, { isDone });
  return res.data;
};

// DELETE TASK
export const deletePlannerTask = async (id) => {
  const res = await api.delete(`/planner/${id}`);
  return res.data;
};
