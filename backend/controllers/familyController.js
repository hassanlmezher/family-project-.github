// backend/controllers/familyController.js
import { pool } from "../db.js";
import { signJwt } from "../auth.js";
import { addDays, formatISO, startOfWeek } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import { ensureInviteAndNotificationTables } from "../setup.js";

function famToken() {
  const s = uuidv4().split("-")[0].toUpperCase();
  const t = uuidv4().split("-")[1].slice(0, 4).toUpperCase();
  return `FAM-${s}-${t}`;
}

function saturdayRange(date = new Date()) {
  const weekStart = startOfWeek(date, { weekStartsOn: 6 }); // Saturday
  const weekEnd = addDays(weekStart, 6);
  return { weekStart, weekEnd };
}

async function createFamilyInternal(req, nickname) {
  const token = famToken();
  const { uid, email } = req.user;

  const fam = await pool.query(
    `INSERT INTO families (nickname, token)
     VALUES ($1, $2)
     RETURNING id, nickname, token`,
    [nickname, token]
  );

  await pool.query(
    `INSERT INTO memberships (user_id, family_id, role)
     VALUES ($1, $2, 'admin')`,
    [uid, fam.rows[0].id]
  );

  const { weekStart, weekEnd } = saturdayRange();
  await pool.query(
    `INSERT INTO lists (family_id, week_start, week_end)
     VALUES ($1, $2, $3)
     ON CONFLICT DO NOTHING`,
    [
      fam.rows[0].id,
      formatISO(weekStart, { representation: "date" }),
      formatISO(weekEnd, { representation: "date" }),
    ]
  );

  const tokenJwt = signJwt({
    uid,
    email,
    fid: fam.rows[0].id,
    role: "admin",
  });

  return { family: fam.rows[0], token: tokenJwt };
}

export async function createFamily(req, res) {
  const nickname = (req.body?.nickname || "").trim();
  if (!req.user?.uid) {
    return res.status(401).json({ error: "Unauthorized: missing user" });
  }
  if (!nickname) {
    return res.status(400).json({ error: "Missing nickname" });
  }

  let attempts = 0;
  while (attempts < 2) {
    try {
      const existing = await pool.query(
        "SELECT 1 FROM memberships WHERE user_id=$1 LIMIT 1",
        [req.user.uid]
      );
      if (existing.rowCount) {
        return res.status(409).json({ error: "Leave current family first" });
      }

      const result = await createFamilyInternal(req, nickname);
      return res.json(result);
    } catch (err) {
      const message = String(err?.message || "").toLowerCase();
      if (
        attempts === 0 &&
        (err?.code === "42P01" || message.includes("does not exist"))
      ) {
        try {
          await ensureInviteAndNotificationTables();
        } catch (ensureErr) {
          console.error("Failed to ensure tables:", ensureErr);
          return res.status(500).json({ error: "Create family failed" });
        }
        attempts += 1;
        continue;
      }

      console.error("Create family failed:", err);
      return res.status(500).json({ error: "Create family failed" });
    }
  }

  return res.status(500).json({ error: "Create family failed" });
}

export async function getMyFamily(req, res) {
  const { uid } = req.user || {};
  if (!uid) {
    return res.status(401).json({ error: "Unauthorized: missing user" });
  }

  try {
    const { rows } = await pool.query(
      `SELECT f.id, f.nickname, f.token
         FROM families f
         JOIN memberships m ON m.family_id = f.id
        WHERE m.user_id=$1`,
      [uid]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "User not in any family" });
    }

    res.json({ family: rows[0] });
  } catch (err) {
    console.error("getMyFamily error:", err);
    res.status(500).json({ error: "Server error" });
  }
}

export async function leaveFamily(req, res) {
  const { uid } = req.user || {};
  if (!uid) {
    return res.status(401).json({ error: "Unauthorized: missing user" });
  }

  try {
    await pool.query("DELETE FROM memberships WHERE user_id=$1", [uid]);
    const tokenJwt = signJwt({ uid, email: req.user.email, fid: null, role: null });
    res.json({ ok: true, token: tokenJwt });
  } catch (err) {
    console.error("leaveFamily error:", err);
    res.status(500).json({ error: "Server error" });
  }
}

