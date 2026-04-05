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
      className="p-4 bg-white rounded-xl shadow-sm border space-y-4"
    >
      <div>
        <h2 className="text-xl font-semibold">Create Mentor Profile</h2>
        <p className="text-sm text-gray-600 mt-1">
          Add your expertise so students can find you.
        </p>
      </div>

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

      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2"
          placeholder="Frontend Mentor"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Bio</label>
        <textarea
          name="bio"
          value={form.bio}
          onChange={handleChange}
          rows={3}
          className="w-full border rounded-lg px-3 py-2"
          placeholder="I help students with React, project structure, and UI design."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Skills</label>
        <input
          type="text"
          name="skills"
          value={form.skills}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2"
          placeholder="React, Node, MongoDB"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Interests</label>
        <input
          type="text"
          name="interests"
          value={form.interests}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2"
          placeholder="Web Development, Leadership"
        />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Expertise Level</label>
          <select
            name="expertiseLevel"
            value={form.expertiseLevel}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
            <option value="Expert">Expert</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Availability</label>
          <select
            name="availability"
            value={form.availability}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="Available">Available</option>
            <option value="Busy">Busy</option>
            <option value="Unavailable">Unavailable</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Max Mentees</label>
          <input
            type="number"
            name="maxMentees"
            value={form.maxMentees}
            onChange={handleChange}
            min="1"
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {loading ? "Creating..." : "Create Mentor Profile"}
      </button>
    </form>
  );
};

export default CreateMentorProfile;