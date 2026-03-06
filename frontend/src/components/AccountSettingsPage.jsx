
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from './Auth/axios';

const AccountSettingsPage  = () => {
  const [notifications, setNotifications] = useState(true);
  const [privacy, setPrivacy] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const res = await API.get('/auth/me');
        setEmail(res.data.email || '');
      } catch (error) {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        setEmail(storedUser.email || '');
      }
    };

    loadCurrentUser();
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <h1 className="text-3xl font-black text-gray-900">Account Settings</h1>

      <div className="space-y-6">
        {/* Profile Info Summary */}
        <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold mb-6 text-gray-800">Login & Security</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between py-4 border-b border-gray-50">
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Email Address</p>
                <p className="font-bold text-gray-900">{email || 'No email available'}</p>
              </div>
              <button className="px-4 py-2 text-sm font-bold text-gray-400 border border-gray-200 rounded-xl cursor-not-allowed" disabled>Update Email</button>
            </div>
            
            <div className="flex items-center justify-between py-4 border-b border-gray-50">
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Password</p>
                <p className="font-bold text-gray-900">••••••••••••</p>
              </div>
              <Link to="/settings/password" className="px-4 py-2 text-sm font-bold text-indigo-600 border border-indigo-100 rounded-xl hover:bg-indigo-50 transition-colors">Change Password</Link>
            </div>
          </div>
        </section>

        {/* Preferences */}
        <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold mb-6 text-gray-800">Preferences</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-gray-800">Email Notifications</h4>
                <p className="text-sm text-gray-500">Receive weekly updates on club activities.</p>
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
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-white p-8 rounded-3xl shadow-sm border border-red-50">
          <h3 className="text-xl font-bold mb-2 text-red-600">Danger Zone</h3>
          <p className="text-sm text-gray-500 mb-6">Once you delete your account, all data is permanently removed.</p>
          <button className="px-6 py-2 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-600 hover:text-white transition-all border border-red-100">Deactivate Account</button>
        </section>
      </div>
    </div>
  );
};

export default AccountSettingsPage;
