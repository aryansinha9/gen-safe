// Safe-Gen shared client script. Each feature initialises only if its markup is on the page.
(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

  // Single source of truth for package names/prices used by the navigator and booking form.
  const PACKAGES = {
    'single-60': { name: 'Starter Drive — 60 min lesson', price: 75 },
    'extended-90': { name: 'Extended 90 min lesson', price: 110 },
    'confident-7': { name: 'Confident Driver Pack — 7 lessons', price: 490 },
    'assurance-10': { name: 'Test Day Pass Assurance — 10 lessons + test', price: 795 },
    'test-day': { name: 'Test Day Car Hire & 60 min Warm-up', price: 260 },
    'overseas-2': { name: 'Overseas Conversion Refresher — 2 lessons', price: 150 },
    'manual-60': { name: 'Manual transmission lesson — 60 min', price: 85 },
  };
  const FIRST_LESSON_DISCOUNT = 0.15;
  const PHONE = '0470452803';

  /* ---------- Mobile menu ---------- */
  const toggle = $('[data-menu-toggle]');
  const drawer = $('#mobile-nav');
  if (toggle && drawer) {
    toggle.addEventListener('click', () => {
      const open = drawer.classList.toggle('hidden') === false;
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      $('[data-menu-icon]', toggle).textContent = open ? 'close' : 'menu';
    });
    drawer.addEventListener('click', (e) => { if (e.target.closest('a')) toggle.click(); });
  }

  /* ---------- Training trajectory navigator (home) ---------- */
  const STAGES = {
    'first-time': {
      badge: 'Beginner Track', badgeClass: 'bg-primary-container',
      timeline: 'Recommended: 6 – 10 guided sessions',
      title: 'Zero Experience? Build Foundation Reflexes in Dual-Control Safety',
      desc: 'Master cockpit ergonomics, blind-spot checks, smooth acceleration, gentle threshold braking and 3-point turns in low-density suburban streets before advancing to complex intersections.',
      pkg: 'confident-7', note: 'Includes 21 credited logbook hours + a VicRoads-style mock test', progress: '35%',
      skills: ['Cockpit drill & mirror alignment', 'Pedal sensitivity & brake control', 'Quiet residential intersection priority', 'Emergency dual-pedal safety net'],
    },
    'logbook-booster': {
      badge: 'Logbook Accelerator', badgeClass: 'bg-secondary-container',
      timeline: 'Fast-track: 10 instructed hours = 30 logbook credits',
      title: 'Supercharge Your 120 Logbook Hours (3-for-1 Victorian Ratio)',
      desc: 'Each hour with a professional instructor counts as three logbook hours, up to 10 lessons. Ten coaching sessions add 30 hours to your learner logbook and cut down your supervised driving burden.',
      pkg: 'assurance-10', note: 'Maximum 30 credited logbook hours + test day car hire', progress: '65%',
      skills: ['3-for-1 official hours multiplier', 'Night driving practice (20 hrs required)', 'Wet weather & braking distance control', 'Freeway speed-matching & merging'],
    },
    'test-prep': {
      badge: 'VicRoads Test Prep', badgeClass: 'bg-tertiary-container',
      timeline: 'Intensive: 2 – 4 sessions + test day hire',
      title: 'Ace the Official VicRoads Drive Test on Attempt #1',
      desc: 'Rehearse around real VicRoads test centres (Carlton, Burwood East, Heatherton, Mooroolbark). Practise speed zones, school precincts, kerbside stops and reverse parallel parking under realistic scoring conditions.',
      pkg: 'test-day', note: 'Our dual-control car for your test + a 60 min warm-up right before', progress: '92%',
      skills: ['Practice on roads around your test centre', 'Critical-error risk elimination', 'Pre-test 60 min nerve-calming warm-up', 'Dual-control test vehicle presentation'],
    },
    'overseas-conversion': {
      badge: 'Licence Conversion', badgeClass: 'bg-secondary-container',
      timeline: 'Fast-track: 1 – 3 sessions',
      title: 'Convert Your Overseas Licence to a Victorian Licence',
      desc: 'Align your existing road experience with Victorian road rules. Target Melbourne-specific complexities like trams, hook turns, pedestrian right-of-way and roundabout rules.',
      pkg: 'overseas-2', note: 'Two 60 min lessons focused on Victorian-specific rules', progress: '80%',
      skills: ['Melbourne CBD hook turn technique', 'Tram safety zones & passing laws', 'Give-way & roundabout mastery', 'Licence conversion paperwork guidance'],
    },
  };
  const stageBtns = $$('[data-stage]');
  if (stageBtns.length) {
    const setText = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    const select = (key) => {
      const d = STAGES[key];
      stageBtns.forEach((btn) => {
        const on = btn.dataset.stage === key;
        btn.setAttribute('aria-selected', String(on));
        btn.classList.toggle('bg-surface-container-high', on);
        btn.classList.toggle('bg-surface-container-low', !on);
        const dot = btn.querySelector(':scope > span:last-child');
        dot.classList.toggle('bg-primary-container', on);
        dot.classList.toggle('bg-surface-variant', !on);
      });
      const badge = document.getElementById('stage-badge');
      badge.className = badge.className.replace(/\bbg-[\w-]+-container\b/g, '').trim() + ' ' + d.badgeClass;
      setText('stage-badge', d.badge);
      setText('stage-timeline', d.timeline);
      setText('stage-title', d.title);
      setText('stage-desc', d.desc);
      setText('stage-price-tag', '$' + PACKAGES[d.pkg].price);
      setText('stage-package-name', PACKAGES[d.pkg].name);
      setText('stage-package-note', d.note);
      document.getElementById('stage-progress').style.width = d.progress;
      document.getElementById('stage-cta').href = '/book.html?package=' + d.pkg;
      document.getElementById('stage-skills').innerHTML = d.skills
        .map((s) => `<div class="flex items-center gap-space-xs text-on-surface"><span class="material-symbols-outlined text-secondary text-lg">check_circle</span><span class="font-title-md text-body-md">${esc(s)}</span></div>`)
        .join('');
    };
    stageBtns.forEach((btn) => btn.addEventListener('click', () => select(btn.dataset.stage)));
    select('first-time');
  }

  /* ---------- Suburb data (postcode checker + booking suggestions) ---------- */
  let suburbsPromise;
  const loadSuburbs = () => (suburbsPromise ||= fetch('/assets/suburbs.json').then((r) => r.json()).then((data) => {
    const all = data.regions.flatMap((r) => r.suburbs.map(([name, pc]) => ({ name, pc, region: r.label })));
    $$('#suburb-list').forEach((dl) => { dl.innerHTML = all.map((s) => `<option value="${esc(s.name)}">${s.pc}</option>`).join(''); });
    return all;
  }).catch(() => []));
  if ($('#suburb-list')) loadSuburbs();

  /* ---------- Postcode / suburb coverage checker ---------- */
  const postcodeForms = $$('[data-postcode-form]');
  if (postcodeForms.length) {
    const render = (box, ok, title, sub) => {
      box.innerHTML = `<span class="material-symbols-outlined ${ok === true ? 'text-secondary' : ok === 'maybe' ? 'text-tertiary' : 'text-primary'} text-xl">${ok === true ? 'check_circle' : ok === 'maybe' ? 'help' : 'info'}</span><div class="flex flex-col"><span class="font-title-md text-label-lg text-on-surface">${title}</span><span class="text-xs ${ok === true ? 'text-secondary' : 'text-on-surface-variant'}">${sub}</span></div>`;
    };

    postcodeForms.forEach((form) => {
      const box = $('[data-postcode-feedback]', form);
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const q = form.elements.q.value.trim();
        if (!q) return render(box, false, 'Please enter a suburb or postcode', 'We serve greater Melbourne’s inner, eastern, southern and south-eastern suburbs.');
        const all = await loadSuburbs();
        const norm = q.toLowerCase().replace(/\s+/g, ' ');
        const hit = /^\d{4}$/.test(norm) ? all.find((s) => s.pc === norm) : all.find((s) => s.name.toLowerCase() === norm);
        if (hit) {
          return render(box, true, `${esc(hit.name)} ${hit.pc} is fully covered!`, `${esc(hit.region)} zone — free home pickup &amp; dual-control slots available.`);
        }
        const partial = !/^\d+$/.test(norm) && all.filter((s) => s.name.toLowerCase().startsWith(norm));
        if (partial && partial.length) {
          return render(box, 'maybe', `Did you mean ${partial.slice(0, 3).map((s) => esc(s.name)).join(', ')}?`, 'Pick your suburb from the suggestions and verify again.');
        }
        if (/^3\d{3}$/.test(norm)) {
          return render(box, 'maybe', `${esc(norm)} is outside our standard zones`, `Call <a class="underline text-on-surface" href="tel:${PHONE}">0470 452 803</a> — we can often still pick you up for a small travel fee.`);
        }
        return render(box, false, `We couldn’t find “${esc(q)}”`, 'Try a Victorian postcode (e.g. 3128) or your suburb name.');
      });
    });
  }

  /* ---------- Logbook hours calculator (lessons page) ---------- */
  const calc = $('[data-logbook-calc]');
  if (calc) {
    const TOTAL = 120, NIGHT = 20, MAX_LESSONS = 10, MULTIPLIER = 3;
    const out = (k) => $(`[data-out="${k}"]`, calc);
    const update = () => {
      const num = (n) => Math.max(0, Number(calc.elements[n].value) || 0);
      const day = num('day');
      const night = num('night');
      const lessons = Math.min(MAX_LESSONS, num('lessons'));
      const credit = lessons * MULTIPLIER;
      const logged = day + night + credit;
      const remaining = Math.max(0, TOTAL - logged);
      const nightRemaining = Math.max(0, NIGHT - night);
      out('lessons').textContent = lessons;
      out('credit').textContent = credit;
      out('logged').textContent = Math.min(TOTAL, logged);
      out('remaining').textContent = remaining;
      out('night-remaining').textContent = nightRemaining;
      out('bar').style.width = Math.min(100, (logged / TOTAL) * 100) + '%';
      out('night-bar').style.width = Math.min(100, (night / NIGHT) * 100) + '%';
      out('verdict').textContent = remaining === 0 && nightRemaining === 0
        ? 'Logbook complete — you’re ready to book your test prep.'
        : `${remaining} hrs to go${nightRemaining ? `, including ${nightRemaining} night hrs` : ''}. ${lessons < MAX_LESSONS ? `${MAX_LESSONS - lessons} more professional lessons would credit ${(MAX_LESSONS - lessons) * MULTIPLIER} hrs.` : 'You’ve maxed out lesson credits.'}`;
    };
    calc.addEventListener('input', update);
    update();
  }

  /* ---------- List filters (instructors, reviews) ---------- */
  $$('[data-filter-group]').forEach((group) => {
    const items = $$(`[data-filter-item="${group.dataset.filterGroup}"]`);
    const btns = $$('[data-filter]', group);
    const empty = $(`[data-filter-empty="${group.dataset.filterGroup}"]`);
    btns.forEach((btn) => btn.addEventListener('click', () => {
      const f = btn.dataset.filter;
      btns.forEach((b) => {
        const on = b === btn;
        b.setAttribute('aria-pressed', String(on));
        b.classList.toggle('bg-primary-container', on);
        b.classList.toggle('text-on-primary-container', on);
        b.classList.toggle('bg-surface-container-high', !on);
      });
      let shown = 0;
      items.forEach((el) => {
        const match = f === 'all' || el.dataset.tags.split(' ').includes(f);
        el.hidden = !match;
        if (match) shown++;
      });
      if (empty) empty.hidden = shown > 0;
    }));
  });

  /* ---------- Booking form ---------- */
  const booking = $('[data-booking-form]');
  if (booking) {
    const params = new URLSearchParams(location.search);
    const pre = params.get('package');
    if (pre && PACKAGES[pre]) {
      const radio = booking.querySelector(`input[name="package"][value="${pre}"]`);
      if (radio) radio.checked = true;
    }
    if (params.get('offer') === 'first15') booking.elements.firstLesson.checked = true;
    const instructor = params.get('instructor');
    if (instructor && booking.elements.instructor) booking.elements.instructor.value = instructor;

    // Earliest selectable date = tomorrow
    const date = booking.elements.date;
    const t = new Date(Date.now() + 864e5);
    date.min = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;

    const summary = $('[data-booking-summary]');
    const updateSummary = () => {
      const key = booking.elements.package.value;
      const p = PACKAGES[key];
      if (!p) { summary.innerHTML = '<span class="text-outline">Select a package to see your total.</span>'; return; }
      const discount = booking.elements.firstLesson.checked && ['single-60', 'extended-90', 'manual-60'].includes(key)
        ? Math.round(p.price * FIRST_LESSON_DISCOUNT * 100) / 100 : 0;
      const total = (p.price - discount).toFixed(2).replace(/\.00$/, '');
      summary.innerHTML = `<div class="flex justify-between gap-space-sm"><span>${esc(p.name)}</span><span class="text-on-surface">$${p.price}</span></div>` +
        (discount ? `<div class="flex justify-between gap-space-sm text-secondary"><span>First-lesson saving (15%)</span><span>−$${discount}</span></div>` : '') +
        (booking.elements.firstLesson.checked && !discount ? '<div class="text-tertiary text-xs">The 15% first-lesson saving applies to single lessons only.</div>' : '') +
        `<div class="flex justify-between gap-space-sm pt-space-xs mt-space-xs border-t border-white/10 font-headline-sm text-title-lg text-on-surface"><span>Total</span><span>$${total}</span></div>`;
    };
    booking.addEventListener('change', updateSummary);
    updateSummary();

    const status = $('[data-booking-status]');
    booking.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!booking.checkValidity()) { booking.reportValidity(); return; }
      const fd = new FormData(booking);
      const p = PACKAGES[fd.get('package')];
      const lines = [
        `Booking request — ${p.name} ($${p.price})`,
        `Name: ${fd.get('name')}`, `Phone: ${fd.get('phone')}`, fd.get('email') && `Email: ${fd.get('email')}`,
        `Licence stage: ${fd.get('stage')}`, `Transmission: ${fd.get('transmission')}`,
        `Pickup suburb: ${fd.get('suburb')}`, `Preferred date: ${fd.get('date')} (${fd.get('time')})`,
        fd.get('instructor') && fd.get('instructor') !== 'any' && `Instructor: ${fd.get('instructor')}`,
        fd.get('firstLesson') && 'First lesson — 15% saving', fd.get('notes') && `Notes: ${fd.get('notes')}`,
      ].filter(Boolean);

      // If a form endpoint is configured (e.g. Formspree / Netlify / your CRM), POST to it.
      const endpoint = booking.dataset.endpoint;
      const btn = $('button[type="submit"]', booking);
      btn.disabled = true;
      try {
        if (endpoint) {
          const res = await fetch(endpoint, { method: 'POST', body: fd, headers: { Accept: 'application/json' } });
          if (!res.ok) throw new Error(String(res.status));
          status.innerHTML = `<span class="material-symbols-outlined text-secondary text-2xl">check_circle</span><div><p class="font-title-md text-title-md text-on-surface">Request received, ${esc(fd.get('name').split(' ')[0])}!</p><p class="text-on-surface-variant">We'll confirm your slot by SMS within business hours.</p></div>`;
          booking.reset(); updateSummary();
        } else {
          // Fallback: open the phone's SMS app pre-filled to the instructor line.
          const body = encodeURIComponent(lines.join('\n'));
          status.innerHTML = `<span class="material-symbols-outlined text-secondary text-2xl">sms</span><div><p class="font-title-md text-title-md text-on-surface">Almost done — send your request by SMS</p><p class="text-on-surface-variant">Your messages app should open with the details filled in. If it didn't, <a class="underline text-on-surface" href="sms:${PHONE}?&body=${body}">tap here</a> or call <a class="underline text-on-surface" href="tel:${PHONE}">0470 452 803</a>.</p></div>`;
          location.href = `sms:${PHONE}?&body=${body}`;
        }
      } catch {
        status.innerHTML = `<span class="material-symbols-outlined text-primary text-2xl">error</span><div><p class="font-title-md text-title-md text-on-surface">Something went wrong sending your request</p><p class="text-on-surface-variant">Please call <a class="underline text-on-surface" href="tel:${PHONE}">0470 452 803</a> and we'll book you in directly.</p></div>`;
      } finally {
        status.hidden = false;
        status.scrollIntoView({ behavior: 'smooth', block: 'center' });
        btn.disabled = false;
      }
    });
  }

  /* ---------- FAQ: only one <details> open at a time within a group ---------- */
  $$('[data-accordion]').forEach((group) => {
    $$('details', group).forEach((d) => d.addEventListener('toggle', () => {
      if (d.open) $$('details', group).forEach((o) => { if (o !== d) o.open = false; });
    }));
  });
})();
