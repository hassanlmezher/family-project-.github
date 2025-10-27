import { useEffect, useState } from 'react';
import { useApp } from '../store';
import api from '../api';
import ItemCard from './ItemCard';

export default function Dashboard({ goMembers, goArchives }: { goMembers: () => void; goArchives: () => void; }) {
  const familyId = useApp(s => s.familyId);
  const currentDay = useApp(s => s.currentDay);
  const lastAutoArchive = useApp(s => s.lastAutoArchive);
  const markAutoArchived = useApp(s => s.markAutoArchived);
  const [items, setItems] = useState<{ id: number; name: string; quantity?: string; status: 'pending' | 'bought' | 'skipped'; added_by_name?: string }[]>([]);
  const [name, setName] = useState('');
  const [qty, setQty] = useState('');

  async function load() {
    const { data } = await api.currentList();
    setItems(data.items);
  }

  useEffect(() => {
    async function refresh() {
      if (!familyId) return;
      if (currentDay.toLowerCase() === 'saturday' && lastAutoArchive !== currentDay) {
        await api.archiveWeek();
        markAutoArchived(currentDay);
      }
      await load();
    }
    refresh();
  }, [familyId, currentDay, lastAutoArchive, markAutoArchived]);

  async function add() {
    if (!name.trim()) return;
    const { data } = await api.addItem({ name, quantity: qty });
    setItems([data, ...items]);
    setName('');
    setQty('');
  }

  async function setStatus(id: number, s: 'pending'|'bought'|'skipped') {
    const { data } = await api.updateItem(id, s);
    setItems(items.map(it => it.id === id ? data : it));
  }

  async function del(id: number) {
    await api.deleteItem(id);
    setItems(items.filter(it => it.id !== id));
  }

  return (
    <div className="flex flex-col gap-4 md:grid md:grid-cols-[1fr_340px] md:gap-8">
      <div className="bg-white dark:bg-black/80 p-4 md:p-6 rounded-2xl shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg md:text-xl font-semibold">This Week's Shopping List</h3>
        </div>
        <div className="flex flex-col gap-3 mb-4">
          <input className="w-full p-3 rounded-xl border text-sm md:text-base" placeholder="Item name" value={name} onChange={e => setName(e.target.value)} />
          <input className="w-full p-3 rounded-xl border text-sm md:text-base" placeholder="Quantity" value={qty} onChange={e => setQty(e.target.value)} />
          <button onClick={add} className="w-full px-4 py-3 rounded-xl bg-cyan-600 text-white text-sm md:text-base">Add Item</button>
        </div>
        {items.map(it => (
          <ItemCard key={it.id} item={it} onStatus={(s) => setStatus(it.id, s)} onDelete={() => del(it.id)} />
        ))}
      </div>

      <div className="bg-white dark:bg-black/80 p-4 md:p-6 rounded-2xl shadow">
        <div className="flex flex-col gap-2 mb-4 sm:flex-row">
          <button className="w-full sm:w-auto px-3 py-2 rounded-xl border text-sm md:text-base" onClick={goMembers}>View Members</button>
          <button className="w-full sm:w-auto px-3 py-2 rounded-xl border text-sm md:text-base" onClick={goArchives}>Archived</button>
        </div>
        <InvitePanel />
        <SwitchFamily />
      </div>
    </div>
  );
}

