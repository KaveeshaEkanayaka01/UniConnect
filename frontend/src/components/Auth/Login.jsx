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

      // Clear stale auth state before new login
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

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-4">
          <div>
            <img
              src="../../images/uniconnect.png"
              alt="UniConnect Logo"
              className="h-20 w-26 rounded-full"
            />
          </div>
        </div>

        <h2 className="text-center text-2xl font-bold text-gray-900">
          Sign in to UniConnect
        </h2>
        <p className="mt-1 text-center text-sm text-gray-600">
          Or{" "}
          <Link
            to="/register"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            create a new account
          </Link>
        </p>

        <div className="mt-6 bg-white p-6 rounded-xl shadow-lg border border-gray-100">
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
                className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 ${
                  errors.email ? "border-red-500" : ""
                }`}
                aria-invalid={Boolean(errors.email)}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="text-xs text-gray-600">Password</label>
              <input
                type="password"
                value={password}
                onChange={handlePasswordChange}
                className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 ${
                  errors.password ? "border-red-500" : ""
                }`}
                aria-invalid={Boolean(errors.password)}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded border-gray-300" />
                Remember me
              </label>
              <Link
                to="/forgot-password"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition disabled:opacity-60"
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