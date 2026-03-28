import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Register from "./components/Auth/Register";
import Login from "./components/Auth/Login";
import LandingPage from "./components/landingPage";
import Dashboard from "./components/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./components/Profile";
import Layout from "./components/Layout";
import ProfileEditPage from "./components/EditProfile";
import AddSkillPage from "./components/AddSkillsPage";
import SkillsListPage from "./components/SkillListPage";
import ChangePasswordPage from "./components/ChangePasswordPage";
import ResetPasswordPage from "./components/ResetPasswordPage";
import ForgotPasswordPage from "./components/ForgotPasswordPage";
import AdminPanel from "./components/AdminPanel";
import BadgeCertificationPage from "./components/BadgeCertificationPage";
import AccountSettingsPage from "./components/AccountSettingpage";
import HomePage from "./components/Home/HomePage";



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/Home" element={<HomePage/>}/>
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["SYSTEM_ADMIN", "CLUB_ADMIN"]}>
              <AdminPanel />
            </ProtectedRoute>
          }
        />

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
           <Route path="/badges" element={<BadgeCertificationPage />} />
          <Route path="/skills" element={<SkillsListPage />} />
          <Route path="/skills/add" element={<AddSkillPage />} />
          <Route path="/settings" element={<AccountSettingsPage />} />
          <Route path="/settings/password" element={<ChangePasswordPage />} />
          
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
