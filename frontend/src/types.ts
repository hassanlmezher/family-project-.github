export type User = { id: number; full_name: string; email: string };
export type Membership = { family_id: number; role: 'admin'|'member'; nickname: string; token: string };
export type Item = { id: number; name: string; quantity?: string; status: 'pending'|'bought'|'skipped'; added_by_name?: string };
export type List = { id: number; week_start: string; week_end: string; archived_at?: string|null };
export type AuthState = {
  token: string|null;
  user: User|null;
  familyId: number|null;
  view: 'login'|'signup'|'welcome'|'home'|'members'|'archives';
  theme: 'light'|'dark';
};
