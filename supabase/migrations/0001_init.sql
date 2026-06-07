-- PSU Stat Curriculum Checker — schema + RLS
-- รันใน Supabase SQL Editor (หรือ supabase db push)

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  plan text not null default 'regular',            -- 'regular' | 'coop'
  ge_framework text not null default 'ge2565',     -- 'ge2565' | 'core2564'
  pass_threshold text not null default 'D',
  current_year int,
  current_term int,
  updated_at timestamptz default now()
);

create table if not exists taken_courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  code text not null,
  name text not null,
  credits numeric not null default 0,
  grade text not null default '',
  term text not null default '',
  section text,
  created_at timestamptz default now(),
  unique (user_id, code, term)
);
create index if not exists taken_courses_user_idx on taken_courses(user_id);

create table if not exists requirement_overrides (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  taken_code text not null,
  term text not null,
  requirement_id text not null,
  created_at timestamptz default now(),
  unique (user_id, requirement_id)
);
create index if not exists overrides_user_idx on requirement_overrides(user_id);

-- Row Level Security: ผู้ใช้เห็นเฉพาะข้อมูลตัวเอง
alter table profiles enable row level security;
alter table taken_courses enable row level security;
alter table requirement_overrides enable row level security;

drop policy if exists "own profile" on profiles;
create policy "own profile" on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "own taken" on taken_courses;
create policy "own taken" on taken_courses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own overrides" on requirement_overrides;
create policy "own overrides" on requirement_overrides
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- สร้าง profile อัตโนมัติเมื่อสมัครสมาชิก
create or replace function handle_new_user()
returns trigger language plpgsql security definer
set search_path = public
as $$
begin
  insert into profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
