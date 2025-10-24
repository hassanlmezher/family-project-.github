import express from "express";
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import authRoutes from './routes/authRoutes.js'; 
import familyRoutes from './routes/familyRoutes.js';
import inviteRoutes from './routes/inviteRoutes.js';
import listRoutes from './routes/listRoutes.js'; 
import notificationRoutes from './routes/notificationRoutes.js'; 
import { ensureInviteAndNotificationTables } from './setup.js';

const app = express();

app.use(cors());

app.use(express.json());

app.get('/', (_, res) => 
res.json({ ok: true, name: 'Family Shopping Planner API' })
);

app.use('/auth', authRoutes);
app.use('/family', familyRoutes);
app.use('/invites', inviteRoutes);
app.use('/lists', listRoutes);
app.use('/notifications', notificationRoutes);

app.use((err, req, res, next) => {
  console.error('Unhandled', err);
  res.status(500).json({ error: 'Server error' });
});

app.listen(process.env.PORT || 4000, () => {
  console.log(`API on http://localhost:${process.env.PORT || 4000}`);
});
