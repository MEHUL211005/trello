import axiosInstance from "./axios";

export const signupUser = async (userData) => {
  const response = await axiosInstance.post("/auth/register", userData);
  return response.data;
};

export const loginUser = async (userData) => {
  const response = await axiosInstance.post("/auth/login", userData);
  return response.data;
};

export const verifyOtp = async ({ email, otp }) => {
  const response = await axiosInstance.post("/auth/verify-otp", { email, otp });
  return response.data;
};

export const resendOtp = async (email) => {
  const response = await axiosInstance.post("/auth/resend-otp", { email });
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await axiosInstance.post("/auth/forgot-password", { email });
  return response.data;
};

export const resetPassword = async ({ token, password, confirmPassword }) => {
  const response = await axiosInstance.post("/auth/reset-password", {
    token,
    password,
    confirmPassword,
  });
  return response.data;
};

export const updateProfile = async (name) => {
  const response = await axiosInstance.put("/auth/profile", { name });
  return response.data;
};

export const changePassword = async (values) => {
  const response = await axiosInstance.post("/auth/change-password", values);
  return response.data;
};
