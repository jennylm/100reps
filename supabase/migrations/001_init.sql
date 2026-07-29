-- 100 Reps initial schema: activities, reps, RLS, storage
-- Run in Supabase SQL Editor (or via supabase db push)

-- Activities (user categories)
create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  icon text,
  color text not null default '#FAA151',
  photo_url text not null,
  area_id text,
  subcategory text,
  rep_type text check (rep_type in ('time', 'goal')),
  session_length_id text,
  goal_definition text,
  visibility text not null default 'private' check (visibility in ('public', 'private')),
  goal integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists activities_user_id_idx on public.activities (user_id);
create index if not exists activities_created_at_idx on public.activities (created_at desc);

-- Reps log
create table if not exists public.reps (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  note text not null default '',
  image_path text,
  logged_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists reps_activity_id_idx on public.reps (activity_id);
create index if not exists reps_user_id_idx on public.reps (user_id);
create index if not exists reps_logged_at_idx on public.reps (logged_at desc);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists activities_set_updated_at on public.activities;
create trigger activities_set_updated_at
  before update on public.activities
  for each row execute function public.set_updated_at();

-- RLS
alter table public.activities enable row level security;
alter table public.reps enable row level security;

drop policy if exists "activities_select_own" on public.activities;
create policy "activities_select_own"
  on public.activities for select
  using (auth.uid() = user_id);

drop policy if exists "activities_insert_own" on public.activities;
create policy "activities_insert_own"
  on public.activities for insert
  with check (auth.uid() = user_id);

drop policy if exists "activities_update_own" on public.activities;
create policy "activities_update_own"
  on public.activities for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "activities_delete_own" on public.activities;
create policy "activities_delete_own"
  on public.activities for delete
  using (auth.uid() = user_id);

drop policy if exists "reps_select_own" on public.reps;
create policy "reps_select_own"
  on public.reps for select
  using (auth.uid() = user_id);

drop policy if exists "reps_insert_own" on public.reps;
create policy "reps_insert_own"
  on public.reps for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.activities
      where activities.id = reps.activity_id
        and activities.user_id = auth.uid()
    )
  );

drop policy if exists "reps_update_own" on public.reps;
create policy "reps_update_own"
  on public.reps for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.activities
      where activities.id = reps.activity_id
        and activities.user_id = auth.uid()
    )
  );

drop policy if exists "reps_delete_own" on public.reps;
create policy "reps_delete_own"
  on public.reps for delete
  using (auth.uid() = user_id);

-- Storage bucket for rep evidence (private)
insert into storage.buckets (id, name, public)
values ('rep-evidence', 'rep-evidence', false)
on conflict (id) do nothing;

-- Storage policies: path must start with `{user_id}/`
drop policy if exists "rep_evidence_select_own" on storage.objects;
create policy "rep_evidence_select_own"
  on storage.objects for select
  using (
    bucket_id = 'rep-evidence'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "rep_evidence_insert_own" on storage.objects;
create policy "rep_evidence_insert_own"
  on storage.objects for insert
  with check (
    bucket_id = 'rep-evidence'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "rep_evidence_update_own" on storage.objects;
create policy "rep_evidence_update_own"
  on storage.objects for update
  using (
    bucket_id = 'rep-evidence'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "rep_evidence_delete_own" on storage.objects;
create policy "rep_evidence_delete_own"
  on storage.objects for delete
  using (
    bucket_id = 'rep-evidence'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
