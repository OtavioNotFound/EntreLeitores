-- Somente o criador pode excluir o próprio clube.
drop policy if exists "owners delete clubs" on public.clubs;
create policy "owners delete clubs" on public.clubs for delete
  using (auth.uid() = owner_id);
