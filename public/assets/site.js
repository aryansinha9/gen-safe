// Safe-Gen Driving: page interactivity. Prices, reviews, passes, recent lessons and areas load from Supabase (edited at /admin).
(() => {
  // Old one-page links (/#prices etc.) now live on their own pages.
  const MOVED = { '#about': '/about', '#lessons': '/lessons', '#journey': '/lessons', '#prices': '/prices', '#contact': '/contact', '#book': '/contact', '#areas': '/contact' };
  if (location.pathname === '/' && MOVED[location.hash]) { location.replace(MOVED[location.hash]); return; }

  const { el, esc, CHECK, packageLabel, reviewDate, initial, fillSlot, priceCard, passCard, lessonCard, areaPill } = window.SafeGen;
  const $ = (q, r = document) => r.querySelector(q);
  const state = { testi: 0, dur: 60 };

  document.querySelectorAll('.sg-slot').forEach(fillSlot);

  /* ---------- Marquee wordmark ---------- */
  const marquee = $('[data-marquee]');
  const run = () => {
    const wrap = el('div', 'display:flex;gap:40px;padding-right:40px;align-items:center;flex:none');
    ['SAFE-GEN', 'DRIVING SCHOOL', 'SAFE-GEN', 'LEARN · PASS · DRIVE'].forEach((w, i) => {
      const even = i % 2 === 0;
      const s = el('span', `display:flex;align-items:center;gap:40px;white-space:nowrap;font:${even ? 'italic 900' : 'italic 700'} 64px/1 'Saira',sans-serif;letter-spacing:-0.03em;color:${even ? '#f3f5fe' : 'transparent'};-webkit-text-stroke:${even ? '0' : '1px #595d6c'}`);
      if (even) {
        s.append(el('span', null, 'SAFE-'), el('span', 'color:#ff4a4f;margin-left:-40px', 'GEN'));
      } else {
        s.append(document.createTextNode(w));
      }
      s.append(el('span', `width:18px;height:18px;border-radius:4px;background:${['#F4C21B', '#1F7A3F', '#E3262B', '#F4C21B'][i]};display:inline-block`));
      wrap.append(s);
    });
    return wrap;
  };
  if (marquee) marquee.append(run(), run());

  /* ---------- Lessons ---------- */
  const LESSONS = [
    { name: 'Learner driver lessons', plate: '#F4C21B', ink: '#161826', letter: 'L', blurb: 'Brand new or still on your L’s? Start with the basics and build up at a pace that suits you.', items: ['Patient, one‑on‑one instruction', 'Clear, step‑by‑step explanations', 'Paced to your confidence level'] },
    { name: 'Test preparation', plate: '#E3262B', ink: '#f3f5fe', letter: 'P1', featured: true, blurb: 'Getting ready for your drive test? Focused practice on the skills you’ll be assessed on.', items: ['Practise test manoeuvres', 'Honest feedback on your readiness', 'Calm and confident on the day'] },
    { name: 'Confidence & refresher', plate: '#1F7A3F', ink: '#f3f5fe', letter: 'P', blurb: 'Licensed but out of practice, or new to driving in Australia? Rebuild your confidence on local roads.', items: ['Overseas & returning drivers', 'Local road rules and conditions', 'Go at your own pace'] },
  ];
  const enquireUrl = (interest) => `/contact?interest=${encodeURIComponent(interest)}`;
  const lessonBox = $('[data-lessons]');
  if (lessonBox) LESSONS.forEach((l) => {
    const f = !!l.featured;
    const card = el('div', `position:relative;padding:28px;border-radius:18px;background:${f ? 'linear-gradient(170deg,#2c1d25,#1d1e2c 60%)' : '#1b1d2b'};box-shadow:${f ? '0 0 0 1px #E3262B,0 30px 70px rgba(227,38,43,.16)' : '0 0 0 1px #292b31'};display:flex;flex-direction:column;gap:18px;transition:transform .3s`,
      `<div style="width:48px;height:48px;border-radius:12px;background:${l.plate};color:${l.ink};font:italic 900 ${l.letter.length > 1 ? 24 : 30}px/48px 'Saira',sans-serif;text-align:center">${l.letter}</div>
       <h3 style="margin:0;font:italic 800 24px/1.15 'Saira',sans-serif;letter-spacing:-.02em;color:#f3f5fe">${esc(l.name)}</h3>
       <p style="margin:0;font:400 15px/1.6 var(--font-body);color:#b2b6ca">${esc(l.blurb)}</p>
       <div style="height:1px;background:linear-gradient(90deg,#3f424d00,#3f424d 20%,#3f424d 80%,#3f424d00)"></div>
       <div style="display:flex;flex-direction:column;gap:10px;flex:1">
         ${l.items.map((it) => `<div style="display:flex;gap:10px;align-items:start;font:400 14px/1.45 var(--font-body);color:#cfd3e5">${CHECK}${esc(it)}</div>`).join('')}
       </div>
       <a href="${esc(enquireUrl(l.name))}" class="btn btn-block ${f ? 'btn-primary' : 'btn-secondary'}" style="padding:12px;font-size:14px;${f ? 'border-color:#E3262B;background:#E3262B;color:#f3f5fe' : ''}">Ask about this lesson</a>`);
    card.className = 'sg-package';
    lessonBox.appendChild(card);
  });

  /* ---------- Editable content: defaults (shown until / unless Supabase answers) ---------- */
  // Same shape as the Supabase tables edited from /admin (see supabase/migrations).
  const DEFAULTS = {
    reviews: [
      { name: 'Chloe', reviewed_on: '2026-09-26', quote: 'Zubair was very helpful on my driving lesson! I haven’t driven in a while nor in Australia so just wanted to build my confidence and Zubair definitely helped with this. Thank you!' },
      { name: 'Elisabetta', reviewed_on: '2026-09-19', quote: 'Very easy to work with and very understanding of skill and confidence level.' },
      { name: 'Alex', reviewed_on: '2026-09-12', quote: 'Had my first lesson with Zubair today and I can’t recommend him enough. His instructions were clear, his advice was easy to understand and I already feel much more confident on the road. I highly recommend Zubair for learner drivers of any skill range that are looking for a patient and supportive instructor.' },
    ],
    passes: [
      { name: 'Vijay', passed_on: '2026-07-30', photo_url: '/assets/img/pass-2.jpg', photo_focus: 'center', message: 'A fantastic achievement and a reflection of your hard work, dedication and commitment throughout your lessons. It’s been a pleasure watching your skills and confidence grow behind the wheel.' },
      { name: 'Priya', passed_on: '2026-05-29', photo_url: '/assets/img/pass-1.jpg', photo_focus: 'center', message: 'Big congratulations to Priya for passing her driving test! She really appreciated the patient teaching style and the confidence she built on the road. So proud of her hard work and success.' },
      { name: 'Danush', passed_on: '2026-04-02', photo_url: '/assets/img/pass-3.jpg', photo_focus: 'center', message: 'At the beginning he was nervous and often scared behind the wheel, but he stayed committed and didn’t give up. Lesson by lesson he listened, improved and started making quicker, better decisions. A well‑deserved pass, and he should be proud of how far he’s come.' },
    ],
    recent_lessons: [],
    areas: ['Sunshine', 'Werribee', 'Melton', 'Coolaroo', 'Melbourne', 'Derrimut', 'Deer Park'].map((name) => ({ name })),
    prices: [
      { name: 'Single lesson', duration: 60, price: 70, unit: '/ lesson', note: 'Pay as you go', features: ['60‑minute one‑on‑one lesson', 'Paced to your confidence level', 'English, Hindi, Urdu or Telugu'] },
      { name: '5‑lesson pack', duration: 60, price: 340, unit: '/ 5 lessons', note: 'Save $10', features: ['5 × 60‑minute lessons', 'A structured plan for your goals', 'Build skills lesson by lesson'] },
      { name: '10‑lesson pack', duration: 60, price: 670, unit: '/ 10 lessons', note: 'Save $30', featured: true, featured_label: 'Best value', features: ['10 × 60‑minute lessons', 'From the basics to test ready', 'Our biggest saving'] },
      { name: 'Lesson + test', duration: 60, price: 210, unit: '/ package', note: 'Warm‑up lesson + test day', features: ['60‑minute pre‑test warm‑up', 'Use of the Safe‑Gen car for your test', 'Calm and confident on the day'] },
      { name: 'Single lesson', duration: 90, price: 100, unit: '/ lesson', note: 'Pay as you go', features: ['90‑minute one‑on‑one lesson', 'More time to practise and repeat', 'English, Hindi, Urdu or Telugu'] },
      { name: 'Lesson + test', duration: 90, price: 240, unit: '/ package', note: 'Longer warm‑up + test day', features: ['90‑minute pre‑test warm‑up', 'Use of the Safe‑Gen car for your test', 'Calm and confident on the day'] },
    ],
  };

  const showSection = (id, on) => { const sec = $('#' + id); if (sec) sec.hidden = !on; };

  /* ---------- Prices + 60/90 min toggle ---------- */
  const durBox = $('[data-durations]');
  const priceBox = $('[data-prices]');
  const renderPrices = (prices) => {
    if (!priceBox) return;
    showSection('prices', prices.length > 0);
    const durs = [...new Set(prices.map((p) => Number(p.duration) || 60))].sort((a, b) => a - b);
    if (!durs.includes(state.dur)) state.dur = durs[0];
    priceBox.innerHTML = '';
    prices.filter((p) => (Number(p.duration) || 60) === state.dur).forEach((p) => priceBox.appendChild(priceCard(p)));
    durBox.innerHTML = '';
    durBox.hidden = durs.length < 2;
    durs.forEach((d) => {
      const on = state.dur === d;
      const b = el('button', `padding:10px 18px;border:0;border-radius:9px;background:${on ? '#3f424d' : 'transparent'};color:${on ? '#f3f5fe' : '#9397ab'};font:600 13px var(--font-body);cursor:pointer;transition:all .2s`, d + ' min');
      b.type = 'button';
      b.setAttribute('aria-pressed', String(on));
      b.addEventListener('click', () => { state.dur = d; renderPrices(prices); });
      durBox.appendChild(b);
    });
  };

  /* ---------- Reviews carousel ---------- */
  const dots = $('[data-review-dots]');
  let REVIEWS = [];
  const renderReview = () => {
    const r = REVIEWS[state.testi];
    if (!r) return;
    $('[data-review-quote]').textContent = r.quote;
    $('[data-review-initials]').textContent = initial(r.name);
    $('[data-review-name]').textContent = r.name;
    $('[data-review-meta]').textContent = reviewDate(r.reviewed_on);
    dots.innerHTML = '';
    REVIEWS.forEach((_, i) => {
      const on = i === state.testi;
      const d = el('button', `width:${on ? '28px' : '10px'};height:6px;border:0;padding:0;border-radius:3px;background:${on ? '#E3262B' : '#3f424d'};cursor:pointer;transition:all .3s`);
      d.type = 'button';
      d.setAttribute('aria-label', `Review ${i + 1}`);
      d.addEventListener('click', () => { state.testi = i; renderReview(); });
      dots.appendChild(d);
    });
  };
  const step = (n) => { if (REVIEWS.length) { state.testi = (state.testi + n + REVIEWS.length) % REVIEWS.length; renderReview(); } };
  if (dots) {
    $('[data-review-prev]').addEventListener('click', () => step(-1));
    $('[data-review-next]').addEventListener('click', () => step(1));
    setInterval(() => step(1), 9000);
  }
  const renderReviews = (reviews) => {
    if (!dots) return;
    REVIEWS = reviews;
    state.testi = 0;
    showSection('reviews', reviews.length > 0);
    $('[data-review-prev]').hidden = $('[data-review-next]').hidden = reviews.length < 2;
    renderReview();
  };

  /* ---------- Recent passes ---------- */
  const storyBox = $('[data-stories]');
  const renderPasses = (passes) => {
    if (!storyBox) return;
    showSection('passes', passes.length > 0);
    storyBox.innerHTML = '';
    passes.forEach((t) => storyBox.appendChild(passCard(t)));
  };

  /* ---------- Recent lessons ---------- */
  const recentBox = $('[data-recent-lessons]');
  const renderRecentLessons = (rows) => {
    if (!recentBox) return;
    showSection('recent-lessons', rows.length > 0);
    recentBox.innerHTML = '';
    rows.forEach((t) => recentBox.appendChild(lessonCard(t)));
  };

  /* ---------- Areas + suburb check ---------- */
  let AREAS = [];
  const input = $('[data-suburb]');
  const msg = $('[data-suburb-msg]');
  const areaBox = $('[data-areas]');
  const renderAreas = () => {
    if (!areaBox) return;
    const q = input.value.trim().toLowerCase();
    const hit = AREAS.find((a) => a.toLowerCase() === q) || (q.length > 2 && AREAS.find((a) => a.toLowerCase().startsWith(q)));
    msg.textContent = !q ? '' : hit ? '✓ Yes, we teach in ' + hit + '.' : 'Not on our list yet. Call 0470 452 803 or send an enquiry and we’ll let you know.';
    msg.style.color = hit ? '#7fe0a3' : '#b2b6ca';
    areaBox.innerHTML = '';
    AREAS.forEach((n) => {
      const b = areaPill(n, hit === n);
      b.addEventListener('click', () => { input.value = n; renderAreas(); });
      areaBox.appendChild(b);
    });
  };
  if (input) input.addEventListener('input', renderAreas);

  /* ---------- Enquiry form (Web3Forms → the school's email) ---------- */
  const form = $('[data-enquiry]');
  const select = $('[data-enquire-select]');
  const OTHER = 'Something else / not sure yet';
  // "Book now" / "Ask about this lesson" buttons link to /contact?interest=… to pre-select the option.
  let wanted = new URLSearchParams(location.search).get('interest');
  if (wanted) history.replaceState(null, '', location.pathname); // keep the address bar clean: /contact
  const addOption = (parent, text) => { const o = el('option', null, esc(text)); o.value = text; parent.appendChild(o); };
  const chooseOption = (text) => {
    if (![...select.options].some((o) => o.value === text)) addOption(select, text);
    select.value = text;
  };
  const renderEnquiryOptions = (prices) => {
    if (!form) return;
    const keep = wanted || select.value;
    wanted = null;
    select.length = 1;
    const lessons = el('optgroup'); lessons.label = 'Lessons';
    LESSONS.forEach((l) => addOption(lessons, l.name));
    select.appendChild(lessons);
    if (prices.length) {
      const pk = el('optgroup'); pk.label = 'Prices & packages';
      prices.forEach((p) => addOption(pk, packageLabel(p)));
      select.appendChild(pk);
    }
    addOption(select, OTHER);
    if (keep) chooseOption(keep.slice(0, 120));
  };

  if (form) {
    const formError = (m) => { const e = $('[data-enquiry-error]'); e.textContent = m || ''; e.hidden = !m; };
    $('[data-enquiry-again]').addEventListener('click', () => {
      form.reset();
      formError('');
      $('[data-enquiry-done]').hidden = true;
    });
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const f = form.elements;
      const name = f.name.value.trim();
      const phone = f.phone.value.trim();
      const email = f.email.value.trim();
      if (!name) { formError('Please enter your name.'); f.name.focus(); return; }
      if (phone.replace(/\D/g, '').length < 8) { formError('Please enter a phone number we can reach you on.'); f.phone.focus(); return; }
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { formError('That email address doesn’t look right.'); f.email.focus(); return; }
      formError('');
      const btn = form.querySelector('[type=submit]');
      btn.disabled = true;
      btn.textContent = 'Sending…';
      const data = Object.fromEntries(new FormData(form));
      Object.keys(data).forEach((k) => { if (typeof data[k] === 'string') data[k] = data[k].trim(); if (data[k] === '') delete data[k]; });
      data.interested_in = data.interested_in || 'Not specified';
      data.subject = `New lesson enquiry: ${name}${f.interested_in.value ? ' · ' + f.interested_in.value : ''}`;
      try {
        const res = await fetch(form.action, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) });
        const out = await res.json().catch(() => ({}));
        if (!res.ok || !out.success) throw new Error(out.message || `HTTP ${res.status}`);
        $('[data-enquiry-done-text]').textContent = `Thanks, ${name.split(' ')[0]}! Zubair will be in touch soon. Need an answer sooner? Call 0470 452 803.`;
        $('[data-enquiry-done]').hidden = false;
      } catch (err) {
        console.warn('Enquiry failed:', err.message);
        formError('Sorry, your enquiry didn’t send. Please try again, or call 0470 452 803.');
      } finally {
        btn.disabled = false;
        btn.textContent = 'Send enquiry';
      }
    });
  }

  /* ---------- Load this page's content from Supabase (falls back to DEFAULTS) ---------- */
  const TABLES = {
    prices: { order: 'sort_order.asc,created_at.asc', needed: !!(priceBox || form) },
    reviews: { order: 'reviewed_on.desc,created_at.desc', needed: !!dots },
    passes: { order: 'passed_on.desc,created_at.desc', needed: !!storyBox },
    recent_lessons: { order: 'lesson_on.desc,created_at.desc', needed: !!recentBox },
    areas: { order: 'sort_order.asc,name.asc', needed: !!areaBox },
  };
  const render = (c) => {
    renderPrices(c.prices);
    renderEnquiryOptions(c.prices);
    renderReviews(c.reviews);
    renderPasses(c.passes);
    renderRecentLessons(c.recent_lessons);
    AREAS = c.areas.map((a) => a.name);
    renderAreas();
  };
  const CFG = window.SAFEGEN_CONFIG || {};
  const fetchTable = async (table) => {
    if (!TABLES[table].needed) return DEFAULTS[table];
    const res = await fetch(`${CFG.supabaseUrl}/rest/v1/${table}?select=*&order=${TABLES[table].order}`, {
      headers: { apikey: CFG.supabaseAnonKey },
    });
    if (!res.ok) throw new Error(`${table}: ${res.status}`);
    return res.json();
  };
  const loadContent = async () => {
    if (!CFG.supabaseUrl || !CFG.supabaseAnonKey) return DEFAULTS;
    const names = Object.keys(TABLES);
    // Each table falls back to its built-in copy on its own, so one failure can't blank the others.
    const rows = await Promise.all(names.map((n) => fetchTable(n).catch((err) => { console.warn(`Safe-Gen: built-in ${n}:`, err.message); return DEFAULTS[n]; })));
    return Object.fromEntries(names.map((n, i) => [n, rows[i]]));
  };
  if (Object.values(TABLES).some((t) => t.needed)) {
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000));
    Promise.race([loadContent(), timeout])
      .then(render)
      .catch((err) => { console.warn('Safe-Gen: showing built-in content:', err.message); render(DEFAULTS); });
  }

  $('[data-year]').textContent = new Date().getFullYear();
})();
