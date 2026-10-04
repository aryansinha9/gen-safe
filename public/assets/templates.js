// Card templates shared by the public site (site.js) and the admin preview (admin/admin.js),
// so content edited in /admin always renders with exactly the site's design.
window.SafeGen = (() => {
  const el = (tag, style, html) => { const e = document.createElement(tag); if (style) e.style.cssText = style; if (html != null) e.innerHTML = html; return e; };
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const CHECK = '<svg width="16" height="16" viewBox="0 0 256 256" fill="#3fcf74" style="flex:none;margin-top:2px" aria-hidden="true"><path d="M229.7 77.7l-128 128a8 8 0 0 1-11.4 0l-56-56a8 8 0 0 1 11.4-11.4L96 188.7 218.3 66.3a8 8 0 0 1 11.4 11.4Z"></path></svg>';

  /* ---------- Formatting ---------- */
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const parseDate = (iso) => { const [y, m, d] = String(iso || '').split('-').map(Number); return { y, m, d }; };
  const reviewDate = (iso) => { const { y, m, d } = parseDate(iso); return m ? `Posted ${d} ${MONTHS[m - 1].slice(0, 3)} ${y}` : ''; };
  const passDate = (iso) => { const { y, m, d } = parseDate(iso); return m ? `${d} ${MONTHS[m - 1]}${y !== new Date().getFullYear() ? ' ' + y : ''}` : ''; };
  const FOCUS = { top: 'center 15%', center: 'center 35%', bottom: 'center 70%' };
  const safeImg = (u) => (/^(https?:\/\/|\/assets\/|blob:)/.test(u || '') ? u : '');

  /* ---------- Image slots: photo if it loads, otherwise the design's placeholder ---------- */
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
    if (img.complete && img.naturalWidth) img.onload(); // already cached: no placeholder flash
  };

  /* ---------- Price card ---------- */
  // Also the option text in the enquiry form's “I’m interested in” list.
  const packageLabel = (p) => `${p.name} · ${Number(p.duration) || 60} min · $${p.price}`;
  const priceCard = (p) => {
    const f = !!p.featured;
    const card = el('div', `position:relative;padding:28px;border-radius:18px;background:${f ? 'linear-gradient(170deg,#2c1d25,#1d1e2c 60%)' : '#1b1d2b'};box-shadow:${f ? '0 0 0 1px #E3262B,0 30px 70px rgba(227,38,43,.16)' : '0 0 0 1px #292b31'};display:flex;flex-direction:column;gap:20px;transition:transform .3s`,
      `<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;min-height:24px">
         <span style="font:600 13px var(--font-body);color:#b2b6ca">${esc(p.name)}</span>
         ${f ? `<span style="padding:4px 10px;border-radius:999px;background:#E3262B;color:#f3f5fe;font:600 11px var(--font-body);letter-spacing:.04em;white-space:nowrap">${esc(p.featured_label || 'Best value')}</span>` : ''}
       </div>
       <div style="display:flex;align-items:baseline;gap:6px;flex-wrap:wrap">
         <span style="font:italic 800 54px/1 'Saira',sans-serif;letter-spacing:-.01em;color:#f3f5fe">$${esc(p.price)}</span>
         <span style="font:500 13px var(--font-body);color:#9397ab">${esc(p.unit)}</span>
       </div>
       <div style="font:500 13px var(--font-body);color:${f ? '#ff8a8d' : '#7fe0a3'};min-height:16px">${esc(p.note)}</div>
       <div style="height:1px;background:linear-gradient(90deg,#3f424d00,#3f424d 20%,#3f424d 80%,#3f424d00)"></div>
       <div style="display:flex;flex-direction:column;gap:10px;flex:1">
         ${(p.features || []).map((it) => `<div style="display:flex;gap:10px;align-items:start;font:400 14px/1.45 var(--font-body);color:#cfd3e5">${CHECK}${esc(it)}</div>`).join('')}
       </div>
       <a href="/contact?interest=${encodeURIComponent(packageLabel(p))}" class="btn btn-block ${f ? 'btn-primary' : 'btn-secondary'}" style="padding:12px;font-size:14px;${f ? 'border-color:#E3262B;background:#E3262B;color:#f3f5fe' : ''}">Book now</a>`);
    card.className = 'sg-package';
    return card;
  };

  /* ---------- Recent pass card ---------- */
  const passCard = (t) => {
    const card = el('article', 'border-radius:18px;overflow:hidden;background:#1b1d2b;box-shadow:0 0 0 1px #292b31;display:flex;flex-direction:column',
      `<figure class="sg-photo" style="border-radius:0;box-shadow:none"><div class="sg-slot" data-src="${esc(safeImg(t.photo_url))}" data-pos="${FOCUS[t.photo_focus] || FOCUS.center}" data-alt="${esc(`${t.name} after passing their driving test with Safe-Gen`)}" data-placeholder="${esc(t.name || 'Photo')}"></div></figure>
       <div style="padding:24px 26px 26px;display:flex;flex-direction:column;gap:12px">
         <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
           <span style="display:flex;align-items:center;gap:10px;min-width:0"><span style="padding:3px 9px;border-radius:7px;background:#1F7A3F;color:#f3f5fe;font:italic 900 14px/1.3 'Saira',sans-serif">P</span><span style="font:italic 800 20px 'Saira',sans-serif;color:#f3f5fe;overflow-wrap:anywhere">Congrats, ${esc(t.name)}!</span></span>
           <span style="font:500 12px var(--font-body);color:#75798c;white-space:nowrap">${esc(passDate(t.passed_on))}</span>
         </div>
         <p style="margin:0;font:400 14px/1.6 var(--font-body);color:#b2b6ca;white-space:pre-line">${esc(t.message)}</p>
       </div>`);
    card.className = 'sg-pass';
    fillSlot(card.querySelector('.sg-slot'));
    return card;
  };

  /* ---------- Review (same markup as the reviews section's quote block) ---------- */
  const reviewBlock = (r) => el('div', 'display:flex;flex-direction:column;gap:24px',
    `<blockquote style="margin:0;font:italic 600 clamp(20px,2.2vw,28px)/1.35 'Saira',sans-serif;letter-spacing:-.02em;color:#f3f5fe;text-wrap:pretty">${esc(r.quote)}</blockquote>
     <div style="display:flex;align-items:center;gap:14px">
       <div style="width:44px;height:44px;border-radius:50%;background:#292b31;box-shadow:0 0 0 1px #3f424d;display:grid;place-items:center;font:600 15px var(--font-body);color:#e9e9ed">${esc(initial(r.name))}</div>
       <div><div style="font:600 15px var(--font-body);color:#f3f5fe">${esc(r.name)}</div><div style="font:400 13px var(--font-body);color:#9397ab">${esc(reviewDate(r.reviewed_on))}</div></div>
     </div>`);
  const initial = (name) => (String(name || '?').trim()[0] || '?').toUpperCase();

  /* ---------- Area pill ---------- */
  const areaPill = (name, on) => {
    const b = el('button', `padding:11px 16px;border-radius:999px;border:1px solid ${on ? '#E3262B' : '#3f424d'};background:${on ? 'rgba(227,38,43,.14)' : 'transparent'};color:#e9e9ed;font:500 14px var(--font-body);cursor:pointer;transition:all .2s`, esc(name));
    b.type = 'button';
    b.className = 'sg-area';
    return b;
  };

  return { el, esc, CHECK, packageLabel, reviewDate, passDate, initial, fillSlot, priceCard, passCard, reviewBlock, areaPill };
})();
