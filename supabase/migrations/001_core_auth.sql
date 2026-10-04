-- MindCircle — Part A: fix public.users so profile rows are auto-created on signup
-- Run this in the Supabase SQL Editor (project btamknquiykxyjmutoki).
-- Either paste the whole block and Run, or run it line-by-line if a step errors.

-- ============================================================
-- Optional cleanup ONLY if step 1 errors with "violates foreign key":
-- that means orphan rows exist in public.users whose id is not a real
-- auth user. Delete them first, then continue below. (public.users should
-- be empty — mention it if this line is actually needed.)
--   delete from public.users where id not in (select id from auth.users);
-- ============================================================

-- 1. Profile id must equal the auth user id (RLS policies depend on this),
--    and deleting an auth account should cascade to the profile row.
alter table public.users alter column id drop default;
alter table public.users
  add constraint users_id_fkey foreign key (id)
  references auth.users(id) on delete cascade;

-- 2. Auto-create a profile row on every new signup.
--    SECURITY DEFINER bypasses RLS (users has no INSERT policy).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, anonymous_id, avatar_emoji)
  values (new.id, new.email,
          'anon-' || substr(md5(new.id::text), 1, 8), '😊')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3. Backfill any existing auth users (e.g. earlier test signups).
insert into public.users (id, email, anonymous_id)
select id, email, 'anon-' || substr(md5(id::text), 1, 8)
from auth.users
on conflict (id) do nothing;