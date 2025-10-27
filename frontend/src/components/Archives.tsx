import { useEffect, useState } from 'react';
import api from '../api';

type ArchivedSummary = {
  bought: { id: number; name: string; quantity?: string; status: string; added_by_name?: string }[];
  skipped: { id: number; name: string; quantity?: string; status: string; added_by_name?: string }[];
};

type ArchivedList = {
  id: number;
  week_start: string;
  week_end: string;
};

export default function Archives({ goBack }: { goBack: () => void }) {
  const [lists, setLists] = useState<ArchivedList[]>([]);
  const [selected, setSelected] = useState<ArchivedList | null>(null);
  const [summary, setSummary] = useState<ArchivedSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.archives();
        setLists(data);
      } catch {
        setError('Failed to load archives');
      }
    })();
  }, []);

  const openDetails = async (list: ArchivedList) => {
    setSelected(list);
    setLoading(true);
    setSummary(null);
    setError('');
    try {
      const { data } = await api.getArchivedItems(list.id);
      setSummary(data);
    } catch {
      setError('Failed to load archived items');
    } finally {
      setLoading(false);
    }
  };

  const closeDetails = () => {
    setSelected(null);
    setSummary(null);
    setError('');
  };

  const renderItems = (title: string, items: { id: number; name: string; quantity?: string; status: string; added_by_name?: string }[], accent: string) => (
    <div className="rounded-2xl border border-slate-200/20 bg-slate-900/30 p-5">
      <div className={`text-sm font-semibold uppercase tracking-wide ${accent}`}>{title} ({items.length})</div>
      {items.length === 0 ? (
        <div className="mt-4 text-sm text-slate-500">No items.</div>
      ) : (
        <div className="mt-4 space-y-3">
          {items.map(item => (
            <div key={item.id} className="rounded-xl border border-slate-200/20 bg-slate-900/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-white">{item.name}</div>
                  {item.quantity && <div className="text-xs text-slate-400">Qty: {item.quantity}</div>}
                </div>
                <div className="text-xs uppercase tracking-wide text-slate-400">{item.status}</div>
              </div>
              {item.added_by_name && (
                <div className="mt-2 text-xs text-slate-500">Added by {item.added_by_name}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="rounded-3xl border border-slate-200/30 bg-slate-900/60 shadow-[0_35px_80px_-40px_rgba(15,118,110,0.6)]">
        <div className="px-6 py-5 border-b border-slate-200/20 flex items-center justify-between">
          <div>
            <div className="text-sm uppercase tracking-wide text-slate-400">Archives</div>
            <div className="text-2xl font-semibold text-white">Shopping history</div>
          </div>
          <button onClick={goBack} className="inline-flex items-center gap-2 rounded-xl border border-slate-200/30 bg-slate-900/70 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-200 transition hover:bg-slate-800">
            Back to current list
          </button>
        </div>
        <div className="p-6 space-y-6">
          {error && <div className="rounded-xl border border-rose-400/50 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>}

          {!selected && (
            <div className="space-y-4">
              {lists.length === 0 ? (
                <div className="rounded-2xl border border-slate-200/20 bg-slate-900/40 py-12 text-center text-slate-400">
                  No archived lists yet. Archive a week to build your history.
                </div>
              ) : (
                lists.map(list => (
                  <div key={list.id} className="rounded-2xl border border-slate-200/30 bg-slate-900/50 p-6 shadow-lg transition hover:-translate-y-0.5 hover:shadow-2xl">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="text-lg font-semibold text-white">{list.week_start} {'->'} {list.week_end}</div>
                        <div className="text-xs uppercase tracking-wide text-slate-400">Archived shopping list</div>
                      </div>
                      <button
                        onClick={() => openDetails(list)}
                        className="mt-3 inline-flex items-center justify-center rounded-xl bg-linear-to-r from-cyan-500 via-teal-500 to-emerald-500 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-lg shadow-teal-500/30 transition hover:-translate-y-0.5 md:mt-0"
                      >
                        View details
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {selected && (
            <div className="space-y-5">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-lg font-semibold text-white">{selected.week_start} {'->'} {selected.week_end}</div>
                  <div className="text-xs uppercase tracking-wide text-slate-400">Archived shopping list summary</div>
                </div>
                <button onClick={closeDetails} className="inline-flex items-center justify-center rounded-xl border border-slate-200/30 bg-slate-900/70 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-200 transition hover:bg-slate-800">
                  Back to archives
                </button>
              </div>

              {loading && <div className="rounded-2xl border border-slate-200/20 bg-slate-900/40 px-4 py-6 text-center text-slate-400">Loading archived items...</div>}

              {!loading && summary && (
                <div className="grid gap-5 lg:grid-cols-2">
                  {renderItems('Bought items', summary.bought, 'text-emerald-300')}
                  {renderItems('Skipped items', summary.skipped, 'text-rose-300')}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
