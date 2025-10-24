import { useEffect, useState } from 'react';
import api from '../api';

export default function Members({ goBack }: { goBack: () => void }) {
  const [me, setMe] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);

  async function load() {
    const [{ data: meData }, { data: memList }] = await Promise.all([api.me(), api.members()]);
    setMe(meData);
    setMembers(memList);
  }
  useEffect(()=>{ load(); },[]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-gray-900/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-800 shadow-2xl">
        <button onClick={goBack} className="mb-6 px-4 py-2 rounded-xl border border-gray-700 bg-gray-800 text-white text-xs font-medium hover:bg-gray-700 transition-all flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to dashboard
        </button>
        {me?.membership ? (
          <>
            <div className="mb-2 text-3xl font-semibold text-white">Family members</div>
            <p className="mb-8 text-gray-400 text-sm">Everyone here has access to the shared shopping lists, archives, and notifications.</p>
            <div className="grid gap-6 md:grid-cols-3">
              {members.map(m => (
                <MemberCard key={m.id} name={m.full_name} email={m.email} role={m.role} />
              ))}
            </div>
            <div className="mt-10 p-6 rounded-2xl border border-gray-700 bg-gray-800/50">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold text-white">Family token</div>
                  <p className="text-gray-400 text-sm">Share securely with anyone you want to invite directly.</p>
                </div>
                <button
                  onClick={()=>navigator.clipboard.writeText(me.membership.token)}
                  className="px-4 py-2 rounded-xl bg-linear-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy token
                </button>
              </div>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input readOnly className="flex-1 p-4 rounded-xl border border-gray-700 bg-gray-800 text-white font-mono text-xs" value={me.membership.token}/>
              </div>
            </div>
          </>
        ) : (
          <div className="py-12 text-center text-gray-500">You are not in a family.</div>
        )}
      </div>
    </div>
  );
}

function MemberCard({ name, email, role }: { name: string; email: string; role: string; }) {
  const initials = name.split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase();
  const colors = ['from-cyan-500 via-sky-500 to-blue-500', 'from-purple-500 via-fuchsia-500 to-pink-500', 'from-green-500 via-emerald-500 to-teal-500', 'from-orange-500 via-amber-500 to-rose-500'];
  const colorClass = colors[Math.abs(name.length + email.length) % colors.length];

  return (
    <div className="p-6 rounded-2xl border border-gray-700 bg-gray-800/50 text-center shadow-lg hover:shadow-xl transition-all">
      <div className={`mx-auto mb-4 w-16 h-16 rounded-xl bg-linear-to-br ${colorClass} flex items-center justify-center text-white text-xl font-semibold shadow-lg`}>{initials}</div>
      <div className="text-lg font-semibold text-white">{name}</div>
      <div className="mt-1 text-sm text-gray-400">{email}</div>
      <div className="mt-4">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide text-white ${
          role === 'admin' ? 'bg-linear-to-r from-yellow-600 to-orange-600' :
          'bg-linear-to-r from-blue-600 to-indigo-600'
        }`}>
          {role === 'admin' ? 'Admin' : 'Member'}
        </span>
      </div>
    </div>
  );
}

