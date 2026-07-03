import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  users: [],
  user: null,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    // ================= SIGNUP =================
    signup: (state, action) => {
      const { name, email, password } = action.payload;

      state.error = null;

      // VALIDATIONS
      if (!name || !email || !password) {
        state.error = "All fields are required";
        return;
      }

      if (!email.includes("@")) {
        state.error = "Invalid email format";
        return;
      }

      if (password.length < 6) {
        state.error = "Password must be at least 6 characters";
        return;
      }

      const existingUser = state.users.find(
        (u) => u.email === email
      );

      if (existingUser) {
        state.error = "User already exists with this email";
        return;
      }

      const newUser = {
        id: crypto.randomUUID(),
        name,
        email,
        password,
      };

      state.users.push(newUser);

      // ❌ IMPORTANT: NO AUTO LOGIN
      state.user = null;
    },

    // ================= LOGIN =================
    login: (state, action) => {
      const { email, password } = action.payload;

      state.error = null;

      if (!email || !password) {
        state.error = "Email and password required";
        return;
      }

      const foundUser = state.users.find(
        (u) => u.email === email && u.password === password
      );

      if (!foundUser) {
        state.error = "Invalid email or password";
        return;
      }

      state.user = foundUser;
    },

    // ================= LOGOUT =================
   logout: (state) => {
  state.user = null;
},

    // ================= CLEAR ERROR =================
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { signup, login, logout, clearError } = authSlice.actions;

export default authSlice.reducer;