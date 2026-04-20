import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../components/Auth/axios";
import { getMyClubs } from "../services/clubService";
import {
  TrendingUp,
  Users,
  MessageSquare,
  Calendar,
  ArrowRight,
} from "lucide-react";

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className={`bg-white rounded-2xl border border-[#0a1e8c]/20 shadow p-4 flex items-center gap-4`}>
    <div className={`p-3 rounded-lg bg-[#f5f8ff] text-[#0a1e8c]`}>
      <Icon size={20} />
    </div>
    <div>
      <p className="text-sm text-[#4a5b86]">{title}</p>
      <p className="text-lg font-semibold text-[#0a1e8c]">{value}</p>
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

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const dashboardRes = await API.get("/student/dashboard");

        setUser(dashboardRes.data.user);
        setProfile(dashboardRes.data.profile);
        const clubsRes = await getMyClubs();

const myClubs = Array.isArray(clubsRes)
  ? clubsRes
  : Array.isArray(clubsRes?.data)
  ? clubsRes.data
  : [];

setJoinedClubs(myClubs);
      } catch (err) {
        localStorage.clear();
        navigate("/login");
      }
    };

    fetchDashboardData();
  }, [navigate]);

  if (!user) return <div className="p-10 text-gray-500">Loading dashboard...</div>;

 return (
  <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 bg-[#ffffff] min-h-screen p-4">

    {/* Welcome Banner */}
    <div className="relative overflow-hidden rounded-[30px] 
      bg-gradient-to-r from-[#0a1e8c] via-[#0c249f] to-[#08166f] 
      p-8 text-white 
      shadow-[0_12px_30px_rgba(10,30,140,0.35)] 
      border border-white/5">

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">
            Welcome back, {user.fullName} 👋
          </h1>

          <p className="mt-2 text-white/80 max-w-lg">
            Faculty: {displayFaculty} • Year {displayYear}
          </p>

          <div className="flex items-center gap-4 mt-6">
            <Link
              to="/profile"
              className="bg-white text-[#0a1e8c] px-6 py-2.5 rounded-xl font-bold text-sm hover:scale-105 transition"
            >
              View Profile
            </Link>

            <Link
              to="/skills"
              className="bg-[#f37021] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#d85f1b] transition"
            >
              Add Skills
            </Link>
          </div>
        </div>
      </div>
    </div>

    {/* Stats */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard title="Role" value={user.role} icon={Users} />
      <StatCard title="Joined Clubs" value={joinedClubs.length} icon={Users} />
      <StatCard title="Account Status" value={user.isActive ? "Active" : "Inactive"} icon={TrendingUp} />
      <StatCard title="Email Verified" value={user.isEmailVerified ? "Yes" : "No"} icon={MessageSquare} />
      <StatCard title="Member Since" value={new Date(user.createdAt).toLocaleDateString()} icon={Calendar} />
    </div>

    {/* Profile + Activity */}
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

      <div className="xl:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-[#0a1e8c]/20 space-y-3">
        <h3 className="text-lg font-black text-[#0a1e8c]">Profile Summary</h3>

        <p><b>Email:</b> {user.email}</p>
        <p><b>Student ID:</b> {user.studentId}</p>
        <p><b>Faculty:</b> {displayFaculty}</p>
        <p><b>Year:</b> {displayYear}</p>

        <Link
          to="/profile"
          className="inline-flex items-center gap-2 mt-3 text-[#f37021] font-bold text-sm hover:underline"
        >
          View Full Profile <ArrowRight size={14} />
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-[#0a1e8c]/20 shadow-sm p-6">
        <h3 className="text-lg font-black text-[#0a1e8c] mb-4">
          Recent Activity
        </h3>

        <div className="space-y-4 text-sm text-[#4a5b86]">
          <div>✅ Completed profile setup</div>
          <div>⚡ Added new skill</div>
          <div>🏆 Earned first badge</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#0a1e8c]/20 shadow-sm p-6">
        <h3 className="text-lg font-black text-[#0a1e8c] mb-4">
          Your Clubs
        </h3>

        {joinedClubs.length > 0 ? (
          <div className="space-y-3">
            {joinedClubs.slice(0, 5).map((club) => (
              <div
                key={club._id || club.id || club.name}
                className="text-sm text-[#0a1e8c] font-semibold"
              >
                {club.name}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#4a5b86]">
            No joined clubs yet.
          </p>
        )}
      </div>
    </div>
  </div>
);
};

export default DashboardPage;
