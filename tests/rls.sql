-- =============================================================================
-- QualityNeighbor — pgTAP RLS Test Suite
-- =============================================================================
-- Run with:
--   psql -d <your-db> -f tests/rls.sql
-- or via:
--   pg_prove tests/rls.sql
--
-- Entire file is wrapped in a transaction that rolls back, leaving no state.
-- =============================================================================

begin;

-- tests schema for helper functions; dropped on rollback
create schema if not exists tests;

select plan(72);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Create auth.users rows first (profiles are created by trigger, but we
-- insert directly here since we're in a test transaction).
-- We bypass the trigger by inserting into profiles directly after inserting
-- stub rows into auth.users.

-- UUIDs are fixed for reproducibility.
do $$
declare
  v_alice   uuid := '00000000-0000-0000-0000-000000000001';
  v_bob     uuid := '00000000-0000-0000-0000-000000000002';
  v_mallory uuid := '00000000-0000-0000-0000-000000000003';
  v_root    uuid := '00000000-0000-0000-0000-000000000004';
begin
  -- Insert stub auth users (email only; password hash irrelevant for tests).
  insert into auth.users (id, email, created_at, updated_at, raw_user_meta_data)
  values
    (v_alice,   'alice@hartlandranch.test',   now(), now(), '{"display_name":"Alice"}'),
    (v_bob,     'bob@hartlandranch.test',     now(), now(), '{"display_name":"Bob"}'),
    (v_mallory, 'mallory@hartlandranch.test', now(), now(), '{"display_name":"Mallory"}'),
    (v_root,    'root@hartlandranch.test',    now(), now(), '{"display_name":"Root"}')
  on conflict do nothing;

  -- The handle_new_user trigger may have already fired; use upsert-like logic.
  insert into public.profiles (id, display_name, verification_status, is_admin)
  values
    (v_alice,   'Alice',   'approved',  false),
    (v_bob,     'Bob',     'approved',  false),
    (v_mallory, 'Mallory', 'pending',   false),
    (v_root,    'Root',    'approved',  true)
  on conflict (id) do update
    set display_name        = excluded.display_name,
        verification_status = excluded.verification_status,
        is_admin            = excluded.is_admin;

  insert into public.profile_private (id)
  values (v_alice), (v_bob), (v_mallory), (v_root)
  on conflict (id) do nothing;

  -- Give alice and bob a street address for testing profile_private.
  update public.profile_private set street_address = '100 Hartland Dr'  where id = v_alice;
  update public.profile_private set street_address = '200 Hartland Dr'  where id = v_bob;
end;
$$;

-- Helper to switch session to a given user (simulates JWT sub claim).
-- Supabase reads request.jwt.claim.sub to resolve auth.uid().
create or replace function tests.set_user(p_uid uuid)
returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims',
    json_build_object('sub', p_uid::text, 'role', 'authenticated')::text,
    true);
  set local role authenticated;
end;
$$;

-- Convenience alias for switching back to superuser inside the test block.
create or replace function tests.set_superuser()
returns void language plpgsql as $$
begin
  reset role;
end;
$$;

-- Insert a listing as superuser (bypasses RLS) for later SELECT tests.
do $$
declare
  v_alice   uuid := '00000000-0000-0000-0000-000000000001';
  v_bob     uuid := '00000000-0000-0000-0000-000000000002';
  v_mallory uuid := '00000000-0000-0000-0000-000000000003';
begin
  insert into public.listings (id, user_id, category, title, is_active)
  values
    ('10000000-0000-0000-0000-000000000001', v_bob,   'for_sale', 'Bob Active Listing',   true),
    ('10000000-0000-0000-0000-000000000002', v_bob,   'for_sale', 'Bob Inactive Listing', false),
    ('10000000-0000-0000-0000-000000000003', v_alice, 'free_stuff','Alice Active Listing', true)
  on conflict do nothing;
end;
$$;

-- ============================================================
-- PROFILES — SELECT
-- ============================================================

