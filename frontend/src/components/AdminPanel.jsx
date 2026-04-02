import React, { useEffect, useMemo, useState } from "react";
import API from "./Auth/axios";
import {
  BadgeCheck,
  GraduationCap,
  Search,
  ShieldAlert,
  UserPlus,
  UserCheck,
  Users,
  X,
  Gift,
} from "lucide-react";

const StatCard = ({ title, value, icon: Icon, tone }) => (
  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-slate-500">{title}</p>
        <p className="text-2xl font-black text-slate-900 mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-xl ${tone}`}>
        <Icon size={18} />
      </div>
    </div>
  </div>
);

const AdminPanel = () => {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [badges, setBadges] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [me, setMe] = useState(null);
  const [hasAdminAccess, setHasAdminAccess] = useState(false);

  // Modal states
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    studentId: "",
    faculty: "",
    yearOfStudy: "",
    role: "STUDENT",
    isActive: true,
    isEmailVerified: false,
    degreeProgram: "",
    bio: "",
  });

  const [rewardForm, setRewardForm] = useState({
    badgeId: "",
    certificateTitle: "",
    issuer: "UniConnect",
    verificationUrl: "",
  });

  const [certificateImageFile, setCertificateImageFile] = useState(null);

  const [badgeForm, setBadgeForm] = useState({
    title: "",
    description: "",
    criteria: "",
    icon: "",
  });

  const resetForm = () => {
    setSelectedUserId("");
    setForm({
      fullName: "",
      email: "",
      password: "",
      studentId: "",
      faculty: "",
      yearOfStudy: "",
      role: "STUDENT",
      isActive: true,
      isEmailVerified: false,
      degreeProgram: "",
      bio: "",
    });
  };

  const loadAdminData = async () => {
    setMessage("");
    try {
      setIsLoading(true);

      try {
        const meRes = await API.get("/auth/me");
        setMe(meRes.data || null);
      } catch (meError) {
        setMe(null);
      }

      try {
        const [usersRes, badgesRes] = await Promise.all([
          API.get("/admin/users"),
          API.get("/admin/badges"),
        ]);

        setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
        setBadges(Array.isArray(badgesRes.data) ? badgesRes.data : []);
        setHasAdminAccess(true);
      } catch (adminError) {
        setUsers([]);
        setBadges([]);
        setHasAdminAccess(false);

        const status = adminError?.response?.status;
        if (status === 403) {
          setMessage("Your account does not have admin permission yet. Use SYSTEM_ADMIN or CLUB_ADMIN role.");
        } else if (status === 404) {
          setMessage("Admin API not found. Restart backend server to load new /api/admin routes.");
        } else {
          setMessage(adminError?.response?.data?.message || "Failed to load admin user data");
        }
      }
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to load admin data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;

    return users.filter((student) =>
      [
        student.studentId,
        student.fullName,
        student.email,
        student.faculty,
        student.role,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [search, users]);

  const selectedUser = useMemo(
    () => users.find((item) => String(item._id) === String(selectedUserId)),
    [users, selectedUserId]
  );

  const totalStudents = users.filter((u) => u.role === "STUDENT").length;
  const activeUsers = users.filter((u) => u.isActive).length;
  const activeMentors = users.filter((u) => u.isMentor).length;
  const inactiveUsers = users.filter((u) => !u.isActive).length;

  const handleInputChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSelectUser = (user) => {
    setSelectedUserId(user._id);
  };

  const openEditModal = (user) => {
    setSelectedUserId(user._id);
    setForm({
      fullName: user.fullName || "",
      email: user.email || "",
      password: "",
      studentId: user.studentId || "",
      faculty: user.faculty || user.profile?.faculty || "",
      yearOfStudy: user.yearOfStudy || user.profile?.yearOfStudy || "",
      role: user.role || "STUDENT",
      isActive: Boolean(user.isActive),
      isEmailVerified: Boolean(user.isEmailVerified),
      degreeProgram: user.profile?.degreeProgram || "",
      bio: user.profile?.bio || "",
    });
    setShowEditUserModal(true);
  };

  const openRewardModal = (user) => {
    setSelectedUserId(user._id);
    setRewardForm({
      badgeId: "",
      certificateTitle: "",
      issuer: "UniConnect",
      verificationUrl: "",
    });
    setCertificateImageFile(null);
    setShowRewardModal(true);
  };

  const handleSaveUser = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!hasAdminAccess) {
      setMessage("You do not have permission to manage users.");
      return;
    }

    try {
      setIsSaving(true);
      if (selectedUserId) {
        await API.put(`/admin/users/${selectedUserId}`, {
          ...form,
          password: form.password || undefined,
        });
        setMessage("User updated successfully");
      } else {
        await API.post("/admin/users", form);
        setMessage("User created successfully");
      }

      await loadAdminData();
      resetForm();
      setShowAddUserModal(false);
      setShowEditUserModal(false);
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to save user");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!hasAdminAccess) {
      setMessage("You do not have permission to manage users.");
      return;
    }

    const ok = window.confirm("Delete this user and profile permanently?");
    if (!ok) return;

    try {
      await API.delete(`/admin/users/${userId}`);
      if (String(selectedUserId) === String(userId)) {
        resetForm();
      }
      setMessage("User deleted successfully");
      await loadAdminData();
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to delete user");
    }
  };

  const handleAssignReward = async (event) => {
    event.preventDefault();

    if (!hasAdminAccess) {
      setMessage("You do not have permission to assign rewards.");
      return;
    }

    if (!selectedUserId) {
      setMessage("Select a user first");
      return;
    }

    if (!rewardForm.badgeId && !rewardForm.certificateTitle.trim()) {
      setMessage("Select a badge and/or enter a certificate title");
      return;
    }

    try {
      const formData = new FormData();

      Object.entries(rewardForm).forEach(([key, value]) => {
        if (value !== undefined && value !== null && String(value).trim() !== "") {
          formData.append(key, value);
        }
      });

      if (certificateImageFile) {
        formData.append("certificateImage", certificateImageFile);
      }

      await API.post(`/admin/users/${selectedUserId}/rewards`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setRewardForm((prev) => ({
        ...prev,
        badgeId: "",
        certificateTitle: "",
        verificationUrl: "",
      }));
      setCertificateImageFile(null);
      setMessage("Badge/certificate assigned successfully");
      setShowRewardModal(false);
      await loadAdminData();
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to assign reward");
    }
  };

  const handleCreateBadge = async (event) => {
    event.preventDefault();

    if (!hasAdminAccess) {
      setMessage("You do not have permission to create badges.");
      return;
    }

    if (!badgeForm.title.trim()) {
      setMessage("Badge title is required");
      return;
    }

    try {
      await API.post("/admin/badges", badgeForm);
      setBadgeForm({
        title: "",
        description: "",
        criteria: "",
        icon: "",
      });
      setMessage("Badge created successfully");
      setShowBadgeModal(false);
      await loadAdminData();
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to create badge");
    }
  };



  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      <div className="bg-white rounded-3xl border border-slate-200 p-7">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500">Admin Console</p>
        <h1 className="mt-2 text-3xl font-black text-slate-900">Student Management Panel</h1>
        <p className="mt-2 text-sm text-slate-500 max-w-2xl">
          Manage real users from your database: create, update, delete accounts, and assign badges/certificates.
        </p>
        {me && (
          <p className="mt-3 text-xs text-slate-500">
            Logged in as: <span className="font-bold text-slate-700">{me.fullName}</span> ({me.role})
          </p>
        )}
        {message && <p className="mt-3 text-sm font-semibold text-indigo-600">{message}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard title="Total Students" value={totalStudents} icon={GraduationCap} tone="bg-indigo-50 text-indigo-600" />
        <StatCard title="Active Users" value={activeUsers} icon={UserCheck} tone="bg-emerald-50 text-emerald-600" />
        <StatCard title="Mentors" value={activeMentors} icon={Users} tone="bg-amber-50 text-amber-600" />
        <StatCard title="Inactive Users" value={inactiveUsers} icon={ShieldAlert} tone="bg-rose-50 text-rose-600" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
          <h2 className="text-xl font-black text-slate-900">Manage Users</h2>

          <div className="flex gap-3">
            <button
              onClick={() => {
                resetForm();
                setShowAddUserModal(true);
              }}
              disabled={!hasAdminAccess}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 disabled:opacity-60"
            >
              <UserPlus size={16} /> Add New User
            </button>
            <button
              onClick={() => setShowBadgeModal(true)}
              disabled={!hasAdminAccess}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-bold hover:bg-violet-700 disabled:opacity-60"
            >
              <BadgeCheck size={16} /> Create Badge
            </button>
          </div>

          <div className="relative w-full lg:w-96">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, ID, faculty..."
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
        </div>

        {isLoading ? (
          <p className="text-sm text-slate-500">Loading users...</p>
        ) : !hasAdminAccess ? (
          <p className="text-sm text-slate-500">
            Admin-only data is hidden for your current role. Your own account details are shown above.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-slate-200 text-slate-500">
                  <th className="py-3 pr-4">Student ID</th>
                  <th className="py-3 pr-4">Name</th>
                  <th className="py-3 pr-4">Email</th>
                  <th className="py-3 pr-4">Faculty</th>
                  <th className="py-3 pr-4">Year</th>
                  <th className="py-3 pr-4">Role</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student._id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 pr-4 font-semibold text-slate-700">{student.studentId}</td>
                    <td className="py-3 pr-4 text-slate-800">{student.fullName}</td>
                    <td className="py-3 pr-4 text-slate-600">{student.email}</td>
                    <td className="py-3 pr-4 text-slate-600">{student.faculty || student.profile?.faculty || "-"}</td>
                    <td className="py-3 pr-4 text-slate-600">{student.yearOfStudy || student.profile?.yearOfStudy || "-"}</td>
                    <td className="py-3 pr-4 text-slate-600">{student.role}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          student.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {student.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => openEditModal(student)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => openRewardModal(student)}
                          className="px-3 py-1.5 rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-xs font-semibold"
                        >
                          Reward
                        </button>
                        <button
                          onClick={() => handleDeleteUser(student._id)}
                          className="px-3 py-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 text-xs font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!filteredStudents.length && (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-slate-500">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD USER MODAL */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <UserPlus size={18} /> Add New User
              </h3>
              <button onClick={() => setShowAddUserModal(false)} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 space-y-3 max-h-96 overflow-y-auto">
              <input value={form.fullName} onChange={(e) => handleInputChange("fullName", e.target.value)} placeholder="Full Name" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" required />
              <input value={form.email} onChange={(e) => handleInputChange("email", e.target.value)} placeholder="Email" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" required />
              <input value={form.password} onChange={(e) => handleInputChange("password", e.target.value)} placeholder="Password" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" required />
              <input value={form.studentId} onChange={(e) => handleInputChange("studentId", e.target.value)} placeholder="Student ID" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" required />
              <input value={form.faculty} onChange={(e) => handleInputChange("faculty", e.target.value)} placeholder="Faculty" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" required />
              <input value={form.yearOfStudy} onChange={(e) => handleInputChange("yearOfStudy", e.target.value)} placeholder="Year of Study" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" required />
              <input value={form.degreeProgram} onChange={(e) => handleInputChange("degreeProgram", e.target.value)} placeholder="Degree Program" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
              <textarea value={form.bio} onChange={(e) => handleInputChange("bio", e.target.value)} placeholder="Bio" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" rows={2} />

              <select value={form.role} onChange={(e) => handleInputChange("role", e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                <option value="STUDENT">STUDENT</option>
                <option value="CLUB_ADMIN">CLUB_ADMIN</option>
                <option value="SYSTEM_ADMIN">SYSTEM_ADMIN</option>
              </select>

              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={form.isActive} onChange={(e) => handleInputChange("isActive", e.target.checked)} /> Active
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={form.isEmailVerified} onChange={(e) => handleInputChange("isEmailVerified", e.target.checked)} /> Email Verified
              </label>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button type="submit" disabled={isSaving} className="flex-1 px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60">
                  Create User
                </button>
                <button type="button" onClick={() => setShowAddUserModal(false)} className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-semibold">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {showEditUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <UserCheck size={18} /> Update User
              </h3>
              <button onClick={() => setShowEditUserModal(false)} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 space-y-3 max-h-96 overflow-y-auto">
              <input value={form.fullName} onChange={(e) => handleInputChange("fullName", e.target.value)} placeholder="Full Name" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" required />
              <input value={form.email} onChange={(e) => handleInputChange("email", e.target.value)} placeholder="Email" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" required />
              <input value={form.password} onChange={(e) => handleInputChange("password", e.target.value)} placeholder="New Password (leave blank to keep current)" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
              <input value={form.studentId} onChange={(e) => handleInputChange("studentId", e.target.value)} placeholder="Student ID" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" required />
              <input value={form.faculty} onChange={(e) => handleInputChange("faculty", e.target.value)} placeholder="Faculty" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" required />
              <input value={form.yearOfStudy} onChange={(e) => handleInputChange("yearOfStudy", e.target.value)} placeholder="Year of Study" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" required />
              <input value={form.degreeProgram} onChange={(e) => handleInputChange("degreeProgram", e.target.value)} placeholder="Degree Program" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
              <textarea value={form.bio} onChange={(e) => handleInputChange("bio", e.target.value)} placeholder="Bio" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" rows={2} />

              <select value={form.role} onChange={(e) => handleInputChange("role", e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                <option value="STUDENT">STUDENT</option>
                <option value="CLUB_ADMIN">CLUB_ADMIN</option>
                <option value="SYSTEM_ADMIN">SYSTEM_ADMIN</option>
              </select>

              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={form.isActive} onChange={(e) => handleInputChange("isActive", e.target.checked)} /> Active
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={form.isEmailVerified} onChange={(e) => handleInputChange("isEmailVerified", e.target.checked)} /> Email Verified
              </label>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button type="submit" disabled={isSaving} className="flex-1 px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60">
                  Update User
                </button>
                <button type="button" onClick={() => setShowEditUserModal(false)} className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-semibold">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GIVE BADGE/CERTIFICATE MODAL */}
      {showRewardModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Gift size={18} /> Give Badge / Certificate
              </h3>
              <button onClick={() => setShowRewardModal(false)} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAssignReward} className="p-6 space-y-3 max-h-96 overflow-y-auto">
              {selectedUser && (
                <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-100">
                  <p className="text-xs text-indigo-600 uppercase font-bold">Selected User</p>
                  <p className="text-sm font-bold text-indigo-900 mt-1">{selectedUser.fullName}</p>
                </div>
              )}

              <div>
                <label className="text-xs font-bold uppercase text-slate-600 block mb-2">Select Badge (optional)</label>
                <select
                  value={rewardForm.badgeId}
                  onChange={(e) => setRewardForm((prev) => ({ ...prev, badgeId: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">-- No Badge --</option>
                  {badges.map((badge) => (
                    <option key={badge._id} value={badge._id}>{badge.title}</option>
                  ))}
                </select>
              </div>

              <input
                value={rewardForm.certificateTitle}
                onChange={(e) => setRewardForm((prev) => ({ ...prev, certificateTitle: e.target.value }))}
                placeholder="Certificate Title (optional)"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />

              <input
                value={rewardForm.issuer}
                onChange={(e) => setRewardForm((prev) => ({ ...prev, issuer: e.target.value }))}
                placeholder="Issuer"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />

              <p className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                Credential ID is generated automatically when the certificate is issued.
              </p>

              <input
                value={rewardForm.verificationUrl}
                onChange={(e) => setRewardForm((prev) => ({ ...prev, verificationUrl: e.target.value }))}
                placeholder="Verification URL (optional)"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Upload Certificate Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCertificateImageFile(e.target.files?.[0] || null)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                />
                {certificateImageFile && (
                  <p className="text-xs text-emerald-600 font-semibold">Selected: {certificateImageFile.name}</p>
                )}
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button type="submit" className="flex-1 px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700">
                  Assign Reward
                </button>
                <button type="button" onClick={() => setShowRewardModal(false)} className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-semibold">
                  Cancel
                </button>
              </div>


            </form>
          </div>
        </div>
      )}

      {/* CREATE BADGE MODAL */}
      {showBadgeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <BadgeCheck size={18} /> Create New Badge
              </h3>
              <button onClick={() => setShowBadgeModal(false)} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateBadge} className="p-6 space-y-3">
              <input
                value={badgeForm.title}
                onChange={(e) => setBadgeForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Badge Title"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                required
              />

              <input
                value={badgeForm.description}
                onChange={(e) => setBadgeForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Description"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />

              <input
                value={badgeForm.criteria}
                onChange={(e) => setBadgeForm((prev) => ({ ...prev, criteria: e.target.value }))}
                placeholder="Criteria"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />

              <input
                value={badgeForm.icon}
                onChange={(e) => setBadgeForm((prev) => ({ ...prev, icon: e.target.value }))}
                placeholder="Icon URL or name (optional)"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button type="submit" className="flex-1 px-3 py-2 rounded-lg bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700">
                  Create Badge
                </button>
                <button type="button" onClick={() => setShowBadgeModal(false)} className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-semibold">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
