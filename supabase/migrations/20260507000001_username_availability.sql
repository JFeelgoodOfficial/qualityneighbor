-- =============================================================================
-- Username availability check — accessible to anon role
-- =============================================================================
-- Signup happens before a user is authenticated, so the standard profiles
-- SELECT grant (authenticated only) cannot be used to pre-check usernames.
-- This SECURITY DEFINER function runs as its owner and safely exposes only
-- a boolean result — no profile data leaks to anon callers.
-- =============================================================================

create or replace function public.is_display_name_available(p_name text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not exists (
    select 1 from public.profiles
    where lower(display_name) = lower(p_name)
  );
$$;

grant execute on function public.is_display_name_available(text) to anon, authenticated;