-- alice reads bob's display_name (allowed column)
select tests.set_user('00000000-0000-0000-0000-000000000002'::uuid);  -- set bob as context first to ensure row exists
select tests.set_user('00000000-0000-0000-0000-000000000001'::uuid);  -- alice

select is(
  (select display_name from public.profiles
   where id = '00000000-0000-0000-0000-000000000002'),
  'Bob',
  'alice can SELECT bob''s display_name'
);

select is(
  (select avatar_url from public.profiles
   where id = '00000000-0000-0000-0000-000000000002'),
  null,
  'alice can SELECT bob''s avatar_url (null is fine)'
);

select is(
  (select bio from public.profiles
   where id = '00000000-0000-0000-0000-000000000002'),
  null,
  'alice can SELECT bob''s bio'
);

-- alice CANNOT read bob's verification_status (column grant test)
select throws_ok(
  $$select verification_status from public.profiles
    where id = '00000000-0000-0000-0000-000000000002'$$,
  '42501',
  null,
  'alice CANNOT SELECT verification_status — permission denied'
);

-- alice CANNOT read bob's is_admin
select throws_ok(
  $$select is_admin from public.profiles
    where id = '00000000-0000-0000-0000-000000000002'$$,
  '42501',
  null,
  'alice CANNOT SELECT is_admin — permission denied'
);

-- ============================================================
-- PROFILES — UPDATE
-- ============================================================

-- alice updates her own display_name
select lives_ok(
  $$update public.profiles set display_name = 'Alice Updated'
    where id = '00000000-0000-0000-0000-000000000001'$$,
  'alice can UPDATE her own display_name'
);

-- Reset alice's name
select tests.set_superuser();
update public.profiles set display_name = 'Alice' where id = '00000000-0000-0000-0000-000000000001';
select tests.set_user('00000000-0000-0000-0000-000000000001'::uuid);

-- alice CANNOT update bob's profile
select is(
  (with upd as (
    update public.profiles set display_name = 'Hacked'
    where id = '00000000-0000-0000-0000-000000000002'
    returning id
  ) select count(*) from upd),
  0::bigint,
  'alice CANNOT UPDATE bob''s profile (0 rows affected)'
);

-- alice CANNOT set her own is_admin to true.
-- is_admin is not in the column-level UPDATE grant for authenticated, so
-- Postgres raises 42501 (permission denied) before the trigger fires.
select throws_ok(
  $$update public.profiles set is_admin = true
    where id = '00000000-0000-0000-0000-000000000001'$$,
  '42501',
  null,
  'alice CANNOT set is_admin = true — column grant blocks it (42501)'
);

-- Same for verification_status: column grant raises 42501 before trigger.
select throws_ok(
  $$update public.profiles set verification_status = 'approved'
    where id = '00000000-0000-0000-0000-000000000001'$$,
  '42501',
  null,
  'alice CANNOT set verification_status — column grant blocks it (42501)'
);

-- ============================================================
-- PROFILE_PRIVATE — SELECT + UPDATE
-- ============================================================

-- alice can SELECT her own street_address
select is(
  (select street_address from public.profile_private
   where id = '00000000-0000-0000-0000-000000000001'),
  '100 Hartland Dr',
  'alice can SELECT her own street_address'
);

-- alice CANNOT SELECT bob's profile_private row (zero rows returned, not error)
select is(
  (select count(*) from public.profile_private
   where id = '00000000-0000-0000-0000-000000000002'),
  0::bigint,
  'alice CANNOT SELECT bob''s profile_private row (0 rows)'
);

-- alice can UPDATE her own street_address
select lives_ok(
  $$update public.profile_private set street_address = '101 Hartland Dr'
    where id = '00000000-0000-0000-0000-000000000001'$$,
  'alice can UPDATE her own street_address'
);

-- alice CANNOT UPDATE bob's profile_private
select is(
  (with upd as (
    update public.profile_private set street_address = 'Hacked'
    where id = '00000000-0000-0000-0000-000000000002'
    returning id
  ) select count(*) from upd),
  0::bigint,
  'alice CANNOT UPDATE bob''s profile_private (0 rows affected)'
);

