
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
    <div className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-12 text-white sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(14,165,233,0.24),_transparent_34%),radial-gradient(circle_at_bottom_left,_rgba(99,102,241,0.24),_transparent_30%),linear-gradient(135deg,_#020617_0%,_#0f172a_55%,_#111827_100%)]" />
      <div className="absolute left-8 top-12 h-48 w-48 rounded-full bg-cyan-400/15 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />

      <div className="relative mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-6xl items-center">
        <div className="grid w-full gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="max-w-xl space-y-6 text-center lg:text-left">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 backdrop-blur transition hover:border-white/20 hover:bg-white/10"
            >
              <span aria-hidden="true">←</span>
              Back to login
            </Link>

            <div className="space-y-4">
              <span className="inline-flex rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-indigo-200">
                Secure reset
              </span>
              <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Choose a new password and get back in.
              </h2>
              <p className="text-base leading-7 text-slate-300 sm:text-lg">
                Enter a new password below. Use a strong combination so your UniConnect account stays protected.
              </p>
            </div>

            <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="font-semibold text-white">Direct update</p>
                <p className="mt-1">The reset link takes you straight to the password update form.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="font-semibold text-white">Safer access</p>
                <p className="mt-1">Use a password that is unique and easy for you to remember securely.</p>
              </div>
            </div>
          </div>

          <div className="mx-auto w-full max-w-md">
            <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
              <div className="mb-6 space-y-2 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-500 shadow-lg shadow-cyan-500/20">
                  <span className="text-lg font-bold text-white">!</span>
                </div>
                <h3 className="text-2xl font-semibold text-white">Set new password</h3>
                <p className="text-sm leading-6 text-slate-300">
                  Enter your new password using the reset link you received.
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                {error && (
                  <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100" role="alert">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100" role="status">
                    {success}
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="new-password">
                    New password
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    required
                    autoComplete="new-password"
                    value={form.newPassword}
                    onChange={(e) => setForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Enter a strong password"
                    className="block w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-400/10"
                    aria-describedby="password-guidance"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="confirm-password">
                    Confirm new password
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    required
                    autoComplete="new-password"
                    value={form.confirmPassword}
                    onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Repeat the new password"
                    className="block w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-400/10"
                    aria-describedby="password-guidance"
                  />
                </div>

                <p id="password-guidance" className="text-xs leading-5 text-slate-400">
                  Use at least 8 characters and avoid reusing a password from another account.
                </p>

                <button
                  disabled={loading}
                  type="submit"
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Updating password...' : 'Update password'}
                </button>

                <div className="text-center text-sm text-slate-300">
                  Ready to sign in again?{' '}
                  <Link to="/login" className="font-medium text-cyan-300 transition hover:text-cyan-200 hover:underline">
                    Back to login
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
