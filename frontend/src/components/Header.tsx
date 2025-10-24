import { useEffect, useState } from 'react';
import { useApp } from '../store';
import axios from 'axios';

type Notification = { id: number; message: string; token?: string; created_at: string; read: boolean };

export default function Header() {
  const go = useApp(s => s.go);
  const token = useApp(s => s.token);
  const user = useApp(s => s.user);
  const logout = useApp(s => s.logout);
  const currentDay = useApp(s => s.currentDay);
  const nextDay = useApp(s => s.nextDay);
  const [open, setOpen] = useState(false);
  const [list, setList] = useState<Notification[]>([]);

  useEffect(() => {
    if (token) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function refresh() {
    try { const { data } = await axios.get('http://localhost:4000/notifications', { headers: { Authorization: `Bearer ${token}` } }); setList(data); } catch {}
  }

  function initials() {
    if (!user?.full_name) return '';
    const parts = user.full_name.trim().split(/\s+/);
    const first = parts[0]?.[0] || '';
    const last = parts[parts.length - 1]?.[0] || '';
    return (first + last).toUpperCase();
  }

  return (
    <div className="sticky top-0 z-30 border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 select-none">
          <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-lg font-semibold text-white">Family Planner</span>
            <span className="text-xs text-gray-400 uppercase tracking-wide">Shared living</span>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          {token && (
            <>
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-700 bg-gray-800 text-white text-sm font-medium">
                <span>Day: {currentDay}</span>
                <button onClick={nextDay} className="px-2 py-1 rounded border border-gray-600 hover:bg-gray-700 transition-colors text-xs">
                  Next Day
                </button>
              </div>
              <div className="relative">
                <button onClick={() => { setOpen(!open); if (!open) refresh(); }} className="px-3 md:px-4 py-2 rounded-xl border border-gray-700 bg-gray-800 text-white text-xs md:text-sm font-medium hover:bg-gray-700 transition-all relative">
                  <span className="hidden sm:inline">Notifications</span>
                  <svg className="w-5 h-5 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.868 12.683A17.925 17.925 0 012 21.75V19a2 2 0 012-2h1.152c.245-.591.566-1.112.951-1.572l-1.319-1.319zm13.46-1.46L18.012 12H16a8 8 0 01-8-8V2.664c.547-.743 1.228-1.365 2.028-1.84C6.344 1.343 7 2.787 7 4.25v2.5c0 .138-.009.274-.026.407 1.22.276 2.314.889 3.227 1.753.627.677 1.166 1.466 1.597 2.334.334.65.53 1.349.58 2.064.014.114.02.23.02.345 0 .076-.004.152-.011.226 3.245.228 5.83 2.857 5.83 6.122 0 1.312-.48 2.52-1.291 3.439z" />
                  </svg>
                  {list.some(n => !n.read) && <span className="absolute -top-1 -right-1 inline-block w-3 h-3 rounded-full bg-red-500" />}
                </button>
                {open && (
                  <div className="absolute right-0 mt-3 w-80 md:w-96 max-h-96 overflow-auto rounded-2xl border border-gray-700 bg-gray-900 shadow-2xl">
                    <div className="sticky top-0 z-10 px-4 pt-4 pb-2 bg-gray-900 text-xs font-semibold uppercase tracking-wide text-gray-400 border-b border-gray-700">
                      Notifications
                    </div>
                    <div className="space-y-3 px-4 pb-4">
                      {list.length === 0 && <div className="text-center py-8 text-gray-500">No notifications</div>}
                      {list.map(n => (
                        <div key={n.id} className="p-4 rounded-xl border border-gray-700 bg-gray-800/50">
                          <div className="text-sm font-medium text-white">{n.message}</div>
                          {n.token && (
                            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                              <input readOnly className="flex-1 p-3 rounded-lg border border-gray-600 bg-gray-700 text-white font-mono text-xs" value={n.token} />
                              <button className="px-4 py-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-medium transition-all transform hover:scale-105 flex items-center gap-2" onClick={() => navigator.clipboard.writeText(n.token!)}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                Copy
                              </button>
                            </div>
                          )}
                          {!n.read && (
                            <button className="mt-3 text-xs px-3 py-1.5 rounded-full border border-gray-600 text-gray-400 hover:bg-gray-700 transition-colors" onClick={async () => { await axios.post('http://localhost:4000/notifications/mark-read', { id: n.id }, { headers: { Authorization: `Bearer ${token}` } }); await refresh(); }}>Mark read</button>
                          )}
                          <div className="text-xs mt-2 text-gray-500">{new Date(n.created_at).toLocaleString()}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div title={user?.full_name} className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs md:text-sm font-semibold">
                {initials()}
              </div>
              <button onClick={logout} className="px-3 md:px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs md:text-sm font-medium transition-all transform hover:scale-105">
                <span className="hidden sm:inline">Logout</span>
                <svg className="w-5 h-5 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </>
          )}
          {!token && (
            <>
              <button onClick={() => go('login')} className="px-4 py-2 rounded-xl border border-gray-700 bg-gray-800 text-white text-sm font-medium hover:bg-gray-700 transition-all">
                Login
              </button>
              <button onClick={() => go('signup')} className="px-4 py-2 rounded-xl bg-linear-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white text-sm font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]">
                Sign up
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

