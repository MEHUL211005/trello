import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import axiosInstance from "../api/axios";
import { logout } from "../redux/authSlice";
import { queryClient } from "../lib/queryClient";

// Signs the user out everywhere in one go: ends the session on the server,
// clears the signed-in state and every cached query (so the next person on
// this device never sees this person's data), then goes to the login page.
export const useLogout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return useCallback(async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } catch {
      // The server being unreachable must not trap anyone signed in
    } finally {
      dispatch(logout());
      queryClient.clear();
      navigate("/login", { replace: true });
    }
  }, [dispatch, navigate]);
};
