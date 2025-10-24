import { useEffect } from 'react';
import { useApp } from './store';
import AuthLogin from './components/AuthLogin';
import AuthSignup from './components/AuthSignup';
import WelcomeJoinCreate from './components/WelcomeJoinCreate';
import Dashboard from './components/Dashboard';
import Members from './components/Members';
import Archives from './components/Archives';
import Header from './components/Header';
import api from './api';
import './index.css';

export default function App() {
  const view = useApp(s => s.view);
  const go = useApp(s => s.go);
  const theme = useApp(s => s.theme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.body.className = theme === 'dark'
      ? 'bg-slate-950 text-slate-100 antialiased'
      : 'bg-slate-100 text-slate-900 antialiased';
  }, [theme]);

  const isAuthView = view === 'login' || view === 'signup';
  const mainWrapBase = 'relative mx-auto w-full max-w-6xl px-6';
  const mainWrap = isAuthView
    ? `${mainWrapBase} flex min-h-[calc(100vh-88px)] items-center justify-center py-6 sm:py-8`
    : `${mainWrapBase} py-10 lg:py-14`;
  const outerWrap = isAuthView
    ? 'relative min-h-screen overflow-hidden transition-colors duration-300'
    : 'relative min-h-screen transition-colors duration-300';

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = isAuthView ? 'hidden' : '';
    return () => { document.body.style.overflow = previous; };
  }, [isAuthView]);

  return (
    <div className={outerWrap}>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_10%_0%,rgba(139,92,246,0.18),transparent_55%),radial-gradient(circle_at_90%_0%,rgba(59,130,246,0.18),transparent_55%)] dark:bg-[radial-gradient(circle_at_10%_0%,rgba(168,85,247,0.28),transparent_60%),radial-gradient(circle_at_90%_0%,rgba(14,165,233,0.22),transparent_55%)]" />
      <Header />
      <div className={mainWrap}>
        <div className="pointer-events-none absolute inset-0 -z-10 rounded-[3rem] bg-white/40 blur-3xl dark:bg-slate-900/30" />
        {view === 'login' && <AuthLogin onSignup={() => go('signup')} />}
        {view === 'signup' && <AuthSignup onLogin={() => go('login')} />}
        {view === 'welcome' && <WelcomeJoinCreate />}
        {view === 'home' && (
          <Dashboard
            goMembers={() => go('members')}
            goArchives={() => go('archives')}
            archiveNow={async () => {
              await api.archiveWeek();
            }}
          />
        )}
        {view === 'members' && <Members goBack={() => go('home')} />}
        {view === 'archives' && <Archives goBack={() => go('home')} />}
      </div>
    </div>
  );
}

