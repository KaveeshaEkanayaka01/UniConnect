import React, { useEffect, useMemo, useState } from "react";
import {
  getClubMentors,
  getMentorRequests,
  updateMentorshipRequestStatus,
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

const MentorshipTab = ({ clubId, currentUser, dashboard }) => {
  const [mentors, setMentors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const currentUserId = String(currentUser?._id || "");

  const isSystemAdmin =
    String(currentUser?.role || "").trim().toUpperCase() === "SYSTEM_ADMIN";

  const canManageClub =
    isSystemAdmin || Boolean(dashboard?.permissions?.canManageClub);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const [mentorsData, mentorRequestsData] = await Promise.all([
        getClubMentors(clubId),
        getMentorRequests(),
      ]);

      const mentorList = Array.isArray(mentorsData)
        ? mentorsData
        : mentorsData?.data || [];

      const requestList = Array.isArray(mentorRequestsData)
        ? mentorRequestsData
        : mentorRequestsData?.data || [];

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
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to load mentorship data");
      setMentors([]);
      setRequests([]);
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

  const pendingRequests = useMemo(() => {
    return visibleRequests.filter(
      (item) => String(item?.status || "").toUpperCase() === "PENDING"
    );
  }, [visibleRequests]);

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
      setError(err?.response?.data?.message || `Failed to ${status.toLowerCase()} request`);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-white rounded-xl shadow-sm border">
        <div>
          <h2 className="text-xl font-semibold">Mentorship Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage mentor profiles and review mentorship requests for this club.
          </p>
        </div>

        {(error || success) && (
          <div className="mt-4 space-y-3">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700 text-sm">
                {success}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-4 bg-white rounded-xl shadow-sm border">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold">Available Mentors</h3>
            <p className="text-sm text-gray-600">
              Mentor profiles created for this club.
            </p>
          </div>
          <span className="text-sm font-semibold text-indigo-600">
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
                  className="border rounded-xl p-4 shadow-sm bg-gray-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-lg font-semibold">
                        {mentorUser.fullName || mentorUser.name || "Mentor"}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {mentorProfile.title || "Mentor"}
                      </p>
                    </div>

                    {isOwnProfile && (
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-indigo-100 text-indigo-700">
                        Your Profile
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-700 mt-3">
                    {mentorProfile.bio || "No bio added yet."}
                  </p>

                  <div className="mt-3">
                    <p className="text-sm font-medium">Skills</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {(mentorProfile.skills || []).length > 0 ? (
                        mentorProfile.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-500">
                          No skills added
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3">
                    <p className="text-sm font-medium">Interests</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {(mentorProfile.interests || []).length > 0 ? (
                        mentorProfile.interests.map((interest, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 rounded-full bg-purple-100 text-purple-700 text-xs"
                          >
                            {interest}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-500">
                          No interests added
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 text-sm text-gray-700 space-y-1">
                    <p>Level: {mentorProfile.expertiseLevel || "Not specified"}</p>
                    <p>Availability: {mentorProfile.availability || "Unknown"}</p>
                    <p>
                      Capacity: {mentorProfile.currentMentees || 0}/
                      {mentorProfile.maxMentees || 0}
                    </p>
                    <p>Status: {mentorProfile.isActive ? "Active" : "Inactive"}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="p-4 bg-white rounded-xl shadow-sm border">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold">Mentorship Requests</h3>
            <p className="text-sm text-gray-600">
              Review requests sent by students to mentors in this club.
            </p>
          </div>
          <span className="text-sm font-semibold text-indigo-600">
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
              const studentName =
                request?.student?.fullName ||
                request?.student?.name ||
                "Unknown Student";

              const mentorName =
                request?.mentor?.fullName ||
                request?.mentor?.name ||
                "Unknown Mentor";

              const requestId = request?._id;
              const isPending =
                String(request?.status || "").toUpperCase() === "PENDING";

              return (
                <div
                  key={requestId}
                  className="rounded-xl border border-slate-200 p-4 bg-slate-50"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h4 className="text-base font-semibold text-slate-900">
                          {studentName}
                        </h4>
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadgeClass(
                            request?.status
                          )}`}
                        >
                          {request?.status || "PENDING"}
                        </span>
                      </div>

                      <p className="text-sm text-slate-600">
                        <span className="font-medium">Mentor:</span> {mentorName}
                      </p>

                      <p className="text-sm text-slate-600">
                        <span className="font-medium">Student Level:</span>{" "}
                        {request?.studentLevel || "Not specified"}
                      </p>

                      <p className="text-sm text-slate-600">
                        <span className="font-medium">Match Score:</span>{" "}
                        {request?.matchScore ?? 0}
                      </p>

                      <p className="text-sm text-slate-600">
                        <span className="font-medium">Skills:</span>{" "}
                        {(request?.studentSkills || []).length > 0
                          ? request.studentSkills.join(", ")
                          : "Not specified"}
                      </p>

                      <p className="text-sm text-slate-600">
                        <span className="font-medium">Interests:</span>{" "}
                        {(request?.studentInterests || []).length > 0
                          ? request.studentInterests.join(", ")
                          : "Not specified"}
                      </p>

                      <p className="text-sm text-slate-700">
                        <span className="font-medium">Message:</span>{" "}
                        {request?.message || "No message provided"}
                      </p>
                    </div>

                    {isPending && (
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateStatus(requestId, "ACCEPTED")
                          }
                          disabled={actionLoadingId === requestId}
                          className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
                        >
                          {actionLoadingId === requestId
                            ? "Updating..."
                            : "Accept"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateStatus(requestId, "REJECTED")
                          }
                          disabled={actionLoadingId === requestId}
                          className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                        >
                          {actionLoadingId === requestId
                            ? "Updating..."
                            : "Reject"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {pendingRequests.length > 0 && (
          <div className="mt-4 text-sm text-slate-600">
            Pending requests:{" "}
            <span className="font-semibold text-slate-900">
              {pendingRequests.length}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorshipTab;