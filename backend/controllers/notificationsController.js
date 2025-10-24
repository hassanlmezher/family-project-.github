import { pool } from '../db.js';

export async function listMyNotifications(req, res) {
  try {
    const email = String(req.user.email || '').toLowerCase();
    const q = await pool.query(
      'select id, message, token, created_at, read from notifications where user_email=$1 order by id desc',
      [email]
    );
    res.json(q.rows);
  } catch (e) {
    res.status(500).json({ error: 'Failed to load notifications' });
  }
}

export async function markRead(req, res) {
  try {
    const { id } = req.body;
    const email = String(req.user.email || '').toLowerCase();
    await pool.query('update notifications set read=true where id=$1 and user_email=$2', [id, email]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to mark read' });
  }
}
