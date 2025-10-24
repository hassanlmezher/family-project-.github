import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { setToken } from './api';
import type { User } from './types';

type View = 'login'|'signup'|'welcome'|'home'|'members'|'archives';
type Theme = 'light'|'dark';

type SetAuthPayload = { token: string|null; user: User|null; familyId: number|null };

export type AppState = {
  token: string|null;
  user: User|null;
  familyId: number|null;
  view: View;
  theme: Theme;
  currentDay: string;
  lastAutoArchive: string|null;
  setTheme: (t: Theme) => void;
  go: (v: View) => void;
  setAuth: (payload: SetAuthPayload) => void;
  logout: () => void;
  nextDay: () => void;
  markAutoArchived: (day: string) => void;
  resetAutoArchive: () => void;
};

export const useApp = create<AppState>()(persist((set, _get) => ({
  token: null,
  user: null,
  familyId: null,
  view: 'login',
  theme: (localStorage.getItem('fsp-theme') as Theme) || 'light',
  currentDay: 'Monday',
  lastAutoArchive: null,

  setTheme: (t: Theme) => { localStorage.setItem('fsp-theme', t); set({ theme: t }); },
  go: (v: View) => set({ view: v }),

  setAuth: ({ token, user, familyId }: SetAuthPayload) => {
    set({ token, user, familyId, view: familyId ? 'home' : 'welcome' });
    setToken(token);
  },

  logout: () => {
    set({ token: null, user: null, familyId: null, view: 'login' });
    setToken(null);
  },

  nextDay: () => set((state) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const currentIndex = days.indexOf(state.currentDay);
    const nextIndex = (currentIndex + 1) % days.length;
    const nextDay = days[nextIndex];
    return {
      currentDay: nextDay,
      lastAutoArchive: nextDay === 'Saturday' ? state.lastAutoArchive : null
    };
  }),

  markAutoArchived: (day: string) => set({ lastAutoArchive: day }),
  resetAutoArchive: () => set({ lastAutoArchive: null })
}), { name: 'fsp-store' }));

// re-hydrate axios auth header
const s = useApp.getState();
if (s.token) setToken(s.token);
