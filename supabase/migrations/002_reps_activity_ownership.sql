-- Harden reps RLS: require activity_id to belong to the same authenticated user.
-- Prevents inserting/updating a rep that points at someone else's activity
-- while claiming your own user_id.

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
