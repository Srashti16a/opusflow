import { createSlice } from "@reduxjs/toolkit";

const storedUser = localStorage.getItem("user");
const storedToken = localStorage.getItem("token");
const storedRefreshToken = localStorage.getItem("refreshToken");

const initialState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken || null,
  refreshToken: storedRefreshToken || null,
  loading: false,
  error: null
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      const { user, token, refreshToken } = action.payload;
      state.loading = false;
      state.user = user;
      state.token = token;
      state.refreshToken = refreshToken;
      state.error = null;

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", refreshToken);
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem("user", JSON.stringify(state.user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.loading = false;
      state.error = null;

      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
    }
  }
});

export const { loginStart, loginSuccess, loginFailure, updateUser, logout } = authSlice.actions;

export default authSlice.reducer;
