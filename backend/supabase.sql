-- Invites table for sending invites
create table if not exists invites (
  id bigserial primary key,
  family_id bigint not null references families(id),
  email text not null,
  token text not null,
  used_by bigint references users(id),
  used_at timestamp with time zone,
  created_at timestamp with time zone not null default now()
);

-- Minimal notifications table for invite flow
create table if not exists notifications (
  id bigserial primary key,
  user_email text not null,
  message text not null,
  token text,
  read boolean not null default false,
  created_at timestamp with time zone not null default now()
);