import React, { useEffect, useMemo, useState } from "react";
import {
  Wallet,
  PlusCircle,
  Search,
  Lock,
  CheckCircle2,
  XCircle,
  Paperclip,
} from "lucide-react";
import {
  getClubExpenses,
  createExpense,
  deleteExpense,
  approveExpense,
  rejectExpense,
} from "../../services/expenseService";

const expenseCategories = [
  "Event",
  "Travel",
  "Food",
  "Marketing",
  "Printing",
  "Equipment",
  "Stationery",
  "Utilities",
  "Other",
];

const initialForm = {
  title: "",
  amount: "",
  description: "",
  category: "Event",
  vendor: "",
  paymentMethod: "",
  receiptFile: null,
};

const normalizeText = (value) => String(value || "").trim().toLowerCase();

const expenseCreatorRoles = [
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

const statusClassMap = {
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-rose-100 text-rose-700",
  pending: "bg-amber-100 text-amber-700",
};

const paymentMethods = [
  "",
  "Cash",
  "Bank Transfer",
  "Card",
  "Online Payment",
  "Other",
];

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") ||
  "http://localhost:5000";

const ClubExpenses = ({ clubId, club, membership, permissions }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  const currentUser = getCurrentUser();
  const userRole = normalizeText(currentUser?.role);
  const membershipRole = normalizeText(membership?.role);
  const parentRole = normalizeText(membership?.parentRole);

  const isSystemAdmin = userRole === "system_admin";

  const canManageExpenses = useMemo(() => {
    if (permissions?.canManageClub) return true;
    if (parentRole === "system_admin") return true;
    if (parentRole === "club_admin") return true;
    return expenseCreatorRoles.includes(membershipRole);
  }, [permissions, parentRole, membershipRole]);

  const canCreateExpenses = !isSystemAdmin && canManageExpenses;
  const canApproveRejectExpenses = isSystemAdmin;

  const loadExpenses = async () => {
    try {
      setLoading(true);
      setMessage("");
      const res = await getClubExpenses(clubId);
      setExpenses(
        Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
      );
    } catch (error) {
      console.error("Error loading expenses:", error);
      setExpenses([]);
      setMessage(
        error?.response?.data?.message || "Failed to load expenses"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clubId) {
      loadExpenses();
    }
  }, [clubId]);

  const filteredExpenses = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return expenses;

    return expenses.filter((expense) =>
      [
        expense.title,
        expense.description,
        expense.category,
        expense.status,
        expense.vendor,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [expenses, search]);

  const totalAmount = useMemo(() => {
    return expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }, [expenses]);

  const approvedCount = useMemo(() => {
    return expenses.filter(
      (item) => normalizeText(item.status || "pending") === "approved"
    ).length;
  }, [expenses]);

  const pendingCount = useMemo(() => {
    return expenses.filter(
      (item) => normalizeText(item.status || "pending") === "pending"
    ).length;
  }, [expenses]);

  const handleInputChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
    setMessage("");
  };

  const validateForm = () => {
    const newErrors = {};

    const title = form.title.trim();
    const amount = Number(form.amount);
    const description = form.description.trim();
    const vendor = form.vendor.trim();
    const file = form.receiptFile;

    if (!title) {
      newErrors.title = "Title is required";
    } else if (title.length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    } else if (title.length > 120) {
      newErrors.title = "Title cannot exceed 120 characters";
    }

    if (form.amount === "" || form.amount === null) {
      newErrors.amount = "Amount is required";
    } else if (Number.isNaN(amount)) {
      newErrors.amount = "Amount must be a valid number";
    } else if (amount <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }

    if (!form.category || !expenseCategories.includes(form.category)) {
      newErrors.category = "Please select a valid category";
    }

    if (!description) {
      newErrors.description = "Description is required";
    } else if (description.length > 500) {
      newErrors.description = "Description cannot exceed 500 characters";
    }

    if (vendor.length > 100) {
      newErrors.vendor = "Vendor cannot exceed 100 characters";
    }

    if (form.paymentMethod && !paymentMethods.includes(form.paymentMethod)) {
      newErrors.paymentMethod = "Please select a valid payment method";
    }

    if (file) {
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];

      if (!allowedTypes.includes(file.type)) {
        newErrors.receiptFile =
          "Only PDF, JPG, JPEG, PNG, and WEBP files are allowed";
      } else if (file.size > 5 * 1024 * 1024) {
        newErrors.receiptFile = "Receipt file must be 5MB or less";
      }
    }

    return newErrors;
  };

  const handleCreateExpense = async (e) => {
    e.preventDefault();

    if (!canCreateExpenses) {
      setMessage("You are not allowed to create expenses for this club.");
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

      const formData = new FormData();
      formData.append("clubId", clubId);
      formData.append("title", form.title.trim());
      formData.append("amount", String(Number(form.amount)));
      formData.append("description", form.description.trim());
      formData.append("category", form.category);
      formData.append("expenseDate", new Date().toISOString());
      formData.append("vendor", form.vendor.trim());
      formData.append("paymentMethod", form.paymentMethod || "");

      if (form.receiptFile) {
        formData.append("receipt", form.receiptFile);
      }

      await createExpense(formData);
      setMessage("Expense request created successfully");
      setForm(initialForm);
      setErrors({});
      await loadExpenses();
    } catch (error) {
      console.error("Error creating expense:", error);
      setMessage(error?.response?.data?.message || "Failed to create expense");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!canCreateExpenses) {
      setMessage("You are not allowed to delete expenses for this club.");
      return;
    }

    const confirmed = window.confirm("Delete this expense?");
    if (!confirmed) return;

    try {
      setMessage("");
      await deleteExpense(expenseId);
      setMessage("Expense deleted successfully");
      await loadExpenses();
    } catch (error) {
      console.error("Error deleting expense:", error);
      setMessage(error?.response?.data?.message || "Failed to delete expense");
    }
  };

  const handleApprove = async (expenseId) => {
    try {
      setActionLoadingId(expenseId);
      setMessage("");
      await approveExpense(expenseId, {});
      setMessage("Expense approved successfully");
      await loadExpenses();
    } catch (error) {
      console.error("Error approving expense:", error);
      setMessage(error?.response?.data?.message || "Failed to approve expense");
    } finally {
      setActionLoadingId("");
    }
  };

  const handleReject = async (expenseId) => {
    const reason = window.prompt("Enter rejection reason (optional):", "") || "";

    try {
      setActionLoadingId(expenseId);
      setMessage("");
      await rejectExpense(expenseId, { reason });
      setMessage("Expense rejected successfully");
      await loadExpenses();
    } catch (error) {
      console.error("Error rejecting expense:", error);
      setMessage(error?.response?.data?.message || "Failed to reject expense");
    } finally {
      setActionLoadingId("");
    }
  };

  const getStatusClass = (status) => {
    const normalized = normalizeText(status || "pending");
    return statusClassMap[normalized] || "bg-slate-100 text-slate-700";
  };

  const getReceiptUrl = (receiptPath) => {
    if (!receiptPath) return "";
    if (receiptPath.startsWith("http://") || receiptPath.startsWith("https://")) {
      return receiptPath;
    }
    return `${API_BASE_URL}${receiptPath}`;
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-3">
              <Wallet className="text-indigo-600" size={20} />
              <h2 className="text-xl font-black text-slate-900">
                {club?.name ? `${club.name} Expenses` : "Expenses"}
              </h2>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              {isSystemAdmin
                ? "Review, approve, or reject submitted expenses."
                : "Track and manage club expense records."}
            </p>
          </div>

          <div className="relative w-full lg:w-80">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search expenses..."
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
        </div>

        {message && (
          <div className="mb-4 rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
            {message}
          </div>
        )}

        <div className="mb-4 flex flex-wrap gap-3">
          <span className="px-4 py-2 rounded-full bg-slate-100 text-slate-700 text-sm font-semibold">
            Records: {expenses.length}
          </span>
          <span className="px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold">
            Approved: {approvedCount}
          </span>
          <span className="px-4 py-2 rounded-full bg-amber-100 text-amber-700 text-sm font-semibold">
            Pending: {pendingCount}
          </span>
          <span className="px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold">
            Total: Rs. {totalAmount.toLocaleString()}
          </span>
        </div>

        {loading ? (
          <p className="text-slate-500">Loading expenses...</p>
        ) : filteredExpenses.length === 0 ? (
          <p className="text-slate-500">No expenses found.</p>
        ) : (
          <div className="space-y-4">
            {filteredExpenses.map((expense) => {
              const normalizedStatus = normalizeText(expense.status || "pending");
              const isPending = normalizedStatus === "pending";
              const isBusy = actionLoadingId === expense._id;
              const receiptUrl = getReceiptUrl(expense.receiptUrl);

              return (
                <div
                  key={expense._id}
                  className="rounded-2xl border border-slate-200 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {expense.title || "Untitled Expense"}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        {expense.description || "No description provided"}
                      </p>
                      <p className="text-sm text-slate-600 mt-2">
                        Category: {expense.category || "Other"}
                      </p>
                      {expense.vendor && (
                        <p className="text-sm text-slate-600 mt-1">
                          Vendor: {expense.vendor}
                        </p>
                      )}

                      {receiptUrl && (
                        <a
                          href={receiptUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                        >
                          <Paperclip size={14} />
                          View Receipt
                        </a>
                      )}
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-slate-900">
                        Rs. {Number(expense.amount || 0).toLocaleString()}
                      </p>
                      <span
                        className={`inline-flex mt-2 px-3 py-1 rounded-full text-xs font-semibold ${getStatusClass(
                          expense.status
                        )}`}
                      >
                        {expense.status || "pending"}
                      </span>

                      {!isSystemAdmin && canCreateExpenses && (
                        <div className="mt-3">
                          <button
                            onClick={() => handleDeleteExpense(expense._id)}
                            className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {expense.rejectionReason && (
                    <div className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600 border border-slate-200">
                      <span className="font-semibold text-slate-800">
                        Rejection Reason:
                      </span>{" "}
                      {expense.rejectionReason}
                    </div>
                  )}

                  {canApproveRejectExpenses && isPending && (
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleApprove(expense._id)}
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-white font-semibold hover:bg-emerald-700 disabled:opacity-60"
                      >
                        <CheckCircle2 size={16} />
                        {isBusy ? "Processing..." : "Approve"}
                      </button>

                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleReject(expense._id)}
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

      {canCreateExpenses && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <PlusCircle className="text-indigo-600" size={20} />
            <h2 className="text-xl font-black text-slate-900">Create Expense</h2>
          </div>

          <form onSubmit={handleCreateExpense} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className={`w-full rounded-xl border px-4 py-2.5 focus:outline-none focus:ring-2 ${
                  errors.title
                    ? "border-rose-300 focus:ring-rose-100"
                    : "border-slate-200 focus:ring-indigo-200"
                }`}
                placeholder="Enter expense title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-rose-600">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Amount
              </label>
              <input
                type="number"
                min="1"
                step="0.01"
                value={form.amount}
                onChange={(e) => handleInputChange("amount", e.target.value)}
                className={`w-full rounded-xl border px-4 py-2.5 focus:outline-none focus:ring-2 ${
                  errors.amount
                    ? "border-rose-300 focus:ring-rose-100"
                    : "border-slate-200 focus:ring-indigo-200"
                }`}
                placeholder="Enter expense amount"
              />
              {errors.amount && (
                <p className="mt-1 text-sm text-rose-600">{errors.amount}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                className={`w-full rounded-xl border px-4 py-2.5 focus:outline-none focus:ring-2 ${
                  errors.category
                    ? "border-rose-300 focus:ring-rose-100"
                    : "border-slate-200 focus:ring-indigo-200"
                }`}
              >
                {expenseCategories.map((category) => (
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
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Vendor
              </label>
              <input
                type="text"
                value={form.vendor}
                onChange={(e) => handleInputChange("vendor", e.target.value)}
                className={`w-full rounded-xl border px-4 py-2.5 focus:outline-none focus:ring-2 ${
                  errors.vendor
                    ? "border-rose-300 focus:ring-rose-100"
                    : "border-slate-200 focus:ring-indigo-200"
                }`}
                placeholder="Optional vendor name"
              />
              {errors.vendor && (
                <p className="mt-1 text-sm text-rose-600">{errors.vendor}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Payment Method
              </label>
              <select
                value={form.paymentMethod}
                onChange={(e) =>
                  handleInputChange("paymentMethod", e.target.value)
                }
                className={`w-full rounded-xl border px-4 py-2.5 focus:outline-none focus:ring-2 ${
                  errors.paymentMethod
                    ? "border-rose-300 focus:ring-rose-100"
                    : "border-slate-200 focus:ring-indigo-200"
                }`}
              >
                <option value="">Select payment method</option>
                {paymentMethods
                  .filter((method) => method !== "")
                  .map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
              </select>
              {errors.paymentMethod && (
                <p className="mt-1 text-sm text-rose-600">
                  {errors.paymentMethod}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Receipt File
              </label>
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={(e) =>
                  handleInputChange("receiptFile", e.target.files?.[0] || null)
                }
                className={`w-full rounded-xl border px-4 py-2.5 focus:outline-none focus:ring-2 ${
                  errors.receiptFile
                    ? "border-rose-300 focus:ring-rose-100"
                    : "border-slate-200 focus:ring-indigo-200"
                }`}
              />
              {form.receiptFile && (
                <p className="mt-1 text-xs text-slate-500">
                  Selected: {form.receiptFile.name}
                </p>
              )}
              {errors.receiptFile && (
                <p className="mt-1 text-sm text-rose-600">
                  {errors.receiptFile}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Description
              </label>
              <textarea
                rows="4"
                value={form.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className={`w-full rounded-xl border px-4 py-2.5 focus:outline-none focus:ring-2 ${
                  errors.description
                    ? "border-rose-300 focus:ring-rose-100"
                    : "border-slate-200 focus:ring-indigo-200"
                }`}
                placeholder="Explain this expense"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-rose-600">{errors.description}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-white font-semibold hover:bg-indigo-700 disabled:opacity-60"
            >
              <Wallet size={16} />
              {submitting ? "Submitting..." : "Submit Expense"}
            </button>
          </form>
        </div>
      )}

      {!canCreateExpenses && !canApproveRejectExpenses && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="text-amber-600" size={20} />
            <h3 className="text-2xl font-black text-slate-900">
              Expense Actions
            </h3>
          </div>

          <p className="text-sm text-slate-500 mb-4">
            You can view expenses, but you are not allowed to submit new ones for
            this club.
          </p>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Only allowed club management roles can submit expenses.
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubExpenses;