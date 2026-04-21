import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../Auth/axios";

const validateLoginForm = ({ email, password }) => {
  const errors = {};
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email.trim()) {
    errors.email = "Email is required";
  } else if (!emailRegex.test(email.trim())) {
    errors.email = "Enter a valid email address";
  }

  if (!password) {
    errors.password = "Password is required";
  } else if (password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }

  return errors;
};

const normalizeRole = (role) => {
  const value = String(role || "").trim().toUpperCase();
  if (value === "ADMIN" || value === "SYSTEM_ADMIN") return "SYSTEM_ADMIN";
  if (value === "CLUB_ADMIN") return "CLUB_ADMIN";
  return "STUDENT";
};

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setErrors((prev) => ({ ...prev, email: "" }));
    setSubmitError("");
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setErrors((prev) => ({ ...prev, password: "" }));
    setSubmitError("");
  };

  const handleLogin = async (e) => {
  e.preventDefault();

  const normalizedEmail = email.trim();
  const validationErrors = validateLoginForm({
    email: normalizedEmail,
    password,
  });

  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }

  try {
    setLoading(true);
    setSubmitError("");

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("authUser");

    const res = await API.post("/auth/login", {
      email: normalizedEmail,
      password,
    });

    const token = res?.data?.token;
    const user = res?.data?.user;

    if (!token || !user) {
      throw new Error("Invalid login response");
    }

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    const role = normalizeRole(user.role);
    const isAdmin = role === "SYSTEM_ADMIN" || role === "CLUB_ADMIN";

    navigate(isAdmin ? "/admin" : "/dashboard", { replace: true });
  } catch (err) {
    setSubmitError(
      err?.response?.data?.message || err?.message || "Login failed"
    );
  } finally {
    setLoading(false);
  }
};

const handleBack = () => {
  navigate("/", { replace: true });
};
  return (
  <div className="min-h-screen bg-[#0B1E8A] flex items-center justify-center px-4 relative">
    <div className="w-full max-w-md">
      <button
        type="button"
        onClick={handleBack}
        className="mb-4 text-sm text-white hover:text-[#F36C21] transition"
      >
        ← Back
      </button>

      {/* Logo */}
      <div className="flex justify-center mb-4">
        <img
          src="../../images/uniconnect.png"
          alt="UniConnect Logo"
          className="h-20 w-26 rounded-full bg-white p-1"
        />
      </div>

      {/* Title */}
      <h2 className="text-center text-2xl font-bold text-white">
        Sign in to UniConnect
      </h2>

      <p className="mt-1 text-center text-sm text-gray-200">
        Or{" "}
        <Link
          to="/register"
          className="font-medium text-[#F36C21] hover:text-orange-400"
        >
          create a new account
        </Link>
      </p>

      {/* Form Card */}
      <div className="mt-6 bg-white p-6 rounded-xl shadow-lg">
        <form className="space-y-4" onSubmit={handleLogin} noValidate>
          {submitError && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {submitError}
            </div>
          )}

          <div>
            <label className="text-xs text-gray-600">Email address</label>
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm text-gray-800 focus:ring-2 focus:ring-[#F36C21] focus:border-[#F36C21] outline-none ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="text-xs text-gray-600">Password</label>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={handlePasswordChange}
                className={`block w-full rounded-lg border px-3 py-2 pr-16 text-sm text-gray-800 focus:ring-2 focus:ring-[#F36C21] focus:border-[#F36C21] outline-none ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#0B1E8A] hover:text-[#F36C21]"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password}</p>
            )}
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded border-gray-300" />
              Remember me
            </label>
            <Link
              to="/forgot-password"
              className="font-medium text-[#0B1E8A] hover:text-[#F36C21]"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#F36C21] py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  </div>
);
};

export default LoginPage;