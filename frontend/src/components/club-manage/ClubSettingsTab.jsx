import React, { useEffect, useMemo, useState } from "react";
import { Save, Upload, FileText, Download, Lock } from "lucide-react";
import { updateClub, uploadClubConstitution } from "../../api/clubApi";

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

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") ||
  "http://localhost:5000";

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

const normalizeText = (value) => String(value || "").trim().toLowerCase();

const sameId = (a, b) => {
  if (!a || !b) return false;
  return String(a?._id || a) === String(b?._id || b);
};

const managerRoles = [
  "president",
  "vice_president",
  "treasurer",
  "secretary",
  "assistant_secretary",
  "assistant_treasurer",
  "event_coordinator",
  "project_coordinator",
  "executive",
];

const ClubSettingsTab = ({ club, onClubUpdated }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "Academic",
    tags: "",
  });

  const [constitutionFile, setConstitutionFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [constitutionLoading, setConstitutionLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [constitutionMessage, setConstitutionMessage] = useState("");

  const [errors, setErrors] = useState({});

  const currentUser = getCurrentUser();
  const currentUserId = currentUser?._id || currentUser?.id;
  const userRole = normalizeText(currentUser?.role);

  const canManageSettings = useMemo(() => {
    if (!club || !currentUserId) return false;

    if (userRole === "system_admin") return true;

    if (club?.clubAdmin?.user && sameId(club.clubAdmin.user, currentUserId)) {
      return true;
    }

    if (club?.president?.user && sameId(club.president.user, currentUserId)) {
      return true;
    }

    const membership =
      club?.members?.find((member) => {
        const memberUserId =
          member?.user?._id || member?.user || member?._id || member?.memberId;

        return (
          String(memberUserId) === String(currentUserId) &&
          normalizeText(member?.status) === "active"
        );
      }) || null;

    return managerRoles.includes(normalizeText(membership?.role));
  }, [club, currentUserId, userRole]);

  useEffect(() => {
    if (club) {
      setFormData({
        name: club.name || "",
        description: club.description || "",
        category: club.category || "Academic",
        tags: Array.isArray(club.tags) ? club.tags.join(", ") : "",
      });
    }
  }, [club]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setMessage("");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Club name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.category.trim()) {
      newErrors.category = "Category is required";
    }

    return newErrors;
  };

  const handleSaveDetails = async (e) => {
    e.preventDefault();

    if (!canManageSettings) {
      setMessage("You are not allowed to edit this club.");
      return;
    }

    const validationErrors = validateForm();
    setErrors(validationErrors);
    setMessage("");

    if (Object.keys(validationErrors).length > 0) return;

    try {
      setLoading(true);

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      };

      const res = await updateClub(club._id, payload);

      setMessage(res?.message || "Club details updated successfully");

      if (onClubUpdated) {
        onClubUpdated();
      }
    } catch (error) {
      console.error("Error updating club:", error);
      setMessage(
        error?.response?.data?.message || "Failed to update club details"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleConstitutionUpload = async (e) => {
    e.preventDefault();

    if (!canManageSettings) {
      setConstitutionMessage("You are not allowed to update the constitution.");
      return;
    }

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
      setConstitutionLoading(true);

      const form = new FormData();
      form.append("constitution", constitutionFile);

      const res = await uploadClubConstitution(club._id, form);

      setConstitutionMessage(
        res?.message || "Constitution uploaded successfully"
      );
      setConstitutionFile(null);

      if (onClubUpdated) {
        onClubUpdated();
      }
    } catch (error) {
      console.error("Error uploading constitution:", error);
      setConstitutionMessage(
        error?.response?.data?.message || "Failed to upload constitution"
      );
    } finally {
      setConstitutionLoading(false);
    }
  };

  const constitutionDownloadUrl = club?._id
    ? `${API_BASE_URL}/api/clubs/${club._id}/constitution/download`
    : null;

  return (
    <div className="space-y-6">
      {!canManageSettings && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 flex items-start gap-2">
          <Lock size={16} className="mt-0.5" />
          <span>
            You can view club settings information, but you are not allowed to
            edit club details or upload a constitution for this club.
          </span>
        </div>
      )}

      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-1">
          Club Settings
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          Update the club details and constitution.
        </p>

        {message && (
          <div className="mb-4 rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
            {message}
          </div>
        )}

        <form onSubmit={handleSaveDetails} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Club Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={!canManageSettings}
              className={`w-full rounded-xl border px-4 py-2.5 focus:outline-none focus:ring-2 disabled:bg-slate-50 disabled:text-slate-500 ${
                errors.name
                  ? "border-rose-300 focus:ring-rose-100"
                  : "border-slate-200 focus:ring-indigo-200"
              }`}
              placeholder="Enter club name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-rose-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows="4"
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={!canManageSettings}
              className={`w-full rounded-xl border px-4 py-2.5 focus:outline-none focus:ring-2 disabled:bg-slate-50 disabled:text-slate-500 ${
                errors.description
                  ? "border-rose-300 focus:ring-rose-100"
                  : "border-slate-200 focus:ring-indigo-200"
              }`}
              placeholder="Enter club description"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-rose-600">
                {errors.description}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              disabled={!canManageSettings}
              className={`w-full rounded-xl border px-4 py-2.5 focus:outline-none focus:ring-2 disabled:bg-slate-50 disabled:text-slate-500 ${
                errors.category
                  ? "border-rose-300 focus:ring-rose-100"
                  : "border-slate-200 focus:ring-indigo-200"
              }`}
            >
              {categories.map((category) => (
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
              Tags
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              disabled={!canManageSettings}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:bg-slate-50 disabled:text-slate-500"
              placeholder="e.g. coding, innovation, research"
            />
            <p className="mt-1 text-xs text-slate-500">
              Separate multiple tags with commas.
            </p>
          </div>

          {canManageSettings && (
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-white font-semibold hover:bg-indigo-700 disabled:opacity-60"
            >
              <Save size={16} />
              {loading ? "Saving..." : "Save Details"}
            </button>
          )}
        </form>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <div className="flex items-center gap-2 mb-2">
          <FileText size={18} className="text-indigo-600" />
          <h3 className="text-xl font-bold text-slate-900">Constitution</h3>
        </div>
        <p className="text-sm text-slate-500 mb-5">
          Upload a PDF constitution file for this club.
        </p>

        {constitutionDownloadUrl && (
          <a
            href={constitutionDownloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-5 inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-indigo-700 font-semibold hover:bg-indigo-100"
          >
            <Download size={16} />
            Download Current Constitution
          </a>
        )}

        {constitutionMessage && (
          <div className="mb-4 rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
            {constitutionMessage}
          </div>
        )}

        <form onSubmit={handleConstitutionUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Constitution PDF
            </label>
            <input
              type="file"
              accept="application/pdf"
              disabled={!canManageSettings}
              onChange={(e) => setConstitutionFile(e.target.files?.[0] || null)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>

          {canManageSettings && (
            <button
              type="submit"
              disabled={constitutionLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-white font-semibold hover:bg-slate-800 disabled:opacity-60"
            >
              <Upload size={16} />
              {constitutionLoading ? "Uploading..." : "Upload Constitution"}
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default ClubSettingsTab;