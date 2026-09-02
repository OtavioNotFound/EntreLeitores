-- Livros privados do leitor e tipos de registro usados pelo leitor de PDF.
alter table public.books add column if not exists visibility text not null default 'public' check (visibility in ('public','private'));
create index if not exists books_visibility_created_idx on public.books(visibility, created_at desc);

drop policy if exists "books are public" on public.books;
drop policy if exists "admins add books" on public.books;
drop policy if exists "admins update books" on public.books;
drop policy if exists "creators update books" on public.books;
create policy "public books and private owner access" on public.books for select to authenticated using (visibility = 'public' or created_by = auth.uid() or public.is_app_admin());
create policy "readers add private books and admins add public books" on public.books for insert to authenticated with check (auth.uid() = created_by and (visibility = 'private' or public.is_app_admin()));
create policy "owners update private books and admins manage catalog" on public.books for update to authenticated using ((created_by = auth.uid() and visibility = 'private') or public.is_app_admin()) with check ((created_by = auth.uid() and visibility = 'private') or public.is_app_admin());
create policy "owners delete private books and admins delete catalog" on public.books for delete to authenticated using ((created_by = auth.uid() and visibility = 'private') or public.is_app_admin());

drop policy if exists "readers see authorized reading files" on public.book_reading_files;
drop policy if exists "admins manage reading files" on public.book_reading_files;
create policy "readers see public files and their private files" on public.book_reading_files for select to authenticated using (public.is_app_admin() or exists (select 1 from public.books where books.id = book_reading_files.book_id and (books.visibility = 'public' or books.created_by = auth.uid())));
create policy "owners manage private files and admins manage catalog files" on public.book_reading_files for all to authenticated using (public.is_app_admin() or exists (select 1 from public.books where books.id = book_reading_files.book_id and books.visibility = 'private' and books.created_by = auth.uid())) with check (public.is_app_admin() or exists (select 1 from public.books where books.id = book_reading_files.book_id and books.visibility = 'private' and books.created_by = auth.uid()));

drop policy if exists "admins upload reading materials" on storage.objects;
drop policy if exists "admins update reading materials" on storage.objects;
drop policy if exists "admins remove reading materials" on storage.objects;
create policy "owners upload private reading materials" on storage.objects for insert to authenticated with check (bucket_id = 'reading-materials' and (public.is_app_admin() or split_part(name, '/', 1) = auth.uid()::text));
create policy "owners update private reading materials" on storage.objects for update to authenticated using (bucket_id = 'reading-materials' and (public.is_app_admin() or split_part(name, '/', 1) = auth.uid()::text)) with check (bucket_id = 'reading-materials' and (public.is_app_admin() or split_part(name, '/', 1) = auth.uid()::text));
create policy "owners remove private reading materials" on storage.objects for delete to authenticated using (bucket_id = 'reading-materials' and (public.is_app_admin() or split_part(name, '/', 1) = auth.uid()::text));

alter table public.reading_notes drop constraint if exists reading_notes_kind_check;
alter table public.reading_notes add constraint reading_notes_kind_check check (kind in ('highlight','reflection','question','vocabulary','citation','favorite'));
alter table public.reading_notes drop constraint if exists reading_notes_color_check;
alter table public.reading_notes add constraint reading_notes_color_check check (color in ('yellow','green','blue','purple','red','orange','pink'));
