import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getElectionById,
  voteElection,
  getElectionResults,
} from "../../services/electionService";

const MANAGEMENT_ROLES = [
  "PRESIDENT",
  "VICE_PRESIDENT",
  "SECRETARY",
  "TREASURER",
  "EXECUTIVE",
  "ASSISTANT_SECRETARY",
  "ASSISTANT_TREASURER",
  "EVENT_COORDINATOR",
  "PROJECT_COORDINATOR",
];

const normalizeRole = (role) =>
  String(role || "")
    .trim()
    .replace(/\s+/g, "_")
    .toUpperCase();

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

const formatDateTime = (value) => {
  if (!value) return "Not specified";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not specified";
  return date.toLocaleString();
};

const getElectionStatus = (election) => {
  if (!election) return "upcoming";

  const now = new Date();
  const nominationStart = new Date(election.nominationStartDate);
  const votingEnd = new Date(election.votingEndDate);

  if (election.status === "cancelled") return "cancelled";
  if (now < nominationStart) return "upcoming";
  if (now > votingEnd) return "completed";
  return "ongoing";
};

const isVotingOpen = (election) => {
  if (!election || election.status === "cancelled") return false;

  const now = new Date();
  const votingStart = new Date(election.votingStartDate);
  const votingEnd = new Date(election.votingEndDate);

  return now >= votingStart && now <= votingEnd;
};

const getStatusBadgeClass = (status) => {
  if (status === "upcoming") return "bg-blue-100 text-blue-700";
  if (status === "ongoing") return "bg-green-100 text-green-700";
  if (status === "completed") return "bg-slate-100 text-slate-700";
  if (status === "cancelled") return "bg-red-100 text-red-700";
  return "bg-slate-100 text-slate-700";
};