-- ============================================================
-- LISTINGS — INSERT
-- ============================================================

-- alice (approved) can INSERT a listing with user_id = alice
select lives_ok(
  $$insert into public.listings (id, user_id, category, title)
    values ('20000000-0000-0000-0000-000000000001',
            '00000000-0000-0000-0000-000000000001',
            'gigs', 'Alice Test Gig')$$,
  'alice can INSERT a listing with user_id = alice'
);

-- alice CANNOT INSERT a listing with user_id = bob
select is(
  (with ins as (
    insert into public.listings (id, user_id, category, title)
    values ('20000000-0000-0000-0000-000000000002',
            '00000000-0000-0000-0000-000000000002',
            'gigs', 'Alice Spoofed Bob Gig')
    on conflict do nothing
    returning id
  ) select count(*) from ins),
  0::bigint,
  'alice CANNOT INSERT a listing with user_id = bob (0 rows)'
);

-- mallory (pending) CANNOT INSERT any listing
select tests.set_user('00000000-0000-0000-0000-000000000003'::uuid);

select is(
  (with ins as (
    insert into public.listings (id, user_id, category, title)
    values ('20000000-0000-0000-0000-000000000003',
            '00000000-0000-0000-0000-000000000003',
            'free_stuff', 'Mallory Free Stuff')
    on conflict do nothing
    returning id
  ) select count(*) from ins),
  0::bigint,
  'mallory CANNOT INSERT any listing (0 rows)'
);

-- mallory CANNOT SELECT any listing
select is(
  (select count(*) from public.listings),
  0::bigint,
  'mallory CANNOT SELECT any listing (0 rows)'
);

-- ============================================================
-- LISTINGS — SELECT
-- ============================================================

select tests.set_user('00000000-0000-0000-0000-000000000001'::uuid);

-- alice can SELECT bob's active listing
select is(
  (select count(*) from public.listings
   where id = '10000000-0000-0000-0000-000000000001'),
  1::bigint,
  'alice can SELECT bob''s active listing'
);

-- alice CANNOT SELECT bob's inactive listing (is_active = false filtered by policy)
select is(
  (select count(*) from public.listings
   where id = '10000000-0000-0000-0000-000000000002'),
  0::bigint,
  'alice CANNOT SELECT bob''s inactive listing'
);

-- ============================================================
-- LISTINGS — UPDATE
-- ============================================================

-- alice can UPDATE her own listing
select lives_ok(
  $$update public.listings set title = 'Alice Updated Listing'
    where id = '10000000-0000-0000-0000-000000000003'$$,
  'alice can UPDATE her own listing'
);

-- alice CANNOT UPDATE bob's listing
select is(
  (with upd as (
    update public.listings set title = 'Hacked'
    where id = '10000000-0000-0000-0000-000000000001'
    returning id
  ) select count(*) from upd),
  0::bigint,
  'alice CANNOT UPDATE bob''s listing (0 rows)'
);

-- ============================================================
-- LISTINGS — DELETE (admin)
-- ============================================================

select tests.set_user('00000000-0000-0000-0000-000000000004'::uuid);  -- root/admin

select is(
  (with del as (
    delete from public.listings
    where id = '10000000-0000-0000-0000-000000000001'
    returning id
  ) select count(*) from del),
  1::bigint,
  'root (admin) can DELETE any listing'
);

-- Restore the deleted listing for remaining tests.
select tests.set_superuser();
insert into public.listings (id, user_id, category, title, is_active)
values ('10000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000002',
        'for_sale', 'Bob Active Listing', true)
on conflict do nothing;

-- ============================================================
-- LISTING_MESSAGES
-- ============================================================

select tests.set_user('00000000-0000-0000-0000-000000000001'::uuid);  -- alice

