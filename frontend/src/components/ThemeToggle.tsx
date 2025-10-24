import { useApp } from '../store';

export default function ThemeToggle() {
  const theme = useApp(s => s.theme);
  const setTheme = useApp(s => s.setTheme);
  return (
    <button
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="px-4 py-2 rounded-xl border border-gray-700 bg-gray-800 text-white text-xs font-medium hover:bg-gray-700 transition-all flex items-center gap-2"
      title="Toggle theme">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
      {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
    </button>
  );
}
