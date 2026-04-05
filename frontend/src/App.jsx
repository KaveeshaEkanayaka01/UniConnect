import React from "react";
import {
  BrowserRouter,
  Route,
  Routes,
  Navigate,
  Outlet,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

// ================= ERROR BOUNDARY =================
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    this.setState({ error, info });
    console.error("ErrorBoundary caught", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-red-50">
          <div className="max-w-3xl bg-white p-6 rounded shadow">
            <h2 className="text-xl font-bold text-red-700">
              Something went wrong
            </h2>
            <pre className="mt-4 text-sm">
              {String(this.state.error)}
            </pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ================= IMPORTS =================

// Auth
import Register from "./components/Auth/Register";
import Login from "./components/Auth/Login";

// Public
import LandingPage from "./components/landingPage";
import HomePage from "./components/Home/HomePage";
import VerificationPage from "./components/VerificationPage";

// Core
import Dashboard from "./components/Dashboard";
import Profile from "./components/Profile";
import Layout from "./components/Layout";
import Navbar from "./components/Navbar";

// Profile
import ProfileEditPage from "./components/EditProfile";
import AddSkillPage from "./components/AddSkillsPage";
import SkillsListPage from "./components/SkillListPage";
import ChangePasswordPage from "./components/ChangePasswordPage";
import ResetPasswordPage from "./components/ResetPasswordPage";
import ForgotPasswordPage from "./components/ForgotPasswordPage";
import AccountSettingsPage from "./components/AccountSettingpage";
import BadgeCertificationPage from "./components/BadgeCertificationPage";

// Admin
import AdminPanel from "./components/AdminPanel";
import AdminDashboard from "./pages/AdminDashboard";

// Club
import MyClubs from "./components/MyClubs";
import ClubDashboard from "./components/ClubDashboard";
import ClubManage from "./components/club-manage/ClubManage";
import ElectionVote from "./components/club-manage/ElectionVote";

// Protection
import ProtectedRoute from "./components/ProtectedRoute";

// News & Project Modules
import NewsOnlyPage from "./pages/NewsPages/NewsOnlyPage";
import NewsPage from "./pages/NewsPages/NewsPage";
import NewsEditor from "./pages/NewsEditor";

import ProjectFeed from "./pages/ProjectFeed";
import UploadProject from "./pages/UploadProject";
import ClubEventAnalysis from "./pages/ClubEventAnalysis";

// ================= PUBLIC LAYOUT =================
const PublicLayout = () => (
  <>
    <Navbar />
    <div className="min-h-screen">
      <Outlet />
    </div>
  </>
);

// ================= APP =================
function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Toaster />

        <Routes>
          {/* ================= PUBLIC ROUTES ================= */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/home" element={<HomePage />} />

            {/* News & Projects Public */}
            <Route path="/news-only" element={<NewsOnlyPage />} />
            <Route path="/project-feed" element={<ProjectFeed />} />
            <Route path="/analysis" element={<ClubEventAnalysis />} />
          </Route>

          {/* ================= AUTH ================= */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/verify/:credentialId" element={<VerificationPage />} />

          {/* ================= ADMIN ================= */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["SYSTEM_ADMIN"]}>
                <AdminPanel />
              </ProtectedRoute>
            }
          />

          <Route path="/admin-dashboard" element={<AdminDashboard />} />

          {/* ================= PROTECTED ================= */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/edit" element={<ProfileEditPage />} />

            <Route path="/skills" element={<SkillsListPage />} />
            <Route path="/skills/add" element={<AddSkillPage />} />

            <Route path="/settings" element={<AccountSettingsPage />} />
            <Route path="/settings/password" element={<ChangePasswordPage />} />

            <Route path="/badges" element={<BadgeCertificationPage />} />

            <Route path="/my-clubs" element={<MyClubs />} />

            <Route path="/clubs/:clubId" element={<ClubDashboard />} />
            <Route path="/clubs/:clubId/manage" element={<ClubManage />} />
            <Route
              path="/clubs/:clubId/elections/:electionId"
              element={<ElectionVote />}
            />

            {/* ================= MANAGE NEWS ================= */}
            <Route path="/manage-news" element={<NewsPage />} />
            <Route path="/manage-news/new" element={<NewsEditor />} />
            <Route path="/manage-news/edit/:id" element={<NewsEditor />} />

            {/* ================= PROJECT ================= */}
            <Route path="/upload-project" element={<UploadProject />} />
          </Route>

          {/* ================= FALLBACK ================= */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;