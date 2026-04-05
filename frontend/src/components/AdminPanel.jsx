import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Building2,
  Layers3,
  FolderCog,
  FileText,
  Newspaper,
  FolderOpen,
  PlusCircle,
  Pencil,
  Trash2,
  ExternalLink,
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

const tabButtonClass = (active) =>
  `inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition ${
    active
      ? "bg-indigo-600 text-white shadow-sm"
      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
  }`;

const USER_ROLE_OPTIONS = ["STUDENT", "CLUB_ADMIN", "SYSTEM_ADMIN"];

const initialUserForm = {
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
};

const initialRewardForm = {
  badgeId: "",
  certificateTitle: "",
  issuer: "UniConnect",
  verificationUrl: "",
};

const initialBadgeForm = {
  title: "",
  description: "",
  criteria: "",
  icon: "",
};

const initialClubForm = {
  name: "",
  description: "",
  category: "Academic",
  presidentName: "",
  presidentEmail: "",
};

const initialNewsForm = {
  title: "",
  summary: "",
  content: "",
  category: "General",
  author: "",
  imageUrl: "",
  isPublished: true,
};

const initialProjectForm = {
  title: "",
  description: "",
  category: "Web",
  ownerName: "",
  githubUrl: "",
  liveUrl: "",
  imageUrl: "",
  status: "published",
};

const categories = [
  "Engineering",
  "Academic",
  "Environment",
  "Creative",
  "Business",
  "Cultural",
  "Sports",
  "Arts",
];

const newsCategories = [
  "General",
  "Events",
  "Announcements",
  "Achievements",
  "Academic",
  "Technology",
];

