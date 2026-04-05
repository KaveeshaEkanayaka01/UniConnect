
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from './Auth/axios';

const AddSkillPage  = () => {
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
    <div className="max-w-md mx-auto animate-in zoom-in duration-300">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">Add New Skill</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Skill Name</label>
            <input 
              type="text" 
              placeholder="e.g. Python, Graphic Design, Project Management"
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Proficiency Level</label>
            <div className="grid grid-cols-2 gap-2">
              {['Beginner', 'Intermediate', 'Advanced', 'Expert'].map(level => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setProficiency(level)}
                  className={`py-2 text-sm font-medium rounded-lg border transition-all ${proficiency === level ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Skill Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="TECHNICAL">Technical</option>
              <option value="SOFT_SKILL">Soft Skill</option>
              <option value="MANAGEMENT">Management</option>
              <option value="DESIGN">Design</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Related Club/Activity (Optional)</label>
            <input 
              type="text" 
              placeholder="e.g. Robotics Club"
              value={relatedActivity}
              onChange={(e) => setRelatedActivity(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="flex flex-col space-y-3 pt-4">
            <button type="submit" disabled={loading} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-colors disabled:opacity-60">
              {loading ? 'Adding...' : 'Add to Profile'}
            </button>
            <button type="button" onClick={() => navigate('/skills')} className="w-full py-2 text-gray-500 hover:text-gray-700 font-medium">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSkillPage;
