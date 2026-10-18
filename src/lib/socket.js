import { io } from "socket.io-client";

import axiosInstance from "../api/axios";
import { store } from "../redux/store";

// The real-time server lives on the same origin as the API (without "/api")
const ORIGIN = (
  import.meta.env.VITE_FILE_URL ||
  (import.meta.env.VITE_API_URL || "").replace(/\/api\/?$/, "")
).replace(/\/$/, "");

let socket = null;
let renewing = false;

export const getSocket = () => {
  if (!socket) {
    socket = io(ORIGIN, {
      autoConnect: false,
      // Read on every (re)connect, so a refreshed access token is used
      auth: (done) => done({ token: store.getState().auth.token }),
    });

    // The server rejects an expired access token and does not retry by
    // itself. Calling any authenticated endpoint makes axios refresh the
    // token (see api/axios.js); then we connect again with the new one.
    socket.on("connect_error", async (error) => {
      if (error.message !== "unauthorized" || renewing) return;

      renewing = true;
      try {
        await axiosInstance.get("/auth/profile");
        socket.connect();
      } catch {
        // Refresh failed: the axios interceptor has logged the user out
      } finally {
        renewing = false;
      }
    });
  }

  return socket;
};

export const connectSocket = () => {
  const instance = getSocket();
  if (!instance.connected && !instance.active) instance.connect();
  return instance;
};

export const disconnectSocket = () => {
  if (socket) socket.disconnect();
};
