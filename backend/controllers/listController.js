
import { pool } from '../db.js';
import { addDays, formatISO, startOfWeek } from 'date-fns';

function saturdayRange(date = new Date()) {
  const weekStart = startOfWeek(date, { weekStartsOn: 6 });
  const weekEnd = addDays(weekStart, 6);
  return { weekStart, weekEnd };
}

function getCurrentDay() {
  return new Date().toLocaleString('en-US', { weekday: 'long' });
}

async function ensureCurrentList(fid) {
  const { weekStart, weekEnd } = saturdayRange();

  // Check if a current list already exists
  const existingList = await pool.query('select * from lists where family_id=$1 and archived_at is null', [fid]);
  if (!existingList.rowCount) {
    // Insert new list if none exists
    await pool.query(
      `insert into lists(family_id,week_start,week_end)
       values($1,$2,$3)`,
      [fid, formatISO(weekStart, { representation: 'date' }), formatISO(weekEnd, { representation: 'date' })]
    );
  }
}

async function archiveCurrentList(fid) {
  const client = await pool.connect();
  try {
    await client.query('begin');

    const current = await client.query(
      'select id, week_start from lists where family_id=$1 and archived_at is null for update',
      [fid]
    );

    if (!current.rowCount) {
      await client.query('commit');
      return null;
    }

    const cur = current.rows[0];

    await client.query(
      "update items set status='skipped' where list_id=$1 and status <> 'bought'",
      [cur.id]
    );
    await client.query('update lists set archived_at=now() where id=$1', [cur.id]);

    const nextRange = saturdayRange(addDays(new Date(cur.week_start), 7));
    await client.query('commit');
    return nextRange;
  } catch (err) {
    await client.query('rollback');
    throw err;
  } finally {
    client.release();
  }
}

export async function getCurrentList(req, res) {
  const { fid } = req.user;
  if (!fid) return res.json({ list: null, items: [] });

  try {
    const { weekStart, weekEnd } = saturdayRange();

    // Check if a current list already exists
    const existingList = await pool.query('select * from lists where family_id=$1 and archived_at is null', [fid]);
    if (!existingList.rowCount) {
      // Insert new list if none exists
      await pool.query(
        `insert into lists(family_id,week_start,week_end)
         values($1,$2,$3)`,
        [fid, formatISO(weekStart, { representation: 'date' }), formatISO(weekEnd, { representation: 'date' })]
      );
    }

    const list = await pool.query('select * from lists where family_id=$1 and archived_at is null', [fid]);
    if (!list.rowCount) return res.status(500).json({ error: 'Server error' });

    const items = await pool.query(
      `select it.*, u.full_name as added_by_name
       from items it left join users u on u.id=it.added_by
       where it.list_id=$1 order by it.id desc`,
      [list.rows[0].id]
    );
    res.json({ list: list.rows[0], items: items.rows });
  } catch (err) {
    console.error('Error in getCurrentList:', err);
    res.status(500).json({ error: 'Server error' });
  }
}

export async function addItem(req, res) {
  const { fid, uid } = req.user;
  const { name, quantity } = req.body;

  try {
    // Ensure a current list exists
    await ensureCurrentList(fid);

    const list = await pool.query('select id from lists where family_id=$1 and archived_at is null', [fid]);
    if (!list.rowCount) return res.status(400).json({ error: 'No current list' });

    const q = await pool.query(
      'insert into items(list_id,name,quantity,added_by) values($1,$2,$3,$4) returning *',
      [list.rows[0].id, name, quantity || null, uid]
    );
    res.json(q.rows[0]);
  } catch (err) {
    console.error('Error in addItem:', err);
    res.status(500).json({ error: 'Server error' });
  }
}

export async function updateItem(req, res) {
  const { id } = req.params;
  const { status } = req.body; // 'pending' | 'bought' | 'skipped'
  const q = await pool.query('update items set status=$1 where id=$2 returning *', [status, id]);
  res.json(q.rows[0]);
}

export async function deleteItem(req, res) {
  await pool.query('delete from items where id=$1', [req.params.id]);
  res.json({ ok: true });
}

export async function archiveWeek(req, res) {
  const { fid } = req.user;
  const currentDay = (req.headers['x-current-day'] || getCurrentDay()).toString().toLowerCase();
  if (currentDay !== 'saturday') {
    return res.status(400).json({ error: 'Can only archive on Saturday' });
  }

  try {
    const nextRange = await archiveCurrentList(fid);
    if (!nextRange) return res.status(400).json({ error: 'No list to archive' });

    const next = await pool.query(
      `insert into lists(family_id,week_start,week_end)
       values($1,$2,$3)
       on conflict (family_id) where archived_at is null
       do update set week_start = excluded.week_start, week_end = excluded.week_end
       returning *`,
      [fid, formatISO(nextRange.weekStart, { representation: 'date' }), formatISO(nextRange.weekEnd, { representation: 'date' })]
    );

    res.json({ ok: true, newList: next.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to archive week' });
  }
}

export async function listArchives(req, res) {
  const { fid } = req.user;
  const q = await pool.query(
    'select * from lists where family_id=$1 and archived_at is not null order by week_start desc',
    [fid]
  );
  res.json(q.rows);
}

export async function getArchivedListItems(req, res) {
  const { id } = req.params;
  const { fid } = req.user;

  const listCheck = await pool.query(
    'select id from lists where id=$1 and family_id=$2 and archived_at is not null',
    [id, fid]
  );
  if (!listCheck.rowCount) return res.status(404).json({ error: 'Archived list not found' });

  const items = await pool.query(
    `select it.*, u.full_name as added_by_name
     from items it left join users u on u.id=it.added_by
     where it.list_id=$1 order by it.id desc`,
    [id]
  );

  const normalized = items.rows.map(item => ({
    ...item,
    status: item.status === 'bought' ? 'bought' : 'skipped'
  }));

  const bought = normalized.filter(item => item.status === 'bought');
  const skipped = normalized.filter(item => item.status !== 'bought');

  res.json({ bought, skipped });
}
