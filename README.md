# Safe-Gen Driving Academy — website

Static multi-page site built from the Stitch mockup in `design-reference/` (the original `code.html`, `DESIGN.md` and `screen.png`).

## Commands

```bash
npm install       # once
npm run dev       # build + watch + preview at http://localhost:5173
npm run build     # production output in dist/
```

Deploy by uploading `dist/` to any static host (Netlify, Vercel, Cloudflare Pages, cPanel, S3…).

## Structure

```
src/
  pages/        one file per page; starts with <!--meta {"title","description","nav"} -->
  partials/     layout, header, footer, cta-banner, postcode-checker
  assets/       main.js (all interactivity), styles.css (Tailwind entry)
  data/         suburbs.json — service-area suburbs (drives lists, checker & autocomplete)
build.mjs       zero-dependency page assembler (+ sitemap.xml)
serve.mjs       local preview server
tailwind.config.js  design tokens from the mockup
```

Page directives: `<!--include name-->` inserts `src/partials/name.html`; `<!--suburbs:east-->` renders a region's suburb list; `{{suburbCount}}` / `{{year}}` are replaced at build time.

Package names and prices used by the booking form and homepage navigator live in `PACKAGES` at the top of `src/assets/main.js`. Page copy has prices in HTML too, so update both.

## Before launch — TODO

- [ ] **Booking backend**: set `data-endpoint` on the form in `src/pages/book.html` (e.g. a Formspree URL). Until then, submitting opens the visitor's SMS app pre-filled to 0470 452 803.
- [ ] **Domain**: update `SITE_URL` in `build.mjs` and the sitemap line in `src/robots.txt`.
- [ ] **Images**: the hero and instructor photos are hot-linked from the Stitch export (`lh3.googleusercontent.com`). Those URLs can expire, so replace them with real photos saved in `src/assets/img/`.
- [ ] **Claims & reviews**: pass rates, review counts, "5,000+ drivers" and all testimonials are mockup copy. Replace them with real, verifiable figures and genuine reviews. Australian Consumer Law prohibits fake testimonials and misleading claims.
- [ ] **Instructors**: names, bios, languages and availability are placeholders.
- [ ] **Prices**: confirm the specialist prices ($85 manual, $110 90-min, $260 test day, $150 overseas) that were added beyond the mockup.
- [ ] **Policies**: `policies.html` is a starting template and needs a review by the owner or a legal adviser.
- [ ] **Links**: social links in the footer and the "Read all reviews on Google" button are `#`.
- [ ] **Logo**: the "SG" text mark and `favicon.svg` stand in for the real shield logo.
