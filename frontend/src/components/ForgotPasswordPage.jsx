import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API from './Auth/axios';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const res = await API.post('/auth/forgot-password', { email: email.trim() });
      setSuccess(res.data?.message || 'If an account exists for that email, a reset link has been sent.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-12 text-white sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.28),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.18),_transparent_30%),linear-gradient(135deg,_#020617_0%,_#0f172a_55%,_#111827_100%)]" />
      <div className="absolute left-10 top-10 h-48 w-48 rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-6xl items-center">
        <div className="grid w-full gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="max-w-xl space-y-6 text-center lg:text-left">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 backdrop-blur transition hover:border-white/20 hover:bg-white/10"
            >
              <span aria-hidden="true">←</span>
              Back to login
            </Link>

            <div className="space-y-4">
              <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                Account recovery
              </span>
              <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Reset your password without the friction.
              </h2>
              <p className="text-base leading-7 text-slate-300 sm:text-lg">
                Enter the email linked to your UniConnect account and we&apos;ll send a secure reset link.
                If the address exists, the message will arrive shortly.
              </p>
            </div>

            <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="font-semibold text-white">Fast recovery</p>
                <p className="mt-1">A single link takes you straight to a new password screen.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="font-semibold text-white">Privacy first</p>
                <p className="mt-1">We never reveal whether an email is registered on the page.</p>
              </div>
            </div>
          </div>

          <div className="mx-auto w-full max-w-md">
            <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
              <div className="mb-6 space-y-2 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-lg shadow-indigo-500/20">
                  <span className="text-lg font-bold text-white">?</span>
                </div>
                <h3 className="text-2xl font-semibold text-white">Forgot password</h3>
                <p className="text-sm leading-6 text-slate-300">
                  We&apos;ll email you a reset link so you can get back into your account.
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
                  <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="forgot-password-email">
                    Email address
                  </label>
                  <input
                    id="forgot-password-email"
                    type="email"
                    required
                    autoComplete="email"
                    inputMode="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="block w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-400/10"
                    aria-describedby="forgot-password-help"
                  />
                  <p id="forgot-password-help" className="mt-2 text-xs leading-5 text-slate-400">
                    Use the email address associated with your UniConnect account.
                  </p>
                </div>

                <button
                  disabled={loading}
                  type="submit"
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Sending reset link...' : 'Send reset link'}
                </button>

                <p className="text-center text-xs leading-5 text-slate-400">
                  If you do not see the email, check spam or try again after a few minutes.
                </p>

                <div className="text-center text-sm text-slate-300">
                  Remember your password?{' '}
                  <Link to="/login" className="font-medium text-cyan-300 transition hover:text-cyan-200 hover:underline">
                    Sign in
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

export default ForgotPasswordPage;
