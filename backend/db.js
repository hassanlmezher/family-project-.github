import pkg from "pg";
import dotenv from "dotenv";
import { newDb } from "pg-mem";

dotenv.config({ path: process.env.NODE_ENV === "test" ? ".env.test" : ".env" });

const { Pool } = pkg;

let pool;

if (process.env.NODE_ENV === "test") {
  const db = newDb();
  db.public.none(`
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE families (
      id SERIAL PRIMARY KEY,
      nickname TEXT NOT NULL,
      token TEXT NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE memberships (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      family_id INTEGER NOT NULL REFERENCES families(id) ON DELETE CASCADE,
      role TEXT NOT NULL DEFAULT 'member',
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE (user_id)
    );
    CREATE TABLE lists (
      id SERIAL PRIMARY KEY,
      family_id INTEGER NOT NULL REFERENCES families(id) ON DELETE CASCADE,
      week_start DATE NOT NULL,
      week_end DATE NOT NULL,
      archived_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE items (
      id SERIAL PRIMARY KEY,
      list_id INTEGER NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      quantity TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      added_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE invites (
      id SERIAL PRIMARY KEY,
      family_id INTEGER NOT NULL REFERENCES families(id) ON DELETE CASCADE,
      email TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      used_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      used_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE notifications (
      id SERIAL PRIMARY KEY,
      user_email TEXT NOT NULL,
      message TEXT NOT NULL,
      token TEXT,
      read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
  const adapter = db.adapters.createPg();
  pool = new adapter.Pool();
} else {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes("supabase")
      ? { rejectUnauthorized: false }
      : false,
  });
}

export { pool };

if (process.env.NODE_ENV !== "test") {
  pool.on("connect", () => console.log("✅ PostgreSQL connected"));
  pool.on("error", (err) => console.error("❌ Database error:", err));
}
