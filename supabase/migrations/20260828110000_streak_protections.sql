-- Até cinco proteções de ofensiva por leitor em cada mês.
create table if not exists public.streak_protections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  protected_on date not null check (protected_on <= current_date),
  created_at timestamptz not null default now(),
  unique (user_id, protected_on)
);

create index if not exists streak_protections_user_date_idx
  on public.streak_protections(user_id, protected_on desc);

create or replace function public.limit_monthly_streak_protections()
returns trigger language plpgsql set search_path = public as $$
begin
  if exists (
    select 1 from public.reading_sessions
    where user_id = new.user_id and occurred_on = new.protected_on
  ) then
    raise exception 'reading already registered on this day';
  end if;
  if (
    select count(*) from public.streak_protections
    where user_id = new.user_id
      and date_trunc('month', protected_on) = date_trunc('month', new.protected_on)
  ) >= 5 then
    raise exception 'five protections already used this month';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_monthly_streak_protection_limit on public.streak_protections;
create trigger enforce_monthly_streak_protection_limit
before insert on public.streak_protections
for each row execute function public.limit_monthly_streak_protections();

revoke all on function public.limit_monthly_streak_protections() from public, anon, authenticated;

alter table public.streak_protections enable row level security;
drop policy if exists "users read own streak protections" on public.streak_protections;
create policy "users read own streak protections" on public.streak_protections for select using (auth.uid() = user_id);
drop policy if exists "users create own streak protections" on public.streak_protections;
create policy "users create own streak protections" on public.streak_protections for insert with check (auth.uid() = user_id);
drop policy if exists "users remove own streak protections" on public.streak_protections;
create policy "users remove own streak protections" on public.streak_protections for delete using (auth.uid() = user_id);
