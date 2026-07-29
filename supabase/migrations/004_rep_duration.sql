-- Store measured active duration for timed reps (nullable for manual / goal reps).
alter table public.reps
  add column if not exists duration_seconds integer
  check (duration_seconds is null or duration_seconds >= 0);