-- alice can INSERT a message to bob about bob's listing
select lives_ok(
  $$insert into public.listing_messages
      (id, listing_id, sender_id, receiver_id, body)
    values ('30000000-0000-0000-0000-000000000001',
            '10000000-0000-0000-0000-000000000001',
            '00000000-0000-0000-0000-000000000001',
            '00000000-0000-0000-0000-000000000002',
            'Hi Bob, is this still available?')$$,
  'alice can INSERT a message to bob about bob''s listing'
);

-- alice CANNOT INSERT a message with sender_id = bob (not her uid)
select is(
  (with ins as (
    insert into public.listing_messages
        (id, listing_id, sender_id, receiver_id, body)
    values ('30000000-0000-0000-0000-000000000002',
            '10000000-0000-0000-0000-000000000001',
            '00000000-0000-0000-0000-000000000002',
            '00000000-0000-0000-0000-000000000001',
            'Impersonating Bob')
    on conflict do nothing
    returning id
  ) select count(*) from ins),
  0::bigint,
  'alice CANNOT INSERT a message with sender_id = bob'
);

-- alice CANNOT INSERT a message to mallory (mallory unapproved — trigger raises)
select throws_ok(
  $$insert into public.listing_messages
      (id, listing_id, sender_id, receiver_id, body)
    values ('30000000-0000-0000-0000-000000000003',
            '10000000-0000-0000-0000-000000000001',
            '00000000-0000-0000-0000-000000000001',
            '00000000-0000-0000-0000-000000000003',
            'Hi Mallory')$$,
  'P0001',
  null,
  'alice CANNOT INSERT a message to mallory (unapproved — trigger exception)'
);

-- alice CANNOT message herself (check constraint + RLS)
select throws_ok(
  $$insert into public.listing_messages
      (id, listing_id, sender_id, receiver_id, body)
    values ('30000000-0000-0000-0000-000000000004',
            '10000000-0000-0000-0000-000000000001',
            '00000000-0000-0000-0000-000000000001',
            '00000000-0000-0000-0000-000000000001',
            'Self message')$$,
  '23514',
  null,
  'alice CANNOT message herself (check constraint violation)'
);

-- if bob blocks alice, alice CANNOT INSERT a message to bob
select tests.set_superuser();
insert into public.blocked_users (blocker_id, blocked_id)
values ('00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0000-000000000001')  -- bob blocks alice
on conflict do nothing;

select tests.set_user('00000000-0000-0000-0000-000000000001'::uuid);

select throws_ok(
  $$insert into public.listing_messages
      (id, listing_id, sender_id, receiver_id, body)
    values ('30000000-0000-0000-0000-000000000005',
            '10000000-0000-0000-0000-000000000001',
            '00000000-0000-0000-0000-000000000001',
            '00000000-0000-0000-0000-000000000002',
            'Trying to message blocked bob')$$,
  'P0001',
  null,
  'alice CANNOT INSERT message to bob after bob blocks alice'
);

-- Remove block for remaining message tests.
select tests.set_superuser();
delete from public.blocked_users
where blocker_id = '00000000-0000-0000-0000-000000000002'
  and blocked_id  = '00000000-0000-0000-0000-000000000001';

-- Insert a bob-to-alice reply directly as superuser for SELECT tests.
insert into public.listing_messages
    (id, listing_id, sender_id, receiver_id, body)
values ('30000000-0000-0000-0000-000000000006',
        '10000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0000-000000000001',
        'Yes, still available!')
on conflict do nothing;

-- Insert a bob-to-root message that alice should NOT see.
insert into public.listing_messages
    (id, listing_id, sender_id, receiver_id, body)
values ('30000000-0000-0000-0000-000000000007',
        '10000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0000-000000000004',
        'Private message to root')
on conflict do nothing;

select tests.set_user('00000000-0000-0000-0000-000000000001'::uuid);

-- alice can SELECT messages where she is sender or receiver
select is(
  (select count(*) from public.listing_messages
   where id in (
     '30000000-0000-0000-0000-000000000001',
     '30000000-0000-0000-0000-000000000006'
   )),
  2::bigint,
  'alice can SELECT messages where she is sender or receiver'
);