function InvitePanel() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function create() {
    if (!email.trim()) return;
    setLoading(true);
    setMessage('');
    try {
      await api.createInvite(email.trim());
      setMessage('Invite sent successfully!');
      setEmail('');
    } catch (e: unknown) {
      const error = e as { response?: { data?: { error?: string } } };
      setMessage('Failed to send invite: ' + (error?.response?.data?.error || 'Unknown error'));
    }
    setLoading(false);
  }

  const statusStyles = message.startsWith('Invite sent')
    ? 'border-emerald-300/70 bg-emerald-100/70 text-emerald-700 dark:border-emerald-400/40 dark:bg-emerald-500/10 dark:text-emerald-200'
    : 'border-rose-300/70 bg-rose-100/70 text-rose-700 dark:border-rose-400/40 dark:bg-rose-500/10 dark:text-rose-200';

  return (
    <div className="flex w-full flex-col gap-4 rounded-2xl border border-violet-200/60 bg-linear-to-br from-violet-500/15 via-fuchsia-500/10 to-transparent p-6 shadow-inner shadow-violet-500/10 dark:border-violet-800/30 dark:from-violet-500/20 dark:via-fuchsia-500/20 dark:to-transparent">
      <div>
        <div className="text-lg font-semibold text-violet-700 dark:text-violet-200">Invite family member</div>
        <p className="text-sm text-violet-600/90 dark:text-violet-200/80">Send a secure invite token straight to their notifications.</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          className="w-full flex-1 min-w-0 rounded-2xl border border-violet-200 bg-white/80 px-5 py-3 text-sm font-medium text-violet-800 shadow-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-violet-500 dark:border-violet-500/60 dark:bg-slate-950/60 dark:text-violet-50"
          placeholder="member@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && create()}
        />
        <button
          onClick={create}
          disabled={loading || !email.trim()}
          className="inline-flex w-full items-center justify-center rounded-2xl bg-linear-to-r from-violet-500 via-purple-500 to-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/40 transition-transform duration-300 hover:-translate-y-0.5 disabled:translate-y-0 disabled:bg-slate-400 disabled:shadow-none disabled:cursor-not-allowed sm:w-auto"
        >
          {loading ? 'Sending...' : 'Send Invite'}
        </button>
      </div>
      {message && (
        <div className={`rounded-xl border p-3 text-sm font-medium ${statusStyles}`}>
          {message}
        </div>
      )}
      <div className="text-xs uppercase tracking-wide text-violet-600/80 dark:text-violet-200/70">Invites send a private notification to the recipient with a join token.</div>
    </div>
  );
}

function SwitchFamily() {
  const user = useApp(s => s.user);
  const setAuth = useApp(s => s.setAuth);
  const go = useApp(s => s.go);
  const [tok, setTok] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function join() {
    if (!tok.trim()) return;
    setLoading(true);
    setMessage('');
    try {
      const { data } = await api.joinToken(tok.trim());
      setAuth({ token: data.token, user, familyId: data.familyId });
      setMessage('Successfully joined family!');
      setTok('');
      go('home');
    } catch (e: unknown) {
      const error = e as { response?: { data?: { error?: string } } };
      setMessage('Failed to join: ' + (error?.response?.data?.error || 'Invalid token'));
    }
    setLoading(false);
  }

  const statusStyles = message.startsWith('Successfully')
    ? 'border-emerald-300/70 bg-emerald-100/70 text-emerald-700 dark:border-emerald-400/40 dark:bg-emerald-500/10 dark:text-emerald-200'
    : 'border-rose-300/70 bg-rose-100/70 text-rose-700 dark:border-rose-400/40 dark:bg-rose-500/10 dark:text-rose-200';

  return (
    <div className="flex w-full flex-col gap-4 rounded-2xl border border-emerald-200/70 bg-linear-to-br from-emerald-500/10 via-emerald-500/5 to-transparent p-6 shadow-inner shadow-emerald-500/10 dark:border-emerald-700/40 dark:from-emerald-500/20 dark:via-emerald-500/10 dark:to-transparent">
      <div>
        <div className="text-lg font-semibold text-emerald-700 dark:text-emerald-200">Switch family</div>
        <p className="text-sm text-emerald-600/90 dark:text-emerald-200/80">Join another household instantly with a token or family code.</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          className="w-full flex-1 min-w-0 rounded-2xl border border-emerald-200 bg-white/80 px-5 py-3 text-sm font-medium text-emerald-800 shadow-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-emerald-500/60 dark:bg-slate-950/60 dark:text-emerald-50"
          placeholder="Enter invite or family token"
          value={tok}
          onChange={e => setTok(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && join()}
        />
        <button
          onClick={join}
          disabled={loading || !tok.trim()}
          className="inline-flex w-full items-center justify-center rounded-2xl bg-linear-to-r from-emerald-500 via-teal-500 to-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-transform duration-300 hover:-translate-y-0.5 disabled:translate-y-0 disabled:bg-slate-400 disabled:shadow-none disabled:cursor-not-allowed sm:w-auto"
        >
          {loading ? 'Joining...' : 'Join'}
        </button>
      </div>
      {message && (
        <div className={`rounded-xl border p-3 text-sm font-medium ${statusStyles}`}>
          {message}
        </div>
      )}
    </div>
  );
}
