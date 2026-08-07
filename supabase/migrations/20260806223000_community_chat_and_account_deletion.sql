-- Chat geral da comunidade e exclusão segura da própria conta.
create table public.community_messages (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(btrim(content)) between 1 and 1200),
  created_at timestamptz not null default now()
);

create index community_messages_created_at_idx
  on public.community_messages(created_at desc);

alter table public.community_messages enable row level security;

create policy "authenticated users read community messages"
  on public.community_messages for select
  to authenticated
  using (true);

create policy "users send community messages"
  on public.community_messages for insert
  to authenticated
  with check (auth.uid() = author_id);

create policy "authors delete community messages"
  on public.community_messages for delete
  to authenticated
  using (auth.uid() = author_id);

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'community_messages'
  ) then
    alter publication supabase_realtime add table public.community_messages;
  end if;
end;
$$;

create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  delete from auth.users where id = current_user_id;

  if not found then
    raise exception 'Account not found';
  end if;
end;
$$;

revoke all on function public.delete_own_account() from public, anon;
grant execute on function public.delete_own_account() to authenticated;
