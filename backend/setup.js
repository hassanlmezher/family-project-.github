import { pool } from './db.js';

export async function ensureInviteAndNotificationTables() {
  // Bootstrap all core tables needed by the app so first run works.
  const sql = `
  -- core users
  create table if not exists users (
    id bigserial primary key,
    full_name text not null,
    email text not null unique,
    password_hash text not null
  );

  -- families
  create table if not exists families (
    id bigserial primary key,
    nickname text not null,
    token text not null unique
  );

  -- memberships
  create table if not exists memberships (
    user_id bigint not null references users(id) on delete cascade,
    family_id bigint not null references families(id) on delete cascade,
    role text not null default 'member',
    primary key (user_id)
  );
  create index if not exists idx_memberships_family_id on memberships(family_id);

  -- lists (one active row per family when archived_at is null)
  create table if not exists lists (
    id bigserial primary key,
    family_id bigint not null references families(id) on delete cascade,
    week_start date not null,
    week_end date not null,
    archived_at timestamp with time_zone
  );
  create unique index if not exists lists_one_active on lists(family_id) where archived_at is null;
  create index if not exists idx_lists_family_id on lists(family_id);
  create index if not exists idx_lists_archived_at on lists(archived_at);

  -- items
  create table if not exists items (
    id bigserial primary key,
    list_id bigint not null references lists(id) on delete cascade,
    name text not null,
    quantity text,
    status text not null default 'pending',
    added_by bigint references users(id)
  );
  create index if not exists idx_items_list_id on items(list_id);
  create index if not exists idx_items_status on items(status);
  create index if not exists idx_items_list_id_status on items(list_id, status);

  -- invites (depends on families + users)
  create table if not exists invites (
    id bigserial primary key,
    family_id bigint not null references families(id),
    email text not null,
    token text not null,
    used_by bigint references users(id),
    used_at timestamp with time zone,
    created_at timestamp with time zone not null default now()
  );
  create index if not exists idx_invites_family_id on invites(family_id);
  create index if not exists idx_invites_token on invites(token);
  create index if not exists idx_invites_email on invites(email);

  -- notifications
  create table if not exists notifications (
    id bigserial primary key,
    user_email text not null,
    message text not null,
    token text,
    read boolean not null default false,
    created_at timestamp with time zone not null default now()
  );
  create index if not exists idx_notifications_user_email on notifications(user_email);
  create index if not exists idx_notifications_read on notifications(read);
  create index if not exists idx_notifications_user_email_read on notifications(user_email, read);`;

  try {
    await pool.query(sql);
    // eslint-disable-next-line no-console
    console.log('DB ready: users/families/memberships/lists/items/invites/notifications');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed ensuring tables:', err.message);
  }
}