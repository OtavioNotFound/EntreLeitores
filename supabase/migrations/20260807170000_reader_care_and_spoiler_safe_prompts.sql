-- Cuidado coletivo: alertas de conteúdo por consenso e perguntas de clube sem spoilers.
create table public.book_content_warnings (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  category text not null check (category in ('violencia','luto','abuso','sexo','saude_mental','animais','discriminacao','drogas','outro')),
  severity smallint not null default 2 check (severity between 1 and 3),
  details text check (details is null or char_length(details) <= 280),
  created_at timestamptz not null default now(),
  unique(book_id,user_id,category)
);

create table public.user_content_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  categories text[] not null default '{}',
  minimum_severity smallint not null default 2 check (minimum_severity between 1 and 3),
  blur_sensitive boolean not null default true,
  updated_at timestamptz not null default now()
);

create table public.club_prompts (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  question text not null check (char_length(btrim(question)) between 5 and 500),
  spoiler_progress smallint not null default 0 check (spoiler_progress between 0 and 100),
  created_at timestamptz not null default now()
);

create table public.club_prompt_votes (
  prompt_id uuid not null references public.club_prompts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(prompt_id,user_id)
);

create index content_warnings_book_idx on public.book_content_warnings(book_id,category);
create index club_prompts_club_book_idx on public.club_prompts(club_id,book_id,created_at desc);

alter table public.book_content_warnings enable row level security;
alter table public.user_content_preferences enable row level security;
alter table public.club_prompts enable row level security;
alter table public.club_prompt_votes enable row level security;

create policy "authenticated readers see warnings" on public.book_content_warnings for select to authenticated using (true);
create policy "readers create own warnings" on public.book_content_warnings for insert to authenticated with check (user_id=auth.uid());
create policy "readers update own warnings" on public.book_content_warnings for update to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy "readers delete own warnings" on public.book_content_warnings for delete to authenticated using (user_id=auth.uid());
create policy "readers see own safety preferences" on public.user_content_preferences for select using(user_id=auth.uid());
create policy "readers create own safety preferences" on public.user_content_preferences for insert with check(user_id=auth.uid());
create policy "readers update own safety preferences" on public.user_content_preferences for update using(user_id=auth.uid()) with check(user_id=auth.uid());

create policy "members create prompts" on public.club_prompts for insert to authenticated
with check(author_id=auth.uid() and public.is_club_member(club_id));
create policy "authors remove prompts" on public.club_prompts for delete to authenticated using(author_id=auth.uid());
create policy "members see prompt votes" on public.club_prompt_votes for select to authenticated
using(exists(select 1 from public.club_prompts p where p.id=prompt_id and public.is_club_member(p.club_id)));
create policy "members vote on prompts" on public.club_prompt_votes for insert to authenticated
with check(user_id=auth.uid() and exists(select 1 from public.club_prompts p where p.id=prompt_id and public.is_club_member(p.club_id)));
create policy "members remove own prompt votes" on public.club_prompt_votes for delete to authenticated using(user_id=auth.uid());

create or replace function public.get_book_warning_summary(target_book_id uuid)
returns table(category text,votes bigint,severity smallint,details text[])
language sql stable security definer set search_path=public as $$
  select w.category,count(*)::bigint,max(w.severity)::smallint,
    array_remove(array_agg(distinct nullif(btrim(w.details),'')),null)
  from public.book_content_warnings w where w.book_id=target_book_id
  group by w.category order by count(*) desc,max(w.severity) desc;
$$;

create or replace function public.get_safe_club_prompts(target_club_id uuid,target_book_id uuid)
returns table(id uuid,author_id uuid,author_name text,question text,spoiler_progress smallint,locked boolean,votes bigint,voted boolean,created_at timestamptz)
language plpgsql stable security definer set search_path=public as $$
declare reader_progress smallint;
begin
  if not public.is_club_member(target_club_id) then raise exception 'Apenas membros podem acessar o pote de perguntas'; end if;
  select coalesce(ub.progress,0)::smallint into reader_progress from public.user_books ub where ub.user_id=auth.uid() and ub.book_id=target_book_id;
  reader_progress:=coalesce(reader_progress,0);
  return query select p.id,p.author_id,coalesce(pr.display_name,pr.username,'Leitor'),
    case when p.author_id=auth.uid() or p.spoiler_progress<=reader_progress then p.question else null end,
    p.spoiler_progress,(p.author_id<>auth.uid() and p.spoiler_progress>reader_progress),
    (select count(*) from public.club_prompt_votes v where v.prompt_id=p.id),
    exists(select 1 from public.club_prompt_votes v where v.prompt_id=p.id and v.user_id=auth.uid()),p.created_at
  from public.club_prompts p join public.profiles pr on pr.id=p.author_id
  where p.club_id=target_club_id and p.book_id=target_book_id
  order by (select count(*) from public.club_prompt_votes v where v.prompt_id=p.id) desc,p.created_at desc;
end $$;

create or replace function public.toggle_club_prompt_vote(target_prompt_id uuid)
returns boolean language plpgsql security definer set search_path=public as $$
declare already_voted boolean; target_club uuid;
begin
  select club_id into target_club from public.club_prompts where id=target_prompt_id;
  if target_club is null or not public.is_club_member(target_club) then raise exception 'Pergunta indisponível'; end if;
  select exists(select 1 from public.club_prompt_votes where prompt_id=target_prompt_id and user_id=auth.uid()) into already_voted;
  if already_voted then delete from public.club_prompt_votes where prompt_id=target_prompt_id and user_id=auth.uid(); return false;
  else insert into public.club_prompt_votes(prompt_id,user_id) values(target_prompt_id,auth.uid()); return true; end if;
end $$;

grant execute on function public.get_book_warning_summary(uuid) to authenticated;
grant execute on function public.get_safe_club_prompts(uuid,uuid) to authenticated;
grant execute on function public.toggle_club_prompt_vote(uuid) to authenticated;
