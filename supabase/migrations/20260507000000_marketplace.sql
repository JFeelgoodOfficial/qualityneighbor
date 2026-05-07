-- =============================================================================
-- QualityNeighbor Marketplace — Initial Migration
-- =============================================================================
-- ASSUMPTIONS TO VERIFY BEFORE DEPLOYING:
--   1. pgcrypto and pgtap extensions are available in your Supabase project.
--   2. The auth schema is Supabase-managed; this file never touches it.
--   3. You are running Postgres 15+.
--   4. The trigger on auth.users (handle_new_user) requires SECURITY DEFINER
--      to insert into public.profiles; the function owner must have INSERT
--      on public.profiles and public.profile_private.
--   5. Column-level GRANTs on public.profiles are the primary mechanism
--      preventing verification_status / is_admin from leaking to other
--      authenticated users. RLS SELECT policies allow all authenticated rows,
--      but only the explicitly granted columns are readable.
--   6. service_role bypasses RLS. Never expose service_role key client-side.
--   7. The prevent_self_promotion trigger fires on BEFORE UPDATE FOR EACH ROW
--      for role 'authenticated'. In Supabase the PostgREST role is
--      'authenticated'; direct psql sessions use the postgres superuser and
--      will not be blocked — keep that in mind during manual testing.
--   8. array_length() returns NULL for empty arrays, so the check constraint
--      on image_paths uses a coalesce guard.
--   9. blocked_users mutual-block check in enforce_message_participants checks
--      both directions (alice blocks bob OR bob blocks alice).
--  10. Notification inserts are done by service_role (Edge Functions or
--      triggers run as SECURITY DEFINER). Authenticated users cannot INSERT
--      notifications.
-- =============================================================================

-- ============================================================
-- 1. EXTENSIONS
-- ============================================================

create extension if not exists pgcrypto;

-- ============================================================
-- 2. ENUMS
-- ============================================================

