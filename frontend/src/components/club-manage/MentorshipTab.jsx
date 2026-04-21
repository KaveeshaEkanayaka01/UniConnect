import React, { useEffect, useMemo, useState } from "react";
import {
  getClubMentors,
  getMentorRequests,
  updateMentorshipRequestStatus,
  createMentorProfile,
  getMyMentorProfile,
  updateMyMentorProfile,
  deleteMyMentorProfile,
} from "../../services/mentorshipService";

const statusBadgeClass = (status) => {
  const normalized = String(status || "").toUpperCase();

  if (normalized === "ACCEPTED") {
    return "bg-green-100 text-green-700";
  }

  if (normalized === "REJECTED") {
    return "bg-red-100 text-red-700";
  }

  if (normalized === "COMPLETED") {
    return "bg-blue-100 text-blue-700";
  }

  if (normalized === "CANCELLED") {
    return "bg-slate-200 text-slate-700";
  }

  return "bg-yellow-100 text-yellow-700";
};

const initialForm = {
  title: "",
  bio: "",
  skills: "",
  interests: "",
  expertiseLevel: "Intermediate",
  availability: "Available",
  maxMentees: 5,
};

const MentorshipTab = ({ clubId, currentUser, dashboard }) => {
  const [mentors, setMentors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submittingProfile, setSubmittingProfile] = useState(false);
  const [deletingProfile, setDeletingProfile] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [mentorForm, setMentorForm] = useState(initialForm);
  const [existingProfile, setExistingProfile] = useState(null);

  const currentUserId = String(currentUser?._id || "");

  const isSystemAdmin =
    String(currentUser?.role || "").trim().toUpperCase() === "SYSTEM_ADMIN";

  const canManageClub =
    isSystemAdmin || Boolean(dashboard?.permissions?.canManageClub);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [mentorsData, mentorRequestsData, myProfileData] = await Promise.all([
        getClubMentors(clubId),
        getMentorRequests(),
        getMyMentorProfile(clubId),
      ]);

      const mentorList = Array.isArray(mentorsData)
        ? mentorsData
        : mentorsData?.data || [];

      const requestList = Array.isArray(mentorRequestsData)
        ? mentorRequestsData
        : mentorRequestsData?.data || [];

      const myProfile = myProfileData?.data || myProfileData || null;

      const clubMentorIds = new Set(
        mentorList.map((item) => String(item?.mentor?._id || item?.mentor || ""))
      );

      const filteredRequests = requestList.filter((request) => {
        const requestClubId = String(request?.club?._id || request?.club || "");
        const requestMentorId = String(
          request?.mentor?._id || request?.mentor || ""
        );

        if (requestClubId === String(clubId)) return true;
        if (clubMentorIds.has(requestMentorId)) return true;

        return false;
      });

      setMentors(mentorList);
      setRequests(filteredRequests);
      setExistingProfile(myProfile);

      if (myProfile) {
        setMentorForm({
          title: myProfile.title || "",
          bio: myProfile.bio || "",
          skills: Array.isArray(myProfile.skills)
            ? myProfile.skills.join(", ")
            : "",
          interests: Array.isArray(myProfile.interests)
            ? myProfile.interests.join(", ")
            : "",
          expertiseLevel: myProfile.expertiseLevel || "Intermediate",
          availability: myProfile.availability || "Available",
          maxMentees: Number(myProfile.maxMentees || 5),
        });
      } else {
        setMentorForm(initialForm);
      }
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to load mentorship data");
      setMentors([]);
      setRequests([]);
      setExistingProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clubId) {
      loadData();
    }
  }, [clubId]);

  const myMentorProfileIds = useMemo(() => {
    return new Set(
      mentors
        .filter(
          (item) =>
            String(item?.mentor?._id || item?.mentor || "") === currentUserId
        )
        .map((item) => String(item?.mentor?._id || item?.mentor || ""))
    );
  }, [mentors, currentUserId]);

  const visibleRequests = useMemo(() => {
    if (canManageClub) return requests;

    return requests.filter((request) => {
      const mentorId = String(request?.mentor?._id || request?.mentor || "");
      return myMentorProfileIds.has(mentorId);
    });
  }, [requests, canManageClub, myMentorProfileIds]);

  const validateForm = () => {
    const nextErrors = {};
    const trimmedTitle = String(mentorForm.title || "").trim();
    const trimmedBio = String(mentorForm.bio || "").trim();
    const skillsList = String(mentorForm.skills || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    const interestsList = String(mentorForm.interests || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    const maxMentees = Number(mentorForm.maxMentees);

    if (!trimmedTitle) {
      nextErrors.title = "Title is required";
    } else if (trimmedTitle.length < 2) {
      nextErrors.title = "Title must be at least 2 characters";
    }

    if (!trimmedBio) {
      nextErrors.bio = "Bio is required";
    } else if (trimmedBio.length > 500) {
      nextErrors.bio = "Bio cannot exceed 500 characters";
    }

    if (skillsList.length === 0) {
      nextErrors.skills = "Enter at least one skill";
    }

    if (interestsList.length === 0) {
      nextErrors.interests = "Enter at least one interest";
    }

    if (!Number.isFinite(maxMentees) || maxMentees < 1) {
      nextErrors.maxMentees = "Max mentees must be at least 1";
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setMentorForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setFormErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleSubmitProfile = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setError("Please fix the form errors and try again");
      setSuccess("");
      return;
    }

    try {
      setSubmittingProfile(true);
      setError("");
      setSuccess("");

      const payload = {
        title: mentorForm.title.trim(),
        bio: mentorForm.bio.trim(),
        skills: mentorForm.skills,
        interests: mentorForm.interests,
        expertiseLevel: mentorForm.expertiseLevel,
        availability: mentorForm.availability,
        maxMentees: Number(mentorForm.maxMentees),
      };

      if (existingProfile?._id) {
        await updateMyMentorProfile(clubId, payload);
        setSuccess("Mentor profile updated successfully");
      } else {
        await createMentorProfile(clubId, payload);
        setSuccess("Mentor profile created successfully");
      }

      await loadData();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to save mentor profile");
      setSuccess("");
    } finally {
      setSubmittingProfile(false);
    }
  };

  const handleEditProfile = () => {
    if (!existingProfile) return;

    setMentorForm({
      title: existingProfile.title || "",
      bio: existingProfile.bio || "",
      skills: Array.isArray(existingProfile.skills)
        ? existingProfile.skills.join(", ")
        : "",
      interests: Array.isArray(existingProfile.interests)
        ? existingProfile.interests.join(", ")
        : "",
      expertiseLevel: existingProfile.expertiseLevel || "Intermediate",
      availability: existingProfile.availability || "Available",
      maxMentees: Number(existingProfile.maxMentees || 5),
    });

    setError("");
    setSuccess("You can now edit your profile below");
    setFormErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteProfile = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your mentor profile?"
    );

    if (!confirmed) return;

    try {
      setDeletingProfile(true);
      setError("");
      setSuccess("");

      await deleteMyMentorProfile(clubId);

      setExistingProfile(null);
      setMentorForm(initialForm);
      setFormErrors({});
      setSuccess("Mentor profile deleted successfully");
      await loadData();
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message || "Failed to delete mentor profile"
      );
    } finally {
      setDeletingProfile(false);
    }
  };

  const handleUpdateStatus = async (requestId, status) => {
    try {
      setActionLoadingId(requestId);
      setError("");
      setSuccess("");

      await updateMentorshipRequestStatus(requestId, { status });

      setSuccess(`Request ${status.toLowerCase()} successfully`);
      await loadData();
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          `Failed to ${status.toLowerCase()} request`
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-white rounded-xl shadow-sm border border-[#0B1E8A]/10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-[#0B1E8A]">
              {existingProfile ? "Update Mentor Profile" : "Create Mentor Profile"}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Add your expertise so students can find you.
            </p>
          </div>

          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="rounded-lg border border-[#0B1E8A]/10 px-4 py-2 text-sm font-medium text-[#0B1E8A] hover:bg-[#f5f8ff] disabled:opacity-60"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {(error || success || existingProfile) && (
          <div className="mt-4 space-y-3">
            {existingProfile && !error && (
              <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700 text-sm">
                You already have a mentor profile in this club. You can update or delete it below.
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-lg border border-[#0B1E8A]/10 bg-[#0B1E8A]/5 px-4 py-3 text-[#F36C21] text-sm">
                {success}
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmitProfile} className="mt-5 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-[#0B1E8A] mb-2">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={mentorForm.title}
              onChange={handleFormChange}
              maxLength={100}
              className="w-full rounded-xl border border-[#0B1E8A]/15 px-4 py-3 outline-none focus:ring-2 focus:ring-[#0B1E8A]"
              placeholder="Enter mentor title"
            />
            {formErrors.title && (
              <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#0B1E8A] mb-2">
              Bio
            </label>
            <textarea
              name="bio"
              value={mentorForm.bio}
              onChange={handleFormChange}
              rows={4}
              maxLength={500}
              className="w-full rounded-xl border border-[#0B1E8A]/15 px-4 py-3 outline-none focus:ring-2 focus:ring-[#0B1E8A]"
              placeholder="Tell students about your background and expertise"
            />
            <div className="mt-1 flex items-center justify-between">
              {formErrors.bio ? (
                <p className="text-sm text-red-600">{formErrors.bio}</p>
              ) : (
                <span className="text-xs text-gray-500">
                  Max 500 characters
                </span>
              )}
              <span className="text-xs text-gray-500">
                {String(mentorForm.bio || "").length}/500
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#0B1E8A] mb-2">
              Skills
            </label>
            <input
              type="text"
              name="skills"
              value={mentorForm.skills}
              onChange={handleFormChange}
              className="w-full rounded-xl border border-[#0B1E8A]/15 px-4 py-3 outline-none focus:ring-2 focus:ring-[#0B1E8A]"
              placeholder="Public Speaking, Leadership"
            />
            {formErrors.skills && (
              <p className="mt-1 text-sm text-red-600">{formErrors.skills}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#0B1E8A] mb-2">
              Interests
            </label>
            <input
              type="text"
              name="interests"
              value={mentorForm.interests}
              onChange={handleFormChange}
              className="w-full rounded-xl border border-[#0B1E8A]/15 px-4 py-3 outline-none focus:ring-2 focus:ring-[#0B1E8A]"
              placeholder="Team Building, Personal Development"
            />
            {formErrors.interests && (
              <p className="mt-1 text-sm text-red-600">{formErrors.interests}</p>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#0B1E8A] mb-2">
                Expertise Level
              </label>
              <select
                name="expertiseLevel"
                value={mentorForm.expertiseLevel}
                onChange={handleFormChange}
                className="w-full rounded-xl border border-[#0B1E8A]/15 px-4 py-3 outline-none focus:ring-2 focus:ring-[#0B1E8A]"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0B1E8A] mb-2">
                Availability
              </label>
              <select
                name="availability"
                value={mentorForm.availability}
                onChange={handleFormChange}
                className="w-full rounded-xl border border-[#0B1E8A]/15 px-4 py-3 outline-none focus:ring-2 focus:ring-[#0B1E8A]"
              >
                <option value="Available">Available</option>
                <option value="Busy">Busy</option>
                <option value="Unavailable">Unavailable</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0B1E8A] mb-2">
                Max Mentees
              </label>
              <input
                type="number"
                min="1"
                name="maxMentees"
                value={mentorForm.maxMentees}
                onChange={handleFormChange}
                className="w-full rounded-xl border border-[#0B1E8A]/15 px-4 py-3 outline-none focus:ring-2 focus:ring-[#0B1E8A]"
              />
              {formErrors.maxMentees && (
                <p className="mt-1 text-sm text-red-600">
                  {formErrors.maxMentees}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={submittingProfile}
              className="bg-[#F36C21] text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-60"
            >
              {submittingProfile
                ? existingProfile
                  ? "Updating..."
                  : "Creating..."
                : existingProfile
                ? "Update Mentor Profile"
                : "Create Mentor Profile"}
            </button>

            {existingProfile && (
              <>
                <button
                  type="button"
                  onClick={handleEditProfile}
                  className="border border-[#0B1E8A]/15 text-[#0B1E8A] px-6 py-3 rounded-xl font-semibold hover:bg-[#f5f8ff]"
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={handleDeleteProfile}
                  disabled={deletingProfile}
                  className="border border-red-200 bg-red-50 text-red-700 px-6 py-3 rounded-xl font-semibold hover:bg-red-100 disabled:opacity-60"
                >
                  {deletingProfile ? "Deleting..." : "Delete"}
                </button>
              </>
            )}
          </div>
        </form>
      </div>

      <div className="p-4 bg-white rounded-xl shadow-sm border border-[#0B1E8A]/10">
        <div>
          <h2 className="text-xl font-semibold text-[#0B1E8A]">
            Mentorship Management
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage mentor profiles and review mentorship requests for this club.
          </p>
        </div>
      </div>

      <div className="p-4 bg-white rounded-xl shadow-sm border border-[#0B1E8A]/10">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-[#0B1E8A]">
              Available Mentors
            </h3>
            <p className="text-sm text-gray-600">
              Mentor profiles created for this club.
            </p>
          </div>
          <span className="text-sm font-semibold text-[#F36C21]">
            {mentors.length} total
          </span>
        </div>

        {loading ? (
          <p className="text-gray-600">Loading mentors...</p>
        ) : mentors.length === 0 ? (
          <p className="text-gray-600">No mentors found for this club.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {mentors.map((mentorProfile) => {
              const mentorUser = mentorProfile.mentor || {};
              const mentorId = String(mentorUser._id || mentorProfile.mentor);
              const isOwnProfile = mentorId === currentUserId;

              return (
                <div
                  key={mentorProfile._id}
                  className="border border-[#0B1E8A]/10 rounded-xl p-4 shadow-sm bg-[#0B1E8A]/5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-lg font-semibold text-[#0B1E8A]">
                        {mentorUser.fullName || mentorUser.name || "Mentor"}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {mentorProfile.title || "Mentor"}
                      </p>
                    </div>

                    {isOwnProfile && (
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-white text-[#F36C21] border border-[#0B1E8A]/10">
                        Your Profile
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mt-3">
                    {mentorProfile.bio || "No bio added yet."}
                  </p>

                  <div className="mt-3">
                    <p className="text-sm font-medium text-[#0B1E8A]">Skills</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {(mentorProfile.skills || []).length > 0 ? (
                        mentorProfile.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 rounded-full bg-white border border-[#0B1E8A]/10 text-[#F36C21] text-xs"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-600">
                          No skills added
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3">
                    <p className="text-sm font-medium text-[#0B1E8A]">Interests</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {(mentorProfile.interests || []).length > 0 ? (
                        mentorProfile.interests.map((interest, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 rounded-full bg-white border border-[#0B1E8A]/10 text-[#F36C21] text-xs"
                          >
                            {interest}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-600">
                          No interests added
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-sm text-gray-600">
                    <span>
                      <strong className="text-[#0B1E8A]">Level:</strong>{" "}
                      {mentorProfile.expertiseLevel || "Not set"}
                    </span>
                    <span>
                      <strong className="text-[#0B1E8A]">Availability:</strong>{" "}
                      {mentorProfile.availability || "Not set"}
                    </span>
                    <span>
                      <strong className="text-[#0B1E8A]">Capacity:</strong>{" "}
                      {Number(mentorProfile.currentMentees || 0)}/
                      {Number(mentorProfile.maxMentees || 0)}
                    </span>
                  </div>

                  {isOwnProfile && (
                    <div className="mt-4 flex gap-3">
                      <button
                        type="button"
                        onClick={handleEditProfile}
                        className="px-4 py-2 rounded-lg border border-[#0B1E8A]/15 text-[#0B1E8A] font-medium hover:bg-white"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={handleDeleteProfile}
                        disabled={deletingProfile}
                        className="px-4 py-2 rounded-lg border border-red-200 bg-red-50 text-red-700 font-medium hover:bg-red-100 disabled:opacity-60"
                      >
                        {deletingProfile ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="p-4 bg-white rounded-xl shadow-sm border border-[#0B1E8A]/10">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-[#0B1E8A]">
              Mentorship Requests
            </h3>
            <p className="text-sm text-gray-600">
              Review incoming mentorship requests.
            </p>
          </div>
          <span className="text-sm font-semibold text-[#F36C21]">
            {visibleRequests.length} total
          </span>
        </div>

        {loading ? (
          <p className="text-gray-600">Loading requests...</p>
        ) : visibleRequests.length === 0 ? (
          <p className="text-gray-600">No mentorship requests found.</p>
        ) : (
          <div className="space-y-4">
            {visibleRequests.map((request) => {
              const requestId = String(request?._id || "");
              const isPending =
                String(request?.status || "").toUpperCase() === "PENDING";

              return (
                <div
                  key={requestId}
                  className="border border-[#0B1E8A]/10 rounded-xl p-4 bg-[#0B1E8A]/5"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="space-y-2">
                      <h4 className="text-lg font-semibold text-[#0B1E8A]">
                        {request?.student?.fullName ||
                          request?.student?.name ||
                          "Student"}
                      </h4>

                      <p className="text-sm text-gray-600">
                        {request?.message || "No message provided"}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${statusBadgeClass(
                            request?.status
                          )}`}
                        >
                          {request?.status || "PENDING"}
                        </span>

                        {request?.matchScore !== undefined && (
                          <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-white text-[#0B1E8A] border border-[#0B1E8A]/10">
                            Match Score: {request.matchScore}
                          </span>
                        )}
                      </div>
                    </div>

                    {isPending && (
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateStatus(requestId, "ACCEPTED")
                          }
                          disabled={actionLoadingId === requestId}
                          className="bg-[#F36C21] text-white px-4 py-2 rounded-lg disabled:opacity-60"
                        >
                          {actionLoadingId === requestId ? "Saving..." : "Accept"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateStatus(requestId, "REJECTED")
                          }
                          disabled={actionLoadingId === requestId}
                          className="border border-[#0B1E8A]/20 px-4 py-2 rounded-lg text-[#0B1E8A] disabled:opacity-60"
                        >
                          {actionLoadingId === requestId ? "Saving..." : "Reject"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorshipTab;