-- Move a conversa geral para salas vinculadas aos clubes.
alter table public.community_messages
  add column if not exists club_id uuid references public.clubs(id) on delete cascade;

create index if not exists community_messages_club_created_at_idx
  on public.community_messages(club_id, created_at desc);

drop policy if exists "authenticated users read community messages" on public.community_messages;
drop policy if exists "users send community messages" on public.community_messages;

create policy "club members read club messages"
  on public.community_messages for select
  to authenticated
  using (
    club_id is not null
    and exists (
      select 1 from public.club_members
      where club_members.club_id = community_messages.club_id
        and club_members.user_id = auth.uid()
    )
  );

create policy "club members send club messages"
  on public.community_messages for insert
  to authenticated
  with check (
    auth.uid() = author_id
    and club_id is not null
    and exists (
      select 1 from public.club_members
      where club_members.club_id = community_messages.club_id
        and club_members.user_id = auth.uid()
    )
  );
