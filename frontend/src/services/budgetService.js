import API from "../components/Auth/axios";

// ================= BUDGET SERVICES =================
export const getClubBudgets = async (clubId) => {
  const res = await API.get(`/budgets/club/${clubId}`);
  return res.data;
};

export const createBudgetRequest = async (payload) => {
  const res = await API.post("/budgets", payload);
  return res.data;
};

export const getAllBudgets = async () => {
  const res = await API.get("/budgets/all");
  return res.data;
};

export const approveBudgetRequest = async (budgetId, payload) => {
  const res = await API.put(`/budgets/${budgetId}/approve`, payload);
  return res.data;
};

export const rejectBudgetRequest = async (budgetId, payload) => {
  const res = await API.put(`/budgets/${budgetId}/reject`, payload);
  return res.data;
};

export const deleteBudgetRequest = async (budgetId) => {
  const res = await API.delete(`/budgets/${budgetId}`);
  return res.data;
};