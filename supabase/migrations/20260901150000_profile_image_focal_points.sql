-- Cada leitor escolhe qual parte da foto e do banner deve ficar visível.
alter table public.profiles add column if not exists avatar_position_x smallint not null default 50 check (avatar_position_x between 0 and 100);
alter table public.profiles add column if not exists avatar_position_y smallint not null default 50 check (avatar_position_y between 0 and 100);
alter table public.profiles add column if not exists banner_position_x smallint not null default 50 check (banner_position_x between 0 and 100);
alter table public.profiles add column if not exists banner_position_y smallint not null default 50 check (banner_position_y between 0 and 100);
