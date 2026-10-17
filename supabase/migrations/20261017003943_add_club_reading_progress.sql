-- O progresso representa o andamento coletivo declarado pelo responsavel do clube.
alter table public.club_readings
  add column current_progress smallint not null default 0
  check (current_progress between 0 and 100);
