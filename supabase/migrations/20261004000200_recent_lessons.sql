-- Recent lessons: photo cards on the /lessons page, edited at /admin (same rules as recent passes).
create table public.recent_lessons (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 60),
  lesson_on date not null,
  message text not null check (char_length(message) between 1 and 1200),
  photo_url text check (photo_url ~ '^(https?://|/assets/)'),
  photo_path text,
  photo_focus text not null default 'center' check (photo_focus in ('top', 'center', 'bottom')),
  created_at timestamptz not null default now()
);

alter table public.recent_lessons enable row level security;
create policy "recent_lessons: public read" on public.recent_lessons for select to anon, authenticated using (true);
create policy "recent_lessons: admin insert" on public.recent_lessons for insert to authenticated with check (public.is_admin());
create policy "recent_lessons: admin update" on public.recent_lessons for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "recent_lessons: admin delete" on public.recent_lessons for delete to authenticated using (public.is_admin());

grant select on public.recent_lessons to anon, authenticated;
grant insert, update, delete on public.recent_lessons to authenticated;
