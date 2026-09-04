-- Corrige funções já aplicadas e mantém o banco livre de ambiguidades no painel administrativo.

create or replace function public.sync_user_achievements(achievement_ids text[], achievement_xp integer[])
returns integer language plpgsql security definer set search_path = public as $$
declare inserted_count integer := 0;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if cardinality(coalesce(achievement_ids, '{}')) <> cardinality(coalesce(achievement_xp, '{}')) then
    raise exception 'Achievement arrays must have the same length';
  end if;
  if cardinality(coalesce(achievement_ids, '{}')) > 0 then
    for item_index in 1..cardinality(achievement_ids) loop
      insert into public.user_achievements(user_id, achievement_id, xp, unlock_type)
      values(auth.uid(), achievement_ids[item_index], greatest(0, achievement_xp[item_index]), 'automatic')
      on conflict(user_id, achievement_id) do nothing;
      if found then inserted_count := inserted_count + 1; end if;
    end loop;
  end if;
  return inserted_count;
end;
$$;

drop function if exists public.sync_reader_rank(integer);
create or replace function public.sync_reader_rank()
returns text language plpgsql security definer set search_path = public as $$
declare thresholds jsonb; next_rank text := 'visitor'; earned_xp integer := 0;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select coalesce(sum(xp), 0) into earned_xp from public.user_achievements where user_id = auth.uid();
  select rank_thresholds into thresholds from public.platform_settings where singleton = true;
  if earned_xp >= coalesce((thresholds->>'explorer')::integer, 100) then next_rank := 'explorer'; end if;
  if earned_xp >= coalesce((thresholds->>'debater')::integer, 500) then next_rank := 'debater'; end if;
  if earned_xp >= coalesce((thresholds->>'connector')::integer, 1500) then next_rank := 'connector'; end if;
  if earned_xp >= coalesce((thresholds->>'curator')::integer, 5000) then next_rank := 'curator'; end if;
  if earned_xp >= coalesce((thresholds->>'legend')::integer, 10000) then next_rank := 'legend'; end if;
  perform set_config('app.allow_role_change', 'true', true);
  update public.profiles set reader_rank = next_rank where id = auth.uid() and rank_manual = false;
  return (select reader_rank from public.profiles where id = auth.uid());
end;
$$;
revoke all on function public.sync_reader_rank() from public, anon;
grant execute on function public.sync_reader_rank() to authenticated;

create or replace function public.admin_list_reports()
returns table(id uuid, target_type text, target_id uuid, reason text, details text, status text, created_at timestamptz, reporter_name text, target_summary text)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.has_admin_permission('reports.view') then raise exception 'Report view permission required'; end if;
  return query select r.id, r.target_type, r.target_id, r.reason, r.details, r.status, r.created_at, p.display_name,
    case r.target_type
      when 'profile' then coalesce((select 'Perfil: ' || target_profile.display_name || ' (@' || target_profile.username || ')' from public.profiles target_profile where target_profile.id = r.target_id), 'Perfil removido')
      when 'post' then coalesce((select left(target_post.content, 240) from public.posts target_post where target_post.id = r.target_id), 'Publicação removida')
      when 'comment' then coalesce((select left(target_comment.content, 240) from public.comments target_comment where target_comment.id = r.target_id), 'Comentário removido')
      when 'message' then coalesce((select left(target_message.content, 240) from public.community_messages target_message where target_message.id = r.target_id), 'Mensagem removida')
      when 'book' then coalesce((select 'Livro: ' || target_book.title from public.books target_book where target_book.id = r.target_id), 'Livro removido')
      else 'Conteúdo não identificado'
    end
  from public.reports r join public.profiles p on p.id = r.reporter_id order by r.created_at desc;
end;
$$;
