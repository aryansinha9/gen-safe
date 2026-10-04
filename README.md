# Safe Gen Driving School — website

Multi-page static site built from the Claude Design export in `design-reference/Safe Gen Driving.dc.html`.
Pages use clean URLs (`/`, `/about`, `/lessons`, `/prices`, `/contact`, `/admin`) via `cleanUrls` in `vercel.json`.
Plain static HTML/CSS/JS — no build step.

```
public/
  index.html            home: hero, meet Zubair, why Safe-Gen, reviews, recent passes
  about.html            Zubair's story + learner journey
  lessons.html          lesson types + learner journey
  prices.html           prices & packages (from Supabase)
  contact.html          enquiry form (Web3Forms) + areas we service
  assets/nocturne.css   "Nocturne" design-system stylesheet from the export
  assets/site.css       page rules, hover states, animations, phone-width fixes
  assets/site.js        contact links, marquee, lessons, prices 60/90 toggle, reviews carousel, passes, suburb check
  assets/templates.js   card templates shared by the site and the admin preview
  assets/config.js      Supabase URL + anon key (editable content and /admin login)
  admin/                admin dashboard (see ADMIN.md)
  assets/logo.png       Safe-Gen logo
  assets/img/           drop photos here (see below)
```

Preview locally (clean URLs, like Vercel): `npx serve public -l 5175` → http://localhost:5175

The header and footer are repeated in each page; update all five when changing the menu.

Deploys on Vercel as a static site (`vercel.json` → output directory `public`).

## Content

All copy is real Safe-Gen information (About Zubair, reviews, Facebook pass posts, contact details, service areas).
Prices, reviews, recent passes and service areas are edited at `/admin` (stored in Supabase, see [ADMIN.md](ADMIN.md)).
`DEFAULTS` in `assets/site.js` is the built-in copy shown if Supabase isn't configured or can't be reached.

## Enquiry form

Every "Book" button opens `/contact` with that lesson or package pre-selected.
Submissions go through [Web3Forms](https://web3forms.com) to the email linked to the access key
(the key is public by design, in `contact.html`). The phone number stays as the only other contact method.

## Photos

| File | Where |
| --- | --- |
| `public/assets/img/pass-1.jpg` | Hero + Recent passes (Priya) |
| `public/assets/img/pass-2.jpg` | Recent passes (Vijay) |
| `public/assets/img/pass-3.jpg` | Recent passes (Danush) |

Photos uploaded through `/admin` are stored in Supabase Storage.
