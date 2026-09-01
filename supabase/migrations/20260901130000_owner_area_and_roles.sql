-- Papel de dono da plataforma, separado da administração de catálogo.
alter table public.profiles add column if not exists is_owner boolean not null default false;

create or replace function public.prevent_self_admin_change()
returns trigger language plpgsql set search_path = public as $$
begin
  if auth.uid() is not null
    and current_setting('app.allow_role_change', true) is distinct from 'true'
    and (new.is_admin is distinct from old.is_admin or new.is_owner is distinct from old.is_owner) then
    raise exception 'role changes require owner authorization';
  end if;
  return new;
end;
$$;

create or replace function public.is_app_owner()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and is_owner = true);
$$;
revoke all on function public.is_app_owner() from public, anon;
grant execute on function public.is_app_owner() to authenticated;

create or replace function public.owner_set_admin(target_user_id uuid, grant_admin boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_app_owner() then raise exception 'Owner access required'; end if;
  if not exists (select 1 from public.profiles where id = target_user_id) then raise exception 'User not found'; end if;
  if exists (select 1 from public.profiles where id = target_user_id and is_owner) then raise exception 'Owner roles cannot be changed here'; end if;
  perform set_config('app.allow_role_change', 'true', true);
  update public.profiles set is_admin = grant_admin where id = target_user_id;
end;
$$;
revoke all on function public.owner_set_admin(uuid, boolean) from public, anon;
grant execute on function public.owner_set_admin(uuid, boolean) to authenticated;

create or replace function public.owner_platform_overview()
returns table(readers bigint, books bigint, clubs bigint, reports bigint)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_app_owner() then raise exception 'Owner access required'; end if;
  return query select
    (select count(*) from public.profiles),
    (select count(*) from public.books),
    (select count(*) from public.clubs),
    (select count(*) from public.reports);
end;
$$;
revoke all on function public.owner_platform_overview() from public, anon;
grant execute on function public.owner_platform_overview() to authenticated;

update public.profiles
set is_owner = true, is_admin = true
where username in ('otavionotfound', 'jeffer.d_morgan');
