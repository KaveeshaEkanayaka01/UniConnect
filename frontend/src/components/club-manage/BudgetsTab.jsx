import React, { useEffect, useMemo, useState } from "react";
import {
  DollarSign,
  PlusCircle,
  RefreshCw,
  BadgeCheck,
  Lock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  getClubBudgets,
  createBudgetRequest,
  approveBudgetRequest,
  rejectBudgetRequest,
} from "../../services/budgetService";

const initialBudgetForm = {
  title: "",
  amount: "",
  description: "",
  category: "General",
};

const budgetCategories = [
  "General",
  "Events",
  "Travel",
  "Equipment",
  "Marketing",
  "Operations",
  "Training",
  "Competition",
];

const statusClassMap = {
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-rose-100 text-rose-700",
  pending: "bg-amber-100 text-amber-700",
};

const normalizeText = (value) => String(value || "").trim().toLowerCase();

const budgetCreatorRoles = [
  "president",
  "vice_president",
  "treasurer",
  "secretary",
  "assistant_secretary",
  "assistant_treasurer",
  "event_coordinator",
  "project_coordinator",
  "executive",
  "club_admin",
];

const getCurrentUser = () => {
  try {
    return (
      JSON.parse(localStorage.getItem("userInfo")) ||
      JSON.parse(localStorage.getItem("user")) ||
      JSON.parse(localStorage.getItem("authUser")) ||
      null
    );
  } catch {
    return null;
  }
};

