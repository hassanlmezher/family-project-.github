import pkg from "pg";
import dotenv from "dotenv";
import { newDb } from "pg-mem";

dotenv.config({ path: process.env.NODE_ENV === "test" ? ".env.test" : ".env" });

const { Pool } = pkg;

function createMemoryPool() {
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
  const memPool = new adapter.Pool();
  process.env.USE_IN_MEMORY_DB = "true";
  return memPool;
}

function shouldUseMemory() {
  return (
    process.env.NODE_ENV === "test" ||
    process.env.USE_IN_MEMORY_DB === "true" ||
    !process.env.DATABASE_URL
  );
}

function buildSupabaseDirectUrls(urlString) {
  try {
    const parsed = new URL(urlString);
    if (!parsed.hostname.includes(".pooler.supabase.com")) return null;

    const username = decodeURIComponent(parsed.username || "");
    const parts = username.split(".");
    if (parts[0] !== "postgres" || parts.length < 2) return null;
    const projectRef = parts[parts.length - 1];
    if (!projectRef) return null;

    const password = decodeURIComponent(parsed.password || "");
    const build = (hostname) => {
      const direct = new URL(urlString);
      direct.username = "postgres";
      direct.password = password;
      direct.hostname = hostname;
      direct.port = "5432";
      direct.searchParams.delete("pgbouncer");
      direct.searchParams.set("sslmode", "require");
      return direct.toString();
    };

    return [
      build(`db.${projectRef}.supabase.co`),
      build(`db.${projectRef}.supabase.net`),
    ];
  } catch {
    return null;
  }
}

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function createPool() {
  if (shouldUseMemory()) {
    return createMemoryPool();
  }

  const fallbackAllowed =
    process.env.USE_IN_MEMORY_DB === "true" ||
    process.env.ALLOW_DB_FALLBACK === "true" ||
    (process.env.NODE_ENV ?? "development") !== "production";

  const candidateUrls = [];
  if (process.env.DATABASE_URL) {
    candidateUrls.push({
      url: process.env.DATABASE_URL.trim(),
      label: "primary",
    });
    const supabaseDirect = buildSupabaseDirectUrls(process.env.DATABASE_URL);
    if (supabaseDirect) {
      supabaseDirect.forEach((url, idx) => {
        candidateUrls.push({
          url,
          label: `supabase-direct${idx ? `-${idx + 1}` : ""}`,
        });
      });
    }
  }

  const maxAttempts = Math.max(
    1,
    Number.parseInt(process.env.DB_CONNECT_RETRIES ?? "3", 10),
  );
  const retryDelayMs = Math.max(
    0,
    Number.parseInt(process.env.DB_CONNECT_RETRY_DELAY_MS ?? "2000", 10),
  );
  let lastError;

  for (const candidate of candidateUrls) {
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      const pool = new Pool({
        connectionString: candidate.url,
        ssl: candidate.url.startsWith("postgres")
          ? { rejectUnauthorized: false, require: true }
          : false,
        keepAlive: true,
        connectionTimeoutMillis: Number.parseInt(
          process.env.DB_CONNECT_TIMEOUT_MS ?? "30000",
          10,
        ),
        idleTimeoutMillis: Number.parseInt(
          process.env.DB_IDLE_TIMEOUT_MS ?? "30000",
          10,
        ),
        max: Number.parseInt(process.env.DB_POOL_MAX ?? "10", 10),
      });

      try {
        const client = await pool.connect();
        client.release();

        if (process.env.NODE_ENV !== "test") {
          pool.on("connect", () => console.log("PostgreSQL connected"));
          pool.on("error", (err) => console.error("Database error:", err));
        }

        if (candidate.label !== "primary") {
          console.log(`Connected using ${candidate.label} database URL`);
        }

        return pool;
      } catch (err) {
        lastError = err;
        await pool.end().catch(() => {});

        if (attempt < maxAttempts) {
          console.warn(
            `Database connection failed (${candidate.label}, attempt ${attempt}/${maxAttempts}): ${
              err.message
            }`,
          );
          if (retryDelayMs > 0) {
            await delay(retryDelayMs);
          }
          continue;
        }

        console.error(
          `Database connection failed (${candidate.label}): ${err.message}`,
        );
        break;
      }
    }
  }

  if (fallbackAllowed) {
    console.warn("Falling back to in-memory database");
    return createMemoryPool();
  }

  throw lastError ?? new Error("Database connection failed");
}

export const pool = await createPool();
