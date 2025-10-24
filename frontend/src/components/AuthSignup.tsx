import { useState, type FormEvent, useCallback } from 'react';
import api from '../api';
import { useApp } from '../store';

export default function AuthSignup({ onLogin }: { onLogin: () => void }) {
  const setAuth = useApp(s => s.setAuth);
  const [fullName, setFull] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  const submit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    setErr('');
    try {
      const { data } = await api.register({ fullName, email, password });
      setAuth({ token: data.token, user: data.user, familyId: null });
    } catch (e: any) {
      setErr(e?.response?.data?.error || 'Signup failed');
    }
  }, [fullName, email, password, setAuth]);

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-5">
      <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-linear-to-br from-slate-950 via-purple-950 to-slate-950 shadow-[0_40px_80px_-40px_rgba(168,85,247,0.4)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.25),transparent_55%)] opacity-80" />
        <div className="relative z-10 px-5 py-5 sm:px-7 sm:py-7 space-y-4">
          <header className="text-center space-y-2">
            <div className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-r from-blue-400 via-cyan-400 to-indigo-500 shadow-lg shadow-violet-500/40">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11c1.104 0 2-.672 2-1.5S17.104 8 16 8s-2 .672-2 1.5S14.896 11 16 11zM8 11c1.104 0 2-.672 2-1.5S9.104 8 8 8s-2 .672-2 1.5S6.896 11 8 11zm8 3c2.21 0 4 1.343 4 3v2h-4v-2c0-.795-.316-1.558-.879-2.121A2.996 2.996 0 0016 14zm-8 0a3 3 0 012.121.879C10.684 15.442 11 16.205 11 17v2H3v-2c0-1.657 1.79-3 4-3z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-white">Join Family Planner</h1>
              <p className="text-xs text-slate-300/80">Create an account and start planning together</p>
            </div>
          </header>

          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-white/80">Full name</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A9 9 0 1118.364 5.56M15 11a3 3 0 10-6 0 3 3 0 006 0z" />
                  </svg>
                </span>
                <input
                  className="w-full rounded-xl border border-white/15 bg-white/10 pl-10 pr-3 py-2 text-sm text-white placeholder-white/45 shadow-inner focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={e => setFull(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-white/80">Email Address</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </span>
                <input
                  className="w-full rounded-xl border border-white/15 bg-white/10 pl-10 pr-3 py-2 text-sm text-white placeholder-white/45 shadow-inner focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
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
                  className="w-full rounded-xl border border-white/15 bg-white/10 pl-10 pr-3 py-2 text-sm text-white placeholder-white/45 shadow-inner focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                  placeholder="Create a password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            {err && (
              <div className="rounded-xl border border-rose-400/40 bg-rose-500/15 px-3 py-2 text-xs font-medium text-rose-100">
                {err}
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-linear-to-r from-indigo-500 via-cyan-500 to-emerald-500 px-5 py-2 text-sm font-semibold uppercase tracking-wide text-white shadow-lg shadow-cyan-500/40 transition-transform duration-200 hover:-translate-y-0.5"
            >
              Sign Up
            </button>
          </form>

          <div className="text-center text-xs text-white/70">
            Already have an account?{' '}
            <button onClick={onLogin} className="font-semibold text-cyan-300 hover:text-cyan-200">Sign in</button>
          </div>
        </div>
      </div>
    </div>
  );
}
