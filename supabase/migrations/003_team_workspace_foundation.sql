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

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint workspaces_name_length check (char_length(trim(name)) between 2 and 80)
);

create table if not exists public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'viewer',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, user_id),
  constraint workspace_members_role_check check (
    role in ('owner', 'admin', 'editor', 'viewer')
  ),
  constraint workspace_members_status_check check (
    status in ('active', 'invited', 'removed')
  )
);

alter table public.projects
add column if not exists workspace_id uuid references public.workspaces(id) on delete set null;

create index if not exists workspaces_owner_id_idx on public.workspaces(owner_id);
create index if not exists workspace_members_workspace_id_idx on public.workspace_members(workspace_id);
create index if not exists workspace_members_user_id_idx on public.workspace_members(user_id);
create index if not exists projects_workspace_id_idx on public.projects(workspace_id);

drop trigger if exists workspaces_touch_updated_at on public.workspaces;
create trigger workspaces_touch_updated_at
before update on public.workspaces
for each row execute function public.touch_updated_at();

drop trigger if exists workspace_members_touch_updated_at on public.workspace_members;
create trigger workspace_members_touch_updated_at
before update on public.workspace_members
for each row execute function public.touch_updated_at();

create or replace function public.normalize_workspace_slug(value text)
returns text
language sql
immutable
as $$
  select trim(
    both '-'
    from regexp_replace(lower(coalesce(value, '')), '[^a-z0-9]+', '-', 'g')
  );
$$;

create or replace function public.is_workspace_member(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = target_workspace_id
      and wm.user_id = auth.uid()
      and wm.status = 'active'
  );
$$;

create or replace function public.can_manage_workspace(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = target_workspace_id
      and wm.user_id = auth.uid()
      and wm.status = 'active'
      and wm.role in ('owner', 'admin')
  );
$$;

create or replace function public.handle_workspace_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.workspace_members (
    workspace_id,
    user_id,
    role,
    status
  )
  values (
    new.id,
    new.owner_id,
    'owner',
    'active'
  )
  on conflict (workspace_id, user_id)
  do update set
    role = 'owner',
    status = 'active',
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_workspace_created on public.workspaces;

create trigger on_workspace_created
after insert on public.workspaces
for each row
execute function public.handle_workspace_created();

alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;

drop policy if exists "workspaces_select_member" on public.workspaces;
create policy "workspaces_select_member"
on public.workspaces
for select
to authenticated
using (public.is_workspace_member(id));

drop policy if exists "workspaces_insert_owner" on public.workspaces;
create policy "workspaces_insert_owner"
on public.workspaces
for insert
to authenticated
with check (auth.uid() = owner_id);

drop policy if exists "workspaces_update_admin" on public.workspaces;
create policy "workspaces_update_admin"
on public.workspaces
for update
to authenticated
using (public.can_manage_workspace(id))
with check (public.can_manage_workspace(id));

drop policy if exists "workspaces_delete_owner" on public.workspaces;
create policy "workspaces_delete_owner"
on public.workspaces
for delete
to authenticated
using (auth.uid() = owner_id);

drop policy if exists "workspace_members_select_member" on public.workspace_members;
create policy "workspace_members_select_member"
on public.workspace_members
for select
to authenticated
using (public.is_workspace_member(workspace_id));

drop policy if exists "workspace_members_insert_admin" on public.workspace_members;
create policy "workspace_members_insert_admin"
on public.workspace_members
for insert
to authenticated
with check (
  public.can_manage_workspace(workspace_id)
  and role in ('admin', 'editor', 'viewer')
);

drop policy if exists "workspace_members_update_admin" on public.workspace_members;
create policy "workspace_members_update_admin"
on public.workspace_members
for update
to authenticated
using (public.can_manage_workspace(workspace_id))
with check (
  public.can_manage_workspace(workspace_id)
  and role in ('admin', 'editor', 'viewer')
);

drop policy if exists "workspace_members_delete_admin" on public.workspace_members;
create policy "workspace_members_delete_admin"
on public.workspace_members
for delete
to authenticated
using (
  public.can_manage_workspace(workspace_id)
  and role <> 'owner'
);

create or replace function public.create_workspace(workspace_name text)
returns table (
  id uuid,
  name text,
  slug text,
  owner_id uuid,
  role text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid;
  clean_name text;
  base_slug text;
  final_slug text;
  created_workspace public.workspaces%rowtype;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  clean_name := trim(coalesce(workspace_name, ''));

  if char_length(clean_name) < 2 or char_length(clean_name) > 80 then
    raise exception 'Workspace name must be between 2 and 80 characters';
  end if;

  base_slug := public.normalize_workspace_slug(clean_name);

  if base_slug = '' then
    base_slug := 'workspace';
  end if;

  final_slug := base_slug || '-' || substring(replace(gen_random_uuid()::text, '-', '') from 1 for 8);

  insert into public.workspaces (
    name,
    slug,
    owner_id
  )
  values (
    clean_name,
    final_slug,
    current_user_id
  )
  returning * into created_workspace;

  return query
  select
    created_workspace.id,
    created_workspace.name,
    created_workspace.slug,
    created_workspace.owner_id,
    'owner'::text as role,
    created_workspace.created_at;
end;
$$;

create or replace function public.list_my_workspaces()
returns table (
  id uuid,
  name text,
  slug text,
  owner_id uuid,
  role text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    w.id,
    w.name,
    w.slug,
    w.owner_id,
    wm.role,
    w.created_at
  from public.workspaces w
  inner join public.workspace_members wm
    on wm.workspace_id = w.id
  where wm.user_id = auth.uid()
    and wm.status = 'active'
  order by w.created_at desc;
$$;

create or replace function public.rename_workspace(
  target_workspace_id uuid,
  next_name text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  clean_name text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not public.can_manage_workspace(target_workspace_id) then
    raise exception 'Permission denied';
  end if;

  clean_name := trim(coalesce(next_name, ''));

  if char_length(clean_name) < 2 or char_length(clean_name) > 80 then
    raise exception 'Workspace name must be between 2 and 80 characters';
  end if;

  update public.workspaces
  set
    name = clean_name,
    updated_at = now()
  where id = target_workspace_id;
end;
$$;