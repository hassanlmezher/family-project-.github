import { useEffect, useState } from 'react';
import api, { notifyApi } from '../api';
import { useApp } from '../store';

export default function WelcomeJoinCreate() {
  const user = useApp(s => s.user);
  const setAuth = useApp(s => s.setAuth);
  const [familyName, setFamilyName] = useState('The Smiths');
  const [token, setToken] = useState('');
  const [notifications, setNotifications] = useState<Array<{ id: number; message: string; token: string; read: boolean }>>([]);

  useEffect(() => { loadNotifications(); }, []);
  async function loadNotifications() {
    try {
      const { data } = await notifyApi.list();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  }

  async function createFamily() {
    const { data } = await api.createFamily(familyName);
    setAuth({ token: data.token, user, familyId: data.family.id });
  }

  async function join() {
    const { data } = await api.joinToken(token.trim());
    setAuth({ token: data.token, user, familyId: data.familyId });
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="bg-white dark:bg-black/80 p-6 rounded-2xl shadow">
        <h3 className="text-xl font-semibold mb-2">Join a Family</h3>
        <p className="opacity-70 mb-4">Paste your invitation token to join your family</p>
        <input className="w-full p-3 rounded-xl border mb-4" placeholder="FAM-XXXX-XXXX"
          value={token} onChange={e=>setToken(e.target.value)} />
        <button onClick={join} className="w-full p-3 rounded-xl bg-cyan-600 text-white">Join Family</button>
        {!!notifications.filter(n => n.token).length && (
          <div className="mt-6 text-sm">
            <div className="mb-2 font-semibold">Invite Notifications</div>
            {notifications.filter(n => n.token).slice(0,2).map(n=>(
              <div key={n.id} className="flex items-center gap-2 mb-2">
                <input readOnly className="flex-1 p-2 rounded border" value={n.token}/>
                <button onClick={()=>navigator.clipboard.writeText(n.token)} className="px-2 py-1 border rounded">Copy</button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="bg-white dark:bg-black/80 p-6 rounded-2xl shadow">
        <h3 className="text-xl font-semibold mb-2">Create Your Own Family</h3>
        <p className="opacity-70 mb-4">Start fresh with a new family group</p>
        <input className="w-full p-3 rounded-xl border mb-4" value={familyName} onChange={e=>setFamilyName(e.target.value)} />
        <button onClick={createFamily} className="w-full p-3 rounded-xl bg-green-600 text-white">Create Family</button>
      </div>
    </div>
  );
}
