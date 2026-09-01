-- Administração de catálogo, materiais de leitura autorizados e ajustes de confiabilidade.

alter table public.profiles add column if not exists is_admin boolean not null default false;

create or replace function public.prevent_self_admin_change()
returns trigger language plpgsql set search_path = public as $$
begin
  if auth.uid() is not null and new.is_admin is distinct from old.is_admin then
    raise exception 'admin role can only be changed by a project administrator';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_prevent_self_admin_change on public.profiles;
create trigger profiles_prevent_self_admin_change
before update of is_admin on public.profiles
for each row execute function public.prevent_self_admin_change();

create or replace function public.is_app_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and is_admin = true);
$$;
revoke all on function public.is_app_admin() from public, anon;
grant execute on function public.is_app_admin() to authenticated;

drop policy if exists "authenticated users add books" on public.books;
drop policy if exists "creators update books" on public.books;
create policy "admins add books" on public.books for insert to authenticated with check (public.is_app_admin() and auth.uid() = created_by);
create policy "admins update books" on public.books for update to authenticated using (public.is_app_admin()) with check (public.is_app_admin());

create table if not exists public.book_reading_files (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  uploaded_by uuid not null references public.profiles(id) on delete cascade,
  file_name text not null check (char_length(file_name) between 1 and 180),
  file_path text not null unique,
  file_type text not null default 'pdf' check (file_type in ('pdf','epub','outro')),
  created_at timestamptz not null default now()
);
create index if not exists book_reading_files_book_id_idx on public.book_reading_files(book_id, created_at desc);
alter table public.book_reading_files enable row level security;
create policy "readers see authorized reading files" on public.book_reading_files for select to authenticated using (true);
create policy "admins manage reading files" on public.book_reading_files for all to authenticated using (public.is_app_admin()) with check (public.is_app_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('reading-materials', 'reading-materials', false, 20971520, array['application/pdf','application/epub+zip'])
on conflict (id) do nothing;
drop policy if exists "authenticated readers view reading materials" on storage.objects;
drop policy if exists "admins upload reading materials" on storage.objects;
drop policy if exists "admins update reading materials" on storage.objects;
drop policy if exists "admins remove reading materials" on storage.objects;
create policy "authenticated readers view reading materials" on storage.objects for select to authenticated using (bucket_id = 'reading-materials');
create policy "admins upload reading materials" on storage.objects for insert to authenticated with check (bucket_id = 'reading-materials' and public.is_app_admin());
create policy "admins update reading materials" on storage.objects for update to authenticated using (bucket_id = 'reading-materials' and public.is_app_admin()) with check (bucket_id = 'reading-materials' and public.is_app_admin());
create policy "admins remove reading materials" on storage.objects for delete to authenticated using (bucket_id = 'reading-materials' and public.is_app_admin());

alter table public.posts add column if not exists image_url text;
alter table public.reading_notes add column if not exists color text not null default 'yellow' check (color in ('yellow','blue','green','pink'));
alter table public.streak_protections add column if not exists status text not null default 'used' check (status in ('used','saved'));
alter table public.streak_protections drop constraint if exists streak_protections_protected_on_check;
alter table public.streak_protections add constraint streak_protections_date_window_check check (protected_on <= (current_date + 31));

-- Recria as regras de remoção para evitar que uma política anterior deixe a tela indicar sucesso sem apagar o registro.
alter table public.clubs enable row level security;
drop policy if exists "owners delete clubs" on public.clubs;
create policy "owners delete clubs" on public.clubs for delete to authenticated using (auth.uid() = owner_id);

alter table public.club_prompts enable row level security;
drop policy if exists "authors remove prompts" on public.club_prompts;
drop policy if exists "authors update prompts" on public.club_prompts;
create policy "authors remove prompts" on public.club_prompts for delete to authenticated using (author_id = auth.uid());
create policy "authors update prompts" on public.club_prompts for update to authenticated using (author_id = auth.uid()) with check (author_id = auth.uid());
