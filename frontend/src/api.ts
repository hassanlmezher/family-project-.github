import axios from 'axios';
import { useApp } from './store';

const rawBaseUrl = (import.meta.env.VITE_API_URL ?? '').trim();
const baseURL = rawBaseUrl ? rawBaseUrl.replace(/\/+$/, '') : '/api';

const API = axios.create({ baseURL });

export function setToken(t: string|null) {
  if (t) API.defaults.headers.common['Authorization'] = `Bearer ${t}`;
  else delete API.defaults.headers.common['Authorization'];
}

// Add interceptor to include current day in headers
API.interceptors.request.use((config) => {
  const state = useApp.getState();
  if (state.currentDay) {
    config.headers['x-current-day'] = state.currentDay;
  }
  return config;
});

export default {
  register: (data: { fullName: string; email: string; password: string }) => API.post('/auth/register', data),
  login:    (data: { email: string; password: string }) => API.post('/auth/login', data),
  me:       () => API.get('/family/me'),
  members:  () => API.get('/family/members'),
  createFamily: (nickname: string) => API.post('/family/create', { nickname }),
  leaveFamily:  () => API.post('/family/leave'),
  listInvites:  () => API.get('/invites'),
  createInvite: (email?: string|null) => API.post('/invites', { email }),
  joinToken:    (token: string) => API.post('/invites/join', { token }),
  currentList:  () => API.get('/lists/current'),
  addItem:      (payload: { name: string; quantity?: string }) => API.post('/lists/items', payload),
  updateItem:   (id: number, status: 'pending'|'bought'|'skipped') => API.patch(`/lists/items/${id}`, { status }),
  deleteItem:   (id: number) => API.delete(`/lists/items/${id}`),
  archives:     () => API.get('/lists/archives'),
  archiveWeek:  () => API.post('/lists/archive-week'),
  getArchivedItems: (listId: number) => API.get(`/lists/${listId}/items`)
};

export const notifyApi = {
  list: () => API.get('/notifications'),
  markRead: (id: number) => API.post('/notifications/mark-read', { id })
};

