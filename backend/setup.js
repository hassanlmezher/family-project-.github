// backend/setup.js
import { q } from "./db.js";

export async function ensureInviteAndNotificationTables() {
  // Core data needed by the API when running in CI
  await q(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await q(`
    CREATE TABLE IF NOT EXISTS families (
      id SERIAL PRIMARY KEY,
      nickname TEXT NOT NULL,
      token TEXT NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await q(`
    CREATE TABLE IF NOT EXISTS memberships (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      family_id INTEGER NOT NULL REFERENCES families(id) ON DELETE CASCADE,
      role TEXT NOT NULL DEFAULT 'member',
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE (user_id)
    );
  `);

  await q(`
    CREATE TABLE IF NOT EXISTS lists (
      id SERIAL PRIMARY KEY,
      family_id INTEGER NOT NULL REFERENCES families(id) ON DELETE CASCADE,
      week_start DATE NOT NULL,
      week_end DATE NOT NULL,
      archived_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await q(`
    CREATE TABLE IF NOT EXISTS items (
      id SERIAL PRIMARY KEY,
      list_id INTEGER NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      quantity TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      added_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await q(`
    CREATE TABLE IF NOT EXISTS invites (
      id SERIAL PRIMARY KEY,
      family_id INTEGER NOT NULL REFERENCES families(id) ON DELETE CASCADE,
      email TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      used_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      used_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await q(`
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_email TEXT NOT NULL,
      message TEXT NOT NULL,
      token TEXT,
      read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await q(`
    CREATE UNIQUE INDEX IF NOT EXISTS lists_active_unique
    ON lists(family_id) WHERE archived_at IS NULL;
  `);

  console.log("Database tables ensured");
}

