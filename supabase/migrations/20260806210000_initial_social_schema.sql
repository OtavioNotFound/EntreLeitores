-- Entre Leitores: esquema social inicial sem dados fictícios.
create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9._]{3,30}$'),
  display_name text not null check (char_length(display_name) between 2 and 60),
  bio text check (char_length(bio) <= 280),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 200),
  author text not null check (char_length(author) between 1 and 160),
  description text,
  cover_url text,
  isbn text unique,
  page_count integer check (page_count > 0),
  genre text,
  publisher text,
  published_at date,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.user_books (
  user_id uuid not null references public.profiles(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  status text not null default 'quero-ler' check (status in ('quero-ler', 'lendo', 'lidos', 'favoritos', 'abandonados')),
  progress integer not null default 0 check (progress between 0 and 100),
  rating numeric(2,1) check (rating between 0 and 5),
  started_at date,
  finished_at date,
  updated_at timestamptz not null default now(),
  primary key (user_id, book_id)
);

create table public.clubs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (char_length(name) between 3 and 80),
  slug text not null unique check (slug ~ '^[a-z0-9-]{3,80}$'),
  description text check (char_length(description) <= 500),
  cover_url text,
  is_private boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.club_members (
  club_id uuid not null references public.clubs(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'moderator', 'member')),
  joined_at timestamptz not null default now(),
  primary key (club_id, user_id)
);

create table public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  club_id uuid references public.clubs(id) on delete cascade,
  book_id uuid references public.books(id) on delete set null,
  type text not null default 'publicacao' check (type in ('publicacao', 'resenha', 'citacao', 'enquete')),
  content text not null check (char_length(content) between 1 and 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  parent_id uuid references public.comments(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 2000),
  created_at timestamptz not null default now()
);

create table public.post_likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table public.saved_posts (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  creator_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 120),
  description text,
  starts_at timestamptz not null,
  location text,
  created_at timestamptz not null default now()
);

create table public.event_attendees (
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete cascade,
  type text not null check (type in ('follow', 'like', 'comment', 'club', 'event')),
  post_id uuid references public.posts(id) on delete cascade,
  club_id uuid references public.clubs(id) on delete cascade,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  check (recipient_id <> actor_id)
);

create index posts_created_at_idx on public.posts(created_at desc);
create index posts_author_id_idx on public.posts(author_id);
create index posts_club_id_idx on public.posts(club_id);
create index comments_post_id_idx on public.comments(post_id);
create index notifications_recipient_created_idx on public.notifications(recipient_id, created_at desc);
create index user_books_user_status_idx on public.user_books(user_id, status);

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger posts_set_updated_at before update on public.posts
for each row execute function public.set_updated_at();
create trigger user_books_set_updated_at before update on public.user_books
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  base_username text;
begin
  base_username := lower(regexp_replace(coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)), '[^a-z0-9._]', '', 'g'));
  if char_length(base_username) < 3 then base_username := 'leitor'; end if;
  if exists (select 1 from public.profiles where username = base_username) then
    base_username := left(base_username, 22) || '_' || substr(replace(new.id::text, '-', ''), 1, 6);
  end if;
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    base_username,
    coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.add_club_owner()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.club_members (club_id, user_id, role) values (new.id, new.owner_id, 'owner');
  return new;
end;
$$;
create trigger on_club_created after insert on public.clubs
for each row execute function public.add_club_owner();

create or replace function public.create_social_notification()
returns trigger language plpgsql security definer set search_path = public as $$
declare target_id uuid;
declare notification_type text;
declare related_post uuid;
begin
  if tg_table_name = 'follows' then
    target_id := new.following_id; notification_type := 'follow'; related_post := null;
  elsif tg_table_name = 'post_likes' then
    select author_id into target_id from public.posts where id = new.post_id;
    notification_type := 'like'; related_post := new.post_id;
  else
    select author_id into target_id from public.posts where id = new.post_id;
    notification_type := 'comment'; related_post := new.post_id;
  end if;
  if target_id is distinct from auth.uid() then
    insert into public.notifications (recipient_id, actor_id, type, post_id)
    values (target_id, auth.uid(), notification_type, related_post);
  end if;
  return new;
