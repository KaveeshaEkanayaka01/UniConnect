
import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import API from './Auth/axios';

const ResetPasswordPage  = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const [form, setForm] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!token) {
      setError('Invalid or missing reset token.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      await API.post(`/auth/reset-password/${token}`, {
        newPassword: form.newPassword,
      });
      setSuccess('Password updated successfully. Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">Set new password</h2>
        <p className="mt-2 text-center text-sm text-gray-600">Enter your new password using the reset link.</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}
            <div>
              <label className="block text-sm font-medium text-gray-700">New Password</label>
              <input
                type="password"
                required
                value={form.newPassword}
                onChange={(e) => setForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
              <input
                type="password"
                required
                value={form.confirmPassword}
                onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 shadow-sm"
              />
            </div>
            <button disabled={loading} type="submit" className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60">
              {loading ? 'Updating...' : 'Update Password'}
            </button>

            <div className="text-center text-sm">
              <Link to="/login" className="text-indigo-600 hover:underline font-medium">
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
