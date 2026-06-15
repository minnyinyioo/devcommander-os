create extension if not exists pgcrypto;

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  workspace_id uuid references public.workspaces(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  event_type text not null,
  entity_type text not null,
  entity_id text,
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint audit_events_event_type_length check (char_length(trim(event_type)) between 2 and 100),
  constraint audit_events_entity_type_length check (char_length(trim(entity_type)) between 2 and 100),
  constraint audit_events_message_length check (char_length(trim(message)) between 2 and 500)
);

create index if not exists audit_events_user_id_idx on public.audit_events(user_id);
create index if not exists audit_events_workspace_id_idx on public.audit_events(workspace_id);
create index if not exists audit_events_project_id_idx on public.audit_events(project_id);
create index if not exists audit_events_created_at_idx on public.audit_events(created_at desc);
create index if not exists audit_events_event_type_idx on public.audit_events(event_type);

alter table public.audit_events enable row level security;

drop policy if exists "audit_events_select_owner_or_workspace_member" on public.audit_events;
create policy "audit_events_select_owner_or_workspace_member"
on public.audit_events
for select
to authenticated
using (
  user_id = auth.uid()
  or (
    workspace_id is not null
    and public.is_workspace_member(workspace_id)
  )
);

drop policy if exists "audit_events_insert_self_or_workspace_member" on public.audit_events;
create policy "audit_events_insert_self_or_workspace_member"
on public.audit_events
for insert
to authenticated
with check (
  user_id = auth.uid()
  and (
    workspace_id is null
    or public.is_workspace_member(workspace_id)
  )
);

drop policy if exists "audit_events_no_update" on public.audit_events;
create policy "audit_events_no_update"
on public.audit_events
for update
to authenticated
using (false)
with check (false);

drop policy if exists "audit_events_no_delete" on public.audit_events;
create policy "audit_events_no_delete"
on public.audit_events
for delete
to authenticated
using (false);

create or replace function public.list_my_audit_events(
  target_workspace_id uuid default null,
  target_project_id uuid default null,
  max_rows int default 50
)
returns table (
  id uuid,
  user_id uuid,
  workspace_id uuid,
  project_id uuid,
  event_type text,
  entity_type text,
  entity_id text,
  message text,
  metadata jsonb,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    ae.id,
    ae.user_id,
    ae.workspace_id,
    ae.project_id,
    ae.event_type,
    ae.entity_type,
    ae.entity_id,
    ae.message,
    ae.metadata,
    ae.created_at
  from public.audit_events ae
  where (
    ae.user_id = auth.uid()
    or (
      ae.workspace_id is not null
      and public.is_workspace_member(ae.workspace_id)
    )
  )
  and (
    target_workspace_id is null
    or ae.workspace_id = target_workspace_id
  )
  and (
    target_project_id is null
    or ae.project_id = target_project_id
  )
  order by ae.created_at desc
  limit least(greatest(max_rows, 1), 100);
$$;