end;
$$;
create trigger notify_follow after insert on public.follows for each row execute function public.create_social_notification();
create trigger notify_like after insert on public.post_likes for each row execute function public.create_social_notification();
create trigger notify_comment after insert on public.comments for each row execute function public.create_social_notification();

revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.add_club_owner() from public, anon, authenticated;
revoke all on function public.create_social_notification() from public, anon, authenticated;

alter table public.profiles enable row level security;
alter table public.books enable row level security;
alter table public.user_books enable row level security;
alter table public.clubs enable row level security;
alter table public.club_members enable row level security;
alter table public.follows enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.post_likes enable row level security;
alter table public.saved_posts enable row level security;
alter table public.events enable row level security;
alter table public.event_attendees enable row level security;
alter table public.notifications enable row level security;

create policy "profiles are public" on public.profiles for select using (true);
create policy "users update own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "books are public" on public.books for select using (true);
create policy "authenticated users add books" on public.books for insert to authenticated with check (auth.uid() = created_by);
create policy "creators update books" on public.books for update using (auth.uid() = created_by) with check (auth.uid() = created_by);
create policy "shelves are public" on public.user_books for select using (true);
create policy "users add own shelf" on public.user_books for insert with check (auth.uid() = user_id);
create policy "users update own shelf" on public.user_books for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users remove own shelf" on public.user_books for delete using (auth.uid() = user_id);
create policy "public clubs are visible" on public.clubs for select using (not is_private or owner_id = auth.uid());
create policy "authenticated users create clubs" on public.clubs for insert to authenticated with check (auth.uid() = owner_id);
create policy "owners update clubs" on public.clubs for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "memberships are visible" on public.club_members for select using (true);
create policy "users join clubs" on public.club_members for insert to authenticated with check (auth.uid() = user_id and role = 'member');
create policy "users leave clubs" on public.club_members for delete using (auth.uid() = user_id);
create policy "follows are visible" on public.follows for select using (true);
create policy "users follow as themselves" on public.follows for insert with check (auth.uid() = follower_id);
create policy "users unfollow as themselves" on public.follows for delete using (auth.uid() = follower_id);
create policy "posts are public" on public.posts for select using (true);
create policy "users create own posts" on public.posts for insert with check (auth.uid() = author_id);
create policy "authors update posts" on public.posts for update using (auth.uid() = author_id) with check (auth.uid() = author_id);
create policy "authors delete posts" on public.posts for delete using (auth.uid() = author_id);
create policy "comments are public" on public.comments for select using (true);
create policy "users create own comments" on public.comments for insert with check (auth.uid() = author_id);
create policy "authors delete comments" on public.comments for delete using (auth.uid() = author_id);
create policy "likes are public" on public.post_likes for select using (true);
create policy "users like as themselves" on public.post_likes for insert with check (auth.uid() = user_id);
create policy "users remove own likes" on public.post_likes for delete using (auth.uid() = user_id);
create policy "users read own saves" on public.saved_posts for select using (auth.uid() = user_id);
create policy "users save as themselves" on public.saved_posts for insert with check (auth.uid() = user_id);
create policy "users remove own saves" on public.saved_posts for delete using (auth.uid() = user_id);
create policy "events are public" on public.events for select using (true);
create policy "club members create events" on public.events for insert with check (auth.uid() = creator_id);
create policy "creators update events" on public.events for update using (auth.uid() = creator_id) with check (auth.uid() = creator_id);
create policy "attendees are visible" on public.event_attendees for select using (true);
create policy "users attend as themselves" on public.event_attendees for insert with check (auth.uid() = user_id);
create policy "users leave events" on public.event_attendees for delete using (auth.uid() = user_id);
create policy "users read own notifications" on public.notifications for select using (auth.uid() = recipient_id);
create policy "users update own notifications" on public.notifications for update using (auth.uid() = recipient_id) with check (auth.uid() = recipient_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;
create policy "avatars are public" on storage.objects for select using (bucket_id = 'avatars');
create policy "users upload own avatar" on storage.objects for insert to authenticated
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "users update own avatar" on storage.objects for update to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "users delete own avatar" on storage.objects for delete to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
