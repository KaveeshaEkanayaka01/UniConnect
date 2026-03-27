import React, { useState } from "react";
import API from "../Auth/axios";
import { useNavigate, Link } from "react-router-dom";

const validateRegisterForm = (values, confirmPassword) => {
  const errors = {};
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!values.fullName.trim()) {
    errors.fullName = "Full name is required";
  }

  if (!values.studentId.trim()) {
    errors.studentId = "Student ID is required";
  }

  if (!values.email.trim()) {
    errors.email = "Email is required";
  } else if (!emailRegex.test(values.email)) {
    errors.email = "Enter a valid email address";
  }

  if (!values.faculty) {
    errors.faculty = "Faculty is required";
  }

  if (!values.yearOfStudy) {
    errors.yearOfStudy = "Year of study is required";
  }

  if (!values.password) {
    errors.password = "Password is required";
  } else if (values.password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Confirm password is required";
  } else if (values.password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  return errors;
};

function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    studentId: "",
    role: "STUDENT",
    faculty: "",
    yearOfStudy: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setSubmitError("");
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    setErrors((prev) => ({ ...prev, confirmPassword: "" }));
    setSubmitError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateRegisterForm(formData, confirmPassword);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      setSubmitError("");
      const res = await API.post("/auth/register", formData);
      localStorage.setItem("token", res.data.token);

      const user = res.data?.user || {};
      const { password, ...safeUser } = user;
      localStorage.setItem("user", JSON.stringify(safeUser));

      const role = String(safeUser?.role || "").trim().toUpperCase();
      const isAdmin = role === "SYSTEM_ADMIN" || role === "CLUB_ADMIN";
      alert("Registration successful!");
      navigate(isAdmin ? "/admin" : "/dashboard");
    } catch (err) {
      setSubmitError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-center text-2xl font-bold text-gray-900">
          Create Account
        </h2>
        <p className="mt-1 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Log in
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4" noValidate>
          {submitError && (
            <div className="md:col-span-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {submitError}
            </div>
          )}

          <div>
            <label className="text-xs text-gray-600">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 ${errors.fullName ? "border-red-500" : ""}`}
              aria-invalid={Boolean(errors.fullName)}
              placeholder="Enter your full name"
            />
            {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>}
          </div>

          <div>
            <label className="text-xs text-gray-600">Student ID</label>
            <input
              type="text"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 ${errors.studentId ? "border-red-500" : ""}`}
              aria-invalid={Boolean(errors.studentId)}
              placeholder="StudentID"
            />
            {errors.studentId && <p className="mt-1 text-xs text-red-600">{errors.studentId}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="text-xs text-gray-600">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 ${errors.email ? "border-red-500" : ""}`}
              aria-invalid={Boolean(errors.email)}
              placeholder="Email"
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label className="text-xs text-gray-600">Faculty</label>
            <select
              name="faculty"
              value={formData.faculty}
              onChange={handleChange}
              className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 ${errors.faculty ? "border-red-500" : ""}`}
              aria-invalid={Boolean(errors.faculty)}
            >
              <option value="">Select Faculty</option>
              <option value="Engineering">Engineering</option>
              <option value="Business">Business</option>
              <option value="Computing">Computing</option>
              <option value="Medicine">Medicine</option>
            </select>
            {errors.faculty && <p className="mt-1 text-xs text-red-600">{errors.faculty}</p>}
          </div>

          <div>
            <label className="text-xs text-gray-600">Year of Study</label>
            <select
              name="yearOfStudy"
              value={formData.yearOfStudy}
              onChange={handleChange}
              className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 ${errors.yearOfStudy ? "border-red-500" : ""}`}
              aria-invalid={Boolean(errors.yearOfStudy)}
            >
              <option value="">Select Year</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
            {errors.yearOfStudy && <p className="mt-1 text-xs text-red-600">{errors.yearOfStudy}</p>}
          </div>

          <div>
            <label className="text-xs text-gray-600">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 ${errors.password ? "border-red-500" : ""}`}
              aria-invalid={Boolean(errors.password)}
              placeholder="Password"
            />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
          </div>

          <div>
            <label className="text-xs text-gray-600">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 ${errors.confirmPassword ? "border-red-500" : ""}`}
              aria-invalid={Boolean(errors.confirmPassword)}
              placeholder="Confirm Password"

            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Register"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;


