create or replace function public.can_write_workspace_projects(target_workspace_id uuid)
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
      and wm.role in ('owner', 'admin', 'editor')
  );
$$;

create or replace function public.can_read_project(target_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.projects p
    where p.id = target_project_id
      and (
        p.user_id = auth.uid()
        or (
          p.workspace_id is not null
          and public.is_workspace_member(p.workspace_id)
        )
      )
  );
$$;

create or replace function public.can_write_project(target_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.projects p
    where p.id = target_project_id
      and (
        p.user_id = auth.uid()
        or (
          p.workspace_id is not null
          and public.can_write_workspace_projects(p.workspace_id)
        )
      )
  );
$$;

drop policy if exists "projects_select_own" on public.projects;
drop policy if exists "projects_insert_own" on public.projects;
drop policy if exists "projects_update_own" on public.projects;
drop policy if exists "projects_delete_own" on public.projects;

create policy "projects_select_owner_or_workspace_member"
on public.projects
for select
to authenticated
using (
  auth.uid() = user_id
  or (
    workspace_id is not null
    and public.is_workspace_member(workspace_id)
  )
);

create policy "projects_insert_owner_or_workspace_editor"
on public.projects
for insert
to authenticated
with check (
  auth.uid() = user_id
  and (
    workspace_id is null
    or public.can_write_workspace_projects(workspace_id)
  )
);

create policy "projects_update_owner_or_workspace_editor"
on public.projects
for update
to authenticated
using (
  auth.uid() = user_id
  or (
    workspace_id is not null
    and public.can_write_workspace_projects(workspace_id)
  )
)
with check (
  auth.uid() = user_id
  or (
    workspace_id is not null
    and public.can_write_workspace_projects(workspace_id)
  )
);

create policy "projects_delete_owner_or_workspace_editor"
on public.projects
for delete
to authenticated
using (
  auth.uid() = user_id
  or (
    workspace_id is not null
    and public.can_write_workspace_projects(workspace_id)
  )
);

drop policy if exists "project_brains_crud_own" on public.project_brains;
drop policy if exists "project_prds_crud_own" on public.project_prds;
drop policy if exists "project_architectures_crud_own" on public.project_architectures;
drop policy if exists "project_tasks_crud_own" on public.project_tasks;
drop policy if exists "export_packs_crud_own" on public.export_packs;

create policy "project_brains_select_project_access"
on public.project_brains
for select
to authenticated
using (public.can_read_project(project_id));

create policy "project_brains_insert_project_access"
on public.project_brains
for insert
to authenticated
with check (public.can_write_project(project_id));

create policy "project_brains_update_project_access"
on public.project_brains
for update
to authenticated
using (public.can_write_project(project_id))
with check (public.can_write_project(project_id));

create policy "project_brains_delete_project_access"
on public.project_brains
for delete
to authenticated
using (public.can_write_project(project_id));

create policy "project_prds_select_project_access"
on public.project_prds
for select
to authenticated
using (public.can_read_project(project_id));

create policy "project_prds_insert_project_access"
on public.project_prds
for insert
to authenticated
with check (public.can_write_project(project_id));

create policy "project_prds_update_project_access"
on public.project_prds
for update
to authenticated
using (public.can_write_project(project_id))
with check (public.can_write_project(project_id));

create policy "project_prds_delete_project_access"
on public.project_prds
for delete
to authenticated
using (public.can_write_project(project_id));

create policy "project_architectures_select_project_access"
on public.project_architectures
for select
to authenticated
using (public.can_read_project(project_id));

create policy "project_architectures_insert_project_access"
on public.project_architectures
for insert
to authenticated
with check (public.can_write_project(project_id));

create policy "project_architectures_update_project_access"
on public.project_architectures
for update
to authenticated
using (public.can_write_project(project_id))
with check (public.can_write_project(project_id));

create policy "project_architectures_delete_project_access"
on public.project_architectures
for delete
to authenticated
using (public.can_write_project(project_id));

create policy "project_tasks_select_project_access"
on public.project_tasks
for select
to authenticated
using (public.can_read_project(project_id));

create policy "project_tasks_insert_project_access"
on public.project_tasks
for insert
to authenticated
with check (public.can_write_project(project_id));

create policy "project_tasks_update_project_access"
on public.project_tasks
for update
to authenticated
using (public.can_write_project(project_id))
with check (public.can_write_project(project_id));

create policy "project_tasks_delete_project_access"
on public.project_tasks
for delete
to authenticated
using (public.can_write_project(project_id));

create policy "export_packs_select_project_access"
on public.export_packs
for select
to authenticated
using (public.can_read_project(project_id));

create policy "export_packs_insert_project_access"
on public.export_packs
for insert
to authenticated
with check (public.can_write_project(project_id));

create policy "export_packs_update_project_access"
on public.export_packs
for update
to authenticated
using (public.can_write_project(project_id))
with check (public.can_write_project(project_id));

create policy "export_packs_delete_project_access"
on public.export_packs
for delete
to authenticated
using (public.can_write_project(project_id));