-- alice CANNOT SELECT a message between bob and root
select is(
  (select count(*) from public.listing_messages
   where id = '30000000-0000-0000-0000-000000000007'),
  0::bigint,
  'alice CANNOT SELECT a message between bob and root'
);

-- alice CANNOT DELETE any message
select is(
  (with del as (
    delete from public.listing_messages
    where id = '30000000-0000-0000-0000-000000000001'
    returning id
  ) select count(*) from del),
  0::bigint,
  'alice CANNOT DELETE any message (0 rows, policy denies)'
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

-- Insert notification as superuser.
select tests.set_superuser();
insert into public.notifications (id, user_id, kind)
values ('40000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000001',
        'resident_approved')
on conflict do nothing;

insert into public.notifications (id, user_id, kind)
values ('40000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0000-000000000002',
        'new_message')
on conflict do nothing;

select tests.set_user('00000000-0000-0000-0000-000000000001'::uuid);

-- alice can SELECT her own notification
select is(
  (select count(*) from public.notifications
   where id = '40000000-0000-0000-0000-000000000001'),
  1::bigint,
  'alice can SELECT her own notification'
);

-- alice CANNOT SELECT bob's notification
select is(
  (select count(*) from public.notifications
   where id = '40000000-0000-0000-0000-000000000002'),
  0::bigint,
  'alice CANNOT SELECT bob''s notification'
);

-- alice can UPDATE read_at on her own notification
select lives_ok(
  $$update public.notifications set read_at = now()
    where id = '40000000-0000-0000-0000-000000000001'$$,
  'alice can UPDATE read_at on her own notification'
);

-- alice CANNOT INSERT a notification (policy denies)
select is(
  (with ins as (
    insert into public.notifications (id, user_id, kind)
    values ('40000000-0000-0000-0000-000000000003',
            '00000000-0000-0000-0000-000000000001',
            'new_message')
    on conflict do nothing
    returning id
  ) select count(*) from ins),
  0::bigint,
  'alice CANNOT INSERT a notification (0 rows)'
);

-- ============================================================
-- ADMIN_ACTIONS
-- ============================================================

select tests.set_superuser();
insert into public.admin_actions (id, admin_id, target_user_id, kind)
values ('50000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000004',
        '00000000-0000-0000-0000-000000000003',
        'approve_resident')
on conflict do nothing;

-- alice (non-admin) CANNOT SELECT admin_actions
select tests.set_user('00000000-0000-0000-0000-000000000001'::uuid);

select is(
  (select count(*) from public.admin_actions),
  0::bigint,
  'alice (non-admin) CANNOT SELECT admin_actions (0 rows)'
);

-- root (admin) CAN SELECT admin_actions
select tests.set_user('00000000-0000-0000-0000-000000000004'::uuid);

select is(
  (select count(*) from public.admin_actions
   where id = '50000000-0000-0000-0000-000000000001'),
  1::bigint,
  'root (admin) CAN SELECT admin_actions'
);

-- authenticated users CANNOT INSERT admin_actions
select tests.set_user('00000000-0000-0000-0000-000000000004'::uuid);  -- even admin

select is(
  (with ins as (
    insert into public.admin_actions (id, admin_id, kind)
    values ('50000000-0000-0000-0000-000000000002',
            '00000000-0000-0000-0000-000000000004',
            'remove_listing')
    on conflict do nothing
    returning id
  ) select count(*) from ins),
  0::bigint,
  'authenticated (even admin) CANNOT INSERT admin_actions directly'
);

-- ============================================================
-- LISTING_REPORTS
-- ============================================================

-- alice (approved) can INSERT a report
select tests.set_user('00000000-0000-0000-0000-000000000001'::uuid);

select lives_ok(
  $$insert into public.listing_reports (id, listing_id, reporter_id, reason)
    values ('60000000-0000-0000-0000-000000000001',
            '10000000-0000-0000-0000-000000000003',
            '00000000-0000-0000-0000-000000000001',
            'Spam or misleading')$$,
  'alice (approved) can INSERT a listing report'
);

-- mallory (pending) CANNOT INSERT a report
select tests.set_user('00000000-0000-0000-0000-000000000003'::uuid);

select is(
  (with ins as (
    insert into public.listing_reports (id, listing_id, reporter_id, reason)
    values ('60000000-0000-0000-0000-000000000002',
            '10000000-0000-0000-0000-000000000003',
            '00000000-0000-0000-0000-000000000003',
            'Mallory trying to report')
    on conflict do nothing
    returning id
  ) select count(*) from ins),
  0::bigint,
  'mallory (pending) CANNOT INSERT a listing report'
);

-- alice can SELECT her own report
select tests.set_user('00000000-0000-0000-0000-000000000001'::uuid);

select is(
  (select count(*) from public.listing_reports
   where id = '60000000-0000-0000-0000-000000000001'),
  1::bigint,
  'alice can SELECT her own listing report'
);

-- bob CANNOT SELECT alice's report (not reporter, not admin)
select tests.set_user('00000000-0000-0000-0000-000000000002'::uuid);

select is(
  (select count(*) from public.listing_reports
   where id = '60000000-0000-0000-0000-000000000001'),
  0::bigint,
  'bob CANNOT SELECT alice''s listing report'
);

-- root (admin) can UPDATE (resolve) a report
select tests.set_user('00000000-0000-0000-0000-000000000004'::uuid);

select is(
  (with upd as (
    update public.listing_reports
    set resolved_at = now(), resolved_by = '00000000-0000-0000-0000-000000000004'
    where id = '60000000-0000-0000-0000-000000000001'
    returning id
  ) select count(*) from upd),
  1::bigint,
  'root (admin) can UPDATE (resolve) a listing report'
);

-- alice CANNOT UPDATE a report (non-admin)
select tests.set_user('00000000-0000-0000-0000-000000000001'::uuid);

select is(
  (with upd as (
    update public.listing_reports
    set resolved_at = now()
    where id = '60000000-0000-0000-0000-000000000001'
    returning id
  ) select count(*) from upd),
  0::bigint,
  'alice (non-admin) CANNOT UPDATE a listing report'
);

-- ============================================================
-- BLOCKED_USERS
-- ============================================================

select tests.set_user('00000000-0000-0000-0000-000000000001'::uuid);

-- alice can INSERT a block
select lives_ok(
  $$insert into public.blocked_users (blocker_id, blocked_id)
    values ('00000000-0000-0000-0000-000000000001',
            '00000000-0000-0000-0000-000000000002')
    on conflict do nothing$$,
  'alice can INSERT a blocked_users row (blocking bob)'
);

-- alice can SELECT her own blocks
select is(
  (select count(*) from public.blocked_users
   where blocker_id = '00000000-0000-0000-0000-000000000001'),
  1::bigint,
  'alice can SELECT her own blocked_users rows'
);

-- alice CANNOT INSERT a block on behalf of bob
select is(
  (with ins as (
    insert into public.blocked_users (blocker_id, blocked_id)
    values ('00000000-0000-0000-0000-000000000002',
            '00000000-0000-0000-0000-000000000001')
    on conflict do nothing
    returning blocker_id
  ) select count(*) from ins),
  0::bigint,
  'alice CANNOT INSERT a blocked_users row with blocker_id = bob'
);

-- alice CANNOT SELECT bob's block list
select is(
  (select count(*) from public.blocked_users
   where blocker_id = '00000000-0000-0000-0000-000000000002'),
  0::bigint,
  'alice CANNOT SELECT bob''s blocked_users rows'
);

-- alice can DELETE her own block
select is(
  (with del as (
    delete from public.blocked_users
    where blocker_id = '00000000-0000-0000-0000-000000000001'
      and blocked_id  = '00000000-0000-0000-0000-000000000002'
    returning blocker_id
  ) select count(*) from del),
  1::bigint,
  'alice can DELETE her own block'
);

-- ============================================================
-- FINISH
-- ============================================================

select * from finish();

rollback;