const projectCategories = [
  "Web",
  "Mobile",
  "AI",
  "Research",
  "Community",
  "Design",
  "Other",
];

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AdminPanel = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [clubSearch, setClubSearch] = useState("");
  const [newsSearch, setNewsSearch] = useState("");
  const [projectSearch, setProjectSearch] = useState("");

  const [users, setUsers] = useState([]);
  const [badges, setBadges] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [newsList, setNewsList] = useState([]);
  const [projects, setProjects] = useState([]);

  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedNewsId, setSelectedNewsId] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [me, setMe] = useState(null);

  const [hasAdminAccess, setHasAdminAccess] = useState(false);
  const [hasClubAccess, setHasClubAccess] = useState(false);

  const [activeTab, setActiveTab] = useState("overview");

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [showClubModal, setShowClubModal] = useState(false);
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);

  const [form, setForm] = useState(initialUserForm);
  const [rewardForm, setRewardForm] = useState(initialRewardForm);
  const [certificateImageFile, setCertificateImageFile] = useState(null);
  const [badgeForm, setBadgeForm] = useState(initialBadgeForm);
  const [clubForm, setClubForm] = useState(initialClubForm);
  const [constitutionFile, setConstitutionFile] = useState(null);
  const [newsForm, setNewsForm] = useState(initialNewsForm);
  const [projectForm, setProjectForm] = useState(initialProjectForm);

  const role = me?.role || "";
  const isSystemAdmin = role === "SYSTEM_ADMIN";
  const isClubAdmin = role === "CLUB_ADMIN";

  const canManageUsers = isSystemAdmin;
  const canManageBadges = isSystemAdmin;
  const canCreateClub = isSystemAdmin;
  const canApproveRejectClub = isSystemAdmin;
  const canDeleteClub = isSystemAdmin;
  const canSeeClubTab = isSystemAdmin || isClubAdmin;
  const canManageNews = isSystemAdmin;
  const canManageProjects = isSystemAdmin;

  const presidentEmailError =
    clubForm.presidentEmail.trim() &&
    !emailRegex.test(clubForm.presidentEmail.trim().toLowerCase())
      ? "Enter a valid president email address"
      : "";

  const constitutionFileError =
    constitutionFile &&
    constitutionFile.type !== "application/pdf"
      ? "Please upload a PDF file for the constitution"
      : "";

  const resetUserForm = () => {
    setSelectedUserId("");
    setForm(initialUserForm);
  };

  const resetClubForm = () => {
    setClubForm(initialClubForm);
    setConstitutionFile(null);
  };

  const resetNewsForm = () => {
    setSelectedNewsId("");
    setNewsForm(initialNewsForm);
  };

  const resetProjectForm = () => {
    setSelectedProjectId("");
    setProjectForm(initialProjectForm);
  };

  const handleUserInputChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleClubInputChange = (key, value) => {
    setClubForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleNewsInputChange = (key, value) => {
    setNewsForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleProjectInputChange = (key, value) => {
    setProjectForm((prev) => ({ ...prev, [key]: value }));
  };

  const loadAdminData = async () => {
    setMessage("");
    try {
      setIsLoading(true);

      try {
        const meRes = await API.get("/auth/me");
        setMe(meRes.data || null);
      } catch {
        setMe(null);
      }

      let userList = [];
      let badgeList = [];
      let clubList = [];
      let fetchedNews = [];
      let fetchedProjects = [];

      try {
        const usersRes = await API.get("/admin/users");
        userList = Array.isArray(usersRes.data) ? usersRes.data : [];
        setUsers(userList);
        setHasAdminAccess(true);
      } catch {
        setUsers([]);
        setHasAdminAccess(false);
      }

      try {
        const badgesRes = await API.get("/admin/badges");
        badgeList = Array.isArray(badgesRes.data) ? badgesRes.data : [];
        setBadges(badgeList);
      } catch {
        setBadges([]);
      }

      try {
        const clubsRes = await API.get("/clubs");
        clubList = Array.isArray(clubsRes.data?.data)
          ? clubsRes.data.data
          : Array.isArray(clubsRes.data)
          ? clubsRes.data
          : [];
        setClubs(clubList);
        setHasClubAccess(true);
      } catch {
        setClubs([]);
        setHasClubAccess(false);
      }

      try {
        const newsRes = await API.get("/admin/news");
        fetchedNews = Array.isArray(newsRes.data?.data)
          ? newsRes.data.data
          : Array.isArray(newsRes.data)
          ? newsRes.data
          : [];
        setNewsList(fetchedNews);
      } catch {
        setNewsList([]);
      }

      try {
        const projectsRes = await API.get("/admin/projects");
        fetchedProjects = Array.isArray(projectsRes.data?.data)
          ? projectsRes.data.data
          : Array.isArray(projectsRes.data)
          ? projectsRes.data
          : [];
        setProjects(fetchedProjects);
      } catch {
        setProjects([]);
      }

      if (
        !userList.length &&
        !clubList.length &&
        !fetchedNews.length &&
        !fetchedProjects.length
      ) {
        setMessage("Some admin modules are unavailable.");
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

  useEffect(() => {
    if (isClubAdmin && !isSystemAdmin) {
      setActiveTab("clubs");
    }
  }, [isClubAdmin, isSystemAdmin]);

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

  const filteredClubs = useMemo(() => {
    const q = clubSearch.trim().toLowerCase();
    if (!q) return clubs;

    return clubs.filter((club) =>
      [
        club.name,
        club.description,
        club.category,
        club.status,
        club.president?.name,
        club.president?.email,
        club.constitution?.fileName,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [clubSearch, clubs]);

  const filteredNews = useMemo(() => {
    const q = newsSearch.trim().toLowerCase();
    if (!q) return newsList;

    return newsList.filter((item) =>
      [
        item.title,
        item.summary,
        item.content,
        item.category,
        item.author,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [newsSearch, newsList]);

  const filteredProjects = useMemo(() => {
    const q = projectSearch.trim().toLowerCase();
    if (!q) return projects;

    return projects.filter((item) =>
      [
        item.title,
        item.description,
        item.category,
        item.ownerName,
        item.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [projectSearch, projects]);

  const selectedUser = useMemo(
    () => users.find((item) => String(item._id) === String(selectedUserId)),
    [users, selectedUserId]
  );

  const totalStudents = users.filter((u) => u.role === "STUDENT").length;
  const activeUsers = users.filter((u) => u.isActive).length;
  const inactiveUsers = users.filter((u) => !u.isActive).length;
  const activeMentors = 0;

  const totalClubs = clubs.length;
  const activeClubs = clubs.filter((c) => c.status === "active").length;
  const pendingClubs = clubs.filter((c) => c.status === "pending").length;
  const rejectedClubs = clubs.filter((c) => c.status === "rejected").length;

  const totalNews = newsList.length;
  const publishedNews = newsList.filter((n) => n.isPublished !== false).length;

  const totalProjects = projects.length;
  const publishedProjects = projects.filter(
    (p) => (p.status || "").toLowerCase() === "published"
  ).length;

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
    setRewardForm(initialRewardForm);
    setCertificateImageFile(null);
    setShowRewardModal(true);
  };

  const openEditNewsModal = (item) => {
    setSelectedNewsId(item._id);
    setNewsForm({
      title: item.title || "",
      summary: item.summary || "",
      content: item.content || "",
      category: item.category || "General",
      author: item.author || "",
      imageUrl: item.imageUrl || "",
      isPublished: item.isPublished !== false,
    });
    setShowNewsModal(true);
  };

  const openEditProjectModal = (item) => {
    setSelectedProjectId(item._id);
    setProjectForm({
      title: item.title || "",
      description: item.description || "",
      category: item.category || "Web",
      ownerName: item.ownerName || "",
      githubUrl: item.githubUrl || "",
      liveUrl: item.liveUrl || "",
      imageUrl: item.imageUrl || "",
      status: item.status || "published",
    });
    setShowProjectModal(true);
  };

  const handleSaveUser = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!isSystemAdmin) {
      setMessage("Only system admins can manage users.");
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
      resetUserForm();
      setShowAddUserModal(false);
      setShowEditUserModal(false);
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to save user");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!isSystemAdmin) {
      setMessage("Only system admins can delete users.");
      return;
    }

    const ok = window.confirm("Delete this user and profile permanently?");
    if (!ok) return;

    try {
      await API.delete(`/admin/users/${userId}`);
      if (String(selectedUserId) === String(userId)) {
        resetUserForm();
      }
      setMessage("User deleted successfully");
      await loadAdminData();
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to delete user");
    }
  };

  const handleAssignReward = async (event) => {
    event.preventDefault();

    if (!isSystemAdmin) {
      setMessage("Only system admins can assign rewards.");
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

      setRewardForm(initialRewardForm);
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

    if (!isSystemAdmin) {
      setMessage("Only system admins can create badges.");
      return;
    }

    if (!badgeForm.title.trim()) {
      setMessage("Badge title is required");
      return;
    }

    try {
      await API.post("/admin/badges", badgeForm);
      setBadgeForm(initialBadgeForm);
      setMessage("Badge created successfully");
      setShowBadgeModal(false);
      await loadAdminData();
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to create badge");
    }
  };

  const handleCreateClub = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!isSystemAdmin) {
      setMessage("Only system admins can create clubs.");
      return;
    }

    const normalizedName = clubForm.name.trim();
    const normalizedDescription = clubForm.description.trim();
    const normalizedPresidentName = clubForm.presidentName.trim();
    const normalizedPresidentEmail = clubForm.presidentEmail.trim().toLowerCase();

    if (!normalizedName) {
      setMessage("Club name is required.");
      return;
    }

    if (!normalizedDescription) {
      setMessage("Club description is required.");
      return;
    }

    if (!normalizedPresidentName) {
      setMessage("President name is required.");
      return;
    }

    if (!normalizedPresidentEmail) {
      setMessage("President email is required.");
      return;
    }

    if (!emailRegex.test(normalizedPresidentEmail)) {
      setMessage("Please enter a valid president email address.");
      return;
    }

    if (constitutionFile && constitutionFile.type !== "application/pdf") {
      setMessage("Please upload a valid PDF constitution.");
      return;
    }

    try {
      setIsSaving(true);

      const formData = new FormData();
      formData.append("name", normalizedName);
      formData.append("description", normalizedDescription);
      formData.append("category", clubForm.category);
      formData.append("presidentName", normalizedPresidentName);
      formData.append("presidentEmail", normalizedPresidentEmail);

      if (constitutionFile) {
        formData.append("constitution", constitutionFile);
      }

      await API.post("/clubs", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage(
        constitutionFile
          ? "Club and constitution uploaded successfully"
          : "Club created successfully"
      );
      setShowClubModal(false);
      resetClubForm();
      await loadAdminData();
    } catch (error) {
      console.error("Create club error:", error?.response?.data || error);
      setMessage(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Failed to create club"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleClubStatus = async (clubId, status) => {
    if (!isSystemAdmin) {
      setMessage("Only system admins can update club status.");
      return;
    }

    try {
      if (status === "active") {
        await API.put(`/clubs/${clubId}/approve`);
      } else if (status === "rejected") {
        await API.put(`/clubs/${clubId}/reject`, {
          reason: "Rejected by system admin",
        });
      }

      setMessage("Club status updated successfully");
      await loadAdminData();
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to update club status");
    }
  };

  const handleDeleteClub = async (clubId) => {
    if (!isSystemAdmin) {
      setMessage("Only system admins can delete clubs.");
      return;
    }

    const ok = window.confirm("Delete this club permanently?");
    if (!ok) return;

    try {
      await API.delete(`/clubs/${clubId}`);
      setMessage("Club deleted successfully");
      await loadAdminData();
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to delete club");
    }
  };

  const handleSaveNews = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!isSystemAdmin) {
      setMessage("Only system admins can manage news.");
      return;
    }

    if (!newsForm.title.trim() || !newsForm.summary.trim() || !newsForm.content.trim()) {
      setMessage("Title, summary, and content are required for news.");
      return;
    }

    try {
      setIsSaving(true);

      if (selectedNewsId) {
        await API.put(`/admin/news/${selectedNewsId}`, newsForm);
        setMessage("News updated successfully");
      } else {
        await API.post("/admin/news", newsForm);
        setMessage("News created successfully");
      }

      resetNewsForm();
      setShowNewsModal(false);
      await loadAdminData();
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to save news");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteNews = async (newsId) => {
    if (!isSystemAdmin) {
      setMessage("Only system admins can delete news.");
      return;
    }

    const ok = window.confirm("Delete this news item permanently?");
    if (!ok) return;

    try {
      await API.delete(`/admin/news/${newsId}`);
      setMessage("News deleted successfully");
      await loadAdminData();
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to delete news");
    }
  };

  const handleSaveProject = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!isSystemAdmin) {
      setMessage("Only system admins can manage projects.");
      return;
    }

    if (!projectForm.title.trim() || !projectForm.description.trim()) {
      setMessage("Project title and description are required.");
      return;
    }

    try {
      setIsSaving(true);

      if (selectedProjectId) {
        await API.put(`/admin/projects/${selectedProjectId}`, projectForm);
        setMessage("Project updated successfully");
      } else {
        await API.post("/admin/projects", projectForm);
        setMessage("Project created successfully");
      }

      resetProjectForm();
      setShowProjectModal(false);
      await loadAdminData();
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to save project");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!isSystemAdmin) {
      setMessage("Only system admins can delete projects.");
      return;
    }

    const ok = window.confirm("Delete this project permanently?");
    if (!ok) return;

    try {
      await API.delete(`/admin/projects/${projectId}`);
      setMessage("Project deleted successfully");
      await loadAdminData();
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to delete project");
    }
  };

  const openClubWorkspace = (club) => {
    navigate(`/clubs/${club._id}`);
  };

  const openClubManage = (club) => {
    navigate(`/clubs/${club._id}/manage`);
  };

  const openNewsPage = () => {
    navigate("/news");
  };

  const openUploadProjectPage = () => {
    navigate("/upload-project");
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      <div className="bg-white rounded-3xl border border-slate-200 p-7">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500">
          Admin Console
        </p>

        <h1 className="mt-2 text-3xl font-black text-slate-900">
          {isSystemAdmin ? "System Administration Panel" : "Club Administration Panel"}
        </h1>

        <p className="mt-2 text-sm text-slate-500 max-w-2xl">
          {isSystemAdmin
            ? "Manage platform users, clubs, badges, news, and projects from one place."
            : "As a club admin, you can open and manage clubs from this panel, but you cannot create, approve, reject, or delete clubs."}
        </p>

        {me && (
          <p className="mt-3 text-xs text-slate-500">
            Logged in as:{" "}
            <span className="font-bold text-slate-700">{me.fullName}</span> ({me.role})
          </p>
        )}

        {message && (
          <p className="mt-3 text-sm font-semibold text-indigo-600">{message}</p>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          {isSystemAdmin && (
            <button
              onClick={() => setActiveTab("overview")}
              className={tabButtonClass(activeTab === "overview")}
            >
              <Layers3 size={16} />
              Overview
            </button>
          )}

          {canManageUsers && (
            <button
              onClick={() => setActiveTab("users")}
              className={tabButtonClass(activeTab === "users")}
            >
              <Users size={16} />
              Users
            </button>
          )}

          {canSeeClubTab && (
            <button
              onClick={() => setActiveTab("clubs")}
              className={tabButtonClass(activeTab === "clubs")}
            >
              <Building2 size={16} />
              Clubs
            </button>
          )}

          {canManageNews && (
            <button
              onClick={() => setActiveTab("news")}
              className={tabButtonClass(activeTab === "news")}
            >
              <Newspaper size={16} />
              News
            </button>
          )}

          {canManageProjects && (
            <button
              onClick={() => setActiveTab("projects")}
              className={tabButtonClass(activeTab === "projects")}
            >
              <FolderOpen size={16} />
              Projects
            </button>
          )}

          {canManageBadges && (
            <button
              onClick={() => setActiveTab("badges")}
              className={tabButtonClass(activeTab === "badges")}
            >
              <BadgeCheck size={16} />
              Badges
            </button>
          )}
        </div>
      </div>

      {activeTab === "overview" && isSystemAdmin && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            <StatCard
              title="Total Students"
              value={totalStudents}
              icon={GraduationCap}
              tone="bg-indigo-50 text-indigo-600"
            />
            <StatCard
              title="Active Users"
              value={activeUsers}
              icon={UserCheck}
              tone="bg-emerald-50 text-emerald-600"
            />
            <StatCard
              title="News Posts"
              value={totalNews}
              icon={Newspaper}
              tone="bg-cyan-50 text-cyan-600"
            />
            <StatCard
              title="Projects"
              value={totalProjects}
              icon={FolderOpen}
              tone="bg-violet-50 text-violet-600"
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-xl font-black text-slate-900">System Summary</h2>
            <p className="mt-2 text-sm text-slate-500">
              Manage users, clubs, news, projects, and badges from this panel.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={() => setActiveTab("clubs")}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700"
              >
                Open Club Management
              </button>

              <button
                onClick={() => setActiveTab("users")}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50"
              >
                Open User Management
              </button>

              <button
                onClick={() => setActiveTab("news")}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50"
              >
                Open News Management
              </button>

              <button
                onClick={() => setActiveTab("projects")}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50"
              >
                Open Project Management
              </button>

              <button
                onClick={openNewsPage}
                className="px-4 py-2 rounded-xl border border-indigo-200 text-indigo-700 text-sm font-bold hover:bg-indigo-50"
              >
                Go to NewsPage
              </button>

              <button
                onClick={openUploadProjectPage}
                className="px-4 py-2 rounded-xl border border-violet-200 text-violet-700 text-sm font-bold hover:bg-violet-50"
              >
                Go to UploadProject
              </button>
            </div>
          </div>
        </>
      )}

      {activeTab === "users" && canManageUsers && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            <StatCard
              title="Total Students"
              value={totalStudents}
              icon={GraduationCap}
              tone="bg-indigo-50 text-indigo-600"
            />
            <StatCard
              title="Active Users"
              value={activeUsers}
              icon={UserCheck}
              tone="bg-emerald-50 text-emerald-600"
            />
            <StatCard
              title="Mentors"
              value={activeMentors}
              icon={Users}
              tone="bg-amber-50 text-amber-600"
            />
            <StatCard
              title="Inactive Users"
              value={inactiveUsers}
              icon={ShieldAlert}
              tone="bg-rose-50 text-rose-600"
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
              <h2 className="text-xl font-black text-slate-900">Manage Users</h2>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    resetUserForm();
                    setShowAddUserModal(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700"
                >
                  <UserPlus size={16} /> Add New User
                </button>

                <button
                  onClick={() => setShowBadgeModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-bold hover:bg-violet-700"
                >
                  <BadgeCheck size={16} /> Create Badge
                </button>
              </div>

              <div className="relative w-full lg:w-96">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
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
                User management is unavailable for your current role.
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
                      <tr
                        key={student._id}
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >
                        <td className="py-3 pr-4 font-semibold text-slate-700">
                          {student.studentId}
                        </td>
                        <td className="py-3 pr-4 text-slate-800">{student.fullName}</td>
                        <td className="py-3 pr-4 text-slate-600">{student.email}</td>
                        <td className="py-3 pr-4 text-slate-600">
                          {student.faculty || student.profile?.faculty || "-"}
                        </td>
                        <td className="py-3 pr-4 text-slate-600">
                          {student.yearOfStudy || student.profile?.yearOfStudy || "-"}
                        </td>
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
        </>
      )}

      {activeTab === "clubs" && canSeeClubTab && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            <StatCard
              title={isSystemAdmin ? "Total Clubs" : "Available Clubs"}
              value={totalClubs}
              icon={Building2}
              tone="bg-indigo-50 text-indigo-600"
            />
            <StatCard
              title="Active Clubs"
              value={activeClubs}
              icon={FolderCog}
              tone="bg-emerald-50 text-emerald-600"
            />
            <StatCard
              title="Pending Clubs"
              value={pendingClubs}
              icon={ShieldAlert}
              tone="bg-amber-50 text-amber-600"
            />
            <StatCard
              title="Rejected Clubs"
              value={rejectedClubs}
              icon={X}
              tone="bg-rose-50 text-rose-600"
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
              <h2 className="text-xl font-black text-slate-900">
                {isSystemAdmin ? "Manage Clubs" : "Club Workspaces"}
              </h2>

              <div className="flex gap-3">
                {canCreateClub && (
                  <button
                    onClick={() => {
                      resetClubForm();
                      setShowClubModal(true);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700"
                  >
                    <Building2 size={16} /> Create Club
                  </button>
                )}
              </div>

              <div className="relative w-full lg:w-96">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={clubSearch}
                  onChange={(e) => setClubSearch(e.target.value)}
                  placeholder="Search clubs by name, category, status..."
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            </div>

            {!isSystemAdmin && (
              <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                You can open and manage clubs from this panel, but you cannot create,
                approve, reject, or delete clubs.
              </div>
            )}

            {isLoading ? (
              <p className="text-sm text-slate-500">Loading clubs...</p>
            ) : !hasClubAccess ? (
              <p className="text-sm text-slate-500">
                Club management data is unavailable for your current role.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-slate-200 text-slate-500">
                      <th className="py-3 pr-4">Club</th>
                      <th className="py-3 pr-4">Category</th>
                      <th className="py-3 pr-4">President</th>
                      <th className="py-3 pr-4">Status</th>
                      <th className="py-3 pr-4">Members</th>
                      <th className="py-3 pr-4">Constitution</th>
                      <th className="py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClubs.map((club) => (
                      <tr
                        key={club._id}
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >
                        <td className="py-3 pr-4">
                          <div>
                            <p className="font-semibold text-slate-800">{club.name}</p>
                            <p className="text-xs text-slate-500 line-clamp-1">
                              {club.description}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-slate-600">{club.category}</td>
                        <td className="py-3 pr-4 text-slate-600">
                          {club.president?.name || "-"}
                        </td>
                        <td className="py-3 pr-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                            {club.status}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-slate-600">
                          {club.members?.length || 0}
                        </td>
                        <td className="py-3 pr-4 text-slate-600">
                          {club.constitution?.fileName ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-700 bg-indigo-50 px-2 py-1 rounded-full">
                              <FileText size={12} />
                              {club.constitution.fileName}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="py-3 text-right">
                          <div className="inline-flex flex-wrap gap-2 justify-end">
                            <button
                              onClick={() => openClubWorkspace(club)}
                              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold"
                            >
                              Open
                            </button>

                            <button
                              onClick={() => openClubManage(club)}
                              className="px-3 py-1.5 rounded-lg border border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-xs font-semibold"
                            >
                              Manage
                            </button>

                            {canApproveRejectClub && club.status === "pending" && (
                              <>
                                <button
                                  onClick={() => handleClubStatus(club._id, "active")}
                                  className="px-3 py-1.5 rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-xs font-semibold"
                                >
                                  Approve
                                </button>

                                <button
                                  onClick={() => handleClubStatus(club._id, "rejected")}
                                  className="px-3 py-1.5 rounded-lg border border-amber-200 text-amber-700 hover:bg-amber-50 text-xs font-semibold"
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            {canDeleteClub && (
                              <button
                                onClick={() => handleDeleteClub(club._id)}
                                className="px-3 py-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 text-xs font-semibold"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!filteredClubs.length && (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-slate-500">
                          No clubs found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === "news" && canManageNews && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            <StatCard
              title="Total News"
              value={totalNews}
              icon={Newspaper}
              tone="bg-cyan-50 text-cyan-600"
            />
            <StatCard
              title="Published News"
              value={publishedNews}
              icon={BadgeCheck}
              tone="bg-emerald-50 text-emerald-600"
            />
            <StatCard
              title="Draft News"
              value={totalNews - publishedNews}
              icon={FileText}
              tone="bg-amber-50 text-amber-600"
            />
            <StatCard
              title="Public Page"
              value="NewsPage"
              icon={ExternalLink}
              tone="bg-violet-50 text-violet-600"
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
              <h2 className="text-xl font-black text-slate-900">Manage News</h2>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    resetNewsForm();
                    setShowNewsModal(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 text-white text-sm font-bold hover:bg-cyan-700"
                >
                  <PlusCircle size={16} /> Add News
                </button>

                <button
                  onClick={openNewsPage}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-cyan-200 text-cyan-700 text-sm font-bold hover:bg-cyan-50"
                >
                  <ExternalLink size={16} /> Open NewsPage
                </button>
              </div>

              <div className="relative w-full lg:w-96">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={newsSearch}
                  onChange={(e) => setNewsSearch(e.target.value)}
                  placeholder="Search news by title, category, author..."
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-200"
                />
              </div>
            </div>

            {isLoading ? (
              <p className="text-sm text-slate-500">Loading news...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-slate-200 text-slate-500">
                      <th className="py-3 pr-4">Title</th>
                      <th className="py-3 pr-4">Category</th>
                      <th className="py-3 pr-4">Author</th>
                      <th className="py-3 pr-4">Status</th>
                      <th className="py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredNews.map((item) => (
                      <tr
                        key={item._id}
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >
                        <td className="py-3 pr-4">
                          <p className="font-semibold text-slate-800">{item.title}</p>
                          <p className="text-xs text-slate-500 line-clamp-1">
                            {item.summary}
                          </p>
                        </td>
                        <td className="py-3 pr-4 text-slate-600">{item.category || "-"}</td>
                        <td className="py-3 pr-4 text-slate-600">{item.author || "-"}</td>
                        <td className="py-3 pr-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                              item.isPublished !== false
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {item.isPublished !== false ? "Published" : "Draft"}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <div className="inline-flex gap-2">
                            <button
                              onClick={() => openEditNewsModal(item)}
                              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold inline-flex items-center gap-1"
                            >
                              <Pencil size={14} />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteNews(item._id)}
                              className="px-3 py-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 text-xs font-semibold inline-flex items-center gap-1"
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!filteredNews.length && (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-500">
                          No news found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === "projects" && canManageProjects && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            <StatCard
              title="Total Projects"
              value={totalProjects}
              icon={FolderOpen}
              tone="bg-violet-50 text-violet-600"
            />
            <StatCard
              title="Published Projects"
              value={publishedProjects}
              icon={BadgeCheck}
              tone="bg-emerald-50 text-emerald-600"
            />
            <StatCard
              title="Draft Projects"
              value={totalProjects - publishedProjects}
              icon={FileText}
              tone="bg-amber-50 text-amber-600"
            />
            <StatCard
              title="Upload Page"
              value="UploadProject"
              icon={ExternalLink}
              tone="bg-indigo-50 text-indigo-600"
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
              <h2 className="text-xl font-black text-slate-900">Manage Projects</h2>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    resetProjectForm();
                    setShowProjectModal(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-bold hover:bg-violet-700"
                >
                  <PlusCircle size={16} /> Add Project
                </button>

                <button
                  onClick={openUploadProjectPage}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-violet-200 text-violet-700 text-sm font-bold hover:bg-violet-50"
                >
                  <ExternalLink size={16} /> Open UploadProject
                </button>
              </div>

              <div className="relative w-full lg:w-96">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={projectSearch}
                  onChange={(e) => setProjectSearch(e.target.value)}
                  placeholder="Search projects by title, category, owner..."
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-200"
                />
              </div>
            </div>

            {isLoading ? (
              <p className="text-sm text-slate-500">Loading projects...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-slate-200 text-slate-500">
                      <th className="py-3 pr-4">Project</th>
                      <th className="py-3 pr-4">Category</th>
                      <th className="py-3 pr-4">Owner</th>
                      <th className="py-3 pr-4">Status</th>
                      <th className="py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProjects.map((item) => (
                      <tr
                        key={item._id}
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >
                        <td className="py-3 pr-4">
                          <p className="font-semibold text-slate-800">{item.title}</p>
                          <p className="text-xs text-slate-500 line-clamp-1">
                            {item.description}
                          </p>
                        </td>
                        <td className="py-3 pr-4 text-slate-600">{item.category || "-"}</td>
                        <td className="py-3 pr-4 text-slate-600">{item.ownerName || "-"}</td>
                        <td className="py-3 pr-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                            {item.status || "published"}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <div className="inline-flex gap-2">
                            <button
                              onClick={() => openEditProjectModal(item)}
                              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold inline-flex items-center gap-1"
                            >
                              <Pencil size={14} />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProject(item._id)}
                              className="px-3 py-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 text-xs font-semibold inline-flex items-center gap-1"
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!filteredProjects.length && (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-500">
                          No projects found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === "badges" && canManageBadges && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900">Badge Management</h2>
              <p className="mt-1 text-sm text-slate-500">
                Create and issue badges for user recognition.
              </p>
            </div>

            <button
              onClick={() => setShowBadgeModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-bold hover:bg-violet-700"
            >
              <BadgeCheck size={16} /> Create Badge
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {badges.map((badge) => (
              <div
                key={badge._id}
                className="rounded-2xl border border-slate-200 p-4 bg-slate-50"
              >
                <p className="font-bold text-slate-900">{badge.title}</p>
                <p className="text-sm text-slate-500 mt-2">{badge.description}</p>
              </div>
            ))}
            {!badges.length && (
              <p className="text-sm text-slate-500">No badges created yet.</p>
            )}
          </div>
        </div>
      )}

      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <UserPlus size={18} /> Add New User
              </h3>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>

            <form
              onSubmit={handleSaveUser}
              className="p-6 space-y-3 max-h-96 overflow-y-auto"
            >
              <input
                value={form.fullName}
                onChange={(e) => handleUserInputChange("fullName", e.target.value)}
                placeholder="Full Name"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                required
              />
              <input
                value={form.email}
                onChange={(e) => handleUserInputChange("email", e.target.value)}
                placeholder="Email"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                required
              />
              <input
                value={form.password}
                onChange={(e) => handleUserInputChange("password", e.target.value)}
                placeholder="Password"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                required
              />
              <input
                value={form.studentId}
                onChange={(e) => handleUserInputChange("studentId", e.target.value)}
                placeholder="Student ID"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                required
              />
              <input
                value={form.faculty}
                onChange={(e) => handleUserInputChange("faculty", e.target.value)}
                placeholder="Faculty"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />
              <input
                value={form.yearOfStudy}
                onChange={(e) =>
                  handleUserInputChange("yearOfStudy", e.target.value)
                }
                placeholder="Year Of Study"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />
              <select
                value={form.role}
                onChange={(e) => handleUserInputChange("role", e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              >
                {USER_ROLE_OPTIONS.map((roleOption) => (
                  <option key={roleOption} value={roleOption}>
                    {roleOption.replaceAll("_", " ")}
                  </option>
                ))}
              </select>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60"
                >
                  Create User
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900">Edit User</h3>
              <button
                onClick={() => setShowEditUserModal(false)}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>

            <form
              onSubmit={handleSaveUser}
              className="p-6 space-y-3 max-h-96 overflow-y-auto"
            >
              <input
                value={form.fullName}
                onChange={(e) => handleUserInputChange("fullName", e.target.value)}
                placeholder="Full Name"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                required
              />
              <input
                value={form.email}
                onChange={(e) => handleUserInputChange("email", e.target.value)}
                placeholder="Email"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                required
              />
              <input
                value={form.password}
                onChange={(e) => handleUserInputChange("password", e.target.value)}
                placeholder="New Password (optional)"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />
              <input
                value={form.studentId}
                onChange={(e) => handleUserInputChange("studentId", e.target.value)}
                placeholder="Student ID"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />
              <input
                value={form.faculty}
                onChange={(e) => handleUserInputChange("faculty", e.target.value)}
                placeholder="Faculty"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />
              <input
                value={form.yearOfStudy}
                onChange={(e) =>
                  handleUserInputChange("yearOfStudy", e.target.value)
                }
                placeholder="Year Of Study"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />
              <select
                value={form.role}
                onChange={(e) => handleUserInputChange("role", e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              >
                {USER_ROLE_OPTIONS.map((roleOption) => (
                  <option key={roleOption} value={roleOption}>
                    {roleOption.replaceAll("_", " ")}
                  </option>
                ))}
              </select>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60"
                >
                  Update User
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditUserModal(false)}
                  className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRewardModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Gift size={18} /> Give Badge / Certificate
              </h3>
              <button
                onClick={() => setShowRewardModal(false)}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>

            <form
              onSubmit={handleAssignReward}
              className="p-6 space-y-3 max-h-96 overflow-y-auto"
            >
              {selectedUser && (
                <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-100">
                  <p className="text-xs text-indigo-600 uppercase font-bold">
                    Selected User
                  </p>
                  <p className="text-sm font-bold text-indigo-900 mt-1">
                    {selectedUser.fullName}
                  </p>
                  <p className="text-xs text-indigo-700">{selectedUser.email}</p>
                </div>
              )}

              <select
                value={rewardForm.badgeId}
                onChange={(e) =>
                  setRewardForm((prev) => ({ ...prev, badgeId: e.target.value }))
                }
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Select Badge (optional)</option>
                {badges.map((badge) => (
                  <option key={badge._id} value={badge._id}>
                    {badge.title}
                  </option>
                ))}
              </select>

              <input
                value={rewardForm.certificateTitle}
                onChange={(e) =>
                  setRewardForm((prev) => ({
                    ...prev,
                    certificateTitle: e.target.value,
                  }))
                }
                placeholder="Certificate Title"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />

              <input
                value={rewardForm.issuer}
                onChange={(e) =>
                  setRewardForm((prev) => ({ ...prev, issuer: e.target.value }))
                }
                placeholder="Issuer"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />

              <input
                value={rewardForm.verificationUrl}
                onChange={(e) =>
                  setRewardForm((prev) => ({
                    ...prev,
                    verificationUrl: e.target.value,
                  }))
                }
                placeholder="Verification URL"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />

              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setCertificateImageFile(e.target.files?.[0] || null)
                }
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  className="flex-1 px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700"
                >
                  Assign Reward
                </button>
                <button
                  type="button"
                  onClick={() => setShowRewardModal(false)}
                  className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showBadgeModal && canManageBadges && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <BadgeCheck size={18} /> Create Badge
              </h3>
              <button
                onClick={() => setShowBadgeModal(false)}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateBadge} className="p-6 space-y-3">
              <input
                value={badgeForm.title}
                onChange={(e) =>
                  setBadgeForm((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Badge Title"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                required
              />
              <textarea
                value={badgeForm.description}
                onChange={(e) =>
                  setBadgeForm((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Description"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />
              <textarea
                value={badgeForm.criteria}
                onChange={(e) =>
                  setBadgeForm((prev) => ({ ...prev, criteria: e.target.value }))
                }
                placeholder="Criteria"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />
              <input
                value={badgeForm.icon}
                onChange={(e) =>
                  setBadgeForm((prev) => ({ ...prev, icon: e.target.value }))
                }
                placeholder="Icon name"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  className="flex-1 px-3 py-2 rounded-lg bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700"
                >
                  Create Badge
                </button>
                <button
                  type="button"
                  onClick={() => setShowBadgeModal(false)}
                  className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showClubModal && canCreateClub && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Building2 size={18} /> Create Club
              </h3>
              <button
                onClick={() => setShowClubModal(false)}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateClub} className="p-6 space-y-3">
              <input
                value={clubForm.name}
                onChange={(e) => handleClubInputChange("name", e.target.value)}
                placeholder="Club Name"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                required
              />

              <textarea
                value={clubForm.description}
                onChange={(e) =>
                  handleClubInputChange("description", e.target.value)
                }
                placeholder="Club Description"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                required
              />

              <select
                value={clubForm.category}
                onChange={(e) => handleClubInputChange("category", e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <input
                value={clubForm.presidentName}
                onChange={(e) =>
                  handleClubInputChange("presidentName", e.target.value)
                }
                placeholder="President Name"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                required
              />

              <div>
                <input
                  type="email"
                  value={clubForm.presidentEmail}
                  onChange={(e) =>
                    handleClubInputChange("presidentEmail", e.target.value)
                  }
                  placeholder="President Email"
                  className={`w-full border rounded-lg px-3 py-2 text-sm ${
                    presidentEmailError
                      ? "border-rose-300 focus:ring-rose-200"
                      : "border-slate-200"
                  }`}
                  required
                />
                {presidentEmailError && (
                  <p className="mt-1 text-xs font-medium text-rose-600">
                    {presidentEmailError}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <FileText size={16} />
                  Constitution PDF
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setConstitutionFile(e.target.files?.[0] || null)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Upload the club constitution as a PDF. Students will be able to
                  download it.
                </p>
                {constitutionFile && (
                  <p className="mt-2 text-xs font-medium text-indigo-700">
                    Selected: {constitutionFile.name}
                  </p>
                )}
                {constitutionFileError && (
                  <p className="mt-1 text-xs font-medium text-rose-600">
                    {constitutionFileError}
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={
                    isSaving ||
                    Boolean(presidentEmailError) ||
                    Boolean(constitutionFileError)
                  }
                  className="flex-1 px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60"
                >
                  Create Club
                </button>
                <button
                  type="button"
                  onClick={() => setShowClubModal(false)}
                  className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showNewsModal && canManageNews && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Newspaper size={18} /> {selectedNewsId ? "Edit News" : "Add News"}
              </h3>
              <button
                onClick={() => setShowNewsModal(false)}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveNews} className="p-6 space-y-3">
              <input
                value={newsForm.title}
                onChange={(e) => handleNewsInputChange("title", e.target.value)}
                placeholder="News Title"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                required
              />

              <input
                value={newsForm.summary}
                onChange={(e) => handleNewsInputChange("summary", e.target.value)}
                placeholder="Short Summary"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                required
              />

              <textarea
                value={newsForm.content}
                onChange={(e) => handleNewsInputChange("content", e.target.value)}
                placeholder="Full Content"
                rows={6}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <select
                  value={newsForm.category}
                  onChange={(e) => handleNewsInputChange("category", e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                >
                  {newsCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

                <input
                  value={newsForm.author}
                  onChange={(e) => handleNewsInputChange("author", e.target.value)}
                  placeholder="Author"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <input
                value={newsForm.imageUrl}
                onChange={(e) => handleNewsInputChange("imageUrl", e.target.value)}
                placeholder="Image URL"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />

              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={newsForm.isPublished}
                  onChange={(e) =>
                    handleNewsInputChange("isPublished", e.target.checked)
                  }
                />
                Publish this news item
              </label>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-3 py-2 rounded-lg bg-cyan-600 text-white text-sm font-semibold hover:bg-cyan-700 disabled:opacity-60"
                >
                  {selectedNewsId ? "Update News" : "Create News"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewsModal(false)}
                  className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showProjectModal && canManageProjects && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <FolderOpen size={18} />{" "}
                {selectedProjectId ? "Edit Project" : "Add Project"}
              </h3>
              <button
                onClick={() => setShowProjectModal(false)}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="p-6 space-y-3">
              <input
                value={projectForm.title}
                onChange={(e) => handleProjectInputChange("title", e.target.value)}
                placeholder="Project Title"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                required
              />

              <textarea
                value={projectForm.description}
                onChange={(e) =>
                  handleProjectInputChange("description", e.target.value)
                }
                placeholder="Project Description"
                rows={5}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <select
                  value={projectForm.category}
                  onChange={(e) =>
                    handleProjectInputChange("category", e.target.value)
                  }
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                >
                  {projectCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

                <select
                  value={projectForm.status}
                  onChange={(e) => handleProjectInputChange("status", e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <input
                value={projectForm.ownerName}
                onChange={(e) =>
                  handleProjectInputChange("ownerName", e.target.value)
                }
                placeholder="Owner / Team Name"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />

              <input
                value={projectForm.githubUrl}
                onChange={(e) =>
                  handleProjectInputChange("githubUrl", e.target.value)
                }
                placeholder="GitHub URL"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />

              <input
                value={projectForm.liveUrl}
                onChange={(e) => handleProjectInputChange("liveUrl", e.target.value)}
                placeholder="Live Demo URL"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />

              <input
                value={projectForm.imageUrl}
                onChange={(e) =>
                  handleProjectInputChange("imageUrl", e.target.value)
                }
                placeholder="Project Image URL"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-3 py-2 rounded-lg bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 disabled:opacity-60"
                >
                  {selectedProjectId ? "Update Project" : "Create Project"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowProjectModal(false)}
                  className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-semibold"
                >
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