import axios from 'axios';
import { useApp } from './store';

// ✅ Force the frontend to use backend on port 4000 in dev
const rawBaseUrl = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api').trim();
const baseURL = rawBaseUrl.replace(/\/+$/, ''); // remove trailing slashes

// Create Axios instance
const API = axios.create({ baseURL });

// ✅ Ensure JWT token is attached when logged in
export function setToken(t: string | null) {
  if (t) API.defaults.headers.common['Authorization'] = `Bearer ${t}`;
  else delete API.defaults.headers.common['Authorization'];
}

// ✅ Interceptor to attach current day header
API.interceptors.request.use((config) => {
  const state = useApp.getState();
  if (state.currentDay) {
    config.headers['x-current-day'] = state.currentDay;
  }
  return config;
});

export default {
  register: (data: any) => API.post('/auth/register', data),
  login:    (data: any) => API.post('/auth/login', data),
  me:       () => API.get('/family/me'),
  members:  () => API.get('/family/members'),
  createFamily: (nickname: any) => API.post('/family/create', { nickname }),
  leaveFamily:  () => API.post('/family/leave'),
  listInvites:  () => API.get('/invites'),
  createInvite: (email: any) => API.post('/invites', { email }),
  joinToken:    (token: any) => API.post('/invites/join', { token }),
  currentList:  () => API.get('/lists/current'),
  addItem:      (payload: any) => API.post('/lists/items', payload),
  updateItem:   (id: any, status: any) => API.patch(`/lists/items/${id}`, { status }),
  deleteItem:   (id: any) => API.delete(`/lists/items/${id}`),
  archives:     () => API.get('/lists/archives'),
  archiveWeek:  () => API.post('/lists/archive-week'),
  getArchivedItems: (listId: any) => API.get(`/lists/${listId}/items`)
};

export const notifyApi = {
  list: () => API.get('/notifications'),
  markRead: (id: any) => API.post('/notifications/mark-read', { id })
};
