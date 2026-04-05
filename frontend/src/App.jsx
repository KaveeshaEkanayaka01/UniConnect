import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

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

// Club
import MyClubs from "./components/MyClubs";
import ClubDashboard from "./components/ClubDashboard";
import ClubManage from "./components/club-manage/ClubManage";
import ElectionVote from "./components/club-manage/ElectionVote";

// Protection
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/LandingPage" element={<LandingPage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/verify/:credentialId" element={<VerificationPage />} />

        {/* Admin Route */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["SYSTEM_ADMIN"]}>
              <AdminPanel />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes */}
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

          {/* Club Dashboard */}
          <Route path="/clubs/:clubId" element={<ClubDashboard />} />

          {/* Club Manage */}
          <Route path="/clubs/:clubId/manage" element={<ClubManage />} />

          {/* Election Details / Vote Page */}
          <Route
            path="/clubs/:clubId/elections/:electionId"
            element={<ElectionVote />}
          />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;