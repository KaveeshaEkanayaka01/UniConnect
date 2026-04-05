import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  CalendarDays,
  Vote,
  Users,
  Settings,
  Wallet,
  Download,
  FileText,
  Clock3,
  MapPin,
  BadgeCheck,
  UserRound,
  Handshake,
  X,
  Sparkles,
} from "lucide-react";
import { getClubDashboard } from "../services/clubService";
import { getClubBudgets } from "../services/budgetService";
import { getClubExpenses } from "../services/expenseService";
import { getClubEvents } from "../services/clubeventService";
import { getClubElections } from "../services/electionService";
import {
  getClubMentors,
  getRecommendedMentors,
  createMentorshipRequest,
  getMyMentorshipRequests,
} from "../services/mentorshipService";

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") ||
  "http://localhost:5000";

const getImageSrc = (imageUrl) => {
  if (!imageUrl) return "";
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;

  return imageUrl.startsWith("/")
    ? `${API_BASE_URL}${imageUrl}`
    : `${API_BASE_URL}/${imageUrl}`;
};

const splitTags = (value) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const ClubDashboard = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);

  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [events, setEvents] = useState([]);
  const [elections, setElections] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [recommendedMentors, setRecommendedMentors] = useState([]);
  const [myMentorshipRequests, setMyMentorshipRequests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [budgetsLoading, setBudgetsLoading] = useState(true);
  const [expensesLoading, setExpensesLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [electionsLoading, setElectionsLoading] = useState(true);
  const [mentorshipsLoading, setMentorshipsLoading] = useState(true);
  const [recommendLoading, setRecommendLoading] = useState(false);

  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [requestSuccess, setRequestSuccess] = useState("");

  const [recommendationForm, setRecommendationForm] = useState({
    studentSkills: "",
    studentInterests: "",
    studentLevel: "Beginner",
  });

  const [requestForm, setRequestForm] = useState({
    studentSkills: "",
    studentInterests: "",
    studentLevel: "Beginner",
    message: "",
  });

  const loadDashboard = async () => {
    try {
      const res = await getClubDashboard(clubId);
      setDashboard(res?.data || res);
    } catch (error) {
      console.error("Error loading club dashboard:", error);
      alert(error?.response?.data?.message || "Failed to load club dashboard");
      navigate("/my-clubs");
    }
  };

  const loadBudgets = async () => {
    try {
      setBudgetsLoading(true);
      const res = await getClubBudgets(clubId);
      setBudgets(Array.isArray(res) ? res : res?.data || []);
    } catch (error) {
      console.error("Error loading budgets:", error);
      setBudgets([]);
    } finally {
      setBudgetsLoading(false);
    }
  };

  const loadExpenses = async () => {
    try {
      setExpensesLoading(true);
      const res = await getClubExpenses(clubId);
      setExpenses(Array.isArray(res) ? res : res?.data || []);
    } catch (error) {
      console.error("Error loading expenses:", error);
      setExpenses([]);
    } finally {
      setExpensesLoading(false);
    }
  };

  const loadEvents = async () => {
    try {
      setEventsLoading(true);
      const res = await getClubEvents(clubId);
      setEvents(Array.isArray(res) ? res : res?.data || []);
    } catch (error) {
      console.error("Error loading events:", error);
      setEvents([]);
    } finally {
      setEventsLoading(false);
    }
  };

  const loadElections = async () => {
    try {
      setElectionsLoading(true);
      const res = await getClubElections(clubId);
      setElections(Array.isArray(res) ? res : res?.data || []);
    } catch (error) {
      console.error("Error loading elections:", error);
      setElections([]);
    } finally {
      setElectionsLoading(false);
    }
  };

  const loadMentorships = async () => {
    try {
      setMentorshipsLoading(true);

      const [mentorRes, requestRes] = await Promise.all([
        getClubMentors(clubId),
        getMyMentorshipRequests(),
      ]);

      setMentors(Array.isArray(mentorRes) ? mentorRes : mentorRes?.data || []);
      setMyMentorshipRequests(
        Array.isArray(requestRes) ? requestRes : requestRes?.data || []
      );
    } catch (error) {
      console.error("Error loading mentorships:", error);
      setMentors([]);
      setMyMentorshipRequests([]);
    } finally {
      setMentorshipsLoading(false);
    }
  };

  const loadPageData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadDashboard(),
        loadBudgets(),
        loadExpenses(),
        loadEvents(),
        loadElections(),
        loadMentorships(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clubId) {
      loadPageData();
    }
  }, [clubId]);

  useEffect(() => {
    if (dashboard?.club?.name) {
      document.title = `${dashboard.club.name} Club Dashboard`;
    } else {
      document.title = "Club Dashboard";
    }

    return () => {
      document.title = "UniConnect";
    };
  }, [dashboard]);

  const totalBudgetAmount = useMemo(() => {
    return budgets.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }, [budgets]);

  const totalExpenseAmount = useMemo(() => {
    return expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }, [expenses]);

  const activeElectionCount = useMemo(() => {
    return elections.filter((item) => {
      const status = String(item?.status || "").toLowerCase();
      return status === "ongoing";
    }).length;
  }, [elections]);

  const upcomingEventCount = useMemo(() => {
    const now = new Date();
    return events.filter((item) => {
      const eventDate = new Date(
        item?.date || item?.eventDate || item?.startDate
      );
      return !Number.isNaN(eventDate.getTime()) && eventDate >= now;
    }).length;
  }, [events]);

  const activeMentorshipCount = useMemo(() => {
    return mentors.filter((item) => {
      return item?.isActive !== false && item?.availability !== "Unavailable";
    }).length;
  }, [mentors]);

  const pendingMentorIds = useMemo(() => {
    return new Set(
      myMentorshipRequests
        .filter((item) => String(item.status || "").toUpperCase() === "PENDING")
        .filter((item) => String(item.club?._id || item.club) === String(clubId))
        .map((item) => String(item.mentor?._id || item.mentor))
    );
  }, [myMentorshipRequests, clubId]);

  const displayedMentors =
    recommendedMentors.length > 0 ? recommendedMentors : mentors;

  const formatDate = (value) => {
    if (!value) return "Date not specified";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Date not specified";
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
  };

  const formatDateTime = (value) => {
    if (!value) return "Not specified";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Not specified";
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatTimeOnly = (value) => {
    if (!value) return "Not specified";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Not specified";
    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatEventSchedule = (startValue, endValue) => {
    if (!startValue && !endValue) return "Date not specified";

    const start = startValue ? new Date(startValue) : null;
    const end = endValue ? new Date(endValue) : null;

    const validStart = start && !Number.isNaN(start.getTime());
    const validEnd = end && !Number.isNaN(end.getTime());

    if (!validStart && !validEnd) return "Date not specified";
    if (validStart && !validEnd) return formatDateTime(startValue);
    if (!validStart && validEnd) return formatDateTime(endValue);

    const sameDay = start.toDateString() === end.toDateString();

    if (sameDay) {
      return `${formatDate(startValue)} • ${formatTimeOnly(
        startValue
      )} - ${formatTimeOnly(endValue)}`;
    }

    return `${formatDateTime(startValue)} - ${formatDateTime(endValue)}`;
  };

  const getElectionStatusBadge = (status) => {
    const normalized = String(status || "").toLowerCase();

    if (normalized === "upcoming") return "bg-blue-100 text-blue-700";
    if (normalized === "ongoing") return "bg-green-100 text-green-700";
    if (normalized === "completed") return "bg-slate-100 text-slate-700";
    if (normalized === "cancelled") return "bg-red-100 text-red-700";

    return "bg-slate-100 text-slate-700";
  };

  const openRequestModal = (mentor) => {
    setSelectedMentor(mentor);
    setRequestError("");
    setRequestSuccess("");
    setRequestForm({
      studentSkills: recommendationForm.studentSkills,
      studentInterests: recommendationForm.studentInterests,
      studentLevel: recommendationForm.studentLevel,
      message: "",
    });
    setRequestModalOpen(true);
  };

  const closeRequestModal = () => {
    setRequestModalOpen(false);
    setSelectedMentor(null);
    setRequestError("");
    setRequestSuccess("");
  };

  const handleRecommendationChange = (e) => {
    const { name, value } = e.target;
    setRecommendationForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRequestFormChange = (e) => {
    const { name, value } = e.target;
    setRequestForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFindBestMentors = async () => {
    try {
      setRecommendLoading(true);

      const payload = {
        studentSkills: splitTags(recommendationForm.studentSkills),
        studentInterests: splitTags(recommendationForm.studentInterests),
        studentLevel: recommendationForm.studentLevel,
      };

      const res = await getRecommendedMentors(clubId, payload);
      setRecommendedMentors(Array.isArray(res) ? res : res?.data || []);
    } catch (error) {
      console.error("Error loading recommended mentors:", error);
      alert(
        error?.response?.data?.message || "Failed to generate recommendations"
      );
    } finally {
      setRecommendLoading(false);
    }
  };

  const handleShowAllMentors = () => {
    setRecommendedMentors([]);
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();

    if (!selectedMentor?.mentor?._id && !selectedMentor?.mentor) {
      setRequestError("Invalid mentor selected");
      return;
    }

    try {
      setRequestSubmitting(true);
      setRequestError("");
      setRequestSuccess("");

      const mentorId = selectedMentor?.mentor?._id || selectedMentor?.mentor;

      await createMentorshipRequest(clubId, {
        mentorId,
        message: requestForm.message,
        studentSkills: splitTags(requestForm.studentSkills),
        studentInterests: splitTags(requestForm.studentInterests),
        studentLevel: requestForm.studentLevel,
      });

      setRequestSuccess("Mentorship request sent successfully");
      await loadMentorships();

      setTimeout(() => {
        closeRequestModal();
      }, 900);
    } catch (error) {
      console.error("Error creating mentorship request:", error);
      setRequestError(
        error?.response?.data?.message || "Failed to send mentorship request"
      );
    } finally {
      setRequestSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-slate-600">Loading club dashboard...</div>;
  }

  if (!dashboard) {
    return <div className="text-slate-600">No dashboard data found.</div>;
  }

  const { club, membership, permissions } = dashboard;
  const constitutionDownloadUrl = `${API_BASE_URL}/api/clubs/${club._id}/constitution/download`;
  const hasConstitution = Boolean(
    club?.constitution?.fileUrl || club?.constitution?.fileName
  );

  return (
    <>
      <div className="space-y-8">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-400">
            {club?.name ? `${club.name} Club Dashboard` : "Club Dashboard"}
          </p>

          <h1 className="text-3xl font-bold text-slate-900 mt-2">
            {club?.name || "Club"}
          </h1>

          <p className="text-slate-500 mt-2">
            {club?.description || "No club description available."}
          </p>

          <div className="flex flex-wrap gap-3 mt-5">
            <span className="px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold">
              {club?.category || "General"}
            </span>

            <span className="px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold">
              Role: {membership?.role || "member"}
            </span>

            <span className="px-4 py-2 rounded-full bg-slate-100 text-slate-700 text-sm font-semibold">
              Members: {club?.memberCount || 0}
            </span>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {permissions?.canManageClub && (
              <button
                type="button"
                onClick={() => navigate(`/clubs/${club._id}/manage`)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800"
              >
                <Settings size={18} />
                Manage Club
              </button>
            )}

            {hasConstitution && (
              <a
                href={constitutionDownloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 font-semibold hover:bg-indigo-100"
              >
                <Download size={18} />
                Download Constitution
              </a>
            )}
          </div>

          {hasConstitution && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-2 text-sm text-slate-600 border border-slate-200">
              <FileText size={16} />
              <span>{club?.constitution?.fileName || "constitution.pdf"}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <Vote className="text-indigo-600" />
              <p className="text-sm text-slate-500">Active Elections</p>
            </div>
            <h2 className="text-4xl font-bold text-slate-900 mt-4">
              {activeElectionCount}
            </h2>
            <p className="text-emerald-500 mt-3 text-sm">currently open</p>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <CalendarDays className="text-indigo-600" />
              <p className="text-sm text-slate-500">Upcoming Events</p>
            </div>
            <h2 className="text-4xl font-bold text-slate-900 mt-4">
              {upcomingEventCount}
            </h2>
            <p className="text-emerald-500 mt-3 text-sm">events to attend</p>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <Handshake className="text-indigo-600" />
              <p className="text-sm text-slate-500">Available Mentors</p>
            </div>
            <h2 className="text-4xl font-bold text-slate-900 mt-4">
              {activeMentorshipCount}
            </h2>
            <p className="text-emerald-500 mt-3 text-sm">ready to help</p>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <Wallet className="text-indigo-600" />
              <p className="text-sm text-slate-500">Expenses</p>
            </div>
            <h2 className="text-4xl font-bold text-slate-900 mt-4">
              {expenses.length}
            </h2>
            <p className="text-emerald-500 mt-3 text-sm">
              Total Rs. {totalExpenseAmount.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="text-2xl font-bold text-slate-900">Elections</h2>
              <span className="text-sm font-semibold text-indigo-600">
                {elections.length} total
              </span>
            </div>

            {electionsLoading ? (
              <p className="text-slate-500">Loading elections...</p>
            ) : elections.length === 0 ? (
              <p className="text-slate-500">No elections found.</p>
            ) : (
              <div className="space-y-4">
                {elections.map((election) => (
                  <div
                    key={election._id}
                    onClick={() =>
                      navigate(`/clubs/${clubId}/elections/${election._id}`)
                    }
                    className="rounded-2xl border border-slate-200 p-4 cursor-pointer hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">
                          {election.title || "Untitled Election"}
                        </h3>

                        <p className="text-sm text-slate-500 mt-1">
                          {election.position || "Position not specified"}
                        </p>

                        <p className="text-sm text-slate-500 mt-2">
                          {election.description || "No description provided"}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600">
                          <span className="inline-flex items-center gap-1">
                            <Clock3 size={14} />
                            Voting: {formatDateTime(election.votingStartDate)}
                          </span>

                          <span className="inline-flex items-center gap-1">
                            <CalendarDays size={14} />
                            Ends: {formatDateTime(election.votingEndDate)}
                          </span>
                        </div>

                        <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-600">
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays size={14} />
                            Nominations:{" "}
                            {formatDateTime(election.nominationStartDate)}
                          </span>

                          <span className="inline-flex items-center gap-1">
                            <CalendarDays size={14} />
                            To {formatDateTime(election.nominationEndDate)}
                          </span>
                        </div>

                        <div className="mt-3">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/clubs/${clubId}/elections/${election._id}`);
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700"
                          >
                            <Vote size={16} />
                            View Election
                          </button>
                        </div>
                      </div>

                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getElectionStatusBadge(
                          election.status
                        )}`}
                      >
                        {election.status || "Unknown"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="text-2xl font-bold text-slate-900">
                Upcoming Events
              </h2>
              <span className="text-sm font-semibold text-indigo-600">
                {events.length} total
              </span>
            </div>

            {eventsLoading ? (
              <p className="text-slate-500">Loading events...</p>
            ) : events.length === 0 ? (
              <p className="text-slate-500">No events found.</p>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <div
                    key={event._id}
                    className="overflow-hidden rounded-2xl border border-slate-200"
                  >
                    {event.imageUrl ? (
                      <img
                        src={getImageSrc(event.imageUrl)}
                        alt={event.title || event.name || "Event"}
                        className="h-48 w-full object-cover"
                      />
                    ) : null}

                    <div className="p-4">
                      <h3 className="font-semibold text-slate-900">
                        {event.title || event.name || "Untitled Event"}
                      </h3>

                      <p className="text-sm text-slate-500 mt-1">
                        {event.description || "No description provided"}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600">
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays size={14} />
                          {formatEventSchedule(
                            event.startDate || event.date || event.eventDate,
                            event.endDate
                          )}
                        </span>

                        <span className="inline-flex items-center gap-1">
                          <MapPin size={14} />
                          {event.location || event.venue || "Location not specified"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Mentorships
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Find mentors and get smart recommendations.
                </p>
              </div>
              <span className="text-sm font-semibold text-indigo-600">
                {displayedMentors.length} shown
              </span>
            </div>

            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 mb-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={18} className="text-indigo-600" />
                <h3 className="text-lg font-semibold text-slate-900">
                  Find Best Mentors
                </h3>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Your Skills
                  </label>
                  <input
                    type="text"
                    name="studentSkills"
                    value={recommendationForm.studentSkills}
                    onChange={handleRecommendationChange}
                    placeholder="React, Node, Java"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Your Interests
                  </label>
                  <input
                    type="text"
                    name="studentInterests"
                    value={recommendationForm.studentInterests}
                    onChange={handleRecommendationChange}
                    placeholder="Web Development, UI/UX"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Your Level
                  </label>
                  <select
                    name="studentLevel"
                    value={recommendationForm.studentLevel}
                    onChange={handleRecommendationChange}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleFindBestMentors}
                  disabled={recommendLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60"
                >
                  <Sparkles size={16} />
                  {recommendLoading ? "Matching..." : "Find Best Mentors"}
                </button>

                <button
                  type="button"
                  onClick={handleShowAllMentors}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50"
                >
                  Show All Mentors
                </button>
              </div>
            </div>

            {mentorshipsLoading ? (
              <p className="text-slate-500">Loading mentors...</p>
            ) : displayedMentors.length === 0 ? (
              <p className="text-slate-500">No mentors found.</p>
            ) : (
              <div className="space-y-4">
                {displayedMentors.map((item) => {
                  const mentorUser = item.mentor || {};
                  const mentorId = String(mentorUser._id || item.mentor);
                  const alreadyPending = pendingMentorIds.has(mentorId);

                  return (
                    <div
                      key={item._id}
                      className="rounded-2xl border border-slate-200 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="font-semibold text-slate-900">
                              {mentorUser.fullName ||
                                mentorUser.name ||
                                item.title ||
                                "Mentor"}
                            </h3>

                            {item.matchScore !== undefined && (
                              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                Score: {item.matchScore}
                              </span>
                            )}
                          </div>

                          <p className="text-sm text-slate-500 mt-1">
                            {item.bio || "No description provided"}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600">
                            <span className="inline-flex items-center gap-1">
                              <UserRound size={14} />
                              Title: {item.title || "Mentor"}
                            </span>

                            <span className="inline-flex items-center gap-1">
                              <BadgeCheck size={14} />
                              {item.availability || "Unknown"}
                            </span>
                          </div>

                          <div className="mt-3 text-sm text-slate-600 space-y-1">
                            <p>
                              Level: {item.expertiseLevel || "Not specified"}
                            </p>
                            <p>
                              Capacity: {item.currentMentees || 0}/
                              {item.maxMentees || 0}
                            </p>
                            <p>
                              Skills:{" "}
                              {Array.isArray(item.skills) && item.skills.length > 0
                                ? item.skills.join(", ")
                                : "Not specified"}
                            </p>
                            <p>
                              Interests:{" "}
                              {Array.isArray(item.interests) &&
                              item.interests.length > 0
                                ? item.interests.join(", ")
                                : "Not specified"}
                            </p>
                          </div>

                          <div className="mt-4">
                            <button
                              type="button"
                              onClick={() => openRequestModal(item)}
                              disabled={alreadyPending}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              <Handshake size={16} />
                              {alreadyPending
                                ? "Request Pending"
                                : "Request Mentorship"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Expenses</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Students can view these records but cannot edit them.
                </p>
              </div>
              <span className="text-sm font-semibold text-indigo-600">
                {expenses.length} records
              </span>
            </div>

            {expensesLoading ? (
              <p className="text-slate-500">Loading expense records...</p>
            ) : expenses.length === 0 ? (
              <p className="text-slate-500">No expense records found.</p>
            ) : (
              <div className="space-y-4">
                {expenses.map((expense) => (
                  <div
                    key={expense._id}
                    className="rounded-2xl border border-slate-200 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {expense.title || "Untitled Expense"}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">
                          {expense.description || "No description provided"}
                        </p>
                        <p className="text-sm text-slate-600 mt-2">
                          Category: {expense.category || "General"}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-slate-900">
                          Rs. {Number(expense.amount || 0).toLocaleString()}
                        </p>
                        <span className="inline-flex mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                          {expense.status || "recorded"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {permissions?.canManageClub && (
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Budget Requests
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Review budget requests for this club.
                  </p>
                </div>
                <span className="text-sm font-semibold text-indigo-600">
                  {budgets.length} requests
                </span>
              </div>

              {budgetsLoading ? (
                <p className="text-slate-500">Loading budget requests...</p>
              ) : budgets.length === 0 ? (
                <p className="text-slate-500">No budget requests found.</p>
              ) : (
                <div className="space-y-4">
                  {budgets.map((budget) => (
                    <div
                      key={budget._id}
                      className="rounded-2xl border border-slate-200 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-slate-900">
                            {budget.title || "Untitled Budget Request"}
                          </h3>
                          <p className="text-sm text-slate-500 mt-1">
                            {budget.description || "No description provided"}
                          </p>
                          <p className="text-sm text-slate-600 mt-2">
                            Category: {budget.category || "General"}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="font-bold text-slate-900">
                            Rs. {Number(budget.amount || 0).toLocaleString()}
                          </p>
                          <span className="inline-flex mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                            {budget.status || "pending"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700 border border-slate-200">
                Total Requested: Rs. {totalBudgetAmount.toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </div>

      {requestModalOpen && selectedMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-xl border border-slate-200">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Request Mentorship
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Send a request to{" "}
                  {selectedMentor?.mentor?.fullName ||
                    selectedMentor?.mentor?.name ||
                    selectedMentor?.title ||
                    "this mentor"}
                </p>
              </div>

              <button
                type="button"
                onClick={closeRequestModal}
                className="rounded-xl p-2 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            {requestError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {requestError}
              </div>
            )}

            {requestSuccess && (
              <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {requestSuccess}
              </div>
            )}

            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Your Skills
                </label>
                <input
                  type="text"
                  name="studentSkills"
                  value={requestForm.studentSkills}
                  onChange={handleRequestFormChange}
                  placeholder="React, Node, Java"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Your Interests
                </label>
                <input
                  type="text"
                  name="studentInterests"
                  value={requestForm.studentInterests}
                  onChange={handleRequestFormChange}
                  placeholder="Web Development, UI/UX"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Your Level
                </label>
                <select
                  name="studentLevel"
                  value={requestForm.studentLevel}
                  onChange={handleRequestFormChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Message
                </label>
                <textarea
                  name="message"
                  rows="4"
                  value={requestForm.message}
                  onChange={handleRequestFormChange}
                  placeholder="Hi, I would like help with projects and guidance."
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeRequestModal}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={requestSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-60"
                >
                  <Handshake size={16} />
                  {requestSubmitting ? "Sending..." : "Send Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ClubDashboard;