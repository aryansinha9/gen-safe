# Safe Gen Driving School — website

Single-page site built from the Claude Design export in `design-reference/Safe Gen Driving.dc.html`.
Plain static HTML/CSS/JS — no build step.

```
public/
  index.html            page markup (inline styles copied from the design)
  assets/nocturne.css   "Nocturne" design-system stylesheet from the export
  assets/site.css       page rules, hover states, animations, phone-width fixes
  assets/site.js        quick-book slots, marquee, packages 60/90 toggle, instructors, reviews carousel, suburb check
  assets/logo.png       Safe-Gen logo
  assets/img/           drop photos here (see below)
```

Preview locally: `python3 -m http.server 5175 --directory public` → http://localhost:5175

Deploys on Vercel as a static site (`vercel.json` → output directory `public`).

## Content

All copy is real Safe-Gen information (About Zubair, reviews, Facebook pass posts, contact details, service areas).
Editable lists live in `assets/site.js`: `LESSONS`, `REVIEWS`, `STORIES` (pass posts) and `AREAS`.

## Photos

| File | Where |
| --- | --- |
| `public/assets/img/pass-1.jpg` | Hero + Recent passes (Priya) |
| `public/assets/img/pass-2.jpg` | Recent passes (Vijay) |
| `public/assets/img/pass-3.jpg` | Recent passes (Danush) |

No prices are published — the site asks visitors to call/text/WhatsApp for prices and availability.
