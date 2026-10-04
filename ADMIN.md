# Admin dashboard (`/admin`)

The admin can sign in at **`https://<site-domain>/admin`** and add, edit, delete and reorder:

| Tab | Site section | What can be edited |
| --- | --- | --- |
| Recent passes | Recent passes | Photo (upload), photo framing, student name, date, congratulations message |
| Reviews | Student reviews | Name, date posted, review text |
| Prices | Prices & packages | Name, 60/90 min, price, price label, highlight line, included points, “highlight” badge, order |
| Areas | Areas we service | Suburb names, order (also used by “Check your suburb”) |

Every editor shows a **live preview built from the same template the site uses** (`public/assets/templates.js`),
so edited content always matches the site’s design. Editors fill in fields; they can’t change layout or styling.

## How it works

- **Supabase** stores the content (tables `passes`, `reviews`, `prices`, `areas`) and photos (storage bucket `site-images`).
- The public site reads that content on load (`public/assets/site.js`). If Supabase isn’t configured or can’t be reached,
  it shows the built-in copy of the same content, so the site never breaks.
- **Security**
  - Sign-in uses Supabase Auth (email + password). Public sign-ups are turned off.
  - Row Level Security: anyone can *read* content; only users listed in `public.admins` can add, change or delete it,
    or upload photos. A signed-in user who isn’t an admin is refused by the database, not just the page.
  - The database rejects unsafe values (e.g. photo links that aren’t `http(s)`), and the site escapes all text.
  - `/admin` is `noindex`, can’t be framed, and has a strict Content-Security-Policy.
- Photos are resized in the browser (max 1600px, JPEG) before upload, so the site stays fast. Replaced or deleted
  photos are removed from storage.

## One-time production setup

1. **Create a Supabase project** at <https://supabase.com> (the free plan is enough). Pick the Sydney region.
2. **Create the tables, security rules, photo bucket and starting content.** Either:
   - Dashboard → **SQL Editor** → paste and run `supabase/migrations/20261004000000_site_content.sql`,
     then `supabase/migrations/20261004000100_grants.sql`, or
   - CLI: `supabase link --project-ref <ref>` then `supabase db push`.
3. **Turn off public sign-ups:** Authentication → Sign In / Providers → turn off **Allow new users to sign up**.
   (Leave the **Email** provider enabled.)
4. **Create the admin login:** Authentication → Users → **Add user** → email + password, tick **Auto Confirm User**.
5. **Make that user an admin:** SQL Editor →
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'ADMIN_EMAIL_HERE';
   ```
6. **Connect the site:** Project Settings → API → copy the **Project URL** and the **anon / publishable key** into
   `PRODUCTION` in `public/assets/config.js`. (This key is safe to publish; the security rules above protect writes.)
7. Commit and deploy. Sign in at `/admin`.

To add another admin later, repeat steps 4–5. To remove one: `delete from public.admins where user_id = '…';`

If you use a custom domain for Supabase (not `*.supabase.co`), add it to the Content-Security-Policy in
`public/admin/index.html` (`img-src` and `connect-src`).

## Local development

Requires Docker and the Supabase CLI.

```bash
supabase start
```

On `localhost`, `config.js` points at the local Supabase automatically. Create a local admin with
`supabase/create-local-admin.sh` (writes the test login to the git-ignored `.env.local`), then open
<http://localhost:5175/admin/>. `supabase db reset` restores the starting content (then re-run the script).
