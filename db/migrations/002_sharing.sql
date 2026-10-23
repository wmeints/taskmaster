-- Sharing a list: the people who joined it, and invitations by email that are waiting for a reply.
create table list_members (
  list_id uuid not null references lists (id) on delete cascade,
  user_id text not null,
  created_at timestamptz not null default now(),
  primary key (list_id, user_id)
);

create index list_members_user_id_idx on list_members (user_id);

create table list_invites (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references lists (id) on delete cascade,
  -- Lower case; matched against the invitee's sign-in email.
  email text not null,
  invited_by text not null,
  sent_at timestamptz not null default now(),
  -- Set when the invitee declines; resending clears it.
  declined_at timestamptz,
  unique (list_id, email)
);

create index list_invites_email_idx on list_invites (email);
