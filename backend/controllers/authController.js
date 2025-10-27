import { pool } from '../db.js';
import bcrypt from "bcryptjs";
import { signJwt } from '../auth.js';

export async function register(req, res) {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) return res.status(400).json({ error: 'Missing fields' });

    const q1 = await pool.query('select id from users where email=$1', [email]);
    if (q1.rowCount) return res.status(409).json({ error: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);
    const user = await pool.query(
      'insert into users(full_name,email,password_hash) values ($1,$2,$3) returning id,full_name,email',
      [fullName, email, hash]
    );

    // No family yet until user creates or joins one
    const token = signJwt({ uid: user.rows[0].id, email });
    res.json({ token, user: user.rows[0] });
  } catch (e) {
    res.status(500).json({ error: 'Register failed' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const q = await pool.query('select * from users where email=$1', [email]);
    if (!q.rowCount) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, q.rows[0].password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    // Find existing family membership if any
    const mem = await pool.query('select family_id, role from memberships where user_id=$1', [q.rows[0].id]);
    const token = signJwt({
      uid: q.rows[0].id,
      email: q.rows[0].email,
      fid: mem.rowCount ? mem.rows[0].family_id : null,
      role: mem.rowCount ? mem.rows[0].role : null
    });

    res.json({
      token,
      user: { id: q.rows[0].id, full_name: q.rows[0].full_name, email: q.rows[0].email },
      familyId: mem.rowCount ? mem.rows[0].family_id : null
    });
  } catch {
    res.status(500).json({ error: 'Login failed' });
  }
}
