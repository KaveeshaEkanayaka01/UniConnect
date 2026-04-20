import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from './Auth/axios';

const AddSkillPage = () => {
  const navigate = useNavigate();
  const [skillName, setSkillName] = useState('');
  const [proficiency, setProficiency] = useState('Intermediate');
  const [category, setCategory] = useState('TECHNICAL');
  const [relatedActivity, setRelatedActivity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!skillName.trim()) return;

    try {
      setLoading(true);
      setError('');
      await API.post('/student/skills', {
        skillName: skillName.trim(),
        proficiency,
        category,
        relatedActivity: relatedActivity.trim(),
      });
      navigate('/skills');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add skill');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 animate-in zoom-in duration-300">
      
      {/* Card */}
      <div className="rounded-3xl overflow-hidden shadow-xl border border-[#dbe3f5] bg-white">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1e2a78] via-[#2f4bb2] to-[#3b5bdb] px-8 py-6">
          <h1 className="text-2xl font-bold text-white">Add New Skill</h1>
          <p className="text-white/80 text-sm mt-1">
            Build your profile with your abilities
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 p-8 bg-[#f4f6fb]">
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Skill Name */}
          <div>
            <label className="block text-sm font-semibold text-[#1e2a78] mb-1">
              Skill Name
            </label>
            <input
              type="text"
              placeholder="e.g. Python, UI Design"
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              className="w-full rounded-xl border border-[#dbe3f5] bg-white px-4 py-3 text-[#1b2230] outline-none focus:ring-2 focus:ring-[#2f4bb2] focus:border-[#2f4bb2]"
              required
            />
          </div>

          {/* Proficiency */}
          <div>
            <label className="block text-sm font-semibold text-[#1e2a78] mb-2">
              Proficiency Level
            </label>
            <div className="grid grid-cols-2 gap-3">
              {['Beginner', 'Intermediate', 'Advanced', 'Expert'].map(level => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setProficiency(level)}
                  className={`py-3 rounded-xl text-sm font-semibold border transition-all ${
                    proficiency === level
                      ? 'bg-gradient-to-r from-[#1e2a78] to-[#3b5bdb] text-white border-transparent shadow-md'
                      : 'bg-white border-[#dbe3f5] text-[#516072] hover:bg-[#eef2ff]'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-[#1e2a78] mb-1">
              Skill Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-[#dbe3f5] bg-white px-4 py-3 text-[#1b2230] outline-none focus:ring-2 focus:ring-[#2f4bb2] focus:border-[#2f4bb2]"
            >
              <option value="TECHNICAL">Technical</option>
              <option value="SOFT_SKILL">Soft Skill</option>
              <option value="MANAGEMENT">Management</option>
              <option value="DESIGN">Design</option>
            </select>
          </div>

          {/* Activity */}
          <div>
            <label className="block text-sm font-semibold text-[#1e2a78] mb-1">
              Related Club/Activity
            </label>
            <input
              type="text"
              placeholder="e.g. Robotics Club"
              value={relatedActivity}
              onChange={(e) => setRelatedActivity(e.target.value)}
              className="w-full rounded-xl border border-[#dbe3f5] bg-white px-4 py-3 text-[#1b2230] outline-none focus:ring-2 focus:ring-[#2f4bb2] focus:border-[#2f4bb2]"
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col space-y-3 pt-2">
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-white bg-[#ff7a1a] hover:bg-[#ff8c33] transition shadow-lg disabled:opacity-60"
            >
              {loading ? 'Adding...' : 'Add to Profile'}
            </button>

            <button
              type="button"
              onClick={() => navigate('/skills')}
              className="w-full py-3 rounded-xl border border-[#dbe3f5] bg-white text-[#516072] hover:bg-[#eef2ff] font-semibold"
            >
              Cancel
            </button>

          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSkillPage;