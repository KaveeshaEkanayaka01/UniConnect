import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../components/Auth/axios";
import {
  TrendingUp,
  Users,
  MessageSquare,
  Calendar,
  ArrowRight,
} from "lucide-react";

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className={`bg-white rounded-2xl border shadow p-4 flex items-center gap-4`}>
    <div className={`p-3 rounded-lg bg-${color}-100 text-${color}-600`}>
      <Icon size={20} />
    </div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-lg font-semibold text-gray-800">{value}</p>
    </div>
  </div>
);
  

const DashboardPage = () => {
  const [user, setUser] = useState(null);
  const [profile , setProfile] = useState(null);
  const [joinedClubs, setJoinedClubs] = useState([]);
  const navigate = useNavigate();
  const displayFaculty = profile?.faculty || user?.faculty || "Not set";
  const displayYear = profile?.yearOfStudy || user?.yearOfStudy || "Not set";
  const deriveSkillNames = (profile) => {
    if (!profile) return [];

    if (Array.isArray(profile.skillDetails) && profile.skillDetails.length) {
      return profile.skillDetails
        .map((d) => {
          const s = d?.skill;
          return (s && s.name) || (typeof s === "string" ? s : d?.name) || "";
        })
        .filter(Boolean);
    }

    if (Array.isArray(profile.skills)) {
      return profile.skills.map((s) => (typeof s === "string" ? s : s?.name || "")).filter(Boolean);
    }

    return [];
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const dashboardRes = await API.get("/student/dashboard");

        setUser(dashboardRes.data.user);
        setProfile(dashboardRes.data.profile);
        const clubs = Array.isArray(dashboardRes.data?.profile?.joinedClubs)
          ? dashboardRes.data.profile.joinedClubs
          : [];
        setJoinedClubs(clubs);
      } catch (err) {
        localStorage.clear();
        navigate("/login");
      }
    };

    fetchDashboardData();
  }, [navigate]);

  if (!user) return <div className="p-10 text-gray-500">Loading dashboard...</div>;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Main content */}
      <main className="space-y-10">

      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-indigo-700 p-8 text-white">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Welcome back, {user.fullName} 👋
            </h1>
            <p className="mt-2 text-indigo-100 max-w-lg">
              Faculty: {displayFaculty} • Year {displayYear}
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-6">
              <Link
                to="/profile"
                className="bg-white text-indigo-600 px-4 py-2.5 rounded-xl font-bold text-sm shadow hover:scale-105 transition-transform"
              >
                View Profile
              </Link>
              <Link
                to="/skills"
                className="bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-400 transition"
              >
                Add Skills
              </Link>
              <Link
                to="/news-only"
                className="border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50"
              >
                News
              </Link>

              <Link
                to="/project-feed"
                className="border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50"
              >
                Project Feed
              </Link>

              <Link
                to="/analysis"
                className="border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50"
              >
                Analysis
              </Link>
            </div>
          </div>
           
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Role" value={user.role} icon={Users} color="indigo" />
        <StatCard title="Joined Clubs" value={joinedClubs.length} icon={Users} color="sky" />
        <StatCard title="Account Status" value={user.isActive ? "Active" : "Inactive"} icon={TrendingUp} color="emerald" />
        <StatCard title="Email Verified" value={user.isEmailVerified ? "Yes" : "No"} icon={MessageSquare} color="amber" />
        <StatCard title="Member Since" value={new Date(user.createdAt).toLocaleDateString()} icon={Calendar} color="rose" />
      </div>

      {/* Profile Summary + Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Profile Summary */}
        <div className="xl:col-span-2 bg-white p-6 rounded-2xl shadow border space-y-3">
          <h3 className="text-lg font-bold text-slate-800">Profile Summary</h3>
          <p><b>Email:</b> {user.email}</p>
          <p><b>Student ID:</b> {user.studentId}</p>
          <p><b>Faculty:</b> {displayFaculty}</p>
          <p><b>Year:</b> {displayYear}</p>

          {/* Skills preview */}
          <div className="mt-3">
            <h4 className="text-sm font-semibold text-slate-700">Skills</h4>
            {deriveSkillNames(profile).length ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {deriveSkillNames(profile).slice(0, 8).map((s, i) => (
                  <span key={`${s}-${i}`} className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm">
                    {s}
                  </span>
                ))}
                {deriveSkillNames(profile).length > 8 && (
                  <span className="px-3 py-1 rounded-full bg-slate-50 text-slate-500 text-sm">+{deriveSkillNames(profile).length - 8} more</span>
                )}
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-500">No skills added yet.</p>
            )}

            <Link to="/skills" className="mt-3 inline-block text-indigo-600 font-semibold text-sm hover:underline">Manage Skills</Link>
          </div>

          <Link
            to="/profile"
            className="inline-flex items-center gap-2 mt-3 text-indigo-600 font-semibold text-sm hover:underline"
          >
            View Full Profile <ArrowRight size={14} />
          </Link>
        </div>

        {/* Activity Feed  */}
        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="text-sm text-slate-600">✅ Completed profile setup</div>
            <div className="text-sm text-slate-600">⚡ Added new skill</div>
            <div className="text-sm text-slate-600">🏆 Earned first badge</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Your Clubs</h3>
          {joinedClubs.length > 0 ? (
            <div className="space-y-3">
              {joinedClubs.slice(0, 5).map((club) => (
                <div key={club._id || club.id || club.name} className="text-sm text-slate-700 font-medium">
                  {club.name}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No joined clubs yet.</p>
          )}
        </div>
      </div>
      </main>
    </div>
  );
};

export default DashboardPage;
