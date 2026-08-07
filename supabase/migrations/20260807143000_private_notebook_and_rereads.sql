-- Caderno privado e histórico de releituras.
create table public.reading_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  kind text not null default 'reflection' check (kind in ('highlight','reflection','question','vocabulary')),
  content text not null check (char_length(btrim(content)) between 1 and 2000),
  progress smallint check (progress between 0 and 100),
  page_number integer check (page_number > 0),
  chapter text check (char_length(chapter) <= 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index reading_notes_user_created_idx on public.reading_notes(user_id,created_at desc);
create index reading_notes_book_progress_idx on public.reading_notes(book_id,progress);
create trigger reading_notes_set_updated_at before update on public.reading_notes
for each row execute function public.set_updated_at();

create table public.reading_cycles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  cycle_number integer not null check (cycle_number > 0),
  started_at date not null default current_date,
  finished_at date,
  format text check (format in ('fisico','ebook','audiobook','outro')),
  rating numeric(2,1) check (rating between 0 and 5),
  created_at timestamptz not null default now(),
  unique(user_id,book_id,cycle_number)
);
create index reading_cycles_user_book_idx on public.reading_cycles(user_id,book_id,cycle_number desc);

alter table public.reading_notes enable row level security;
alter table public.reading_cycles enable row level security;
create policy "users read own notebook" on public.reading_notes for select using(auth.uid()=user_id);
create policy "users create own notebook" on public.reading_notes for insert with check(auth.uid()=user_id);
create policy "users update own notebook" on public.reading_notes for update using(auth.uid()=user_id) with check(auth.uid()=user_id);
create policy "users delete own notebook" on public.reading_notes for delete using(auth.uid()=user_id);
create policy "users read own cycles" on public.reading_cycles for select using(auth.uid()=user_id);
create policy "users create own cycles" on public.reading_cycles for insert with check(auth.uid()=user_id);
create policy "users update own cycles" on public.reading_cycles for update using(auth.uid()=user_id) with check(auth.uid()=user_id);

create or replace function public.start_reread(target_book_id uuid, target_format text default null)
returns integer language plpgsql security definer set search_path='' as $$
declare next_cycle integer;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if target_format is not null and target_format not in ('fisico','ebook','audiobook','outro') then raise exception 'Invalid format'; end if;
  select coalesce(max(cycle_number),0)+1 into next_cycle from public.reading_cycles where user_id=auth.uid() and book_id=target_book_id;
  insert into public.reading_cycles(user_id,book_id,cycle_number,format) values(auth.uid(),target_book_id,next_cycle,target_format);
  insert into public.user_books(user_id,book_id,status,progress,started_at,reread_count,format)
  values(auth.uid(),target_book_id,'lendo',0,current_date,greatest(0,next_cycle-1),target_format)
  on conflict(user_id,book_id) do update set status='lendo',progress=0,started_at=current_date,finished_at=null,reread_count=public.user_books.reread_count+1,format=coalesce(target_format,public.user_books.format),updated_at=now();
  return next_cycle;
end; $$;
revoke all on function public.start_reread(uuid,text) from public,anon;
grant execute on function public.start_reread(uuid,text) to authenticated;
