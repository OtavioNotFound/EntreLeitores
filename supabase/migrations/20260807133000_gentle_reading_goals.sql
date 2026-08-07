-- Metas flexíveis: orientação sem ranking público ou punição por pausas.
create table public.reading_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  metric text not null check (metric in ('pages','minutes','active_days')),
  target integer not null check (target > 0),
  period text not null default 'weekly' check (period in ('weekly','monthly','yearly')),
  starts_on date not null default current_date,
  ends_on date not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  check (ends_on >= starts_on)
);
create unique index reading_goals_one_active_idx on public.reading_goals(user_id,metric,period) where active;
alter table public.reading_goals enable row level security;
create policy "users read own goals" on public.reading_goals for select using(auth.uid()=user_id);
create policy "users create own goals" on public.reading_goals for insert with check(auth.uid()=user_id);
create policy "users update own goals" on public.reading_goals for update using(auth.uid()=user_id) with check(auth.uid()=user_id);
create policy "users delete own goals" on public.reading_goals for delete using(auth.uid()=user_id);
