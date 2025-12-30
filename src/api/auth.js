import api, { setToken, removeToken } from "./client";

// Register a new mosque
export const register = async (data) => {
  const response = await api.post("/auth/register", data);
  if (response.token) {
    setToken(response.token);
  }
  return response;
};

// Admin login
export const login = async (email, password) => {
  const response = await api.post("/auth/login", { email, password });
  if (response.token) {
    setToken(response.token);
  }
  return response;
};

// Guest login with secret code
export const guestLogin = async (secretCode) => {
  const response = await api.post("/auth/guest-login", { secretCode });
  if (response.token) {
    setToken(response.token);
  }
  return response;
};

// Get current user
export const getMe = () => api.get("/auth/me");

// Update mosque profile
export const updateProfile = (data) => api.put("/auth/profile", data);

// Forgot password
export const forgotPassword = (email) =>
  api.post("/auth/forgot-password", { email });

// Verify OTP
export const verifyOtp = (email, otp) =>
  api.post("/auth/verify-otp", { email, otp });

// Reset password
export const resetPassword = (email, otp, newPassword) =>
  api.post("/auth/reset-password", { email, otp, newPassword });

// Logout
export const logout = () => {
  removeToken();
};

// Check if user is logged in
export const isLoggedIn = () => !!localStorage.getItem("masjid_auth_token");
