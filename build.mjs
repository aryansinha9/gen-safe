// Zero-dependency static page assembler.
// Each src/pages/*.html starts with `<!--meta {json} -->` and is wrapped in src/partials/layout.html.
// Usage: node build.mjs [--watch]
import { readFileSync, writeFileSync, mkdirSync, readdirSync, cpSync, watch } from 'node:fs';
import { join } from 'node:path';

const SRC = 'src';
const OUT = 'dist';
const SITE_URL = 'https://www.safegendriving.com.au'; // TODO: set to the real domain before launch

const read = (p) => readFileSync(join(SRC, p), 'utf8');
const suburbs = JSON.parse(read('data/suburbs.json'));
const suburbCount = suburbs.regions.reduce((n, r) => n + r.suburbs.length, 0);

// `<!--suburbs:region-id-->` renders that region's suburb chips as static HTML (crawlable)
const renderSuburbs = (id) => {
  const region = suburbs.regions.find((r) => r.id === id);
  if (!region) throw new Error(`unknown suburb region "${id}"`);
  return region.suburbs
    .map(([name, pc]) => `<li class="px-space-sm py-1 rounded-lg bg-surface-container-low text-on-surface-variant font-label-lg text-label-lg">${name} <span class="text-outline font-label-sm text-label-sm">${pc}</span></li>`)
    .join('');
};

function renderPage(file) {
  const raw = read(join('pages', file));
  const match = raw.match(/^<!--meta\s+([\s\S]*?)-->\s*/);
  if (!match) throw new Error(`${file}: missing <!--meta {...} --> header`);
  const meta = JSON.parse(match[1]);
  // `<!--include name-->` pulls in src/partials/name.html
  const content = raw.slice(match[0].length).replace(/<!--include ([\w-]+)-->/g, (_, name) => read(`partials/${name}.html`))
    .replace(/<!--suburbs:([\w-]+)-->/g, (_, id) => renderSuburbs(id));

  // Mark the active nav item(s) for this page
  const header = read('partials/header.html').replace(
    new RegExp(`data-nav="${meta.nav}"`, 'g'),
    `data-nav="${meta.nav}" aria-current="page"`,
  );
  const path = file === 'index.html' ? '/' : `/${file}`;
  const vars = {
    title: meta.title,
    description: meta.description,
    canonical: SITE_URL + path,
    header,
    footer: read('partials/footer.html'),
    content,
    year: String(new Date().getFullYear()),
    suburbCount: String(suburbCount),
  };
  return read('partials/layout.html').replace(/\{\{(\w+)\}\}/g, (_, k) => {
    if (!(k in vars)) throw new Error(`${file}: unknown placeholder {{${k}}}`);
    return vars[k];
  }).replace(/\{\{(year|suburbCount)\}\}/g, (_, k) => vars[k]);
}

function build() {
  const started = Date.now();
  mkdirSync(join(OUT, 'assets'), { recursive: true });
  const pages = readdirSync(join(SRC, 'pages')).filter((f) => f.endsWith('.html'));
  for (const file of pages) writeFileSync(join(OUT, file), renderPage(file));
  cpSync(join(SRC, 'assets'), join(OUT, 'assets'), {
    recursive: true,
    filter: (p) => !p.endsWith('styles.css'), // compiled separately by Tailwind
  });
  cpSync(join(SRC, 'data/suburbs.json'), join(OUT, 'assets/suburbs.json'));
  for (const f of ['robots.txt', 'favicon.svg']) cpSync(join(SRC, f), join(OUT, f));
  writeFileSync(
    join(OUT, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      pages.filter((f) => f !== '404.html')
        .map((f) => `  <url><loc>${SITE_URL}${f === 'index.html' ? '/' : '/' + f}</loc></url>`)
        .join('\n') + `\n</urlset>\n`,
  );
  console.log(`built ${pages.length} pages in ${Date.now() - started}ms`);
}

build();

if (process.argv.includes('--watch')) {
  let timer;
  watch(SRC, { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      try { build(); } catch (e) { console.error(e.message); }
    }, 50);
  });
}
