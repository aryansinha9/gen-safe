-- Safe-Gen site content: editable from /admin, readable by everyone.
-- Writes are limited to users listed in public.admins (sign-ups are disabled too).

-- ---------- Admins ----------
create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;
-- Signed-in users may only see whether they themselves are an admin.
create policy "admins: read own row" on public.admins
  for select to authenticated using (user_id = auth.uid());

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------- Recent passes ----------
create table public.passes (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 60),
  passed_on date not null,
  message text not null check (char_length(message) between 1 and 1200),
  photo_url text check (photo_url ~ '^(https?://|/assets/)'),
  photo_path text,
  photo_focus text not null default 'center' check (photo_focus in ('top', 'center', 'bottom')),
  created_at timestamptz not null default now()
);

-- ---------- Student reviews ----------
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 60),
  reviewed_on date not null,
  quote text not null check (char_length(quote) between 1 and 1200),
  created_at timestamptz not null default now()
);

-- ---------- Areas we service ----------
create table public.areas (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(name) between 1 and 60),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- Prices ----------
create table public.prices (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 60),
  duration integer not null default 60 check (duration in (60, 90)),
  price integer not null check (price between 0 and 100000),
  unit text not null default '/ lesson' check (char_length(unit) <= 40),
  note text not null default '' check (char_length(note) <= 80),
  features text[] not null default '{}' check (cardinality(features) <= 8),
  featured boolean not null default false,
  featured_label text not null default 'Best value' check (char_length(featured_label) <= 24),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- Row level security: public read, admin write ----------
do $$
declare t text;
begin
  foreach t in array array['passes', 'reviews', 'areas', 'prices'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "%1$s: public read" on public.%1$I for select to anon, authenticated using (true)', t);
    execute format('create policy "%1$s: admin insert" on public.%1$I for insert to authenticated with check (public.is_admin())', t);
    execute format('create policy "%1$s: admin update" on public.%1$I for update to authenticated using (public.is_admin()) with check (public.is_admin())', t);
    execute format('create policy "%1$s: admin delete" on public.%1$I for delete to authenticated using (public.is_admin())', t);
  end loop;
end $$;

-- ---------- Photo storage ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-images', 'site-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "site-images: admin read" on storage.objects
  for select to authenticated using (bucket_id = 'site-images' and public.is_admin());
create policy "site-images: admin upload" on storage.objects
  for insert to authenticated with check (bucket_id = 'site-images' and public.is_admin());
create policy "site-images: admin update" on storage.objects
  for update to authenticated using (bucket_id = 'site-images' and public.is_admin());
create policy "site-images: admin delete" on storage.objects
  for delete to authenticated using (bucket_id = 'site-images' and public.is_admin());

-- ---------- Starting content (matches the current site) ----------
insert into public.passes (name, passed_on, message, photo_url, photo_focus) values
  ('Vijay', '2026-07-30', 'A fantastic achievement and a reflection of your hard work, dedication and commitment throughout your lessons. It’s been a pleasure watching your skills and confidence grow behind the wheel.', '/assets/img/pass-2.jpg', 'center'),
  ('Priya', '2026-05-29', 'Big congratulations to Priya for passing her driving test! She really appreciated the patient teaching style and the confidence she built on the road. So proud of her hard work and success.', '/assets/img/pass-1.jpg', 'center'),
  ('Danush', '2026-04-02', 'At the beginning he was nervous and often scared behind the wheel, but he stayed committed and didn’t give up. Lesson by lesson he listened, improved and started making quicker, better decisions. A well‑deserved pass, and he should be proud of how far he’s come.', '/assets/img/pass-3.jpg', 'center');

insert into public.reviews (name, reviewed_on, quote) values
  ('Chloe', '2026-09-26', 'Zubair was very helpful on my driving lesson! I haven’t driven in a while nor in Australia so just wanted to build my confidence and Zubair definitely helped with this. Thank you!'),
  ('Elisabetta', '2026-09-19', 'Very easy to work with and very understanding of skill and confidence level.'),
  ('Alex', '2026-09-12', 'Had my first lesson with Zubair today and I can’t recommend him enough. His instructions were clear, his advice was easy to understand and I already feel much more confident on the road. I highly recommend Zubair for learner drivers of any skill range that are looking for a patient and supportive instructor.');

insert into public.areas (name, sort_order) values
  ('Sunshine', 1), ('Werribee', 2), ('Melton', 3), ('Coolaroo', 4), ('Melbourne', 5), ('Derrimut', 6), ('Deer Park', 7);

insert into public.prices (name, duration, price, unit, note, features, featured, sort_order) values
  ('Single lesson', 60, 70, '/ lesson', 'Pay as you go', array['60‑minute one‑on‑one lesson', 'Paced to your confidence level', 'English, Hindi, Urdu or Telugu'], false, 1),
  ('5‑lesson pack', 60, 340, '/ 5 lessons', 'Save $10', array['5 × 60‑minute lessons', 'A structured plan for your goals', 'Build skills lesson by lesson'], false, 2),
  ('10‑lesson pack', 60, 670, '/ 10 lessons', 'Save $30', array['10 × 60‑minute lessons', 'From the basics to test ready', 'Our biggest saving'], true, 3),
  ('Lesson + test', 60, 210, '/ package', 'Warm‑up lesson + test day', array['60‑minute pre‑test warm‑up', 'Use of the Safe‑Gen car for your test', 'Calm and confident on the day'], false, 4),
  ('Single lesson', 90, 100, '/ lesson', 'Pay as you go', array['90‑minute one‑on‑one lesson', 'More time to practise and repeat', 'English, Hindi, Urdu or Telugu'], false, 5),
  ('Lesson + test', 90, 240, '/ package', 'Longer warm‑up + test day', array['90‑minute pre‑test warm‑up', 'Use of the Safe‑Gen car for your test', 'Calm and confident on the day'], false, 6);
