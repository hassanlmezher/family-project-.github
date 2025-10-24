import { pool } from '../db.js';
import { signJwt } from '../auth.js';
import { v4 as uuidv4 } from 'uuid';

function makeInviteToken() {
  const s = uuidv4().split('-')[0].toUpperCase();
  const t = Math.random().toString(36).slice(2,6).toUpperCase();
  return `FAM-${s}-${t}`;
}

export async function listInvites(req, res) {
  const { fid } = req.user;
  if (!fid) return res.json([]);
  const q = await pool.query('select id,email,token,created_at from invites where family_id=$1 order by id desc', [fid]);
  res.json(q.rows);
}

export async function createInvite(req, res) {
  const { fid } = req.user;
  if (!fid) return res.status(400).json({ error: 'No family' });
  const { email } = req.body; // required for notification-based flow
  if (!email) return res.status(400).json({ error: 'Email required to send invite' });
  const emailNorm = String(email).trim().toLowerCase();

  // Check if the email exists in the users table
  const userExists = await pool.query('select id from users where email = $1', [emailNorm]);
  if (userExists.rowCount === 0) {
    return res.status(400).json({ error: 'Email address does not exist in our system' });
  }

  const token = makeInviteToken();
  const q = await pool.query('insert into invites(family_id,email,token) values($1,$2,$3) returning id,email,token', [fid, emailNorm, token]);

  // Create a notification entry for the recipient containing the token
  try {
    await pool.query('insert into notifications(user_email, message, token) values($1,$2,$3)', [
      emailNorm,
      'You have been invited to join a family. Use the token to join.',
      token
    ]);
  } catch (err) {
    console.error('Failed to create notification:', err.message);
    // Continue without failing the invite
  }
  res.json({ id: q.rows[0].id, email: emailNorm });
}

export async function joinWithToken(req, res) {
  try {
    const { token } = req.body;
    const tokenNorm = String(token || '').trim().toUpperCase();
    const { uid, email } = req.user;

    // If user already in a family, switch: remove old membership then add new
    const mem = await pool.query('select family_id from memberships where user_id=$1', [uid]);

    // Accept either family token or invite token
    const inv = await pool.query(
      `select i.id, i.family_id from invites i where i.token=$1
       union all
       select null::bigint as id, f.id as family_id from families f where f.token=$1`,
      [tokenNorm]
    );
    if (!inv.rowCount) return res.status(404).json({ error: 'Invalid token' });

    const familyId = inv.rows[0].family_id;
    if (mem.rowCount) {
      await pool.query('delete from memberships where user_id=$1', [uid]);
    }
    await pool.query('insert into memberships(user_id,family_id,role) values($1,$2,$3)', [uid, familyId, 'member']);
    if (inv.rows[0].id) {
      await pool.query('update invites set used_by=$1, used_at=now() where id=$2', [uid, inv.rows[0].id]);
    }
    const jwtNew = signJwt({ uid, email, fid: familyId, role: 'member' });
    res.json({ ok: true, token: jwtNew, familyId });
  } catch {
    res.status(500).json({ error: 'Join failed' });
  }
}
