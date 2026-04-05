import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Search,
  ShieldCheck,
  Trash2,
  Users,
  XCircle,
  DollarSign,
  Vote,
  CalendarDays,
  Wallet,
  Save,
  Upload,
  FileText,
  Download,
  Handshake,
} from "lucide-react";
import {
  approveJoinRequest,
  getAllJoinRequests,
  getClubById,
  getClubDashboard,
  rejectJoinRequest,
  removeClubMember,
  updateClubMemberRole,
  updateClubProfile,
  uploadClubConstitution,
} from "../../services/clubService";

import BudgetsTab from "./BudgetsTab";
import Election from "./Election";
import ClubEvent from "./ClubEvent";
import ClubExpenses from "./ClubExpenses";
import MentorshipTab from "./MentorshipTab";
import CreateMentorProfile from "./CreateMentorProfile";

const roleOptions = [
  "member",
  "executive",
  "vice_president",
  "president",
  "club_admin",
];

const categories = [
  "Academic",
  "Engineering",
  "Environment",
  "Creative",
  "Business",
  "Cultural",
  "Sports",
  "Arts",
];

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") ||
  "http://localhost:5000";

const tabButtonClass = (active, tone = "default") => {
  const base =
    "inline-flex items-center gap-2 px-5 py-3 rounded-2xl border text-sm font-semibold transition";

  if (active && tone === "warning") {
    return `${base} bg-amber-50 border-amber-400 text-slate-800`;
  }

  if (active) {
    return `${base} bg-indigo-50 border-indigo-400 text-slate-800`;
  }

  return `${base} bg-white border-slate-200 text-slate-700 hover:bg-slate-50`;
};

const getStoredCurrentUser = () => {
  const keys = ["user", "currentUser", "authUser", "userInfo"];

  for (const key of keys) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") return parsed;
    } catch {
      // ignore invalid storage
    }
  }

  return null;
};

