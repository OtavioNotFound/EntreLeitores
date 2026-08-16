drop policy if exists "authors update prompts" on public.club_prompts;
create policy "authors update prompts" on public.club_prompts for update to authenticated
using (author_id = auth.uid())
with check (author_id = auth.uid());