export default function ElectionVote() {
  const { clubId, electionId } = useParams();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const [election, setElection] = useState(null);
  const [results, setResults] = useState(null);
  const [selectedCandidateIndex, setSelectedCandidateIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [submittingVote, setSubmittingVote] = useState(false);
  const [pageError, setPageError] = useState("");
  const [voteMessage, setVoteMessage] = useState("");

  const currentUserRole = normalizeRole(currentUser?.role);

  const currentUserId =
    currentUser?._id?.toString?.() ||
    currentUser?.id?.toString?.() ||
    currentUser?.userId?.toString?.() ||
    "";

  const clubMemberRole = useMemo(() => {
    const member = election?.club?.members?.find((memberItem) => {
      const memberUserId =
        memberItem?.user?._id?.toString?.() ||
        memberItem?.user?.id?.toString?.() ||
        memberItem?.user?.userId?.toString?.() ||
        memberItem?.user?.toString?.() ||
        memberItem?._id?.toString?.() ||
        memberItem?.memberId?.toString?.();

      const memberStatus = String(memberItem?.status || "")
        .trim()
        .toLowerCase();

      return (
        String(memberUserId) === String(currentUserId) &&
        ["active", "approved"].includes(memberStatus)
      );
    });

    return normalizeRole(member?.role);
  }, [election, currentUserId]);

  const isSystemAdmin = currentUserRole === "SYSTEM_ADMIN";
  const isClubManager = MANAGEMENT_ROLES.includes(clubMemberRole);
  const isMember = clubMemberRole === "MEMBER";

  const hasVoted = useMemo(() => {
    if (!election || !currentUserId) return false;
    if (!Array.isArray(election.voters)) return false;

    return election.voters.some((voter) => {
      const voterUserId =
        voter?.user?._id?.toString?.() ||
        voter?.user?.id?.toString?.() ||
        voter?.user?.userId?.toString?.() ||
        voter?.user?.toString?.() ||
        "";

      return String(voterUserId) === String(currentUserId);
    });
  }, [election, currentUserId]);

  const votedCandidateIndex = useMemo(() => {
    if (!election || !currentUserId) return null;
    if (!Array.isArray(election.voters)) return null;

    const voteRecord = election.voters.find((voter) => {
      const voterUserId =
        voter?.user?._id?.toString?.() ||
        voter?.user?.id?.toString?.() ||
        voter?.user?.userId?.toString?.() ||
        voter?.user?.toString?.() ||
        "";

      return String(voterUserId) === String(currentUserId);
    });

    return voteRecord ? Number(voteRecord.candidateIndex) : null;
  }, [election, currentUserId]);

  const electionStatus = useMemo(() => {
    return getElectionStatus(election);
  }, [election]);

  const loadElection = async () => {
    const res = await getElectionById(electionId);
    const data = res?.election || res;
    setElection(data);
    return data;
  };

  const loadResults = async () => {
    try {
      setResultsLoading(true);
      const res = await getElectionResults(electionId);
      setResults(res);
    } catch (error) {
      console.error("Error loading election results:", error);
      setResults(null);
    } finally {
      setResultsLoading(false);
    }
  };

  const loadPage = async () => {
    try {
      setLoading(true);
      setPageError("");

      const electionData = await loadElection();

      if (
        getElectionStatus(electionData) === "completed" ||
        Array.isArray(electionData?.candidates)
      ) {
        await loadResults();
      }
    } catch (error) {
      console.error("Error loading election:", error);
      setPageError(
        error?.response?.data?.message || "Failed to load election"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (electionId) {
      loadPage();
    }
  }, [electionId]);

  useEffect(() => {
    if (hasVoted) {
      loadResults();
    }
  }, [hasVoted]);

  const canVote =
    isMember &&
    isVotingOpen(election) &&
    !hasVoted &&
    Array.isArray(election?.candidates) &&
    election.candidates.length > 0;

  if (loading) {
    return (
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-slate-600">Loading election...</p>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <p className="font-medium text-red-700">{pageError}</p>
      </div>
    );
  }

  if (!election) {
    return (
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-slate-600">Election not found.</p>
      </div>
    );
  }

  const handleVoteSubmit = async () => {
    if (selectedCandidateIndex === null || selectedCandidateIndex === undefined) {
      setVoteMessage("Please select a candidate first.");
      return;
    }

    try {
      setSubmittingVote(true);
      setVoteMessage("");

      await voteElection(electionId, {
        candidateIndex: selectedCandidateIndex,
      });

      setVoteMessage("Vote submitted successfully.");

      await loadElection();
      await loadResults();
    } catch (error) {
      console.error("Error submitting vote:", error);
      setVoteMessage(
        error?.response?.data?.message || "Failed to submit vote"
      );
    } finally {
      setSubmittingVote(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <button
              type="button"
              onClick={() => navigate(`/clubs/${clubId}/manage`)}
              className="mb-4 inline-flex items-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Back to Club Dashboard
            </button>

            <h1 className="text-3xl font-bold text-slate-900">
              {election.title || "Election"}
            </h1>

            <p className="mt-2 text-slate-500">
              {election.description || "No description provided."}
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <span className="rounded-full bg-indigo-100 px-4 py-2 text-sm font-semibold text-indigo-700">
                {election.position || "Position not specified"}
              </span>

              <span
                className={`rounded-full px-4 py-2 text-sm font-semibold ${getStatusBadgeClass(
                  electionStatus
                )}`}
              >
                {electionStatus}
              </span>

              {isVotingOpen(election) && (
                <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
                  Voting Open
                </span>
              )}

              <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                {isSystemAdmin
                  ? "System Admin"
                  : isClubManager
                  ? "Club Management"
                  : isMember
                  ? "Member"
                  : "Viewer"}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-sm font-semibold text-slate-700">
              Nomination Start
            </p>
            <p className="mt-1 text-slate-600">
              {formatDateTime(election.nominationStartDate)}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-sm font-semibold text-slate-700">
              Nomination End
            </p>
            <p className="mt-1 text-slate-600">
              {formatDateTime(election.nominationEndDate)}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-sm font-semibold text-slate-700">
              Voting Start
            </p>
            <p className="mt-1 text-slate-600">
              {formatDateTime(election.votingStartDate)}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-sm font-semibold text-slate-700">Voting End</p>
            <p className="mt-1 text-slate-600">
              {formatDateTime(election.votingEndDate)}
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 p-4">
          <p className="text-sm font-semibold text-slate-700">Eligibility</p>
          <p className="mt-1 text-slate-600">
            {election.eligibility || "No eligibility rules specified."}
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-slate-900">Candidates</h2>
          <span className="text-sm font-semibold text-indigo-600">
            {Array.isArray(election.candidates) ? election.candidates.length : 0}{" "}
            total
          </span>
        </div>

        {!Array.isArray(election.candidates) || election.candidates.length === 0 ? (
          <p className="text-slate-500">
            No candidates available for this election.
          </p>
        ) : (
          <div className="space-y-4">
            {election.candidates.map((candidate, index) => {
              const isSelected = selectedCandidateIndex === index;
              const isMyVote = votedCandidateIndex === index;

              return (
                <label
                  key={index}
                  className={`block rounded-2xl border p-4 transition ${
                    isSelected
                      ? "border-indigo-400 bg-indigo-50"
                      : "border-slate-200 bg-white"
                  } ${canVote ? "cursor-pointer" : "cursor-default"}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="candidate"
                          checked={isSelected}
                          disabled={!canVote}
                          onChange={() => setSelectedCandidateIndex(index)}
                        />
                        <div>
                          <h3 className="font-semibold text-slate-900">
                            {candidate.name || `Candidate ${index + 1}`}
                          </h3>
                          {isMyVote && (
                            <p className="mt-1 text-sm font-medium text-green-600">
                              Your vote
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        )}

        <div className="mt-6">
          {electionStatus === "upcoming" && (
            <p className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
              Voting has not started yet.
            </p>
          )}

          {electionStatus === "completed" && (
            <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              This election has ended. Final results are shown below.
            </p>
          )}

          {electionStatus === "cancelled" && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              This election has been cancelled.
            </p>
          )}

          {hasVoted && electionStatus === "ongoing" && (
            <p className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              You have already voted in this election.
            </p>
          )}

          {!isMember && electionStatus === "ongoing" && (
            <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              Only club members can vote. You can view the election details and
              results here.
            </p>
          )}

          {voteMessage && (
            <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {voteMessage}
            </p>
          )}

          {canVote && (
            <button
              type="button"
              onClick={handleVoteSubmit}
              disabled={submittingVote}
              className="mt-4 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {submittingVote ? "Submitting Vote..." : "Submit Vote"}
            </button>
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-slate-900">Results</h2>
          {results?.totalVotes !== undefined && (
            <span className="text-sm font-semibold text-indigo-600">
              {results.totalVotes} total votes
            </span>
          )}
        </div>

        {resultsLoading ? (
          <p className="text-slate-500">Loading results...</p>
        ) : !results || !Array.isArray(results.results) || results.results.length === 0 ? (
          <p className="text-slate-500">No results available yet.</p>
        ) : (
          <div className="space-y-4">
            {results.results.map((result, index) => (
              <div key={index} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-slate-900">{result.name}</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {result.votes} votes • {result.percentage}%
                    </p>
                  </div>

                  <div className="w-32 md:w-48">
                    <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-3 rounded-full bg-indigo-600"
                        style={{ width: `${Number(result.percentage || 0)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}