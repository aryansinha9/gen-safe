// Safe-Gen Driving — page interactivity (contact links, marquee, lessons, reviews, pass stories, suburb check).
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const el = (tag, style, html) => { const e = document.createElement(tag); if (style) e.style.cssText = style; if (html != null) e.innerHTML = html; return e; };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const WA = 'https://wa.me/61470452803';
  const SMS = 'sms:+61470452803';
  const MSG = "Hi Safe-Gen, I'd like to book a driving lesson.";
  const state = { testi: 0 };

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
    if (slot.dataset.pos) img.style.objectPosition = slot.dataset.pos;
    img.onload = () => { empty.remove(); slot.appendChild(img); };
    img.src = slot.dataset.src;
  };
  document.querySelectorAll('.sg-slot').forEach(fillSlot);

  /* ---------- Contact links: pre-fill WhatsApp / SMS ---------- */
  document.querySelectorAll('[data-wa]').forEach((a) => { a.href = `${WA}?text=${encodeURIComponent(MSG)}`; });
  document.querySelectorAll('[data-sms]').forEach((a) => { a.href = `${SMS}?&body=${encodeURIComponent(MSG)}`; });

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

  /* ---------- Lessons ---------- */
  const CHECK = '<svg width="16" height="16" viewBox="0 0 256 256" fill="#3fcf74" style="flex:none;margin-top:2px" aria-hidden="true"><path d="M229.7 77.7l-128 128a8 8 0 0 1-11.4 0l-56-56a8 8 0 0 1 11.4-11.4L96 188.7 218.3 66.3a8 8 0 0 1 11.4 11.4Z"></path></svg>';
  const LESSONS = [
    { name: 'Learner driver lessons', plate: '#F4C21B', ink: '#161826', letter: 'L', blurb: 'Brand new or still on your L’s? Start with the basics and build up at a pace that suits you.', items: ['Patient, one‑on‑one instruction', 'Clear, step‑by‑step explanations', 'Paced to your confidence level'], ask: 'learner driver lessons' },
    { name: 'Test preparation', plate: '#E3262B', ink: '#f3f5fe', letter: 'P1', featured: true, blurb: 'Getting ready for your drive test? Focused practice on the skills you’ll be assessed on.', items: ['Practise test manoeuvres', 'Honest feedback on your readiness', 'Calm and confident on the day'], ask: 'test preparation lessons' },
    { name: 'Confidence & refresher', plate: '#1F7A3F', ink: '#f3f5fe', letter: 'P', blurb: 'Licensed but out of practice, or new to driving in Australia? Rebuild your confidence on local roads.', items: ['Overseas & returning drivers', 'Local road rules and conditions', 'Go at your own pace'], ask: 'a confidence / refresher lesson' },
  ];
  const lessonBox = $('[data-lessons]');
  LESSONS.forEach((l) => {
    const f = !!l.featured;
    const card = el('div', `position:relative;padding:28px;border-radius:18px;background:${f ? 'linear-gradient(170deg,#2c1d25,#1d1e2c 60%)' : '#1b1d2b'};box-shadow:${f ? '0 0 0 1px #E3262B,0 30px 70px rgba(227,38,43,.16)' : '0 0 0 1px #292b31'};display:flex;flex-direction:column;gap:18px;transition:transform .3s`,
      `<div style="width:48px;height:48px;border-radius:12px;background:${l.plate};color:${l.ink};font:italic 900 ${l.letter.length > 1 ? 24 : 30}px/48px 'Saira',sans-serif;text-align:center">${l.letter}</div>
       <h3 style="margin:0;font:italic 800 24px/1.15 'Saira',sans-serif;letter-spacing:-.02em;color:#f3f5fe">${esc(l.name)}</h3>
       <p style="margin:0;font:400 15px/1.6 var(--font-body);color:#b2b6ca">${esc(l.blurb)}</p>
       <div style="height:1px;background:linear-gradient(90deg,#3f424d00,#3f424d 20%,#3f424d 80%,#3f424d00)"></div>
       <div style="display:flex;flex-direction:column;gap:10px;flex:1">
         ${l.items.map((it) => `<div style="display:flex;gap:10px;align-items:start;font:400 14px/1.45 var(--font-body);color:#cfd3e5">${CHECK}${esc(it)}</div>`).join('')}
       </div>
       <a href="${WA}?text=${encodeURIComponent(`Hi Safe-Gen, I'm interested in ${l.ask}.`)}" target="_blank" rel="noopener" class="btn btn-block ${f ? 'btn-primary' : 'btn-secondary'}" style="padding:12px;font-size:14px;${f ? 'border-color:#E3262B;background:#E3262B;color:#f3f5fe' : ''}">Ask about this lesson</a>`);
    card.className = 'sg-package';
    lessonBox.appendChild(card);
  });

  /* ---------- Reviews carousel ---------- */
  const REVIEWS = [
    { quote: 'Zubair was very helpful on my driving lesson! I haven’t driven in a while nor in Australia so just wanted to build my confidence and Zubair definitely helped with this. Thank you!', name: 'Chloe', meta: 'Posted 26 Sep 2026' },
    { quote: 'Very easy to work with and very understanding of skill and confidence level.', name: 'Elisabetta', meta: 'Posted 19 Sep 2026' },
    { quote: 'Had my first lesson with Zubair today and I can’t recommend him enough. His instructions were clear, his advice was easy to understand and I already feel much more confident on the road. I highly recommend Zubair for learner drivers of any skill range that are looking for a patient and supportive instructor.', name: 'Alex', meta: 'Posted 12 Sep 2026' },
  ];
  const N = REVIEWS.length;
  const dots = $('[data-review-dots]');
  const renderReview = () => {
    const r = REVIEWS[state.testi];
    $('[data-review-quote]').textContent = r.quote;
    $('[data-review-initials]').textContent = r.name[0];
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
  $('[data-review-prev]').addEventListener('click', () => { state.testi = (state.testi + N - 1) % N; renderReview(); });
  $('[data-review-next]').addEventListener('click', () => { state.testi = (state.testi + 1) % N; renderReview(); });
  setInterval(() => { state.testi = (state.testi + 1) % N; renderReview(); }, 9000);
  renderReview();

  /* ---------- Pass stories (from the Safe-Gen Facebook page) ---------- */
  const STORIES = [
    { name: 'Vijay', date: '30 July', text: 'A fantastic achievement and a reflection of your hard work, dedication and commitment throughout your lessons. It’s been a pleasure watching your skills and confidence grow behind the wheel.' },
    { name: 'Priya', date: '29 May', text: 'Big congratulations to Priya for passing her driving test! She really appreciated the patient teaching style and the confidence she built on the road. So proud of her hard work and success.' },
    { name: 'Danush', date: '2 April', text: 'At the beginning he was nervous and often scared behind the wheel, but he stayed committed and didn’t give up. Lesson by lesson he listened, improved and started making quicker, better decisions. A well‑deserved pass — he should be proud of how far he’s come.' },
  ];
  const storyBox = $('[data-stories]');
  STORIES.forEach((t) => {
    storyBox.appendChild(el('article', 'padding:26px;border-radius:18px;background:#1b1d2b;box-shadow:0 0 0 1px #292b31;display:flex;flex-direction:column;gap:12px',
      `<div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
         <span style="display:flex;align-items:center;gap:10px"><span style="padding:3px 9px;border-radius:7px;background:#1F7A3F;color:#f3f5fe;font:italic 900 14px/1.3 'Saira',sans-serif">P</span><span style="font:italic 800 20px 'Saira',sans-serif;color:#f3f5fe">Congrats, ${esc(t.name)}!</span></span>
         <span style="font:500 12px var(--font-body);color:#75798c;white-space:nowrap">${esc(t.date)}</span>
       </div>
       <p style="margin:0;font:400 14px/1.6 var(--font-body);color:#b2b6ca">${esc(t.text)}</p>`));
  });

  /* ---------- Areas + suburb check ---------- */
  const AREAS = ['Sunshine', 'Werribee', 'Melton', 'Coolaroo', 'Melbourne', 'Derrimut', 'Deer Park'];
  const input = $('[data-suburb]');
  const msg = $('[data-suburb-msg]');
  const areaBox = $('[data-areas]');
  const renderAreas = () => {
    const q = input.value.trim().toLowerCase();
    const hit = AREAS.find((a) => a.toLowerCase() === q) || (q.length > 2 && AREAS.find((a) => a.toLowerCase().startsWith(q)));
    msg.textContent = !q ? '' : hit ? '✓ Yes — we teach in ' + hit + '.' : 'Not on our list — call or WhatsApp 0470 452 803 and we’ll let you know.';
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
