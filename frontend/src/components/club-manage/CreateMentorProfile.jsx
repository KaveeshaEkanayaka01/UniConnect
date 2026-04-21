import React, { useState } from "react";
import { createMentorProfile } from "../../services/mentorshipService";

const parseList = (value) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const CreateMentorProfile = ({ clubId, onCreated }) => {
  const [form, setForm] = useState({
    title: "",
    bio: "",
    skills: "",
    interests: "",
    expertiseLevel: "Intermediate",
    availability: "Available",
    maxMentees: 5,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const payload = {
        ...form,
        skills: parseList(form.skills),
        interests: parseList(form.interests),
        maxMentees: Number(form.maxMentees),
      };

      await createMentorProfile(clubId, payload);

      setSuccess("Mentor profile created successfully");
      setForm({
        title: "",
        bio: "",
        skills: "",
        interests: "",
        expertiseLevel: "Intermediate",
        availability: "Available",
        maxMentees: 5,
      });

      if (onCreated) onCreated();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to create mentor profile");
    } finally {
      setLoading(false);
    }
  };

 return (
  <form
    onSubmit={handleSubmit}
    className="p-6 rounded-2xl border border-[#0B1E8A]/10 bg-[#0B1E8A]/5 shadow-sm space-y-5"
  >
    <div>
      <h2 className="text-2xl font-black text-[#0B1E8A]">
        Create Mentor Profile
      </h2>
      <p className="text-sm text-gray-600 mt-1">
        Add your expertise so students can find you.
      </p>
    </div>

    {error && (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
        {error}
      </div>
    )}

    {success && (
      <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700 text-sm">
        {success}
      </div>
    )}

    <div>
      <label className="block text-sm font-bold text-[#0B1E8A] mb-2">
        Title
      </label>
      <input
        type="text"
        name="title"
        value={form.title}
        onChange={handleChange}
        className="w-full rounded-xl border border-[#0B1E8A]/20 bg-white px-4 py-3 text-[#0B1E8A] placeholder:text-gray-400 outline-none focus:border-[#F36C21] focus:ring-2 focus:ring-[#F36C21]/30"
        placeholder="Frontend Mentor"
      />
    </div>

    <div>
      <label className="block text-sm font-bold text-[#0B1E8A] mb-2">
        Bio
      </label>
      <textarea
        name="bio"
        value={form.bio}
        onChange={handleChange}
        rows={4}
        className="w-full rounded-xl border border-[#0B1E8A]/20 bg-white px-4 py-3 text-[#0B1E8A] placeholder:text-gray-400 outline-none focus:border-[#F36C21] focus:ring-2 focus:ring-[#F36C21]/30"
        placeholder="I help students with React, project structure, and UI design."
      />
    </div>

    <div>
      <label className="block text-sm font-bold text-[#0B1E8A] mb-2">
        Skills
      </label>
      <input
        type="text"
        name="skills"
        value={form.skills}
        onChange={handleChange}
        className="w-full rounded-xl border border-[#0B1E8A]/20 bg-white px-4 py-3 text-[#0B1E8A] placeholder:text-gray-400 outline-none focus:border-[#F36C21] focus:ring-2 focus:ring-[#F36C21]/30"
        placeholder="React, Node, MongoDB"
      />
    </div>

    <div>
      <label className="block text-sm font-bold text-[#0B1E8A] mb-2">
        Interests
      </label>
      <input
        type="text"
        name="interests"
        value={form.interests}
        onChange={handleChange}
        className="w-full rounded-xl border border-[#0B1E8A]/20 bg-white px-4 py-3 text-[#0B1E8A] placeholder:text-gray-400 outline-none focus:border-[#F36C21] focus:ring-2 focus:ring-[#F36C21]/30"
        placeholder="Web Development, Leadership"
      />
    </div>

    <div className="grid md:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-bold text-[#0B1E8A] mb-2">
          Expertise Level
        </label>
        <select
          name="expertiseLevel"
          value={form.expertiseLevel}
          onChange={handleChange}
          className="w-full rounded-xl border border-[#0B1E8A]/20 bg-white px-4 py-3 text-[#0B1E8A] outline-none focus:border-[#F36C21] focus:ring-2 focus:ring-[#F36C21]/30"
        >
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
          <option value="Expert">Expert</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-bold text-[#0B1E8A] mb-2">
          Availability
        </label>
        <select
          name="availability"
          value={form.availability}
          onChange={handleChange}
          className="w-full rounded-xl border border-[#0B1E8A]/20 bg-white px-4 py-3 text-[#0B1E8A] outline-none focus:border-[#F36C21] focus:ring-2 focus:ring-[#F36C21]/30"
        >
          <option value="Available">Available</option>
          <option value="Busy">Busy</option>
          <option value="Unavailable">Unavailable</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-bold text-[#0B1E8A] mb-2">
          Max Mentees
        </label>
        <input
          type="number"
          name="maxMentees"
          value={form.maxMentees}
          onChange={handleChange}
          min="1"
          className="w-full rounded-xl border border-[#0B1E8A]/20 bg-white px-4 py-3 text-[#0B1E8A] outline-none focus:border-[#F36C21] focus:ring-2 focus:ring-[#F36C21]/30"
        />
      </div>
    </div>

    <div className="pt-2">
      <button
        type="submit"
        disabled={loading}
        className="px-6 py-3 rounded-xl bg-[#F36C21] text-white font-bold hover:bg-orange-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "Creating..." : "Create Mentor Profile"}
      </button>
    </div>
  </form>
);
};

export default CreateMentorProfile;