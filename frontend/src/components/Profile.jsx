import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Award, Sparkles, CalendarDays, BadgeCheck } from "lucide-react";
import API from "../components/Auth/axios";

const ProfileViewPage = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMe = async () => {
      try {
     const res = await API.get("/student/dashboard");
        setUser(res.data.user);
        setProfile(res.data.profile);  
      } catch (err) {
        console.error(err);
        localStorage.clear();
        navigate("/login");
      }
    };
    fetchMe();
  }, [navigate]);

  if (!user || !profile) {
    return <div className="p-10 text-gray-500">Loading profile...</div>;
  }

  const skillRows = Array.isArray(profile.skillDetails) && profile.skillDetails.length > 0
    ? profile.skillDetails.map((detail) => {
        const skillObj = detail?.skill;
        return {
          id: skillObj?._id || detail?._id,
          name: skillObj?.name || "Unknown Skill",
          proficiency: detail?.proficiency || "Intermediate",
          category: skillObj?.category || "",
          relatedActivity: detail?.relatedActivity || "",
        };
      })
    : (profile.skills || []).map((skill) => ({
        id: skill?._id,
        name: skill?.name || "Unknown Skill",
        proficiency: "Intermediate",
        category: skill?.category || "",
        relatedActivity: "",
      }));

  const badges = Array.isArray(profile.badges) ? profile.badges : [];
  const latestBadge = badges[0] || null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-32 rounded-3xl" />

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold">{user.fullName}</h1>
          <p className="text-indigo-600 font-medium">{profile.faculty}</p>
        </div>

        <Link
          to="/profile/edit"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
        >
          Edit Profile
        </Link>
      </div>

      <div className="bg-white p-6 rounded-xl shadow border space-y-2">
        <p><b>Email:</b> {user.email}</p>
        <p><b>Student ID:</b> {user.studentId}</p>
        <p><b>Faculty:</b> {profile.faculty}</p>
        <p><b>Year:</b> {profile.yearOfStudy}</p>
        <p><b>Role:</b> {user.role}</p>
      </div>
      <div>
        <h2 className="text-lg font-bold mb-3">Bio</h2>
        <p>{profile.bio || "No bio available"}</p>

      </div>

      {/* Skills */}
      <section className="bg-white p-6 rounded-xl shadow border">
        <h3 className="text-lg font-bold mb-3">Skills</h3>

        {!skillRows || skillRows.length === 0 ? (
          <p className="text-gray-400 text-sm">No skills added yet</p>
        ) : (
          <div className="space-y-2">
            {skillRows.map((skill) => (
              <div
                key={skill.id}
                className="px-3 py-2 rounded-lg bg-indigo-50 text-indigo-700 text-sm border"
              >
                <p className="font-semibold">{skill.name}</p>
                <p className="text-xs text-indigo-500">
                  {skill.category ? `${skill.category.replace("_", " ")} • ` : ""}
                  {skill.proficiency}
                  {skill.relatedActivity ? ` • ${skill.relatedActivity}` : ""}
                </p>
              </div>
            ))}
          </div>
        )}

        <Link
          to="/skills/add"
          className="inline-block mt-3 text-indigo-600 text-sm font-semibold"
        >
          + Add Skill
        </Link>
      </section>

      {/* Badges */}
      <section className="space-y-4">
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-900 to-sky-900 text-white p-6 rounded-2xl border border-indigo-300/20 shadow-lg">
          <div className="absolute -top-16 -right-12 w-44 h-44 rounded-full bg-white/15 blur-2xl" />
          <div className="absolute -bottom-20 -left-10 w-56 h-56 rounded-full bg-sky-300/20 blur-3xl" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div>
              <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] font-extrabold text-sky-100">
                <Sparkles size={14} />
                Achievement Showcase
              </p>
              <h3 className="mt-2 text-2xl font-extrabold tracking-tight">Badges</h3>
              <p className="text-sm text-indigo-100 mt-1">Your recognitions and accomplishments in UniConnect.</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white/10 border border-white/20 px-4 py-3 min-w-[130px]">
                <p className="text-[10px] uppercase tracking-widest text-sky-100 font-bold">Total Earned</p>
                <p className="text-2xl font-black">{badges.length}</p>
              </div>

              <div className="w-14 h-14 rounded-2xl bg-amber-300/20 border border-amber-200/40 text-amber-200 flex items-center justify-center">
                <Award size={26} />
              </div>
            </div>
          </div>
        </div>

         
 
      </section>
    </div>
  );
};

export default ProfileViewPage;
