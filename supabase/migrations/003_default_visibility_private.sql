-- Default new activities to private (existing rows unchanged).
alter table public.activities
  alter column visibility set default 'private';
