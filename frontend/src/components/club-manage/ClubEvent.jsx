import React, { useEffect, useMemo, useState } from "react";
import {
  getClubEvents,
  getPendingClubEvents,
  createClubEvent,
  approveClubEvent,
  rejectClubEvent,
  deleteClubEvent,
} from "../../services/clubeventService";

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") ||
  "http://localhost:5000";

const initialForm = {
  title: "",
  description: "",
  category: "Workshop",
  venue: "",
  startDate: "",
  endDate: "",
  image: null,
};

const initialErrors = {
  title: "",
  description: "",
  category: "",
  venue: "",
  startDate: "",
  endDate: "",
  image: "",
};

const normalizeRole = (role) => String(role || "").trim().toLowerCase();

const ALLOWED_CREATOR_ROLES = [
  "club_admin",
  "executive",
  "president",
  "vice_president",
  "secretary",
  "treasurer",
];

const pad = (num) => String(num).padStart(2, "0");

const toDateTimeLocalValue = (date) => {
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const getSameDaySameTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return toDateTimeLocalValue(date);
};

const ClubEvent = ({ clubId, club, membership, permissions, currentUser }) => {
  const [events, setEvents] = useState([]);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState(initialErrors);

  const [loading, setLoading] = useState(false);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [adminSubmittingId, setAdminSubmittingId] = useState(null);
  const [approvalComments, setApprovalComments] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const myClubRole = useMemo(() => {
    return normalizeRole(membership?.role);
  }, [membership]);

  const isSystemAdmin = useMemo(() => {
    return String(currentUser?.role || "").trim().toUpperCase() === "SYSTEM_ADMIN";
  }, [currentUser]);

  const canCreateEvent = useMemo(() => {
    if (!clubId) return false;
    if (isSystemAdmin) return false;
    if (permissions?.canManageClub === true) return true;
    return ALLOWED_CREATOR_ROLES.includes(myClubRole);
  }, [clubId, isSystemAdmin, permissions, myClubRole]);

  const canReviewPendingEvents = useMemo(() => {
    return isSystemAdmin;
  }, [isSystemAdmin]);

  const nowMin = useMemo(() => toDateTimeLocalValue(new Date()), []);
  const endMin = useMemo(() => {
    return form.startDate || nowMin;
  }, [form.startDate, nowMin]);

  const loadEvents = async () => {
    if (!clubId) return;

    try {
      setLoading(true);
      setError("");
      const data = await getClubEvents(clubId);
      setEvents(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      console.error("Error loading events:", err);
      setError(err?.response?.data?.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const loadPendingEvents = async () => {
    if (!canReviewPendingEvents) {
      setPendingEvents([]);
      return;
    }

    try {
      setPendingLoading(true);
      setError("");
      const data = await getPendingClubEvents();
      const allPending = Array.isArray(data) ? data : data?.data || [];
      const filtered = allPending.filter(
        (item) => String(item?.club?._id || item?.club) === String(clubId)
      );
      setPendingEvents(filtered);
    } catch (err) {
      console.error("Error loading pending events:", err);
      setError(err?.response?.data?.message || "Failed to load pending events");
    } finally {
      setPendingLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [clubId]);

  useEffect(() => {
    loadPendingEvents();
  }, [canReviewPendingEvents, clubId]);

  const validateField = (name, value, nextForm = form) => {
    const now = new Date();

    switch (name) {
      case "title":
        if (!value.trim()) return "Event title is required";
        if (value.trim().length < 3) {
          return "Event title must be at least 3 characters";
        }
        if (value.trim().length > 120) {
          return "Event title cannot exceed 120 characters";
        }
        return "";

      case "description":
        if (!value.trim()) return "Description is required";
        if (value.trim().length < 10) {
          return "Description must be at least 10 characters";
        }
        if (value.trim().length > 2000) {
          return "Description cannot exceed 2000 characters";
        }
        return "";

      case "category":
        if (!value.trim()) return "Category is required";
        return "";

      case "venue":
        if (!value.trim()) return "Venue is required";
        if (value.trim().length > 200) {
          return "Venue cannot exceed 200 characters";
        }
        return "";

      case "startDate": {
        if (!value) return "Start date and time are required";

        const start = new Date(value);

        if (Number.isNaN(start.getTime())) {
          return "Please enter a valid start date and time";
        }

        if (start < now) {
          return "Start date and time cannot be in the past";
        }

        return "";
      }

      case "endDate": {
        if (!value) return "End date and time are required";

        const start = new Date(nextForm.startDate);
        const end = new Date(value);

        if (Number.isNaN(end.getTime())) {
          return "Please enter a valid end date and time";
        }

        if (!nextForm.startDate || Number.isNaN(start.getTime())) {
          return "Please select a valid start date and time first";
        }

        if (start < now) {
          return "Start date and time cannot be in the past";
        }

        if (end <= start) {
          return "End date and time cannot be earlier than or equal to the start date and time";
        }

        return "";
      }

      case "image": {
        if (!value) return "";

        const allowedTypes = [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/webp",
        ];

        if (!allowedTypes.includes(value.type)) {
          return "Only JPG, PNG, or WEBP images are allowed";
        }

        const maxSize = 5 * 1024 * 1024;
        if (value.size > maxSize) {
          return "Image size must be 5MB or less";
        }

        return "";
      }

      default:
        return "";
    }
  };

  const validateForm = () => {
    const nextErrors = {
      title: validateField("title", form.title),
      description: validateField("description", form.description),
      category: validateField("category", form.category),
      venue: validateField("venue", form.venue),
      startDate: validateField("startDate", form.startDate, form),
      endDate: validateField("endDate", form.endDate, form),
      image: validateField("image", form.image, form),
    };

    setErrors(nextErrors);
    return !Object.values(nextErrors).some(Boolean);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      const file = files?.[0] || null;

      setForm((prev) => ({
        ...prev,
        image: file,
      }));

      setErrors((prev) => ({
        ...prev,
        image: validateField("image", file),
      }));

      return;
    }

    const nextForm = {
      ...form,
      [name]: value,
    };

    if (name === "startDate") {
      nextForm.endDate = getSameDaySameTime(value);
    }

    setForm(nextForm);

    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value, nextForm),
      ...(name === "startDate" || name === "endDate"
        ? {
            startDate: validateField("startDate", nextForm.startDate, nextForm),
            endDate: validateField("endDate", nextForm.endDate, nextForm),
          }
        : {}),
    }));

    if (error) setError("");
    if (message) setMessage("");
  };

  const resetForm = () => {
    setForm(initialForm);
    setErrors(initialErrors);

    const fileInput = document.getElementById("club-event-image-input");
    if (fileInput) fileInput.value = "";
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!clubId) {
      setError("Club ID is missing");
      return;
    }

    if (!canCreateEvent) {
      setError("You are not allowed to create event requests");
      return;
    }

    const isValid = validateForm();

    if (!isValid) {
      setError("Please fix the highlighted form errors");
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("club", clubId);
      formData.append("title", form.title.trim());
      formData.append("description", form.description.trim());
      formData.append("category", form.category);
      formData.append("venue", form.venue.trim());
      formData.append("startDate", form.startDate);
      formData.append("endDate", form.endDate);

      if (form.image) {
        formData.append("image", form.image);
      }

      const res = await createClubEvent(formData);

      setMessage(res?.message || "Event request submitted for approval");
      resetForm();
      await loadEvents();
    } catch (err) {
      console.error("Error creating event:", err);
      setError(err?.response?.data?.message || "Failed to create event");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (eventId) => {
    try {
      setAdminSubmittingId(eventId);
      setError("");
      setMessage("");

      const res = await approveClubEvent(eventId, {
        approvalComment: approvalComments[eventId] || "",
      });

      setMessage(res?.message || "Event approved successfully");
      await loadPendingEvents();
      await loadEvents();
    } catch (err) {
      console.error("Error approving event:", err);
      setError(err?.response?.data?.message || "Failed to approve event");
    } finally {
      setAdminSubmittingId(null);
    }
  };

  const handleReject = async (eventId) => {
    try {
      setAdminSubmittingId(eventId);
      setError("");
      setMessage("");

      const res = await rejectClubEvent(eventId, {
        approvalComment: approvalComments[eventId] || "",
      });

      setMessage(res?.message || "Event rejected successfully");
      await loadPendingEvents();
      await loadEvents();
    } catch (err) {
      console.error("Error rejecting event:", err);
      setError(err?.response?.data?.message || "Failed to reject event");
    } finally {
      setAdminSubmittingId(null);
    }
  };

  const handleDelete = async (eventId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this event?"
    );
    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      const res = await deleteClubEvent(eventId);
      setMessage(res?.message || "Event deleted successfully");
      await loadEvents();
    } catch (err) {
      console.error("Error deleting event:", err);
      setError(err?.response?.data?.message || "Failed to delete event");
    }
  };

  const formatDateTime = (value) => {
    if (!value) return "Not specified";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Not specified";
    return date.toLocaleString();
  };

  const getImageSrc = (imagePath) => {
    if (!imagePath) return "";
    if (/^https?:\/\//i.test(imagePath)) return imagePath;

    return imagePath.startsWith("/")
      ? `${API_BASE_URL}${imagePath}`
      : `${API_BASE_URL}/${imagePath}`;
  };

  return (
    <div className="space-y-6">
      {message && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      )}

      {!isSystemAdmin && canCreateEvent && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black text-slate-900">
            Create Event Request
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            This event will be sent for approval.
          </p>

          <form
            onSubmit={handleCreateEvent}
            className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Event Title
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Enter event title"
                className={`w-full rounded-xl border px-4 py-3 text-sm ${
                  errors.title ? "border-rose-400" : "border-slate-200"
                }`}
              />
              {errors.title && (
                <p className="mt-1 text-xs text-rose-600">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Category
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className={`w-full rounded-xl border px-4 py-3 text-sm ${
                  errors.category ? "border-rose-400" : "border-slate-200"
                }`}
              >
                <option value="Workshop">Workshop</option>
                <option value="Seminar">Seminar</option>
                <option value="Competition">Competition</option>
                <option value="Meeting">Meeting</option>
                <option value="Social">Social</option>
                <option value="Awareness">Awareness</option>
                <option value="Fundraiser">Fundraiser</option>
                <option value="Training">Training</option>
                <option value="Other">Other</option>
              </select>
              {errors.category && (
                <p className="mt-1 text-xs text-rose-600">{errors.category}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Venue
              </label>
              <input
                type="text"
                name="venue"
                value={form.venue}
                onChange={handleChange}
                placeholder="Enter venue"
                className={`w-full rounded-xl border px-4 py-3 text-sm ${
                  errors.venue ? "border-rose-400" : "border-slate-200"
                }`}
              />
              {errors.venue && (
                <p className="mt-1 text-xs text-rose-600">{errors.venue}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Start Date & Time
              </label>
              <input
                type="datetime-local"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                min={nowMin}
                className={`w-full rounded-xl border px-4 py-3 text-sm ${
                  errors.startDate ? "border-rose-400" : "border-slate-200"
                }`}
              />
              {errors.startDate && (
                <p className="mt-1 text-xs text-rose-600">{errors.startDate}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                End Date & Time
              </label>
              <input
                type="datetime-local"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                min={endMin}
                disabled={!form.startDate}
                className={`w-full rounded-xl border px-4 py-3 text-sm ${
                  errors.endDate ? "border-rose-400" : "border-slate-200"
                } ${!form.startDate ? "bg-slate-100 cursor-not-allowed" : ""}`}
              />
              {errors.endDate && (
                <p className="mt-1 text-xs text-rose-600">{errors.endDate}</p>
              )}
              {!form.startDate && (
                <p className="mt-1 text-xs text-slate-500">
                  Select the start date first.
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Event Image
              </label>
              <input
                id="club-event-image-input"
                type="file"
                name="image"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleChange}
                className={`w-full rounded-xl border px-4 py-3 text-sm ${
                  errors.image ? "border-rose-400" : "border-slate-200"
                }`}
              />
              {errors.image && (
                <p className="mt-1 text-xs text-rose-600">{errors.image}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="5"
                placeholder="Enter event description"
                className={`w-full rounded-xl border px-4 py-3 text-sm ${
                  errors.description ? "border-rose-400" : "border-slate-200"
                }`}
              />
              {errors.description && (
                <p className="mt-1 text-xs text-rose-600">
                  {errors.description}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit Event Request"}
              </button>
            </div>
          </form>
        </div>
      )}

      {isSystemAdmin && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black text-slate-900">
            Pending Event Requests
          </h2>

          {pendingLoading ? (
            <p className="mt-4 text-slate-500">Loading pending events...</p>
          ) : pendingEvents.length === 0 ? (
            <p className="mt-4 text-slate-500">No pending event requests.</p>
          ) : (
            <div className="mt-5 space-y-4">
              {pendingEvents.map((event) => (
                <div
                  key={event._id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  {event.image && (
                    <img
                      src={getImageSrc(event.image)}
                      alt={event.title}
                      className="mb-4 h-56 w-full rounded-2xl object-cover"
                    />
                  )}

                  <h3 className="text-lg font-bold text-slate-900">
                    {event.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Club: {event.club?.name || club?.name || "N/A"}
                  </p>
                  <p className="text-sm text-slate-600">
                    Category: {event.category}
                  </p>
                  <p className="text-sm text-slate-600">Venue: {event.venue}</p>
                  <p className="text-sm text-slate-600">
                    Start: {formatDateTime(event.startDate)}
                  </p>
                  <p className="text-sm text-slate-600">
                    End: {formatDateTime(event.endDate)}
                  </p>
                  <p className="mt-3 text-sm text-slate-700">
                    {event.description}
                  </p>

                  <textarea
                    rows="3"
                    placeholder="Optional approval/rejection comment"
                    value={approvalComments[event._id] || ""}
                    onChange={(e) =>
                      setApprovalComments((prev) => ({
                        ...prev,
                        [event._id]: e.target.value,
                      }))
                    }
                    className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                  />

                  <div className="mt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => handleApprove(event._id)}
                      disabled={adminSubmittingId === event._id}
                      className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReject(event._id)}
                      disabled={adminSubmittingId === event._id}
                      className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!isSystemAdmin && !canCreateEvent && (
        <div className="rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
          You can view approved events here. Only club officers can create
          event requests.
        </div>
      )}

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-black text-slate-900">Events</h2>

        {loading ? (
          <p className="mt-4 text-slate-500">Loading events...</p>
        ) : events.length === 0 ? (
          <p className="mt-4 text-slate-500">No events found.</p>
        ) : (
          <div className="mt-5 space-y-4">
            {events.map((event) => (
              <div
                key={event._id}
                className="overflow-hidden rounded-2xl border border-slate-200"
              >
                {event.image && (
                  <img
                    src={getImageSrc(event.image)}
                    alt={event.title}
                    className="h-56 w-full object-cover"
                  />
                )}

                <div className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-lg font-bold text-slate-900">
                      {event.title}
                    </h3>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        event.approvalStatus === "approved"
                          ? "bg-emerald-100 text-emerald-700"
                          : event.approvalStatus === "rejected"
                          ? "bg-rose-100 text-rose-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {event.approvalStatus || "approved"}
                    </span>
                  </div>

                  <p className="text-sm text-slate-600">
                    Category: {event.category}
                  </p>
                  <p className="text-sm text-slate-600">Venue: {event.venue}</p>
                  <p className="text-sm text-slate-600">
                    Start: {formatDateTime(event.startDate)}
                  </p>
                  <p className="text-sm text-slate-600">
                    End: {formatDateTime(event.endDate)}
                  </p>

                  <p className="mt-3 text-sm text-slate-700">
                    {event.description}
                  </p>

                  {event.approvalComment && (
                    <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                      <span className="font-semibold">Admin comment:</span>{" "}
                      {event.approvalComment}
                    </div>
                  )}

                  {!isSystemAdmin && canCreateEvent && (
                    <div className="mt-4 flex gap-3">
                      <button
                        type="button"
                        onClick={() => handleDelete(event._id)}
                        className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClubEvent;