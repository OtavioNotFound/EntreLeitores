-- Diferenciais: leitura sem spoilers, emoções, clubes adaptativos, descoberta e segurança.

alter table public.profiles add column if not exists city text check (char_length(city) <= 100);
alter table public.profiles add column if not exists state_code text check (char_length(state_code) <= 2);
alter table public.profiles add column if not exists reading_intent text check (reading_intent in ('relaxar','estudar','emocionar','debater','rapido','descobrir'));
alter table public.profiles add column if not exists favorite_genres text[] not null default '{}';
alter table public.clubs add column if not exists city text check (char_length(city) <= 100);
alter table public.clubs add column if not exists meeting_place text check (char_length(meeting_place) <= 180);
alter table public.posts add column if not exists spoiler_progress smallint check (spoiler_progress between 0 and 100);
alter table public.posts add column if not exists spoiler_chapter text check (char_length(spoiler_chapter) <= 80);

create table public.emotional_checkins (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade, progress smallint not null check (progress between 0 and 100),
  emotion text not null check (emotion in ('curioso','feliz','tenso','triste','surpreso','inspirado')),
  note text check (char_length(note) <= 280), created_at timestamptz not null default now(), unique(user_id,book_id,progress)
);

create table public.club_readings (
  id uuid primary key default gen_random_uuid(), club_id uuid not null references public.clubs(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade, starts_at date not null default current_date,
  target_end_at date, target_progress smallint not null default 100 check (target_progress between 1 and 100),
  active boolean not null default true, created_by uuid not null references public.profiles(id), created_at timestamptz not null default now()
);
create unique index club_one_active_reading_idx on public.club_readings(club_id) where active;

create table public.user_blocks (
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(), primary key(blocker_id,blocked_id), check(blocker_id<>blocked_id)
);
create table public.reports (
  id uuid primary key default gen_random_uuid(), reporter_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null check(target_type in ('profile','post','comment','message','book')),
  target_id uuid not null, reason text not null check(reason in ('spam','assédio','ódio','spoiler','fraude','outro')),
  details text check(char_length(details)<=500), status text not null default 'open' check(status in ('open','reviewing','resolved','dismissed')),
  created_at timestamptz not null default now(), unique(reporter_id,target_type,target_id)
);

create table public.book_identifiers (
  book_id uuid not null references public.books(id) on delete cascade, provider text not null,
  external_id text not null, edition_title text, language_code text, format text,
  primary key(provider,external_id), unique(book_id,provider)
);

create table public.authors (
  id uuid primary key default gen_random_uuid(), name text not null check(char_length(name) between 1 and 160),
  normalized_name text generated always as (lower(btrim(name))) stored, bio text, website_url text,
  created_at timestamptz not null default now(), unique(normalized_name)
);
create table public.book_authors (
  book_id uuid not null references public.books(id) on delete cascade,
  author_id uuid not null references public.authors(id) on delete cascade,
  position smallint not null default 0, primary key(book_id,author_id)
);

create index emotional_book_progress_idx on public.emotional_checkins(book_id,progress);
create index profiles_location_idx on public.profiles(city,state_code);
create index clubs_city_idx on public.clubs(city);
create index reports_status_idx on public.reports(status,created_at);

alter table public.emotional_checkins enable row level security;
alter table public.club_readings enable row level security;
alter table public.user_blocks enable row level security;
alter table public.reports enable row level security;
alter table public.book_identifiers enable row level security;
alter table public.authors enable row level security;
alter table public.book_authors enable row level security;

create policy "emotions are visible" on public.emotional_checkins for select using (true);
create policy "users create own emotions" on public.emotional_checkins for insert with check(auth.uid()=user_id);
create policy "users update own emotions" on public.emotional_checkins for update using(auth.uid()=user_id) with check(auth.uid()=user_id);
create policy "club readings visible with club" on public.club_readings for select using(exists(select 1 from public.clubs where clubs.id=club_id));
create policy "club owners manage readings" on public.club_readings for all using(exists(select 1 from public.clubs where clubs.id=club_id and clubs.owner_id=auth.uid())) with check(exists(select 1 from public.clubs where clubs.id=club_id and clubs.owner_id=auth.uid()));
create policy "users read own blocks" on public.user_blocks for select using(auth.uid()=blocker_id);
create policy "users block as themselves" on public.user_blocks for insert with check(auth.uid()=blocker_id);
create policy "users unblock as themselves" on public.user_blocks for delete using(auth.uid()=blocker_id);
create policy "users create reports" on public.reports for insert with check(auth.uid()=reporter_id);
create policy "users read own reports" on public.reports for select using(auth.uid()=reporter_id);
create policy "book identifiers are public" on public.book_identifiers for select using(true);
create policy "book creators add identifiers" on public.book_identifiers for insert with check(exists(select 1 from public.books where books.id=book_id and books.created_by=auth.uid()));
create policy "authors are public" on public.authors for select using(true);
create policy "authenticated users add authors" on public.authors for insert to authenticated with check(true);
create policy "book authors are public" on public.book_authors for select using(true);
create policy "book creators link authors" on public.book_authors for insert with check(exists(select 1 from public.books where books.id=book_id and books.created_by=auth.uid()));

-- Exclui conteúdo de pessoas bloqueadas do feed sem depender do cliente.
drop policy if exists "public and permitted club posts are visible" on public.posts;
create policy "visible posts excluding blocks" on public.posts for select using(
  not exists(select 1 from public.user_blocks where blocker_id=auth.uid() and blocked_id=posts.author_id)
  and (club_id is null or public.is_club_member(club_id) or exists(select 1 from public.clubs where clubs.id=club_id and not clubs.is_private))
);
