// Safe Gen Driving — interactivity ported from the Claude Design component (Safe Gen Driving.dc.html).
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const el = (tag, style, html) => { const e = document.createElement(tag); if (style) e.style.cssText = style; if (html != null) e.innerHTML = html; return e; };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const PHONE = '0470452803';
  const state = { slot: 1, dur: 60, testi: 0 };

  /* ---------- Image slots ---------- */
  const PH_ICON = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 17-5-5-9 8"/></svg>';
  const fillSlot = (slot) => {
    const empty = el('div', null, `${PH_ICON}<span>${esc(slot.dataset.placeholder || '')}</span>`);
    empty.className = 'sg-slot-empty';
    slot.appendChild(empty);
    if (!slot.dataset.src) return;
    const img = new Image();
    img.alt = slot.dataset.alt || '';
    img.decoding = 'async';
    img.onload = () => { empty.remove(); slot.appendChild(img); };
    img.src = slot.dataset.src;
  };
  document.querySelectorAll('.sg-slot').forEach(fillSlot);

  /* ---------- Quick book slots ---------- */
  const SLOTS = [['Tue', '4:30 pm'], ['Wed', '7:00 am'], ['Thu', '5:30 pm'], ['Sat', '9:00 am']];
  const slotBox = $('[data-slots]');
  const reserve = $('[data-reserve]');
  const renderSlots = () => {
    slotBox.innerHTML = '';
    SLOTS.forEach(([day, time], i) => {
      const on = i === state.slot;
      const b = el('button', `flex:1;min-width:92px;padding:10px 12px;border-radius:10px;border:1px solid ${on ? '#E3262B' : '#3f424d'};background:${on ? 'rgba(227,38,43,.14)' : 'rgba(22,24,38,.5)'};color:#e9e9ed;cursor:pointer;text-align:left;font-family:var(--font-body);transition:all .2s`,
        `<div style="font:500 11px var(--font-body);color:#9397ab">${day}</div><div style="font:600 15px var(--font-body);margin-top:2px">${time}</div>`);
      b.type = 'button';
      b.className = 'sg-slot-btn';
      b.setAttribute('role', 'radio');
      b.setAttribute('aria-checked', String(on));
      b.addEventListener('click', () => { state.slot = i; renderSlots(); });
      slotBox.appendChild(b);
    });
    const label = SLOTS[state.slot].join(' ');
    reserve.textContent = 'Reserve ' + label;
    // Reserving opens an SMS to the instructor line, pre-filled with the chosen time.
    reserve.href = `sms:${PHONE}?&body=${encodeURIComponent(`Hi Safe Gen, I'd like to book a driving lesson — ${label} if it's still free.`)}`;
  };
  renderSlots();

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
  marquee.append(run(), run());

  /* ---------- Packages + 60/90 min toggle ---------- */
  const durBox = $('[data-durations]');
  const pkgBox = $('[data-packages]');
  const CHECK = '<svg width="16" height="16" viewBox="0 0 256 256" fill="#3fcf74" style="flex:none;margin-top:2px" aria-hidden="true"><path d="M229.7 77.7l-128 128a8 8 0 0 1-11.4 0l-56-56a8 8 0 0 1 11.4-11.4L96 188.7 218.3 66.3a8 8 0 0 1 11.4 11.4Z"></path></svg>';
  const renderPackages = () => {
    const long = state.dur === 90;
    const k = long ? 1.45 : 1;
    const m = long ? '90' : '60';
    const packages = [
      { name: 'Single lesson', short: 'lesson', price: Math.round(75 * k), unit: '/ lesson', save: 'Pay as you go', items: [m + '‑min lesson', 'Door‑to‑door pickup', 'Progress notes'] },
      { name: '5‑lesson pack', short: '5 pack', price: Math.round(355 * k), unit: '/ 5 lessons', save: 'Save $' + Math.round(20 * k), items: ['5 × ' + m + '‑min lessons', 'Structured L‑stage plan', 'Parent progress updates'] },
      { name: '10‑lesson pack', short: '10 pack', price: Math.round(690 * k), unit: '/ 10 lessons', save: 'Save $' + Math.round(60 * k), featured: true, items: ['10 × ' + m + '‑min lessons', 'Mock test included', 'Priority booking'] },
      { name: 'Test day package', short: 'test day', price: 240, unit: '/ package', save: 'Pre‑test warm‑up + car hire', items: ['60‑min warm‑up lesson', 'Use of Safe Gen car for test', 'Pickup & drop‑off'] },
    ];
    pkgBox.innerHTML = '';
    packages.forEach((p) => {
      const f = !!p.featured;
      const card = el('div', `position:relative;padding:28px;border-radius:18px;background:${f ? 'linear-gradient(170deg,#2c1d25,#1d1e2c 60%)' : '#1b1d2b'};box-shadow:${f ? '0 0 0 1px #E3262B,0 30px 70px rgba(227,38,43,.16)' : '0 0 0 1px #292b31'};display:flex;flex-direction:column;gap:20px;transition:transform .3s`,
        `<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;min-height:24px">
           <span style="font:600 13px var(--font-body);color:#b2b6ca">${p.name}</span>
           ${f ? '<span style="padding:4px 10px;border-radius:999px;background:#E3262B;color:#f3f5fe;font:600 11px var(--font-body);letter-spacing:.04em">Most popular</span>' : ''}
         </div>
         <div style="display:flex;align-items:baseline;gap:6px">
           <span style="font:italic 800 54px/1 'Saira',sans-serif;letter-spacing:-.01em;color:#f3f5fe">$${p.price}</span>
           <span style="font:500 13px var(--font-body);color:#9397ab">${p.unit}</span>
         </div>
         <div style="font:500 13px var(--font-body);color:${f ? '#ff8a8d' : '#7fe0a3'}">${p.save}</div>
         <div style="height:1px;background:linear-gradient(90deg,#3f424d00,#3f424d 20%,#3f424d 80%,#3f424d00)"></div>
         <div style="display:flex;flex-direction:column;gap:10px;flex:1">
           ${p.items.map((it) => `<div style="display:flex;gap:10px;align-items:start;font:400 14px/1.45 var(--font-body);color:#cfd3e5">${CHECK}${esc(it)}</div>`).join('')}
         </div>
         <a href="#book" class="btn btn-block ${f ? 'btn-primary' : 'btn-secondary'}" style="padding:12px;font-size:14px;${f ? 'border-color:#E3262B;background:#E3262B;color:#f3f5fe' : ''}">Book ${p.short}</a>`);
      card.className = 'sg-package';
      pkgBox.appendChild(card);
    });
    durBox.innerHTML = '';
    [60, 90].forEach((d) => {
      const on = state.dur === d;
      const b = el('button', `padding:10px 18px;border:0;border-radius:9px;background:${on ? '#3f424d' : 'transparent'};color:${on ? '#f3f5fe' : '#9397ab'};font:600 13px var(--font-body);cursor:pointer;transition:all .2s`, d + ' min');
      b.type = 'button';
      b.setAttribute('aria-pressed', String(on));
      b.addEventListener('click', () => { state.dur = d; renderPackages(); });
      durBox.appendChild(b);
    });
  };
  renderPackages();

  /* ---------- Instructors ---------- */
  const TEAM = [
    { name: 'Instructor name', years: '12 yrs', bio: 'Specialises in anxious first‑timers. Known for the calmest voice in Melbourne.', tags: ['Auto', 'English', 'Hindi'], plate: '#F4C21B', plateInk: '#161826', letter: 'L' },
    { name: 'Instructor name', years: '8 yrs', bio: 'Test‑route expert with a knack for reverse parks and tricky roundabouts.', tags: ['Auto', 'Test prep'], plate: '#1F7A3F', plateInk: '#f3f5fe', letter: 'P' },
    { name: 'Instructor name', years: '6 yrs', bio: 'Freeway and night‑driving coach for new P‑platers building real‑world skill.', tags: ['Auto', 'Freeways'], plate: '#E3262B', plateInk: '#f3f5fe', letter: 'P' },
  ];
  const teamBox = $('[data-team]');
  TEAM.forEach((t, i) => {
    const card = el('div', 'border-radius:18px;overflow:hidden;background:#1b1d2b;box-shadow:0 0 0 1px #292b31;transition:box-shadow .3s',
      `<div style="position:relative;height:340px">
         <div class="sg-slot" data-src="/assets/img/instructor-${i + 1}.jpg" data-alt="${esc(t.name)}" data-placeholder="Portrait — ${esc(t.name)}"></div>
         <div style="position:absolute;left:16px;top:16px;width:34px;height:34px;border-radius:9px;background:${t.plate};color:${t.plateInk};font:italic 900 20px/34px 'Saira',sans-serif;text-align:center;pointer-events:none">${t.letter}</div>
       </div>
       <div style="padding:22px 24px 24px;display:flex;flex-direction:column;gap:8px">
         <div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px"><h4 style="margin:0;font:italic 800 21px 'Saira',sans-serif;color:#f3f5fe">${esc(t.name)}</h4><span style="font:500 13px var(--font-body);color:#9397ab">${t.years}</span></div>
         <p style="margin:0;font:400 14px/1.55 var(--font-body);color:#9397ab">${esc(t.bio)}</p>
         <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px">${t.tags.map((g) => `<span class="tag tag-neutral">${esc(g)}</span>`).join('')}</div>
       </div>`);
    card.className = 'sg-member';
    teamBox.appendChild(card);
    fillSlot($('.sg-slot', card));
  });

  /* ---------- Reviews carousel ---------- */
  const REVIEWS = [
    { quote: 'I was scared of roundabouts after my first lesson with Dad. Four weeks with Safe Gen and I passed first go.', name: 'Aanya S.', initials: 'AS', meta: 'Passed at Dandenong · P1' },
    { quote: 'As a parent, the notes after every lesson were gold. I always knew exactly what she was working on.', name: 'Michelle T.', initials: 'MT', meta: 'Parent of a learner' },
    { quote: 'Patient, punctual and honest. They told me when I wasn’t ready — and made sure I was when I booked.', name: 'Josh K.', initials: 'JK', meta: 'Passed at Heatherton · P1' },
    { quote: 'Pickup from school, lessons in the evening, test day handled. Couldn’t have been easier.', name: 'Liam R.', initials: 'LR', meta: 'Passed at Narre Warren · P1' },
  ];
  const dots = $('[data-review-dots]');
  const renderReview = () => {
    const r = REVIEWS[state.testi];
    $('[data-review-quote]').textContent = r.quote;
    $('[data-review-initials]').textContent = r.initials;
    $('[data-review-name]').textContent = r.name;
    $('[data-review-meta]').textContent = r.meta;
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
  $('[data-review-prev]').addEventListener('click', () => { state.testi = (state.testi + 3) % 4; renderReview(); });
  $('[data-review-next]').addEventListener('click', () => { state.testi = (state.testi + 1) % 4; renderReview(); });
  setInterval(() => { state.testi = (state.testi + 1) % 4; renderReview(); }, 7000);
  renderReview();

  /* ---------- Areas + suburb check ---------- */
  const AREAS = ['Dandenong', 'Springvale', 'Noble Park', 'Keysborough', 'Clayton', 'Glen Waverley', 'Mulgrave', 'Rowville', 'Narre Warren', 'Berwick', 'Cranbourne', 'Hallam'];
  const input = $('[data-suburb]');
  const msg = $('[data-suburb-msg]');
  const areaBox = $('[data-areas]');
  const renderAreas = () => {
    const q = input.value.trim().toLowerCase();
    const hit = AREAS.find((a) => a.toLowerCase() === q) || (q.length > 2 && AREAS.find((a) => a.toLowerCase().startsWith(q)));
    msg.textContent = !q ? '' : hit ? '✓ Yes — we cover ' + hit + '. Pickup available.' : 'Not on our list yet — call 0470 452 803 and we’ll try.';
    msg.style.color = hit ? '#7fe0a3' : '#b2b6ca';
    areaBox.innerHTML = '';
    AREAS.forEach((n) => {
      const on = hit === n;
      const b = el('button', `padding:11px 16px;border-radius:999px;border:1px solid ${on ? '#E3262B' : '#3f424d'};background:${on ? 'rgba(227,38,43,.14)' : 'transparent'};color:#e9e9ed;font:500 14px var(--font-body);cursor:pointer;transition:all .2s`, n);
      b.type = 'button';
      b.className = 'sg-area';
      b.addEventListener('click', () => { input.value = n; renderAreas(); });
      areaBox.appendChild(b);
    });
  };
  input.addEventListener('input', renderAreas);
  renderAreas();

  $('[data-year]').textContent = new Date().getFullYear();
})();
