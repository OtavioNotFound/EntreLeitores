-- Segurança de clubes privados, integridade social e recursos de leitura/enquete.

create or replace function public.is_club_member(target_club_id uuid, target_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.club_members
    where club_id = target_club_id and user_id = target_user_id
  );
$$;

revoke all on function public.is_club_member(uuid, uuid) from public, anon;
grant execute on function public.is_club_member(uuid, uuid) to authenticated;

drop policy if exists "public clubs are visible" on public.clubs;
create policy "public clubs and memberships are visible"
  on public.clubs for select
  using (not is_private or owner_id = auth.uid() or public.is_club_member(id));

drop policy if exists "memberships are visible" on public.club_members;
create policy "club memberships follow club visibility"
  on public.club_members for select
  using (
    public.is_club_member(club_id)
    or exists (select 1 from public.clubs where clubs.id = club_id and not clubs.is_private)
  );

drop policy if exists "users join clubs" on public.club_members;
create policy "users join public clubs"
  on public.club_members for insert to authenticated
  with check (
    auth.uid() = user_id
    and role = 'member'
    and exists (select 1 from public.clubs where clubs.id = club_id and not clubs.is_private)
  );

drop policy if exists "users leave clubs" on public.club_members;
create policy "non owners leave clubs"
  on public.club_members for delete
  using (auth.uid() = user_id and role <> 'owner');

drop policy if exists "posts are public" on public.posts;
create policy "public and permitted club posts are visible"
  on public.posts for select
  using (
    club_id is null
    or public.is_club_member(club_id)
    or exists (select 1 from public.clubs where clubs.id = club_id and not clubs.is_private)
  );

drop policy if exists "users create own posts" on public.posts;
create policy "users create permitted posts"
  on public.posts for insert
  with check (
    auth.uid() = author_id
    and (club_id is null or public.is_club_member(club_id))
  );

drop policy if exists "events are public" on public.events;
create policy "permitted club events are visible"
  on public.events for select
  using (
    public.is_club_member(club_id)
    or exists (select 1 from public.clubs where clubs.id = club_id and not clubs.is_private)
  );

drop policy if exists "club members create events" on public.events;
create policy "club members create events"
  on public.events for insert
  with check (auth.uid() = creator_id and public.is_club_member(club_id));

drop policy if exists "creators update events" on public.events;
create policy "club members update own events"
  on public.events for update
  using (auth.uid() = creator_id and public.is_club_member(club_id))
  with check (auth.uid() = creator_id and public.is_club_member(club_id));

drop policy if exists "attendees are visible" on public.event_attendees;
create policy "event attendees follow event visibility"
  on public.event_attendees for select
  using (exists (select 1 from public.events where events.id = event_id));

drop policy if exists "users attend as themselves" on public.event_attendees;
create policy "members attend as themselves"
  on public.event_attendees for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.events
      where events.id = event_id and public.is_club_member(events.club_id)
    )
  );

create or replace function public.validate_comment_parent()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.parent_id is not null and not exists (
    select 1 from public.comments
    where id = new.parent_id and post_id = new.post_id
  ) then
    raise exception 'Parent comment must belong to the same post';
  end if;
  return new;
end;
$$;

create trigger comments_validate_parent
before insert or update of parent_id, post_id on public.comments
for each row execute function public.validate_comment_parent();

create table public.poll_options (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  label text not null check (char_length(btrim(label)) between 1 and 120),
  position smallint not null check (position between 0 and 9),
  unique (post_id, position)
);

create table public.poll_votes (
  option_id uuid not null references public.poll_options(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (option_id, user_id)
);

create index poll_options_post_id_idx on public.poll_options(post_id);
create index poll_votes_option_id_idx on public.poll_votes(option_id);

alter table public.poll_options enable row level security;
alter table public.poll_votes enable row level security;

create policy "poll options follow post visibility" on public.poll_options for select
using (exists (select 1 from public.posts where posts.id = post_id));

create policy "authors create poll options" on public.poll_options for insert
with check (exists (select 1 from public.posts where posts.id = post_id and posts.author_id = auth.uid() and posts.type = 'enquete'));

create policy "poll votes are visible" on public.poll_votes for select
using (exists (
  select 1 from public.poll_options join public.posts on posts.id = poll_options.post_id
  where poll_options.id = option_id
));

create policy "users remove own vote" on public.poll_votes for delete
using (auth.uid() = user_id);

create or replace function public.cast_poll_vote(target_option_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare target_post_id uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select post_id into target_post_id from public.poll_options where id = target_option_id;
  if target_post_id is null then raise exception 'Poll option not found'; end if;
  if not exists (select 1 from public.posts where id = target_post_id) then
    raise exception 'Poll is not visible';
  end if;
  delete from public.poll_votes
    where user_id = auth.uid()
      and option_id in (select id from public.poll_options where post_id = target_post_id);
  insert into public.poll_votes(option_id, user_id) values (target_option_id, auth.uid());
end;
$$;

revoke all on function public.cast_poll_vote(uuid) from public, anon;
grant execute on function public.cast_poll_vote(uuid) to authenticated;
