// API Configuration
const API_BASE_URL = "https://masjid-manager-backend.vercel.app/api";

// Get stored auth token
const getToken = () => localStorage.getItem("masjid_auth_token");

// Store auth token
export const setToken = (token) =>
  localStorage.setItem("masjid_auth_token", token);

// Remove auth token
export const removeToken = () => localStorage.removeItem("masjid_auth_token");

// Generic API request function
async function apiRequest(endpoint, options = {}) {
  const token = getToken();

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "API request failed");
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

// API methods
export const api = {
  get: (endpoint) => apiRequest(endpoint, { method: "GET" }),

  post: (endpoint, body) =>
    apiRequest(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  put: (endpoint, body) =>
    apiRequest(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  delete: (endpoint) => apiRequest(endpoint, { method: "DELETE" }),
};

export default api;