do $$ begin
  create type public.verification_status as enum (
    'unsubmitted', 'pending', 'approved', 'rejected', 'revoked'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.listing_category as enum (
    'free_stuff', 'for_sale', 'gigs'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.listing_condition as enum (
    'new', 'like_new', 'good', 'fair', 'for_parts'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.notification_kind as enum (
    'resident_approved', 'resident_rejected', 'new_message',
    'listing_reported', 'listing_removed'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.admin_action_kind as enum (
    'approve_resident', 'reject_resident', 'revoke_resident',
    'remove_listing', 'resolve_report'
  );
exception when duplicate_object then null; end $$;

-- ============================================================
-- 3. TABLES
-- ============================================================

create table if not exists public.profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  display_name        text not null
                        constraint profiles_display_name_length
                        check (char_length(display_name) between 2 and 40),
  avatar_url          text,
  bio                 text
                        constraint profiles_bio_length
                        check (char_length(bio) <= 500),
  neighborhood        text not null default 'Hartland Ranch',
  verification_status public.verification_status not null default 'unsubmitted',
  is_admin            boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

comment on table public.profiles is
  'Public-facing profile data. Sensitive columns (verification_status, is_admin) '
  'are hidden from authenticated users via column-level GRANTs — see grants section.';

create table if not exists public.profile_private (
  id                          uuid primary key
                                references public.profiles(id) on delete cascade,
  street_address              text,
  verification_method         text,
  verification_submitted_at   timestamptz,
  verified_at                 timestamptz,
  verified_by                 uuid references public.profiles(id),
  rejection_reason            text
);

comment on table public.profile_private is
  'Private verification data. RLS restricts each row to its owner. '
  'service_role bypasses RLS for admin workflows.';

create table if not exists public.listings (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  category     public.listing_category not null,
  title        text not null
                 constraint listings_title_length
                 check (char_length(title) between 3 and 100),
  description  text
                 constraint listings_description_length
                 check (char_length(description) <= 2000),
  price        numeric(10,2)
                 constraint listings_price_non_negative
                 check (price >= 0),
  condition    public.listing_condition,
  details      jsonb not null default '{}'::jsonb,
  image_paths  text[] not null default '{}',
               -- coalesce: array_length returns NULL for empty arrays
  constraint   listings_image_paths_max_8
                 check (coalesce(array_length(image_paths, 1), 0) <= 8),
  is_active    boolean not null default true,
  expires_at   timestamptz not null default (now() + interval '60 days'),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.listing_messages (
  id          uuid primary key default gen_random_uuid(),
  listing_id  uuid references public.listings(id) on delete set null,
  sender_id   uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  body        text not null
                constraint listing_messages_body_length
                check (char_length(body) between 1 and 2000),
  read_at     timestamptz,
  created_at  timestamptz not null default now(),
  constraint  listing_messages_no_self_message
                check (sender_id <> receiver_id)
);

create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  kind       public.notification_kind not null,
  payload    jsonb not null default '{}'::jsonb,
  read_at    timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_actions (
  id                uuid primary key default gen_random_uuid(),
  admin_id          uuid references public.profiles(id),
  target_user_id    uuid references public.profiles(id),
  target_listing_id uuid references public.listings(id),
  kind              public.admin_action_kind not null,
  reason            text,
  created_at        timestamptz not null default now()
);

create table if not exists public.listing_reports (
  id          uuid primary key default gen_random_uuid(),
  listing_id  uuid references public.listings(id) on delete cascade,
  reporter_id uuid references public.profiles(id) on delete set null,
  reason      text not null,
  resolved_at timestamptz,
  resolved_by uuid references public.profiles(id),
  created_at  timestamptz not null default now()
);

create table if not exists public.blocked_users (
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  constraint blocked_users_no_self_block check (blocker_id <> blocked_id)
);

-- ============================================================
-- 4. INDEXES
-- ============================================================

create index if not exists idx_listings_category_created_at
  on public.listings (category, created_at desc)
  where is_active;

create index if not exists idx_listings_user_id
  on public.listings (user_id)
  where is_active;

create index if not exists idx_listings_expires_at
  on public.listings (expires_at)
  where is_active;

create index if not exists idx_listing_messages_receiver_id
  on public.listing_messages (receiver_id, created_at desc);

create index if not exists idx_listing_messages_sender_id
  on public.listing_messages (sender_id, created_at desc);

create index if not exists idx_listing_messages_listing_id
  on public.listing_messages (listing_id, created_at desc);

create index if not exists idx_notifications_user_unread
  on public.notifications (user_id, created_at desc)
  where read_at is null;

create index if not exists idx_profiles_approved
  on public.profiles (verification_status)
  where verification_status = 'approved';

-- ============================================================
-- 5. TRIGGERS AND FUNCTIONS
-- ============================================================

-- ------------------------------------------------------------
-- set_updated_at: bump updated_at on any row update
-- ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists trg_listings_updated_at on public.listings;
create trigger trg_listings_updated_at
  before update on public.listings
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- handle_new_user: create profile + profile_private on signup
-- ------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;

  insert into public.profile_private (id)
  values (new.id)
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Supabase does not allow CREATE TRIGGER on auth schema from migrations
-- in all project tiers. If this fails, create the trigger via the
-- Supabase dashboard under Database > Triggers, pointing to auth.users.
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------
-- prevent_self_promotion: block is_admin / verification_status
-- changes by non-service_role sessions
-- ------------------------------------------------------------
create or replace function public.prevent_self_promotion()
returns trigger
language plpgsql
as $$
begin
  -- Only block changes made through the PostgREST 'authenticated' role.
  -- Migrations, seeds, service_role, and the postgres superuser all run
  -- as other roles and must be able to set these columns freely.
  -- (Column-level GRANTs already prevent authenticated users from naming
  -- these columns in an UPDATE, but this trigger is retained as a
  -- defence-in-depth guard in case grant configuration changes.)
  if current_user <> 'authenticated' then
    return new;
  end if;

  if new.is_admin is distinct from old.is_admin then
    raise exception 'Direct modification of is_admin is not allowed.';
  end if;

  if new.verification_status is distinct from old.verification_status then
    raise exception 'Direct modification of verification_status is not allowed.';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_prevent_self_promotion on public.profiles;
create trigger trg_prevent_self_promotion
  before update on public.profiles
  for each row execute function public.prevent_self_promotion();

-- ------------------------------------------------------------
-- enforce_message_participants: verify both parties are approved
-- and not mutually blocked before a message is inserted
-- ------------------------------------------------------------
create or replace function public.enforce_message_participants()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sender_approved   boolean;
  v_receiver_approved boolean;
  v_blocked           boolean;
begin
  select (verification_status = 'approved') into v_sender_approved
    from public.profiles where id = new.sender_id;

  select (verification_status = 'approved') into v_receiver_approved
    from public.profiles where id = new.receiver_id;

  if not coalesce(v_sender_approved, false) then
    raise exception 'Sender is not an approved resident.';
  end if;

  if not coalesce(v_receiver_approved, false) then
    raise exception 'Receiver is not an approved resident.';
  end if;

  -- block in either direction counts
  select exists (
    select 1 from public.blocked_users
    where (blocker_id = new.sender_id   and blocked_id = new.receiver_id)
       or (blocker_id = new.receiver_id and blocked_id = new.sender_id)
  ) into v_blocked;

  if v_blocked then
    raise exception 'Messaging is blocked between these users.';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_enforce_message_participants on public.listing_messages;
create trigger trg_enforce_message_participants
  before insert on public.listing_messages
  for each row execute function public.enforce_message_participants();

-- ============================================================
-- 6. RLS — ENABLE + POLICIES
-- ============================================================

alter table public.profiles          enable row level security;
alter table public.profile_private   enable row level security;
alter table public.listings          enable row level security;
alter table public.listing_messages  enable row level security;
alter table public.notifications     enable row level security;
alter table public.admin_actions     enable row level security;
alter table public.listing_reports   enable row level security;
alter table public.blocked_users     enable row level security;

-- Helper: is the current JWT user an approved resident?
-- Used in multiple policies below to avoid repetition.
create or replace function public.is_approved_resident()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and verification_status = 'approved'
  );
$$;

-- Helper: is the current JWT user an admin?
create or replace function public.is_admin_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and is_admin = true
  );
$$;

-- ---- profiles ----

-- Any authenticated user can see all profile rows (but only the
-- column-granted columns — verification_status and is_admin are withheld
-- via GRANT, not via policy).
drop policy if exists "profiles_select_authenticated" on public.profiles;
create policy "profiles_select_authenticated"
  on public.profiles for select
  to authenticated
  using (true);

-- Users may only update their own row; the trigger enforces field limits.
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- INSERT is handled exclusively by the handle_new_user trigger (service_role).
-- Deny direct INSERT from authenticated or anon.
drop policy if exists "profiles_insert_deny" on public.profiles;
create policy "profiles_insert_deny"
  on public.profiles for insert
  to authenticated
  with check (false);

-- DELETE is never permitted.
drop policy if exists "profiles_delete_deny" on public.profiles;
create policy "profiles_delete_deny"
  on public.profiles for delete
  to authenticated
  using (false);

-- ---- profile_private ----

-- Owner-only: each user may only see and modify their own private row.
drop policy if exists "profile_private_owner_all" on public.profile_private;
create policy "profile_private_owner_all"
  on public.profile_private for all
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ---- listings ----

-- Only approved residents can view active listings.
drop policy if exists "listings_select_approved" on public.listings;
create policy "listings_select_approved"
  on public.listings for select
  to authenticated
  using (is_active = true and public.is_approved_resident());

-- Only approved residents can create listings, and only for themselves.
drop policy if exists "listings_insert_approved" on public.listings;
create policy "listings_insert_approved"
  on public.listings for insert
  to authenticated
  with check (user_id = auth.uid() and public.is_approved_resident());

-- Owners update their own listings.
drop policy if exists "listings_update_own" on public.listings;
create policy "listings_update_own"
  on public.listings for update
  to authenticated
  using (user_id = auth.uid());

-- Owners or admins can delete listings.
drop policy if exists "listings_delete_owner_or_admin" on public.listings;
create policy "listings_delete_owner_or_admin"
  on public.listings for delete
  to authenticated
  using (user_id = auth.uid() or public.is_admin_user());

-- ---- listing_messages ----

-- Parties to a conversation can read it.
drop policy if exists "listing_messages_select_participants" on public.listing_messages;
create policy "listing_messages_select_participants"
  on public.listing_messages for select
  to authenticated
  using (auth.uid() in (sender_id, receiver_id));

-- Sender must be the authenticated user; the trigger enforces approval + block checks.
drop policy if exists "listing_messages_insert_sender" on public.listing_messages;
create policy "listing_messages_insert_sender"
  on public.listing_messages for insert
  to authenticated
  with check (
    sender_id = auth.uid()
    and public.is_approved_resident()
    and sender_id <> receiver_id
  );

-- Receiver may mark messages as read (only read_at column is granted for update).
drop policy if exists "listing_messages_update_receiver" on public.listing_messages;
create policy "listing_messages_update_receiver"
  on public.listing_messages for update
  to authenticated
  using (receiver_id = auth.uid());

-- Messages are never deleted by users (audit trail).
drop policy if exists "listing_messages_delete_deny" on public.listing_messages;
create policy "listing_messages_delete_deny"
  on public.listing_messages for delete
  to authenticated
  using (false);

-- ---- notifications ----

drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own"
  on public.notifications for select
  to authenticated
  using (user_id = auth.uid());

-- Only read_at updates allowed; enforced by restricting column grant below.
drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own"
  on public.notifications for update
  to authenticated
  using (user_id = auth.uid());

-- INSERT restricted to service_role; deny authenticated.
drop policy if exists "notifications_insert_deny" on public.notifications;
create policy "notifications_insert_deny"
  on public.notifications for insert
  to authenticated
  with check (false);

-- ---- admin_actions ----

-- Admins can view all admin actions.
drop policy if exists "admin_actions_select_admin" on public.admin_actions;
create policy "admin_actions_select_admin"
  on public.admin_actions for select
  to authenticated
  using (public.is_admin_user());

-- INSERT is service_role only; deny authenticated directly.
drop policy if exists "admin_actions_insert_deny" on public.admin_actions;
create policy "admin_actions_insert_deny"
  on public.admin_actions for insert
  to authenticated
  with check (false);

-- ---- listing_reports ----

-- Reporters see their own reports; admins see all.
drop policy if exists "listing_reports_select" on public.listing_reports;
create policy "listing_reports_select"
  on public.listing_reports for select
  to authenticated
  using (reporter_id = auth.uid() or public.is_admin_user());

-- Approved residents can file reports.
drop policy if exists "listing_reports_insert_approved" on public.listing_reports;
create policy "listing_reports_insert_approved"
  on public.listing_reports for insert
  to authenticated
  with check (reporter_id = auth.uid() and public.is_approved_resident());

-- Only admins may resolve (update) reports.
drop policy if exists "listing_reports_update_admin" on public.listing_reports;
create policy "listing_reports_update_admin"
  on public.listing_reports for update
  to authenticated
  using (public.is_admin_user());

-- ---- blocked_users ----

-- Users manage their own block list.
drop policy if exists "blocked_users_all_blocker" on public.blocked_users;
create policy "blocked_users_all_blocker"
  on public.blocked_users for all
  to authenticated
  using (blocker_id = auth.uid())
  with check (blocker_id = auth.uid());

-- ============================================================
-- 7. GRANTS
-- ============================================================

-- =============================================================================
-- PRIVACY CRITICAL — READ THIS COMMENT BEFORE CHANGING ANYTHING BELOW.
--
-- Column-level GRANTs on public.profiles are the primary mechanism that
-- prevents verification_status, is_admin, street_address, and any other
-- sensitive column from being readable by other authenticated users.
--
-- The RLS SELECT policy for profiles uses "using (true)", meaning ALL rows
-- pass the row-level filter. Sensitive columns are hidden by NOT being listed
-- in the GRANT below. If you add a sensitive column to profiles, you MUST NOT
-- include it in the grant list or it will be readable by every logged-in user.
-- =============================================================================

-- Revoke all table-level access first, then grant only explicit columns.
revoke all on public.profiles from anon, authenticated;

-- authenticated users may read only these non-sensitive columns.
grant select (id, display_name, avatar_url, bio, neighborhood, created_at)
  on public.profiles to authenticated;

-- authenticated users may update only these display columns (not is_admin, not verification_status).
grant update (display_name, avatar_url, bio)
  on public.profiles to authenticated;

-- profile_private: no column access for anon or authenticated beyond RLS policy.
revoke all on public.profile_private from anon, authenticated;
grant select, insert, update, delete on public.profile_private to authenticated;

-- listings: full access (RLS policies enforce who can do what).
revoke all on public.listings from anon;
grant select, insert, update, delete on public.listings to authenticated;

-- listing_messages: receivers may only update read_at.
revoke all on public.listing_messages from anon;
grant select, insert on public.listing_messages to authenticated;
grant update (read_at) on public.listing_messages to authenticated;

-- notifications: users may only update read_at.
revoke all on public.notifications from anon;
grant select on public.notifications to authenticated;
grant update (read_at) on public.notifications to authenticated;

-- admin_actions: readable by admins (RLS), no insert from authenticated.
revoke all on public.admin_actions from anon;
grant select on public.admin_actions to authenticated;

-- listing_reports: approved residents insert; admins update.
revoke all on public.listing_reports from anon;
grant select, insert, update on public.listing_reports to authenticated;

-- blocked_users: full CRUD for owner (RLS restricts to blocker_id = uid).
revoke all on public.blocked_users from anon;
grant select, insert, delete on public.blocked_users to authenticated;

-- service_role always bypasses RLS and owns all tables; no explicit grants needed.

-- ============================================================
-- MANUAL PROBES — run these in the Supabase SQL editor before
-- deploying to production.
-- ============================================================
--
-- 1. Confirm the trigger on auth.users was created:
--      select trigger_name from information_schema.triggers
--      where event_object_schema = 'auth'
--        and event_object_table = 'users';
--
-- 2. Sign up a test user in Auth and verify a profile + profile_private row
--    were inserted automatically:
--      select * from public.profiles;
--      select * from public.profile_private;
--
-- 3. As the authenticated test user, verify you CANNOT see verification_status:
--      set role authenticated;
--      set local "request.jwt.claim.sub" = '<your-test-user-uuid>';
--      select verification_status from public.profiles limit 1;
--      -- should return ERROR: permission denied for table profiles
--
-- 4. As service_role, update a user to approved, then verify that user can
--    see listings but a pending user cannot:
--      update public.profiles set verification_status = 'approved'
--      where id = '<approved-uuid>';
--
-- 5. Test the prevent_self_promotion trigger as authenticated:
--      set role authenticated;
--      update public.profiles set is_admin = true where id = auth.uid();
--      -- should raise exception
--
-- 6. Test message blocking: insert a blocked_users row, then attempt a
--    listing_message insert — should raise "Messaging is blocked".
--
-- 7. Verify RLS is ON for every table:
--      select tablename, rowsecurity from pg_tables
--      where schemaname = 'public';
--
-- 8. Confirm column grants on profiles show exactly:
--    id, display_name, avatar_url, bio, neighborhood, created_at (select)
--    display_name, avatar_url, bio (update)
--      select grantee, column_name, privilege_type
--      from information_schema.column_privileges
--      where table_schema = 'public' and table_name = 'profiles'
--      order by grantee, column_name;
-- ============================================================
