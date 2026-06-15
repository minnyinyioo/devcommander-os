create extension if not exists pgcrypto;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  input text not null,
  status text not null default 'generated',
  category text,
  complexity text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_brains (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content jsonb not null,
  version text not null default '2.0',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(project_id)
);

create table if not exists public.project_prds (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content jsonb not null,
  version text not null default '2.0',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(project_id)
);

create table if not exists public.project_architectures (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content jsonb not null,
  version text not null default '2.0',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(project_id)
);

create table if not exists public.project_tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content jsonb not null,
  version text not null default '2.0',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(project_id)
);

create table if not exists public.export_packs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content jsonb not null,
  markdown text,
  version text not null default '2.0',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(project_id)
);

create index if not exists projects_user_id_idx on public.projects(user_id);
create index if not exists projects_created_at_idx on public.projects(created_at desc);

create index if not exists project_brains_user_id_idx on public.project_brains(user_id);
create index if not exists project_brains_project_id_idx on public.project_brains(project_id);

create index if not exists project_prds_user_id_idx on public.project_prds(user_id);
create index if not exists project_prds_project_id_idx on public.project_prds(project_id);

create index if not exists project_architectures_user_id_idx on public.project_architectures(user_id);
create index if not exists project_architectures_project_id_idx on public.project_architectures(project_id);

create index if not exists project_tasks_user_id_idx on public.project_tasks(user_id);
create index if not exists project_tasks_project_id_idx on public.project_tasks(project_id);

create index if not exists export_packs_user_id_idx on public.export_packs(user_id);
create index if not exists export_packs_project_id_idx on public.export_packs(project_id);

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();

drop trigger if exists projects_touch_updated_at on public.projects;
create trigger projects_touch_updated_at
before update on public.projects
for each row execute function public.touch_updated_at();

drop trigger if exists project_brains_touch_updated_at on public.project_brains;
create trigger project_brains_touch_updated_at
before update on public.project_brains
for each row execute function public.touch_updated_at();

drop trigger if exists project_prds_touch_updated_at on public.project_prds;
create trigger project_prds_touch_updated_at
before update on public.project_prds
for each row execute function public.touch_updated_at();

drop trigger if exists project_architectures_touch_updated_at on public.project_architectures;
create trigger project_architectures_touch_updated_at
before update on public.project_architectures
for each row execute function public.touch_updated_at();

drop trigger if exists project_tasks_touch_updated_at on public.project_tasks;
create trigger project_tasks_touch_updated_at
before update on public.project_tasks
for each row execute function public.touch_updated_at();

drop trigger if exists export_packs_touch_updated_at on public.export_packs;
create trigger export_packs_touch_updated_at
before update on public.export_packs
for each row execute function public.touch_updated_at();

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_brains enable row level security;
alter table public.project_prds enable row level security;
alter table public.project_architectures enable row level security;
alter table public.project_tasks enable row level security;
alter table public.export_packs enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "projects_select_own" on public.projects;
create policy "projects_select_own"
on public.projects
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "projects_insert_own" on public.projects;
create policy "projects_insert_own"
on public.projects
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "projects_update_own" on public.projects;
create policy "projects_update_own"
on public.projects
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "projects_delete_own" on public.projects;
create policy "projects_delete_own"
on public.projects
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "project_brains_crud_own" on public.project_brains;
create policy "project_brains_crud_own"
on public.project_brains
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "project_prds_crud_own" on public.project_prds;
create policy "project_prds_crud_own"
on public.project_prds
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "project_architectures_crud_own" on public.project_architectures;
create policy "project_architectures_crud_own"
on public.project_architectures
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "project_tasks_crud_own" on public.project_tasks;
create policy "project_tasks_crud_own"
on public.project_tasks
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "export_packs_crud_own" on public.export_packs;
create policy "export_packs_crud_own"
on public.export_packs
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);