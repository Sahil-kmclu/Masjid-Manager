import api from "./client";

// Get all income
export const getIncome = () => api.get("/income");

// Create income
export const createIncome = (data) => api.post("/income", data);

// Delete income
export const deleteIncome = (id) => api.delete(`/income/${id}`);

// --- Expenses ---

// Get all expenses
export const getExpenses = () => api.get("/expenses");

// Create expense
export const createExpense = (data) => api.post("/expenses", data);

// Delete expense
export const deleteExpense = (id) => api.delete(`/expenses/${id}`);
