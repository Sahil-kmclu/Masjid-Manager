import api from "./client";

// Get all payments
export const getPayments = () => api.get("/payments");

// Get payments by member
export const getPaymentsByMember = (memberId) =>
  api.get(`/payments/member/${memberId}`);

// Create a payment
export const createPayment = (data) => api.post("/payments", data);

// Delete a payment
export const deletePayment = (id) => api.delete(`/payments/${id}`);
