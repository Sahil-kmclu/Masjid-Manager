import api from "./client";

// Get all members
export const getMembers = () => api.get("/members");

// Get single member with payments
export const getMember = (id) => api.get(`/members/${id}`);

// Create a new member
export const createMember = (data) => api.post("/members", data);

// Update a member
export const updateMember = (id, data) => api.put(`/members/${id}`, data);

// Delete a member (soft delete)
export const deleteMember = (id) => api.delete(`/members/${id}`);
