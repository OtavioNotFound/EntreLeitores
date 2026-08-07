-- Pausas sem culpa e notificações que fecham os fluxos colaborativos.
alter table public.user_books drop constraint if exists user_books_status_check;
alter table public.user_books add constraint user_books_status_check
  check(status in ('quero-ler','lendo','pausados','lidos','favoritos','abandonados'));

create table public.reading_pauses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  kind text not null check(kind in ('pause','dnf')),
  reason text not null check(reason in ('ritmo','momento','conteudo','dificuldade','outro')),
  note text check(note is null or char_length(note)<=500),
  resume_on date,
  progress smallint not null check(progress between 0 and 100),
  created_at timestamptz not null default now(),
  resumed_at timestamptz
);
create unique index reading_pauses_one_active_idx on public.reading_pauses(user_id,book_id) where resumed_at is null;
alter table public.reading_pauses enable row level security;
create policy "readers manage own pauses" on public.reading_pauses for all using(user_id=auth.uid()) with check(user_id=auth.uid());

create or replace function public.pause_reading(target_book_id uuid,p_kind text,p_reason text,p_note text default null,p_resume_on date default null)
returns public.reading_pauses language plpgsql security definer set search_path=public as $$
declare current_progress smallint; result public.reading_pauses;
begin
  if p_kind not in ('pause','dnf') or p_reason not in ('ritmo','momento','conteudo','dificuldade','outro') then raise exception 'Opção de pausa inválida'; end if;
  select progress::smallint into current_progress from public.user_books where user_id=auth.uid() and book_id=target_book_id;
  if current_progress is null then raise exception 'Livro não está na sua estante'; end if;
  update public.reading_pauses set resumed_at=now() where user_id=auth.uid() and book_id=target_book_id and resumed_at is null;
  insert into public.reading_pauses(user_id,book_id,kind,reason,note,resume_on,progress)
  values(auth.uid(),target_book_id,p_kind,p_reason,nullif(btrim(p_note),''),case when p_kind='pause' then p_resume_on else null end,current_progress)
  returning * into result;
  update public.user_books set status=case when p_kind='pause' then 'pausados' else 'abandonados' end where user_id=auth.uid() and book_id=target_book_id;
  return result;
end $$;

create or replace function public.resume_reading(target_book_id uuid)
returns void language plpgsql security definer set search_path=public as $$
begin
  update public.reading_pauses set resumed_at=now() where user_id=auth.uid() and book_id=target_book_id and resumed_at is null;
  update public.user_books set status='lendo' where user_id=auth.uid() and book_id=target_book_id;
  if not found then raise exception 'Livro não está na sua estante'; end if;
end $$;
grant execute on function public.pause_reading(uuid,text,text,text,date) to authenticated;
grant execute on function public.resume_reading(uuid) to authenticated;

alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check check(type in ('follow','like','comment','club','event','loan_request','loan_accepted','loan_declined','prompt_vote'));
alter table public.notifications add column if not exists loan_request_id uuid references public.loan_requests(id) on delete cascade;
alter table public.notifications add column if not exists prompt_id uuid references public.club_prompts(id) on delete cascade;

create or replace function public.create_collaboration_notification()
returns trigger language plpgsql security definer set search_path=public as $$
declare recipient uuid; actor uuid; notification_type text;
begin
  if tg_table_name='loan_requests' then
    if tg_op='INSERT' then
      select owner_id into recipient from public.lending_offers where id=new.offer_id;
      actor:=new.borrower_id; notification_type:='loan_request';
    elsif new.status is distinct from old.status and new.status in ('accepted','declined') then
      select owner_id into actor from public.lending_offers where id=new.offer_id;
      recipient:=new.borrower_id; notification_type:=case when new.status='accepted' then 'loan_accepted' else 'loan_declined' end;
    else return new; end if;
    if recipient is distinct from actor then insert into public.notifications(recipient_id,actor_id,type,loan_request_id) values(recipient,actor,notification_type,new.id); end if;
  elsif tg_table_name='club_prompt_votes' then
    select author_id into recipient from public.club_prompts where id=new.prompt_id;
    actor:=new.user_id;
    if recipient is distinct from actor then insert into public.notifications(recipient_id,actor_id,type,prompt_id) values(recipient,actor,'prompt_vote',new.prompt_id); end if;
  end if;
  return new;
end $$;
create trigger notify_loan_request after insert or update of status on public.loan_requests for each row execute function public.create_collaboration_notification();
create trigger notify_prompt_vote after insert on public.club_prompt_votes for each row execute function public.create_collaboration_notification();
revoke all on function public.create_collaboration_notification() from public,anon,authenticated;
