-- Funções usadas exclusivamente por triggers não devem ser chamadas pela API.
alter function public.set_updated_at() set search_path = public;
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.add_club_owner() from public, anon, authenticated;
revoke all on function public.create_social_notification() from public, anon, authenticated;
revoke all on function public.rls_auto_enable() from public, anon, authenticated;
