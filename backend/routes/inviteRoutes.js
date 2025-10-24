import { Router } from 'express';
import { requireAuth } from '../auth.js';
import { listInvites, createInvite, joinWithToken } from '../controllers/inviteController.js';

const r = Router();

r.get('/', requireAuth, listInvites);

r.post('/', requireAuth, createInvite);

r.post('/join', requireAuth, joinWithToken);

export default r;
