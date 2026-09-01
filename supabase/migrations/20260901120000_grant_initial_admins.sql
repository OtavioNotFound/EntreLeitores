-- Administradores iniciais indicados pelo responsável pelo projeto.
update public.profiles
set is_admin = true
where username in ('otavionotfound', 'jeffer.d_morgan');
