import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json"
  }
});

export const getBackendURL = () => {
  return baseURL.replace(/\/api$/, "");
};

// Request Interceptor: Attach JWT access token to Authorization header if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle token expiration (401) and perform refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 (Unauthorized) and we haven't already retried this request
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Do not try to refresh if the failed request was login, signup, or refresh-token itself
      if (
        originalRequest.url.includes("/auth/login") ||
        originalRequest.url.includes("/auth/signup") ||
        originalRequest.url.includes("/auth/refresh-token")
      ) {
        return Promise.reject(error);
      }

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        // No refresh token available, redirect to login
        handleLogout();
        return Promise.reject(error);
      }

      try {
        // Try to obtain a new access token
        const res = await axios.post(`${baseURL}/auth/refresh-token`, {
          refreshToken
        });

        const { token } = res.data;
        localStorage.setItem("token", token);

        // Update the authorization header for the original request and retry it
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        // Refresh token is expired or invalid, log out the user
        handleLogout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

function handleLogout() {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  // Force redirect to login page
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}

export default api;
