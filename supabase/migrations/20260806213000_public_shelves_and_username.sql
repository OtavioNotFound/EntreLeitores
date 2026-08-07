-- Ajustes após a migração inicial aplicada pelo dashboard.
drop policy if exists "users read own shelf" on public.user_books;
create policy "shelves are public" on public.user_books for select using (true);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  base_username text;
begin
  base_username := lower(regexp_replace(coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)), '[^a-z0-9._]', '', 'g'));
  if char_length(base_username) < 3 then base_username := 'leitor'; end if;
  if exists (select 1 from public.profiles where username = base_username) then
    base_username := left(base_username, 22) || '_' || substr(replace(new.id::text, '-', ''), 1, 6);
  end if;
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    base_username,
    coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), split_part(new.email, '@', 1))
  );
  return new;
end;
$$;
