import { Router } from 'express';
import { requireAuth } from '../auth.js';
import { getCurrentList, addItem, updateItem, deleteItem, archiveWeek, listArchives, getArchivedListItems } from '../controllers/listController.js';

const r = Router();

r.get('/current', requireAuth, getCurrentList);

r.post('/items', requireAuth, addItem);

r.patch('/items/:id', requireAuth, updateItem);

r.delete('/items/:id', requireAuth, deleteItem);

r.post('/archive-week', requireAuth, archiveWeek);

r.get('/archives', requireAuth, listArchives);

r.get('/:id/items', requireAuth, getArchivedListItems);

export default r;
