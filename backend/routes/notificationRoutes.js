import { Router } from 'express';
import { requireAuth } from '../auth.js';
import { listMyNotifications, markRead } from '../controllers/notificationsController.js';

const r = Router();

r.get('/', requireAuth, listMyNotifications);

r.post('/mark-read', requireAuth, markRead);

export default r;
