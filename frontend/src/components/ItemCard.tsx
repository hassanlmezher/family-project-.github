export default function ItemCard({ item, onStatus, onDelete }: { item: { id: number; name: string; quantity?: string; status: 'pending' | 'bought' | 'skipped'; added_by_name?: string }; onStatus: (s: 'pending'|'bought'|'skipped') => void; onDelete: () => void; }) {
  const getCardStyles = () => {
    switch (item.status) {
      case 'bought':
        return 'border-cyan-500/30 bg-cyan-500/15 text-cyan-400 shadow-cyan-500/20';
      case 'skipped':
        return 'border-purple-500/30 bg-purple-500/15 text-purple-400 shadow-purple-500/20';
      default:
        return 'border-gray-700 bg-gray-800/60 text-white shadow-gray-900/50';
    }
  };

  const isCompleted = item.status !== 'pending';

  return (
    <div
      className={`group rounded-3xl border-2 p-8 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${getCardStyles()}`}
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <div
            className={`text-xl font-bold ${
              isCompleted ? 'line-through opacity-75' : 'text-white'
            }`}
          >
            {item.name}
          </div>
          <div
            className={`mt-2 text-sm font-medium ${
              isCompleted ? 'opacity-70' : 'text-gray-300'
            }`}
          >
            {item.quantity || 'No quantity'}
            {item.added_by_name && <span className="ml-3 text-xs">- Added by {item.added_by_name}</span>}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:justify-end">
          {item.status === 'pending' && (
            <>
              <button
                onClick={() => onStatus('bought')}
                className="px-6 py-3 rounded-2xl bg-linear-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white text-sm font-bold uppercase tracking-wide shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Bought
              </button>
              <button
                onClick={() => onStatus('skipped')}
                className="px-6 py-3 rounded-2xl bg-linear-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white text-sm font-bold uppercase tracking-wide shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                Skip
              </button>
            </>
          )}
          {item.status !== 'pending' && (
            <button
              onClick={() => onStatus('pending')}
              className="px-6 py-3 rounded-2xl border-2 border-gray-600 bg-gray-700/50 text-gray-300 text-sm font-bold uppercase tracking-wide hover:bg-gray-600 hover:border-gray-500 transition-all transform hover:scale-105 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              Undo
            </button>
          )}
          <button
            onClick={onDelete}
            className="px-6 py-3 rounded-2xl bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-sm font-bold uppercase tracking-wide shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

