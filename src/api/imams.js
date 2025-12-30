import api from "./client";

// Get all imams
export const getImams = () => api.get("/imams");

// Get single imam
export const getImam = (id) => api.get(`/imams/${id}`);

// Create an imam
export const createImam = (data) => api.post("/imams", data);

// Update an imam
export const updateImam = (id, data) => api.put(`/imams/${id}`, data);

// Delete an imam
export const deleteImam = (id) => api.delete(`/imams/${id}`);

// --- Imam Salary Payments (Contributions) ---

// Get all imam salary payments
export const getImamSalaryPayments = () => api.get("/imam-salary-payments");

// Create imam salary payment
export const createImamSalaryPayment = (data) =>
  api.post("/imam-salary-payments", data);

// Delete imam salary payment
export const deleteImamSalaryPayment = (id) =>
  api.delete(`/imam-salary-payments/${id}`);

// --- Imam Payouts ---

// Get all imam payouts
export const getImamPayouts = () => api.get("/imam-payouts");

// Get payouts by imam
export const getPayoutsByImam = (imamId) =>
  api.get(`/imam-payouts/imam/${imamId}`);

// Create imam payout
export const createImamPayout = (data) => api.post("/imam-payouts", data);

// Delete imam payout
export const deleteImamPayout = (id) => api.delete(`/imam-payouts/${id}`);
