create table if not exists public.direct_messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 2000),
  read_at timestamptz,
  created_at timestamptz not null default now(),
  check (sender_id <> recipient_id)
);

create index if not exists direct_messages_participants_created_idx on public.direct_messages(sender_id, recipient_id, created_at);
alter table public.direct_messages enable row level security;

drop policy if exists "participants read direct messages" on public.direct_messages;
create policy "participants read direct messages" on public.direct_messages for select
using (auth.uid() = sender_id or auth.uid() = recipient_id);

drop policy if exists "users send direct messages" on public.direct_messages;
create policy "users send direct messages" on public.direct_messages for insert to authenticated
with check (auth.uid() = sender_id and sender_id <> recipient_id);

drop policy if exists "recipients mark direct messages read" on public.direct_messages;
create policy "recipients mark direct messages read" on public.direct_messages for update
using (auth.uid() = recipient_id) with check (auth.uid() = recipient_id);
