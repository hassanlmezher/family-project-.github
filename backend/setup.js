// backend/setup.js
import { q } from "./db.js";

export async function ensureInviteAndNotificationTables() {
  await q(`
    CREATE TABLE IF NOT EXISTS invites (
      id SERIAL PRIMARY KEY,
      token TEXT UNIQUE NOT NULL,
      sender_id INTEGER,
      receiver_email TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await q(`
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      message TEXT NOT NULL,
      seen BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  console.log("✅ Tables ensured");
}
