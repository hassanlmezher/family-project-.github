import { pool } from '../db.js';
import { signJwt } from '../auth.js';
import { formatISO, addDays, startOfWeek } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

function famToken() {
  const s = uuidv4().split('-')[0].toUpperCase();
  const t = uuidv4().split('-')[1].slice(0,4).toUpperCase();
  return `FAM-${s}-${t}`;
}

function saturdayRange(date = new Date()) {
  // week starts on Saturday
  const weekStart = startOfWeek(date, { weekStartsOn: 6 }); // 6 = Saturday
  const weekEnd = addDays(weekStart, 6);
  return { weekStart, weekEnd };
}

export async function me(req, res) {
  // returns current user + family info
  const { uid } = req.user;
  const u = await pool.query('select id, full_name, email from users where id=$1', [uid]);
  const m = await pool.query(
    `select m.family_id, m.role, f.nickname, f.token from memberships m
     join families f on f.id=m.family_id where m.user_id=$1`, [uid]
  );
  res.json({ user: u.rows[0], membership: m.rows[0] || null });
}

export async function members(req, res) {
  try {
    const { fid } = req.user;
    if (!fid) return res.json([]);
    const q = await pool.query(
      `select u.id, u.full_name, u.email, m.role
       from memberships m join users u on u.id=m.user_id
       where m.family_id=$1 order by u.full_name`,
      [fid]
    );
    res.json(q.rows);
  } catch {
    res.status(500).json({ error: 'Failed to load members' });
  }
}

export async function createFamily(req, res) {
  try {
    const { nickname } = req.body;
    if (!nickname) return res.status(400).json({ error: 'Missing nickname' });
    // Ensure user not in a family
    const mem = await pool.query('select 1 from memberships where user_id=$1', [req.user.uid]);
    if (mem.rowCount) return res.status(400).json({ error: 'User already in a family' });

    const token = famToken();
    const fam = await pool.query(
      'insert into families(nickname, token) values($1,$2) returning id,nickname,token',
      [nickname, token]
    );
    await pool.query(
      'insert into memberships(user_id,family_id,role) values($1,$2,$3)',
      [req.user.uid, fam.rows[0].id, 'admin']
    );

    // Ensure a current list exists for this week
    const { weekStart, weekEnd } = saturdayRange();
    await pool.query(
      'insert into lists(family_id, week_start, week_end) values ($1,$2,$3) on conflict do nothing',
      [fam.rows[0].id, formatISO(weekStart, { representation:'date' }), formatISO(weekEnd, { representation:'date' })]
    );

    // refresh JWT with fid
    const tokenJwt = signJwt({ uid: req.user.uid, email: req.user.email, fid: fam.rows[0].id, role: 'admin' });
    res.json({ family: fam.rows[0], token: tokenJwt });
  } catch {
    res.status(500).json({ error: 'Create family failed' });
  }
}

export async function leaveFamily(req, res) {
  try {
    const { uid, fid } = req.user;
    if (!fid) return res.status(400).json({ error: 'Not in a family' });
    await pool.query('delete from memberships where user_id=$1', [uid]);
    const tokenJwt = signJwt({ uid, email: req.user.email, fid: null, role: null });
    res.json({ ok: true, token: tokenJwt });
  } catch {
    res.status(500).json({ error: 'Leave failed' });
  }
}
