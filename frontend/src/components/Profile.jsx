import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
      <section className="bg-white p-6 rounded-xl shadow border">
        <h3 className="text-lg font-bold mb-3">Badges</h3>

        {!profile.badges || profile.badges.length === 0 ? (
          <p className="text-gray-400 text-sm">No badges yet</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {profile.badges.map((badge) => (
              <div
                key={badge._id}
                className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-xl shadow"
                title={badge.name}
              >
                {badge.icon || "🏅"}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ProfileViewPage;
