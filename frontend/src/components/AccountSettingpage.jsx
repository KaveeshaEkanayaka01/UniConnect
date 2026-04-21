
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from './Auth/axios';

const AccountSettingsPage  = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [error, setError] = useState('');
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    faculty: '',
    yearOfStudy: '',
    lastLogin: '',
  });
  const [accountStatus, setAccountStatus] = useState('Active');
  const [notifications, setNotifications] = useState(true);
  const [privacy, setPrivacy] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        setError('');
        const { data } = await API.get('/student/dashboard');
        const user = data?.user || {};
        const profile = data?.profile || {};

        setProfileData({
          fullName: user.fullName || 'Unknown User',
          email: user.email || '-',
          faculty: profile.faculty || user.faculty || '-',
          yearOfStudy: profile.yearOfStudy || user.yearOfStudy || '-',
          lastLogin: user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Not available',
        });
        setAccountStatus(user.isActive ? 'Active' : 'Inactive');

        const rawPrefs = localStorage.getItem('accountSettingsPrefs');
        if (rawPrefs) {
          const prefs = JSON.parse(rawPrefs);
          if (typeof prefs.notifications === 'boolean') setNotifications(prefs.notifications);
          if (typeof prefs.privacy === 'boolean') setPrivacy(prefs.privacy);
        }
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load account settings.');
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  useEffect(() => {
    localStorage.setItem(
      'accountSettingsPrefs',
      JSON.stringify({ notifications, privacy })
    );
  }, [notifications, privacy]);

  const handleDeactivateAccount = async () => {
    const confirmed = window.confirm(
      'Deactivate your account? You will not be able to log in until an admin reactivates it.'
    );

    if (!confirmed) {
      return;
    }

    const currentPassword = window.prompt('Enter your current password to confirm deactivation');

    if (!currentPassword) {
      return;
    }

    try {
      setIsDeactivating(true);
      setError('');

      await API.put('/auth/deactivate-account', { currentPassword });

      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to deactivate account.');
    } finally {
      setIsDeactivating(false);
    }
  };

  if (isLoading) {
    return <div className="max-w-3xl mx-auto p-6 text-gray-500">Loading account settings...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <h1 className="text-3xl font-black text-gray-900">Account Settings</h1>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 px-4 py-3 text-sm font-medium">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold mb-6 text-gray-800">Login & Security</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between py-4 border-b border-gray-50">
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Account Holder</p>
                <p className="font-bold text-gray-900">{profileData.fullName}</p>
              </div>
              <span className={`px-3 py-1 text-xs font-black rounded-full border ${accountStatus === 'Active' ? 'text-emerald-700 bg-emerald-50 border-emerald-100' : 'text-rose-700 bg-rose-50 border-rose-100'}`}>
                {accountStatus}
              </span>
            </div>

            <div className="flex items-center justify-between py-4 border-b border-gray-50">
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Email Address</p>
                <p className="font-bold text-gray-900">{profileData.email}</p>
              </div>
              <span className="px-4 py-2 text-sm font-bold text-gray-500 border border-gray-100 rounded-xl bg-gray-50">Managed by Profile</span>
            </div>
            
            <div className="flex items-center justify-between py-4 border-b border-gray-50">
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Password</p>
                <p className="font-bold text-gray-900">••••••••••••</p>
              </div>
              <Link to="/settings/password" className="px-4 py-2 text-sm font-bold text-indigo-600 border border-indigo-100 rounded-xl hover:bg-indigo-50 transition-colors">Change Password</Link>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">Faculty</p>
                <p className="font-bold text-gray-900 mt-1">{profileData.faculty}</p>
              </div>
              <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">Year of Study</p>
                <p className="font-bold text-gray-900 mt-1">{profileData.yearOfStudy}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">Last login: {profileData.lastLogin}</p>
          </div>
        </section>

        <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold mb-6 text-gray-800">Preferences</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-gray-800">Email Notifications</h4>
                <p className="text-sm text-gray-500">Receive weekly updates on clubs and events.</p>
              </div>
              <button 
                onClick={() => setNotifications(!notifications)}
                className={`w-14 h-8 rounded-full transition-all flex items-center px-1 ${notifications ? 'bg-indigo-600 justify-end' : 'bg-gray-200 justify-start'}`}
              >
                <div className="w-6 h-6 bg-white rounded-full shadow-md"></div>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-gray-800">Private Profile</h4>
                <p className="text-sm text-gray-500">Hide your profile from non-club members.</p>
              </div>
              <button 
                onClick={() => setPrivacy(!privacy)}
                className={`w-14 h-8 rounded-full transition-all flex items-center px-1 ${privacy ? 'bg-indigo-600 justify-end' : 'bg-gray-200 justify-start'}`}
              >
                <div className="w-6 h-6 bg-white rounded-full shadow-md"></div>
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Preferences are saved automatically on this device.
            </p>
          </div>
        </section>

        <section className="bg-white p-8 rounded-3xl shadow-sm border border-red-50">
          <h3 className="text-xl font-bold mb-2 text-red-600">Danger Zone</h3>
          <p className="text-sm text-gray-500 mb-6">Deactivating your account will block future logins until it is reactivated.</p>
          <button
            type="button"
            onClick={handleDeactivateAccount}
            disabled={isDeactivating || accountStatus === 'Inactive'}
            className="px-6 py-2 bg-red-600 text-white font-bold rounded-xl border border-red-700 hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isDeactivating ? 'Deactivating...' : accountStatus === 'Inactive' ? 'Account Deactivated' : 'Deactivate Account'}
          </button>
        </section>
      </div>
    </div>
  );
};

export default AccountSettingsPage;
