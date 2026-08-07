-- Empréstimos físicos entre leitores: cidade pública, endereço sempre fora da plataforma.
create table public.lending_offers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  city text not null check (char_length(trim(city)) between 2 and 80),
  notes text check (notes is null or char_length(notes) <= 280),
  audience text not null default 'followers' check (audience in ('followers','everyone')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id, book_id)
);

create table public.loan_requests (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references public.lending_offers(id) on delete cascade,
  borrower_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted','declined','cancelled','borrowed','returned')),
  message text check (message is null or char_length(message) <= 280),
  due_at date,
  requested_at timestamptz not null default now(),
  responded_at timestamptz,
  returned_at timestamptz,
  unique(offer_id, borrower_id)
);

create index lending_offers_book_active_idx on public.lending_offers(book_id) where active;
create index loan_requests_borrower_idx on public.loan_requests(borrower_id, requested_at desc);
create index loan_requests_offer_idx on public.loan_requests(offer_id, requested_at desc);

alter table public.lending_offers enable row level security;
alter table public.loan_requests enable row level security;

create policy "visible lending offers" on public.lending_offers for select
using (
  owner_id = auth.uid() or
  (active and (audience = 'everyone' or exists (
    select 1 from public.follows f where f.follower_id = auth.uid() and f.following_id = owner_id
  )))
);
create policy "owners create lending offers" on public.lending_offers for insert
with check (owner_id = auth.uid() and exists (
  select 1 from public.user_books ub
  where ub.user_id = auth.uid() and ub.book_id = lending_offers.book_id
    and coalesce(ub.format, 'fisico') = 'fisico'
));
create policy "owners update lending offers" on public.lending_offers for update
using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "owners delete lending offers" on public.lending_offers for delete using (owner_id = auth.uid());

create policy "participants read loan requests" on public.loan_requests for select
using (borrower_id = auth.uid() or exists (
  select 1 from public.lending_offers o where o.id = offer_id and o.owner_id = auth.uid()
));
create policy "borrowers request active offers" on public.loan_requests for insert
with check (borrower_id = auth.uid() and exists (
  select 1 from public.lending_offers o where o.id = offer_id and o.active and o.owner_id <> auth.uid()
));

create or replace function public.respond_loan_request(p_request_id uuid, p_accept boolean, p_due_at date default null)
returns public.loan_requests language plpgsql security definer set search_path = public as $$
declare result public.loan_requests;
begin
  update public.loan_requests r
  set status = case when p_accept then 'accepted' else 'declined' end,
      due_at = case when p_accept then p_due_at else null end,
      responded_at = now()
  from public.lending_offers o
  where r.id = p_request_id and r.offer_id = o.id and o.owner_id = auth.uid() and r.status = 'pending'
  returning r.* into result;
  if result.id is null then raise exception 'Solicitação não encontrada ou já respondida'; end if;
  if p_accept then update public.lending_offers set active = false, updated_at = now() where id = result.offer_id; end if;
  return result;
end $$;

create or replace function public.update_loan_status(p_request_id uuid, p_status text)
returns public.loan_requests language plpgsql security definer set search_path = public as $$
declare result public.loan_requests;
begin
  if p_status not in ('cancelled','borrowed','returned') then raise exception 'Transição inválida'; end if;
  update public.loan_requests r set
    status = p_status,
    returned_at = case when p_status = 'returned' then now() else returned_at end
  from public.lending_offers o
  where r.id = p_request_id and r.offer_id = o.id
    and ((p_status = 'cancelled' and r.borrower_id = auth.uid() and r.status = 'pending')
      or (p_status = 'borrowed' and o.owner_id = auth.uid() and r.status = 'accepted')
      or (p_status = 'returned' and (o.owner_id = auth.uid() or r.borrower_id = auth.uid()) and r.status in ('accepted','borrowed')))
  returning r.* into result;
  if result.id is null then raise exception 'Transição não permitida'; end if;
  if p_status = 'returned' then update public.lending_offers set active = true, updated_at = now() where id = result.offer_id; end if;
  return result;
end $$;

grant execute on function public.respond_loan_request(uuid,boolean,date) to authenticated;
grant execute on function public.update_loan_status(uuid,text) to authenticated;
