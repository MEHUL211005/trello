import axiosInstance from "./axios";

export const signupUser = async (userData) => {
  const response = await axiosInstance.post("/auth/register", userData);
  return response.data;
};

export const loginUser = async (userData) => {
  const response = await axiosInstance.post("/auth/login", userData);
  return response.data;
};