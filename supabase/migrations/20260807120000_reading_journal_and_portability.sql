-- Diário de leitura detalhado, formatos e coleções inteligentes.

alter table public.user_books add column if not exists format text
  check (format in ('fisico','ebook','audiobook','outro'));
alter table public.user_books add column if not exists source text
  check (source in ('proprio','biblioteca','emprestado','assinatura','outro'));
alter table public.user_books add column if not exists reread_count integer not null default 0
  check (reread_count >= 0);
alter table public.user_books add column if not exists tags text[] not null default '{}';

create table public.reading_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  pages_read integer check (pages_read is null or pages_read > 0),
  minutes_read integer check (minutes_read is null or minutes_read > 0),
  format text not null default 'fisico' check (format in ('fisico','ebook','audiobook','outro')),
  note text check (char_length(note) <= 500),
  occurred_on date not null default current_date,
  created_at timestamptz not null default now(),
  check (pages_read is not null or minutes_read is not null)
);

create index reading_sessions_user_date_idx
  on public.reading_sessions(user_id, occurred_on desc);
create index reading_sessions_book_idx on public.reading_sessions(book_id);

alter table public.reading_sessions enable row level security;
create policy "users read own sessions" on public.reading_sessions for select
  using (auth.uid() = user_id);
create policy "users create own sessions" on public.reading_sessions for insert
  with check (auth.uid() = user_id);
create policy "users update own sessions" on public.reading_sessions for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users delete own sessions" on public.reading_sessions for delete
  using (auth.uid() = user_id);
