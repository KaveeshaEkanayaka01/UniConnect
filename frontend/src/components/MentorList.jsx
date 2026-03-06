import React, { useEffect, useMemo, useState } from "react";
import API from "./Auth/axios";

const MentorListPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [mentors, setMentors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestingMentorId, setRequestingMentorId] = useState("");
  const [requestedMentorIds, setRequestedMentorIds] = useState({});

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await API.get("/student/match");
        setMentors(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load mentors.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMentors();
  }, []);

  const filteredMentors = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return mentors;

    return mentors.filter((item) => {
      const mentor = item.mentor || {};
      const fullName = (mentor.fullName || "").toLowerCase();
      const faculty = (mentor.faculty || "").toLowerCase();
      const skills = Array.isArray(mentor.skills) ? mentor.skills : [];
      const hasSkillMatch = skills.some((skill) => String(skill).toLowerCase().includes(query));

      return fullName.includes(query) || faculty.includes(query) || hasSkillMatch;
    });
  }, [mentors, searchTerm]);

  const handleRequestMentor = async (mentorId) => {
    try {
      setRequestingMentorId(mentorId);
      await API.post(`/student/request/${mentorId}`, {
        message: "I’d like to request mentorship",
      });
      setRequestedMentorIds((prev) => ({ ...prev, [mentorId]: true }));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send mentorship request.");
    } finally {
      setRequestingMentorId("");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Find a Mentor</h1>
          <p className="text-gray-500">Connect with experienced students in your network.</p>
        </div>

        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Search by name, faculty, or skill..."
            className="pl-12 pr-4 py-3 w-full md:w-80 rounded-2xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 px-4 py-3 text-sm font-medium">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="py-20 text-center text-gray-500">Loading mentors...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMentors.map((item) => {
            const mentor = item.mentor || {};
            const mentorId = mentor._id;
            const mentorSkills = Array.isArray(mentor.skills) ? mentor.skills : [];
            const isRequested = Boolean(requestedMentorIds[mentorId]);
            const isSubmitting = requestingMentorId === mentorId;

            return (
              <div
                key={mentorId}
                className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:border-indigo-100 transition-all group flex flex-col h-full"
              >
                <div className="h-2 bg-indigo-500 group-hover:h-3 transition-all"></div>

                <div className="p-8 flex-1">
                  <div className="flex items-center space-x-4 mb-6">
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(mentor.fullName || "Mentor")}&background=6366f1&color=fff`}
                      className="w-16 h-16 rounded-2xl object-cover shadow-lg border-2 border-gray-50"
                      alt={mentor.fullName || "Mentor"}
                    />

                    <div>
                      <h3 className="text-xl font-bold text-gray-900 leading-tight">
                        {mentor.fullName || "Unnamed Mentor"}
                      </h3>

                      <p className="text-xs font-semibold text-gray-500 mt-1 uppercase tracking-wide">
                        {mentor.faculty || "Faculty not available"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-5">
                    {mentorSkills.length > 0 ? (
                      mentorSkills.map((skill) => (
                        <span
                          key={skill}
                          className="text-[10px] font-black uppercase text-indigo-500 tracking-wider px-2 py-0.5 bg-indigo-50 rounded-md"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">No skills listed</span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-gray-50 rounded-xl">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">Match Score</p>
                      <p className="text-gray-900 font-bold">{item.score ?? 0}</p>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-xl">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">Status</p>
                      <p className="text-gray-900 font-bold">{mentor.availability ? "Available" : "Busy"}</p>
                    </div>
                  </div>
                </div>

                <div className="px-8 pb-8">
                  <button
                    type="button"
                    disabled={!mentorId || isRequested || isSubmitting}
                    onClick={() => handleRequestMentor(mentorId)}
                    className="block w-full text-center py-3 bg-white border-2 border-indigo-600 text-indigo-600 font-bold rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-indigo-100 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isRequested ? "Request Sent" : isSubmitting ? "Sending..." : "Request Mentorship"}
                  </button>
                </div>
              </div>
            );
          })}

          {filteredMentors.length === 0 && (
            <div className="col-span-full py-20 text-center space-y-4">
              <span className="text-6xl">🔍</span>
              <p className="text-xl font-bold text-gray-400">No mentors found matching your search.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MentorListPage;
