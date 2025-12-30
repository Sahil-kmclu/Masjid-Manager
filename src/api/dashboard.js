import api from "./client";

// Get dashboard data
export const getDashboard = () => api.get("/dashboard");
