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

## Photos

The design leaves the photo spaces empty. Add these files and they appear automatically (until then the design's placeholder shows):

| File | Where |
| --- | --- |
| `public/assets/img/hero.jpg` | Hero — Safe Gen i30 on a Melbourne road at dusk |
| `public/assets/img/why.jpg` | Why Safe Gen — instructor coaching from the passenger seat |
| `public/assets/img/instructor-1.jpg` … `instructor-3.jpg` | Instructor portraits |

## Before launch

- Instructor names are "Instructor name" placeholders (edit `TEAM` in `assets/site.js`).
- Prices are marked "Concept pricing" in the design (edit `packages` in `renderPackages`).
- Reviews and the 4.9★ rating are design copy — replace with genuine reviews.
- Quick-book "Reserve" opens an SMS to 0470 452 803 pre-filled with the chosen time.
