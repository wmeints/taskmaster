-- Tasks, the lists they belong to and their subtasks. Users live in neon_auth."user".
create table lists (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  name text not null,
  color text not null,
  created_at timestamptz not null default now()
);

create index lists_user_id_idx on lists (user_id);

create table tasks (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  list_id uuid references lists (id) on delete set null,
  title text not null,
  description text not null default '',
  -- Calendar date and time in the user's own time zone.
  due_date date,
  due_time time,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index tasks_user_id_completed_at_idx on tasks (user_id, completed_at);
create index tasks_list_id_idx on tasks (list_id);

create table subtasks (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks (id) on delete cascade,
  title text not null,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

create index subtasks_task_id_idx on subtasks (task_id);