const ClubManage = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [club, setClub] = useState(null);
  const [joinRequests, setJoinRequests] = useState([]);
  const [currentUser, setCurrentUser] = useState(getStoredCurrentUser());

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingConstitution, setUploadingConstitution] = useState(false);
  const [message, setMessage] = useState("");
  const [constitutionMessage, setConstitutionMessage] = useState("");

  const [memberSearch, setMemberSearch] = useState("");
  const [requestSearch, setRequestSearch] = useState("");
  const [activeTab, setActiveTab] = useState("mentorship");

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    tags: "",
  });

  const [constitutionFile, setConstitutionFile] = useState(null);

  const normalizedSystemRole = useMemo(() => {
    return String(currentUser?.role || "").trim().toUpperCase();
  }, [currentUser]);

  const membershipRole = useMemo(() => {
    return String(dashboard?.membership?.role || "").trim().toLowerCase();
  }, [dashboard]);

  const isSystemAdmin = useMemo(() => {
    return normalizedSystemRole === "SYSTEM_ADMIN";
  }, [normalizedSystemRole]);

  const canManageJoinRequests =
    isSystemAdmin || dashboard?.permissions?.canManageClub;
  const canManageMembers =
    isSystemAdmin || dashboard?.permissions?.canManageClub;
  const canManageSettings =
    isSystemAdmin || dashboard?.permissions?.canManageClub;

  const canCreateMentorProfile = useMemo(() => {
    if (isSystemAdmin) return true;

    if (
      ["club_admin", "president", "vice_president", "executive"].includes(
        membershipRole
      )
    ) {
      return true;
    }

    if (
      ["CLUB_ADMIN", "SYSTEM_ADMIN", "CLUB_MEMBER"].includes(normalizedSystemRole)
    ) {
      return true;
    }

    return !!dashboard?.permissions?.canManageClub;
  }, [isSystemAdmin, membershipRole, normalizedSystemRole, dashboard]);

  const loadData = async () => {
    try {
      setLoading(true);
      setMessage("");
      setConstitutionMessage("");

      const storedUser = getStoredCurrentUser();
      setCurrentUser(storedUser);

      const isStoredSystemAdmin =
        String(storedUser?.role || "").trim().toUpperCase() === "SYSTEM_ADMIN";

      const dashboardRes = await getClubDashboard(clubId);
      const dashboardData = dashboardRes?.data || dashboardRes;

      if (!dashboardData?.permissions?.canManageClub && !isStoredSystemAdmin) {
        alert("You are not allowed to manage this club");
        navigate(`/clubs/${clubId}`);
        return;
      }

      const [clubRes, requestsRes] = await Promise.all([
        getClubById(clubId),
        getAllJoinRequests(clubId, "all"),
      ]);

      const clubData = clubRes?.data || clubRes;
      const requestsData = requestsRes?.data || requestsRes || [];

      setDashboard(dashboardData);
      setClub(clubData);
      setJoinRequests(Array.isArray(requestsData) ? requestsData : []);

      setForm({
        name: clubData?.name || "",
        description: clubData?.description || "",
        category: clubData?.category || "Academic",
        tags: Array.isArray(clubData?.tags) ? clubData.tags.join(", ") : "",
      });
    } catch (error) {
      console.error("Failed to load club management data:", error);
      alert(
        error?.response?.data?.message || "Failed to load club management data"
      );
      navigate("/my-clubs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clubId) {
      loadData();
    }
  }, [clubId]);

  useEffect(() => {
    if (club?.name) {
      document.title = `${club.name} Club Management`;
    } else {
      document.title = "Club Management";
    }

    return () => {
      document.title = "UniConnect";
    };
  }, [club]);

  const filteredMembers = useMemo(() => {
    const q = memberSearch.trim().toLowerCase();
    const members = club?.members || [];

    if (!q) return members;

    return members.filter((member) =>
      [
        member.user?.fullName,
        member.user?.name,
        member.user?.email,
        member.user?.studentId,
        member.role,
        member.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [club, memberSearch]);

  const filteredRequests = useMemo(() => {
    const q = requestSearch.trim().toLowerCase();

    const pendingRequests = (joinRequests || []).filter(
      (request) => String(request.status || "").toLowerCase() === "pending"
    );

    if (!q) return pendingRequests;

    return pendingRequests.filter((request) =>
      [
        request.user?.fullName,
        request.user?.name,
        request.user?.email,
        request.user?.studentId,
        request.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [joinRequests, requestSearch]);

  const pendingRequestsCount = useMemo(() => {
    return (joinRequests || []).filter(
      (request) => String(request.status || "").toLowerCase() === "pending"
    ).length;
  }, [joinRequests]);

  const memberCount = useMemo(() => {
    return (club?.members || []).filter(
      (member) => String(member.status || "").toLowerCase() === "active"
    ).length;
  }, [club]);

  const constitutionDownloadUrl = club?._id
    ? `${API_BASE_URL}/api/clubs/${club._id}/constitution/download`
    : null;

  const handleProfileSave = async (e) => {
    e.preventDefault();

    try {
      setSavingProfile(true);
      setMessage("");

      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category,
        tags: form.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      };

      await updateClubProfile(clubId, payload);
      setMessage("Club details updated successfully");
      await loadData();
      setActiveTab("settings");
    } catch (error) {
      setMessage(
        error?.response?.data?.message || "Failed to update club details"
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handleConstitutionUpload = async (e) => {
    e.preventDefault();

    setConstitutionMessage("");

    if (!constitutionFile) {
      setConstitutionMessage("Please select a PDF file");
      return;
    }

    if (constitutionFile.type !== "application/pdf") {
      setConstitutionMessage("Only PDF files are allowed");
      return;
    }

    try {
      setUploadingConstitution(true);

      const formData = new FormData();
      formData.append("constitution", constitutionFile);

      await uploadClubConstitution(clubId, formData);

      setConstitutionMessage("Constitution updated successfully");
      setConstitutionFile(null);
      await loadData();
      setActiveTab("settings");
    } catch (error) {
      setConstitutionMessage(
        error?.response?.data?.message || "Failed to update constitution"
      );
    } finally {
      setUploadingConstitution(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      setMessage("");
      await updateClubMemberRole(clubId, userId, newRole);
      setMessage("Member role updated successfully");
      await loadData();
    } catch (error) {
      setMessage(
        error?.response?.data?.message || "Failed to update member role"
      );
    }
  };

  const handleRemoveMember = async (userId) => {
    const confirmed = window.confirm("Remove this member from the club?");
    if (!confirmed) return;

    try {
      setMessage("");
      await removeClubMember(clubId, userId);
      setMessage("Member removed successfully");
      await loadData();
    } catch (error) {
      setMessage(
        error?.response?.data?.message || "Failed to remove member"
      );
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      setMessage("");
      await approveJoinRequest(clubId, requestId);

      setJoinRequests((prev) =>
        prev.filter((request) => request._id !== requestId)
      );

      setMessage("Join request approved successfully");
      await loadData();
    } catch (error) {
      setMessage(
        error?.response?.data?.message || "Failed to approve request"
      );
    }
  };

  const handleRejectRequest = async (requestId) => {
    const reason = window.prompt("Enter rejection reason (optional):", "") || "";

    try {
      setMessage("");
      await rejectJoinRequest(clubId, requestId, reason);

      setJoinRequests((prev) =>
        prev.filter((request) => request._id !== requestId)
      );

      setMessage("Join request rejected successfully");
      await loadData();
    } catch (error) {
      setMessage(
        error?.response?.data?.message || "Failed to reject request"
      );
    }
  };

  if (loading) {
    return <div className="text-slate-600">Loading club management...</div>;
  }

  if (!club || !dashboard) {
    return <div className="text-slate-600">No club data found.</div>;
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-3xl border border-slate-200 p-7 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500">
          {club?.name ? `${club.name} Club Management` : "Club Management"}
        </p>

        <h1 className="mt-2 text-3xl font-black text-slate-900">
          Manage Club
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Membership role:{" "}
          <span className="font-semibold text-slate-700">
            {isSystemAdmin
              ? "SYSTEM_ADMIN"
              : dashboard?.membership?.role || "member"}
          </span>
        </p>

        {message && (
          <p className="mt-3 text-sm font-semibold text-indigo-600">
            {message}
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => setActiveTab("mentorship")}
            className={tabButtonClass(activeTab === "mentorship")}
          >
            <Handshake size={16} />
            Mentorship
          </button>

          <button
            onClick={() => setActiveTab("budgets")}
            className={tabButtonClass(activeTab === "budgets")}
          >
            <DollarSign size={16} />
            Budgets
          </button>

          <button
            onClick={() => setActiveTab("expenses")}
            className={tabButtonClass(activeTab === "expenses")}
          >
            <Wallet size={16} />
            Expenses
          </button>

          <button
            onClick={() => setActiveTab("events")}
            className={tabButtonClass(activeTab === "events")}
          >
            <CalendarDays size={16} />
            Events
          </button>

          <button
            onClick={() => setActiveTab("elections")}
            className={tabButtonClass(activeTab === "elections")}
          >
            <Vote size={16} />
            Elections
          </button>

          {canManageJoinRequests && (
            <button
              onClick={() => setActiveTab("joinRequests")}
              className={tabButtonClass(
                activeTab === "joinRequests",
                "warning"
              )}
            >
              <ShieldCheck size={16} />
              Join Requests ({pendingRequestsCount})
            </button>
          )}

          {canManageMembers && (
            <button
              onClick={() => setActiveTab("members")}
              className={tabButtonClass(activeTab === "members")}
            >
              <Users size={16} />
              Members ({memberCount})
            </button>
          )}

          {canManageSettings && (
            <button
              onClick={() => setActiveTab("settings")}
              className={tabButtonClass(activeTab === "settings")}
            >
              <FileText size={16} />
              Settings
            </button>
          )}
        </div>
      </div>

      {activeTab === "mentorship" && (
        <div className="space-y-6">
          {canCreateMentorProfile && (
            <CreateMentorProfile
              clubId={clubId}
              onCreated={loadData}
            />
          )}

          <MentorshipTab
            clubId={clubId}
            currentUser={currentUser}
            dashboard={dashboard}
          />
        </div>
      )}

      {activeTab === "budgets" && (
        <BudgetsTab
          clubId={clubId}
          club={club}
          membership={dashboard?.membership}
          permissions={dashboard?.permissions}
        />
      )}

      {activeTab === "expenses" && (
        <ClubExpenses
          clubId={clubId}
          club={club}
          membership={dashboard?.membership}
          permissions={dashboard?.permissions}
        />
      )}

      {activeTab === "events" && (
        <ClubEvent
          clubId={clubId}
          club={club}
          membership={dashboard?.membership}
          permissions={dashboard?.permissions}
          currentUser={currentUser}
        />
      )}

      {activeTab === "elections" && (
        <Election
          clubId={clubId}
          club={club}
          membership={dashboard?.membership}
          permissions={dashboard?.permissions}
          currentUser={currentUser}
        />
      )}

      {activeTab === "joinRequests" && canManageJoinRequests && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-2xl font-black text-slate-900">
                Join Requests
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Review and manage incoming membership requests.
              </p>
            </div>

            <div className="relative w-full lg:w-96">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={requestSearch}
                onChange={(e) => setRequestSearch(e.target.value)}
                placeholder="Search requests..."
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-slate-500">
              No pending join requests.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <div
                  key={request._id}
                  className="rounded-2xl border border-slate-200 p-4"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-slate-900">
                        {request.user?.fullName ||
                          request.user?.name ||
                          "Unknown User"}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {request.user?.email || "-"}
                      </p>
                      <p className="text-sm text-slate-500">
                        Student ID: {request.user?.studentId || "-"}
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApproveRequest(request._id)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
                      >
                        Approve
                      </button>

                      <button
                        onClick={() => handleRejectRequest(request._id)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-700"
                      >
                        <XCircle size={16} />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "members" && canManageMembers && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Members</h2>
              <p className="mt-1 text-sm text-slate-500">
                Manage club members and update their roles.
              </p>
            </div>

            <div className="relative w-full lg:w-96">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="Search members..."
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          </div>

          {filteredMembers.length === 0 ? (
            <p className="text-slate-500">No members found.</p>
          ) : (
            <div className="space-y-4">
              {filteredMembers.map((member) => (
                <div
                  key={member._id}
                  className="rounded-2xl border border-slate-200 p-4"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-slate-900">
                        {member.user?.fullName ||
                          member.user?.name ||
                          "Unknown User"}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {member.user?.email || "-"}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <select
                        value={member.role}
                        onChange={(e) =>
                          handleRoleChange(member.user?._id, e.target.value)
                        }
                        className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                      >
                        {roleOptions.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => handleRemoveMember(member.user?._id)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-700"
                      >
                        <Trash2 size={16} />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "settings" && canManageSettings && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-2xl font-black text-slate-900 mb-5">
              Club Details
            </h2>

            <form onSubmit={handleProfileSave} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Club Name
                </label>
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Description
                </label>
                <textarea
                  rows="5"
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, category: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Tags
                </label>
                <input
                  value={form.tags}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, tags: e.target.value }))
                  }
                  placeholder="Comma separated tags"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 disabled:opacity-60"
              >
                <Save size={16} />
                {savingProfile ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-2xl font-black text-slate-900 mb-5">
              Constitution
            </h2>

            {club?.constitution?.fileName && (
              <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <div className="flex items-center justify-between gap-3">
                  <span>{club.constitution.fileName}</span>
                  {constitutionDownloadUrl && (
                    <a
                      href={constitutionDownloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 font-semibold text-indigo-700 hover:bg-indigo-100"
                    >
                      <Download size={16} />
                      Download
                    </a>
                  )}
                </div>
              </div>
            )}

            {constitutionMessage && (
              <p className="mb-4 text-sm font-semibold text-indigo-600">
                {constitutionMessage}
              </p>
            )}

            <form onSubmit={handleConstitutionUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Upload New Constitution (PDF only)
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) =>
                    setConstitutionFile(e.target.files?.[0] || null)
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={uploadingConstitution}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-60"
              >
                <Upload size={16} />
                {uploadingConstitution ? "Uploading..." : "Upload Constitution"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubManage;