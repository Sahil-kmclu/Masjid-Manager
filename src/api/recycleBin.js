import api from "./client";

// Get recycle bin items
export const getRecycleBin = () => api.get("/recycle-bin");

// Restore item from recycle bin
export const restoreItem = (id) => api.post(`/recycle-bin/restore/${id}`);

// Permanently delete item
export const permanentDelete = (id) => api.delete(`/recycle-bin/${id}`);

// Empty recycle bin
export const emptyRecycleBin = () => api.delete("/recycle-bin");