const BudgetsTab = ({ clubId, club, membership, permissions }) => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [budgetForm, setBudgetForm] = useState(initialBudgetForm);

  const currentUser = getCurrentUser();
  const userRole = normalizeText(currentUser?.role);
  const membershipRole = normalizeText(membership?.role);
  const parentRole = normalizeText(membership?.parentRole);

  const isSystemAdmin = userRole === "system_admin";

  const canManageBudgets = useMemo(() => {
    if (permissions?.canManageClub) return true;
    if (parentRole === "system_admin") return true;
    if (parentRole === "club_admin") return true;
    return budgetCreatorRoles.includes(membershipRole);
  }, [permissions, parentRole, membershipRole]);

  const canCreateBudgetRequests = !isSystemAdmin && canManageBudgets;
  const canApproveRejectBudgets = isSystemAdmin;

  const loadBudgets = async () => {
    try {
      setLoading(true);
      setMessage("");

      const res = await getClubBudgets(clubId);
      const budgetData = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.budgets)
        ? res.budgets
        : [];

      setBudgets(budgetData);
    } catch (error) {
      console.error("Error loading budgets:", error);
      setBudgets([]);
      setMessage(
        error?.response?.data?.message || "Failed to load budget requests"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clubId) {
      loadBudgets();
    }
  }, [clubId]);

  const handleInputChange = (key, value) => {
    setBudgetForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
    setMessage("");
  };

  const validateForm = () => {
    const nextErrors = {};

    const title = budgetForm.title.trim();
    const amount = Number(budgetForm.amount);
    const description = budgetForm.description.trim();
    const category = budgetForm.category;

    if (!title) {
      nextErrors.title = "Title is required";
    } else if (title.length < 3) {
      nextErrors.title = "Title must be at least 3 characters";
    } else if (title.length > 100) {
      nextErrors.title = "Title must be less than 100 characters";
    }

    if (budgetForm.amount === "" || budgetForm.amount === null) {
      nextErrors.amount = "Amount is required";
    } else if (Number.isNaN(amount)) {
      nextErrors.amount = "Amount must be a valid number";
    } else if (amount <= 0) {
      nextErrors.amount = "Amount must be greater than 0";
    } else if (amount > 10000000) {
      nextErrors.amount = "Amount is too large";
    }

    if (!description) {
      nextErrors.description = "Description is required";
    } else if (description.length < 10) {
      nextErrors.description = "Description must be at least 10 characters";
    } else if (description.length > 500) {
      nextErrors.description = "Description must be less than 500 characters";
    }

    if (!category || !budgetCategories.includes(category)) {
      nextErrors.category = "Please select a valid category";
    }

    return nextErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!canCreateBudgetRequests) {
      setMessage("You are not allowed to submit budget requests for this club.");
      return;
    }

    const validationErrors = validateForm();
    setErrors(validationErrors);
    setMessage("");

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        clubId,
        title: budgetForm.title.trim(),
        amount: Number(budgetForm.amount),
        description: budgetForm.description.trim(),
        category: budgetForm.category,
      };

      await createBudgetRequest(payload);

      setMessage("Budget request submitted successfully");
      setBudgetForm(initialBudgetForm);
      setErrors({});
      await loadBudgets();
    } catch (error) {
      console.error("Error creating budget request:", error);
      setMessage(
        error?.response?.data?.message || "Failed to submit budget request"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (budgetId) => {
    try {
      setActionLoadingId(budgetId);
      setMessage("");
      await approveBudgetRequest(budgetId, {});
      setMessage("Budget request approved successfully");
      await loadBudgets();
    } catch (error) {
      console.error("Error approving budget request:", error);
      setMessage(
        error?.response?.data?.message || "Failed to approve budget request"
      );
    } finally {
      setActionLoadingId("");
    }
  };

  const handleReject = async (budgetId) => {
    const reason = window.prompt("Enter rejection reason (optional):", "") || "";

    try {
      setActionLoadingId(budgetId);
      setMessage("");
      await rejectBudgetRequest(budgetId, { reason });
      setMessage("Budget request rejected successfully");
      await loadBudgets();
    } catch (error) {
      console.error("Error rejecting budget request:", error);
      setMessage(
        error?.response?.data?.message || "Failed to reject budget request"
      );
    } finally {
      setActionLoadingId("");
    }
  };

  const totalRequested = useMemo(() => {
    return budgets.reduce((sum, item) => sum + Number(item?.amount || 0), 0);
  }, [budgets]);

  const pendingCount = useMemo(() => {
    return budgets.filter(
      (item) => String(item?.status || "").toLowerCase() === "pending"
    ).length;
  }, [budgets]);

  const approvedCount = useMemo(() => {
    return budgets.filter(
      (item) => String(item?.status || "").toLowerCase() === "approved"
    ).length;
  }, [budgets]);

  const getStatusClass = (status) => {
    const normalized = String(status || "pending").toLowerCase();
    return statusClassMap[normalized] || "bg-slate-100 text-slate-700";
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-indigo-600 font-semibold text-sm">
              <DollarSign size={18} />
              Budget Management
            </div>

            <h2 className="mt-2 text-2xl font-black text-slate-900">
              {club?.name ? `${club.name} Budget Requests` : "Budget Requests"}
            </h2>

            <p className="mt-2 text-sm text-slate-500 max-w-2xl">
              {isSystemAdmin
                ? "Review, approve, or reject submitted budget requests for this club."
                : "Review submitted budget requests for this club."}
            </p>
          </div>

          <button
            type="button"
            onClick={loadBudgets}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
            <p className="text-sm text-slate-500">Total Requests</p>
            <h3 className="mt-2 text-3xl font-black text-slate-900">
              {budgets.length}
            </h3>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
            <p className="text-sm text-slate-500">Pending</p>
            <h3 className="mt-2 text-3xl font-black text-amber-600">
              {pendingCount}
            </h3>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
            <p className="text-sm text-slate-500">Approved</p>
            <h3 className="mt-2 text-3xl font-black text-emerald-600">
              {approvedCount}
            </h3>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <div className="flex items-center gap-2 text-slate-700">
            <BadgeCheck size={16} className="text-indigo-600" />
            <span className="text-sm font-semibold">
              Total requested amount: Rs. {totalRequested.toLocaleString()}
            </span>
          </div>
        </div>

        {message && (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
            {message}
          </div>
        )}
      </div>

      <div
        className={`grid grid-cols-1 ${
          canCreateBudgetRequests ? "xl:grid-cols-2" : ""
        } gap-6`}
      >
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-2xl font-black text-slate-900">
                Submitted Requests
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Review all budget requests submitted for this club.
              </p>
            </div>

            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-sm font-semibold">
              <BadgeCheck size={14} />
              Approved: {approvedCount}
            </span>
          </div>

          {loading ? (
            <p className="text-slate-500">Loading budget requests...</p>
          ) : budgets.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-slate-500">
              No budget requests found.
            </div>
          ) : (
            <div className="space-y-4">
              {budgets.map((budget) => {
                const normalizedStatus = normalizeText(budget.status);
                const isPending = normalizedStatus === "pending";
                const isBusy = actionLoadingId === budget._id;

                return (
                  <div
                    key={budget._id}
                    className="rounded-2xl border border-slate-200 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-slate-900">
                          {budget.title || "Untitled Budget Request"}
                        </h4>

                        <p className="text-sm text-slate-500 mt-1">
                          {budget.description || "No description provided"}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600">
                          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-medium">
                            {budget.category || "General"}
                          </span>

                          {budget.createdAt && (
                            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-medium">
                              {new Date(budget.createdAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right min-w-[110px]">
                        <p className="font-black text-slate-900">
                          Rs. {Number(budget.amount || 0).toLocaleString()}
                        </p>

                        <span
                          className={`inline-flex mt-2 px-3 py-1 rounded-full text-xs font-bold ${getStatusClass(
                            budget.status
                          )}`}
                        >
                          {budget.status || "pending"}
                        </span>
                      </div>
                    </div>

                    {budget.rejectionReason && (
                      <div className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600 border border-slate-200">
                        <span className="font-semibold text-slate-800">
                          Rejection Reason:
                        </span>{" "}
                        {budget.rejectionReason}
                      </div>
                    )}

                    {canApproveRejectBudgets && isPending && (
                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleApprove(budget._id)}
                          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-white font-semibold hover:bg-emerald-700 disabled:opacity-60"
                        >
                          <CheckCircle2 size={16} />
                          {isBusy ? "Processing..." : "Approve"}
                        </button>

                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleReject(budget._id)}
                          className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-white font-semibold hover:bg-rose-700 disabled:opacity-60"
                        >
                          <XCircle size={16} />
                          {isBusy ? "Processing..." : "Reject"}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {canCreateBudgetRequests && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <PlusCircle className="text-indigo-600" size={20} />
              <h3 className="text-2xl font-black text-slate-900">
                Create Budget Request
              </h3>
            </div>

            <p className="text-sm text-slate-500 mb-4">
              Submit a new budget request for {club?.name || "this club"}.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Title
                </label>
                <input
                  type="text"
                  value={budgetForm.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 ${
                    errors.title
                      ? "border-rose-300 focus:ring-rose-100"
                      : "border-slate-200 focus:ring-indigo-200"
                  }`}
                  placeholder="Enter budget title"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-rose-600">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Amount
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={budgetForm.amount}
                  onChange={(e) => handleInputChange("amount", e.target.value)}
                  className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 ${
                    errors.amount
                      ? "border-rose-300 focus:ring-rose-100"
                      : "border-slate-200 focus:ring-indigo-200"
                  }`}
                  placeholder="Enter amount"
                />
                {errors.amount && (
                  <p className="mt-1 text-sm text-rose-600">{errors.amount}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Category
                </label>
                <select
                  value={budgetForm.category}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                  className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 ${
                    errors.category
                      ? "border-rose-300 focus:ring-rose-100"
                      : "border-slate-200 focus:ring-indigo-200"
                  }`}
                >
                  {budgetCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-rose-600">{errors.category}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Description
                </label>
                <textarea
                  rows="5"
                  value={budgetForm.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 ${
                    errors.description
                      ? "border-rose-300 focus:ring-rose-100"
                      : "border-slate-200 focus:ring-indigo-200"
                  }`}
                  placeholder="Explain why this budget is needed"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-rose-600">
                    {errors.description}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-60"
              >
                <DollarSign size={16} />
                {submitting ? "Submitting..." : "Submit Budget Request"}
              </button>
            </form>
          </div>
        )}

        {!canCreateBudgetRequests && !canApproveRejectBudgets && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="text-amber-600" size={20} />
              <h3 className="text-2xl font-black text-slate-900">
                Budget Actions
              </h3>
            </div>

            <p className="text-sm text-slate-500 mb-4">
              You can view budget requests, but you are not allowed to submit new
              ones for this club.
            </p>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Only allowed club management roles can submit budget requests.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetsTab;