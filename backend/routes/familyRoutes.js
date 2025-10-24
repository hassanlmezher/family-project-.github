import { Router } from 'express';

import { requireAuth } from '../auth.js';

import { me, createFamily, leaveFamily, members } from '../controllers/familyController.js';

const r = Router();

r.get('/me', requireAuth, me);

r.get('/members', requireAuth, members);

r.post('/create', requireAuth, createFamily);

r.post('/leave', requireAuth, leaveFamily);

export default r;
