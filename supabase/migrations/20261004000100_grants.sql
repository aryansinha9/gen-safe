-- Newer Supabase projects don't grant table access to the API roles automatically.
-- Row Level Security (previous migration) still decides which rows each role can read or change.
grant usage on schema public to anon, authenticated;
grant select on public.passes, public.reviews, public.areas, public.prices to anon, authenticated;
grant insert, update, delete on public.passes, public.reviews, public.areas, public.prices to authenticated;
grant select on public.admins to authenticated;
grant execute on function public.is_admin() to anon, authenticated;
