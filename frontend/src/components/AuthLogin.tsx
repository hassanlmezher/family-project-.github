import { useState, type FormEvent, useCallback } from 'react';
import api from '../api';
import { useApp } from '../store';

export default function AuthLogin({ onSignup }: { onSignup: () => void }) {
  const setAuth = useApp(s => s.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  const submit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    setErr('');
    try {
      const { data } = await api.login({ email, password });
      setAuth({ token: data.token, user: data.user, familyId: data.familyId });
    } catch (e: any) {
      setErr(e?.response?.data?.error || 'Login failed');
    }
  }, [email, password, setAuth]);

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6">
      <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-linear-to-br from-slate-950 via-blue-950 to-slate-950 shadow-[0_40px_80px_-40px_rgba(8,145,178,0.4)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.25),transparent_55%)] opacity-80" />
        <div className="relative z-10 px-6 py-6 sm:px-8 sm:py-8 space-y-5">
          <header className="text-center space-y-3">
            <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-r from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/40">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-white">Welcome back</h1>
              <p className="text-sm text-slate-300/80">Sign in to your Family Planner account</p>
            </div>
          </header>

          <form onSubmit={submit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-white/80">Email Address</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </span>
                <input
                  className="w-full rounded-xl border border-white/15 bg-white/10 pl-10 pr-3 py-3 text-sm text-white placeholder-white/45 shadow-inner focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                  placeholder="Enter your email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-white/80">Password</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  className="w-full rounded-xl border border-white/15 bg-white/10 pl-10 pr-3 py-3 text-sm text-white placeholder-white/45 shadow-inner focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                  placeholder="Enter your password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            {err && (
              <div className="rounded-xl border border-rose-400/40 bg-rose-500/15 px-4 py-3 text-sm font-medium text-rose-100">
                {err}
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-linear-to-r from-cyan-500 via-blue-500 to-indigo-500 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-lg shadow-cyan-500/40 transition-transform duration-200 hover:-translate-y-0.5"
            >
              Sign In
            </button>
          </form>

          <div className="text-center text-xs text-white/70">
            Don't have an account?{' '}
            <button onClick={onSignup} className="font-semibold text-cyan-300 hover:text-cyan-200">Create one</button>
          </div>
        </div>
      </div>
    </div>
  );
}
