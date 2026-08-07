-- Busca de catálogo tolerante a acentos e pequenos erros, indexada por trigramas.
create extension if not exists pg_trgm with schema extensions;
create extension if not exists unaccent with schema extensions;

create or replace function public.immutable_unaccent(value text)
returns text language sql immutable strict parallel safe set search_path=public,extensions as $$
  select extensions.unaccent(value);
$$;

create index if not exists books_title_unaccent_trgm_idx on public.books
  using gin ((public.immutable_unaccent(lower(title))) extensions.gin_trgm_ops);
create index if not exists books_author_unaccent_trgm_idx on public.books
  using gin ((public.immutable_unaccent(lower(author))) extensions.gin_trgm_ops);

create or replace function public.search_books_fuzzy(search_term text,requested_offset integer default 0,requested_limit integer default 24)
returns setof public.books language sql stable security invoker set search_path=public,extensions as $$
  with input as (select public.immutable_unaccent(lower(btrim(coalesce(search_term,'')))) as q)
  select b.* from public.books b cross join input i
  where i.q=''
    or public.immutable_unaccent(lower(b.title)) ilike '%'||i.q||'%'
    or public.immutable_unaccent(lower(b.author)) ilike '%'||i.q||'%'
    or extensions.similarity(public.immutable_unaccent(lower(b.title)),i.q)>=0.22
    or extensions.similarity(public.immutable_unaccent(lower(b.author)),i.q)>=0.22
  order by
    case when i.q<>'' and public.immutable_unaccent(lower(b.title))=i.q then 0
         when i.q<>'' and public.immutable_unaccent(lower(b.title)) like i.q||'%' then 1 else 2 end,
    case when i.q='' then 0 else greatest(
      extensions.similarity(public.immutable_unaccent(lower(b.title)),i.q),
      extensions.similarity(public.immutable_unaccent(lower(b.author)),i.q)
    ) end desc,
    b.created_at desc
  offset greatest(0,requested_offset) limit greatest(1,least(50,requested_limit));
$$;
grant execute on function public.search_books_fuzzy(text,integer,integer) to authenticated;
