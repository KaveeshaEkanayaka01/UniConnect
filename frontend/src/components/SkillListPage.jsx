
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import API from './Auth/axios';

const SkillsListPage  = () => {
  const [skillRows, setSkillRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removingId, setRemovingId] = useState('');

  const deriveSkillRows = (profile) => {
    if (!profile) return [];

    if (Array.isArray(profile.skillDetails) && profile.skillDetails.length > 0) {
      return profile.skillDetails.map((detail) => {
        const skillObject = detail?.skill;
        const resolvedId =
          (skillObject && skillObject._id) ||
          (typeof skillObject === 'string' ? skillObject : '') ||
          detail?._id ||
          '';

        return {
          id: resolvedId,
          name:
            (skillObject && skillObject.name) ||
            (typeof skillObject === 'string' ? skillObject : '') ||
            'Unknown Skill',
          proficiency: detail?.proficiency || 'Intermediate',
          relatedActivity: detail?.relatedActivity || '',
          category: skillObject?.category || '',
        };
      });
    }

    const fallbackSkills = Array.isArray(profile.skills) ? profile.skills : [];
    return fallbackSkills.map((skill) => ({
      id: typeof skill === 'string' ? '' : skill?._id || '',
      name: typeof skill === 'string' ? skill : skill?.name || 'Unknown Skill',
      proficiency: 'Intermediate',
      relatedActivity: '',
      category: skill?.category || '',
    }));
  };

  const loadSkills = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await API.get('/student/dashboard');
      setSkillRows(deriveSkillRows(res.data?.profile));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load skills');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSkills();
  }, []);

  const renderedSkills = useMemo(() => skillRows || [], [skillRows]);

  const handleRemove = async (skillId) => {
    try {
      setRemovingId(skillId);
      const res = await API.delete(`/student/skills/${skillId}`);
      setSkillRows(deriveSkillRows(res.data));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove skill');
    } finally {
      setRemovingId('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Skill Management</h1>
        <Link to="/skills/add" className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors">Add New Skill</Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 bg-gray-50">
          <p className="text-gray-500 text-sm font-medium">Manage and showcase the professional and technical skills you've acquired during your university activities.</p>
          {error && <p className="text-red-600 mt-2">{error}</p>}
        </div>
        
        <ul className="divide-y divide-gray-100">
          {!loading && renderedSkills.map((skill, index) => {
            const resolvedSkillId = skill?.id || '';
            const skillLabel = skill?.name;

            return (
            <li key={resolvedSkillId || skillLabel || index} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors group">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{skillLabel || 'Unknown Skill'}</h3>
                  <p className="text-xs text-gray-400">
                    {skill?.category ? `${skill.category.replace('_', ' ')} • ` : ''}
                    {skill?.proficiency || 'Intermediate'}
                    {skill?.relatedActivity ? ` • ${skill.relatedActivity}` : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleRemove(resolvedSkillId)}
                  disabled={!resolvedSkillId || removingId === resolvedSkillId}
                  className="text-sm text-red-500 font-bold hover:underline disabled:opacity-60"
                >
                  {removingId === resolvedSkillId ? 'Removing...' : 'Remove'}
                </button>
              </div>
            </li>
            );
          })}
          {!loading && renderedSkills.length === 0 && (
            <li className="p-12 text-center">
              <p className="text-gray-400 font-medium">No skills added yet. Start by adding one!</p>
            </li>
          )}
          {loading && (
            <li className="p-12 text-center">
              <p className="text-gray-400 font-medium">Loading skills...</p>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default SkillsListPage;
