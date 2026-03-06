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
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl bg-${color}-50 text-${color}-600`}>
        <Icon size={22} />
      </div>
    </div>
  </div>
);

const DashboardPage = () => {
  const [user, setUser] = useState(null);
  const [profile , setProfile] = useState(null);
  const [mentorNames, setMentorNames] = useState([]);
  const navigate = useNavigate();
  const displayFaculty = profile?.faculty || user?.faculty || "Not set";
  const displayYear = profile?.yearOfStudy || user?.yearOfStudy || "Not set";

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [dashboardRes, mentorsRes] = await Promise.all([
          API.get("/student/dashboard"),
          API.get("/student/match"),
        ]);

        setUser(dashboardRes.data.user);
        setProfile(dashboardRes.data.profile);
        const mentors = Array.isArray(mentorsRes.data) ? mentorsRes.data : [];
        const names = mentors
          .map((item) => item?.mentor?.fullName)
          .filter(Boolean)
          .slice(0, 5);
        setMentorNames(names);
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

      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-indigo-600 p-8 text-white">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Welcome back, {user.fullName} 👋
            </h1>
            <p className="mt-2 text-indigo-100 max-w-lg">
              Faculty: {displayFaculty} • Year {displayYear}
            </p>
            <div className="flex items-center gap-4 mt-6">
              <Link
                to="/profile"
                className="bg-white text-indigo-600 px-6 py-2.5 rounded-xl font-bold text-sm shadow hover:scale-105 transition-transform"
              >
                View Profile
              </Link>
              <Link
                to="/skills"
                className="bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-400 transition"
              >
                Add Skills
              </Link>
            </div>
          </div>
          <div className="hidden lg:block">
            <img
              src="https://picsum.photos/300/200?random=10"
              alt="Dashboard"
              className="w-56 rounded-2xl shadow-2xl rotate-3"
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Role" value={user.role} icon={Users} color="indigo" />
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

          <Link
            to="/profile"
            className="inline-flex items-center gap-2 mt-3 text-indigo-600 font-semibold text-sm hover:underline"
          >
            View Full Profile <ArrowRight size={14} />
          </Link>
        </div>

        {/* Activity Feed (mock for now) */}
        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="text-sm text-slate-600">✅ Completed profile setup</div>
            <div className="text-sm text-slate-600">⚡ Added new skill</div>
            <div className="text-sm text-slate-600">🏆 Earned first badge</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Your Mentors</h3>
          {mentorNames.length > 0 ? (
            <div className="space-y-3">
              {mentorNames.map((name) => (
                <div key={name} className="text-sm text-slate-700 font-medium">
                  {name}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No mentors found yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
