// Safe-Gen admin dashboard: sign in with Supabase Auth, then add / edit / delete / reorder
// the site's editable content. Previews use the same templates as the public site (assets/templates.js).
(() => {
  const { el, esc, priceCard, passCard, reviewBlock, areaPill, reviewDate, passDate } = window.SafeGen;
  const $ = (q, r = document) => r.querySelector(q);
  const CFG = window.SAFEGEN_CONFIG || {};
  const BUCKET = 'site-images';

  const show = (id) => ['login', 'setup', 'app'].forEach((v) => { $('#' + v).hidden = v !== id; });
  if (!CFG.supabaseUrl || !CFG.supabaseAnonKey || !window.supabase) { show('setup'); return; }
  const sb = window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseAnonKey);

  /* ---------- Toasts ---------- */
  const toast = (text, kind = 'ok') => {
    const t = el('div', null, esc(text));
    t.className = `adm-toast adm-toast-${kind}`;
    $('[data-toasts]').appendChild(t);
    setTimeout(() => t.remove(), kind === 'error' ? 7000 : 3500);
  };
  const fail = (err) => { console.error(err); toast(err?.message || 'Something went wrong. Please try again.', 'error'); };

  /* ---------- Sections ---------- */
  const today = () => new Date().toLocaleDateString('en-CA'); // yyyy-mm-dd in local time
  const TABS = {
    passes: {
      label: 'Recent passes', kicker: 'Recent passes section', noun: 'pass',
      desc: 'Students who passed. Newest first on the site. Each card shows the photo, name, date and message.',
      table: 'passes', order: [['passed_on', false], ['created_at', false]],
      blank: () => ({ name: '', passed_on: today(), message: '', photo_url: null, photo_path: null, photo_focus: 'center' }),
      fields: [
        { key: 'name', label: 'Student name', type: 'text', max: 60, required: true, hint: 'Shown as “Congrats, Name!”' },
        { key: 'passed_on', label: 'Date passed', type: 'date', required: true },
        { key: 'photo', label: 'Photo', type: 'image' },
        { key: 'photo_focus', label: 'Photo framing', type: 'select', options: [['top', 'Show the top of the photo'], ['center', 'Centred'], ['bottom', 'Show the bottom of the photo']], hint: 'Adjust if a face gets cropped in the preview.' },
        { key: 'message', label: 'Congratulations message', type: 'textarea', max: 1200, rows: 6, required: true },
      ],
      preview: (v) => passCard(v),
      layout: 'cards',
      card: (r) => passCard(r),
      title: (r) => `${r.name} · ${passDate(r.passed_on)}`,
    },
    reviews: {
      label: 'Reviews', kicker: 'Student reviews section', noun: 'review',
      desc: 'Shown in the reviews slider, newest first.',
      table: 'reviews', order: [['reviewed_on', false], ['created_at', false]],
      blank: () => ({ name: '', reviewed_on: today(), quote: '' }),
      fields: [
        { key: 'name', label: 'Reviewer name', type: 'text', max: 60, required: true },
        { key: 'reviewed_on', label: 'Date posted', type: 'date', required: true },
        { key: 'quote', label: 'Review', type: 'textarea', max: 1200, rows: 7, required: true },
      ],
      preview: (v) => reviewBlock(v),
      layout: 'rows',
      row: (r) => `<div class="adm-row-main"><strong>${esc(r.name)}</strong><span class="adm-muted">${esc(reviewDate(r.reviewed_on))}</span></div><p class="adm-row-text">${esc(r.quote)}</p>`,
    },
    prices: {
      label: 'Prices', kicker: 'Prices & packages section', noun: 'package',
      desc: 'Packages are grouped by lesson length (the 60 min / 90 min switch). Use the arrows to change the order.',
      table: 'prices', order: [['sort_order', true], ['created_at', true]], sortable: true,
      blank: () => ({ name: '', duration: 60, price: '', unit: '/ lesson', note: '', features: [], featured: false, featured_label: 'Best value' }),
      fields: [
        { key: 'name', label: 'Package name', type: 'text', max: 60, required: true, hint: 'e.g. Single lesson, 5‑lesson pack' },
        { key: 'duration', label: 'Lesson length', type: 'select', options: [[60, '60 minutes'], [90, '90 minutes']], number: true },
        { key: 'price', label: 'Price (AUD)', type: 'number', min: 0, max: 100000, required: true },
        { key: 'unit', label: 'Price label', type: 'text', max: 40, hint: 'Shown next to the price, e.g. “/ lesson”, “/ 5 lessons”' },
        { key: 'note', label: 'Highlight line', type: 'text', max: 80, hint: 'e.g. “Save $10”, “Pay as you go”' },
        { key: 'features', label: 'What’s included', type: 'lines', maxLines: 8, hint: 'One point per line (up to 8).' },
        { key: 'featured', label: 'Highlight this package (red border and badge)', type: 'checkbox' },
        { key: 'featured_label', label: 'Badge text', type: 'text', max: 24, showIf: (v) => v.featured },
      ],
      preview: (v) => priceCard({ ...v, price: v.price === '' ? 0 : v.price }),
      layout: 'cards', group: (r) => `${r.duration} minute lessons`,
      card: (r) => priceCard(r),
      title: (r) => `${r.name} · ${r.duration} min`,
    },
    areas: {
      label: 'Areas', kicker: 'Areas we service section', noun: 'area',
      desc: 'Suburbs shown as buttons and used by the “Check your suburb” search. Use the arrows to change the order.',
      table: 'areas', order: [['sort_order', true], ['name', true]], sortable: true,
      blank: () => ({ name: '' }),
      fields: [{ key: 'name', label: 'Suburb name', type: 'text', max: 60, required: true }],
      preview: (v) => areaPill(v.name || 'Suburb', true),
      layout: 'rows',
      row: (r) => `<div class="adm-row-main"><strong>${esc(r.name)}</strong></div>`,
    },
  };
  const TAB_KEYS = Object.keys(TABS);
  const state = { tab: TAB_KEYS[0], rows: [], editing: null, values: null, photo: null, dirty: false, busy: false };

  /* ---------- Auth ---------- */
  const enter = async (session) => {
    const { data: isAdmin, error } = await sb.rpc('is_admin');
    if (error || !isAdmin) {
      await sb.auth.signOut();
      show('login');
      loginError(error ? error.message : 'This account doesn’t have admin access.');
      return;
    }
    $('[data-user]').textContent = session.user.email;
    show('app');
    const fromHash = location.hash.slice(1);
    selectTab(TABS[fromHash] ? fromHash : state.tab);
  };
  const loginError = (msg) => { const e = $('[data-login-error]'); e.textContent = msg || ''; e.hidden = !msg; };

  $('[data-login]').addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const f = ev.currentTarget;
    const btn = f.querySelector('[type=submit]');
    loginError('');
    if (!f.email.value || !f.password.value) { loginError('Enter your email and password.'); return; }
    btn.disabled = true; btn.textContent = 'Signing in…';
    const { data, error } = await sb.auth.signInWithPassword({ email: f.email.value.trim(), password: f.password.value });
    btn.disabled = false; btn.textContent = 'Sign in';
    if (error) { loginError(error.message === 'Invalid login credentials' ? 'Incorrect email or password.' : error.message); return; }
    f.password.value = '';
    enter(data.session);
  });
  $('[data-signout]').addEventListener('click', async () => { await sb.auth.signOut(); show('login'); });
  sb.auth.onAuthStateChange((event) => { if (event === 'SIGNED_OUT') show('login'); });
  sb.auth.getSession().then(({ data }) => (data.session ? enter(data.session) : show('login')));

  /* ---------- Tabs + list ---------- */
  const tabsBox = $('[data-tabs]');
  TAB_KEYS.forEach((k) => {
    const b = el('button', null, esc(TABS[k].label));
    b.type = 'button';
    b.className = 'adm-tab';
    b.setAttribute('role', 'tab');
    b.dataset.tab = k;
    b.addEventListener('click', () => selectTab(k));
    tabsBox.appendChild(b);
  });

  window.addEventListener('hashchange', () => {
    const k = location.hash.slice(1);
    if (TABS[k] && k !== state.tab && !$('#app').hidden) selectTab(k);
  });

  const selectTab = (k) => {
    state.tab = k;
    if (location.hash !== '#' + k) history.pushState(null, '', '#' + k);
    tabsBox.querySelectorAll('.adm-tab').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === k)));
    const t = TABS[k];
    $('[data-kicker]').textContent = t.kicker;
    $('[data-title]').textContent = t.label;
    $('[data-desc]').textContent = t.desc;
    $('[data-add]').textContent = `+ Add ${t.noun}`;
    load();
  };

  const load = async () => {
    const t = TABS[state.tab];
    const list = $('[data-list]');
    list.innerHTML = '<p class="adm-muted adm-loading">Loading…</p>';
    let q = sb.from(t.table).select('*');
    t.order.forEach(([col, asc]) => { q = q.order(col, { ascending: asc }); });
    const { data, error } = await q;
    if (error) { list.innerHTML = ''; fail(error); return; }
    state.rows = data;
    renderList();
  };

  const toolButton = (label, title, fn, cls = '') => {
    const b = el('button', null, label);
    b.type = 'button';
    b.className = `btn btn-ghost adm-tool ${cls}`;
    b.title = title;
    b.setAttribute('aria-label', title);
    b.addEventListener('click', fn);
    return b;
  };

  const renderList = () => {
    const t = TABS[state.tab];
    const list = $('[data-list]');
    list.innerHTML = '';
    if (!state.rows.length) {
      list.innerHTML = `<div class="adm-empty"><p>No ${esc(t.noun)}s yet.</p><p class="adm-muted">The ${esc(t.label.toLowerCase())} section is hidden on the site until you add one.</p></div>`;
      return;
    }
    const groups = new Map();
    state.rows.forEach((r) => { const g = t.group ? t.group(r) : ''; if (!groups.has(g)) groups.set(g, []); groups.get(g).push(r); });
    groups.forEach((rows, g) => {
      if (g) list.appendChild(el('h3', null, esc(g))).className = 'adm-group';
      const box = el('div');
      box.className = t.layout === 'cards' ? `adm-cards adm-cards-${state.tab}` : 'adm-rows';
      rows.forEach((r, i) => {
        const tools = el('div');
        tools.className = 'adm-tools';
        if (t.sortable) {
          const up = toolButton('↑', 'Move up', () => move(r, -1, rows));
          const down = toolButton('↓', 'Move down', () => move(r, 1, rows));
          up.disabled = i === 0; down.disabled = i === rows.length - 1;
          tools.append(up, down);
        }
        tools.append(toolButton('Edit', 'Edit', () => openEditor(r), 'adm-tool-text'));
        tools.append(toolButton('Delete', 'Delete', () => remove(r), 'adm-tool-text adm-danger'));
        let item;
        if (t.layout === 'cards') {
          item = el('div');
          item.className = 'adm-card-item';
          const prev = el('div');
          prev.className = 'adm-card-preview';
          prev.appendChild(t.card(r));
          prev.addEventListener('click', () => openEditor(r));
          item.append(prev, tools);
        } else {
          item = el('div', null, t.row(r));
          item.className = 'adm-row';
          item.appendChild(tools);
        }
        box.appendChild(item);
      });
      list.appendChild(box);
    });
  };

  /* ---------- Reorder ---------- */
  const move = async (row, dir, siblings) => {
    if (state.busy) return;
    const i = siblings.indexOf(row);
    const other = siblings[i + dir];
    if (!other) return;
    // Renumber everything in its current order, then swap the two rows.
    const all = [...state.rows];
    const a = all.indexOf(row);
    const b = all.indexOf(other);
    [all[a], all[b]] = [all[b], all[a]];
    const changes = all.map((r, idx) => ({ r, sort_order: idx + 1 })).filter(({ r, sort_order }) => r.sort_order !== sort_order);
    state.busy = true;
    try {
      const results = await Promise.all(changes.map(({ r, sort_order }) => sb.from(TABS[state.tab].table).update({ sort_order }).eq('id', r.id)));
      const err = results.find((x) => x.error);
      if (err) throw err.error;
      changes.forEach(({ r, sort_order }) => { r.sort_order = sort_order; });
      state.rows = all;
      renderList();
    } catch (e) { fail(e); load(); } finally { state.busy = false; }
  };

  /* ---------- Delete ---------- */
  const remove = async (row) => {
    const t = TABS[state.tab];
    const name = t.title ? t.title(row) : row.name;
    if (!confirm(`Delete this ${t.noun} (${name})? This can’t be undone.`)) return;
    const { error } = await sb.from(t.table).delete().eq('id', row.id);
    if (error) { fail(error); return; }
    if (row.photo_path) await sb.storage.from(BUCKET).remove([row.photo_path]);
    toast(`Deleted ${t.noun}.`);
    if (dialog.open) closeEditor(true);
    load();
  };

  /* ---------- Editor ---------- */
  const dialog = $('[data-dialog]');
  const form = $('[data-form]');
  const fieldsBox = $('[data-fields]');
  const previewBox = $('[data-preview]');

  const openEditor = (row) => {
    const t = TABS[state.tab];
    state.editing = row;
    state.values = row ? { ...row, features: [...(row.features || [])] } : t.blank();
    state.photo = null;
    state.dirty = false;
    $('[data-form-title]').textContent = row ? `Edit ${t.noun}` : `Add ${t.noun}`;
    $('[data-delete]').hidden = !row;
    $('[data-save]').textContent = row ? 'Save changes' : `Add ${t.noun}`;
    previewBox.className = `adm-preview-stage adm-preview-${state.tab}`;
    renderFields();
    renderPreview();
    dialog.showModal();
    fieldsBox.querySelector('input,textarea,select')?.focus();
  };

  const closeEditor = (force) => {
    if (!force && state.dirty && !confirm('Discard your unsaved changes?')) return;
    if (state.photo?.url) URL.revokeObjectURL(state.photo.url);
    state.photo = null;
    dialog.close();
  };
  $('[data-close]').addEventListener('click', () => closeEditor());
  $('[data-cancel]').addEventListener('click', () => closeEditor());
  dialog.addEventListener('cancel', (e) => { e.preventDefault(); closeEditor(); });
  $('[data-delete]').addEventListener('click', () => state.editing && remove(state.editing));
  $('[data-add]').addEventListener('click', () => openEditor(null));

  const renderFields = () => {
    const t = TABS[state.tab];
    fieldsBox.innerHTML = '';
    t.fields.forEach((f) => {
      const v = state.values;
      const wrap = el('div');
      wrap.className = 'adm-field';
      wrap.dataset.key = f.key;
      if (f.showIf) wrap.hidden = !f.showIf(v);
      const id = `f-${f.key}`;
      const label = `<label for="${id}">${esc(f.label)}${f.required ? ' <i>*</i>' : ''}</label>`;
      const hint = f.hint ? `<small class="adm-hint">${esc(f.hint)}</small>` : '';
      let input;
      switch (f.type) {
        case 'textarea':
          input = el('textarea');
          input.rows = f.rows || 4;
          input.value = v[f.key] ?? '';
          break;
        case 'lines':
          input = el('textarea');
          input.rows = 5;
          input.value = (v[f.key] || []).join('\n');
          break;
        case 'select':
          input = el('select', null, f.options.map(([val, txt]) => `<option value="${esc(val)}">${esc(txt)}</option>`).join(''));
          input.value = String(v[f.key]);
          break;
        case 'checkbox':
          input = el('input');
          input.type = 'checkbox';
          input.checked = !!v[f.key];
          break;
        case 'image':
          wrap.innerHTML = `${label}${imageField()}`;
          fieldsBox.appendChild(wrap);
          bindImage(wrap);
          return;
        default:
          input = el('input');
          input.type = f.type;
          input.value = v[f.key] ?? '';
          if (f.type === 'number') { input.min = f.min; input.max = f.max; input.step = 1; input.inputMode = 'numeric'; }
      }
      input.id = id;
      input.name = f.key;
      if (f.type !== 'checkbox') input.className = 'input';
      if (f.max) input.maxLength = f.max;
      if (f.required) input.required = true;
      if (f.type === 'checkbox') {
        wrap.classList.add('adm-check');
        wrap.append(input);
        wrap.insertAdjacentHTML('beforeend', label);
      } else {
        wrap.innerHTML = label;
        wrap.append(input);
        if (f.max && f.type === 'textarea') wrap.insertAdjacentHTML('beforeend', `<small class="adm-count" data-count>${input.value.length} / ${f.max}</small>`);
      }
      wrap.insertAdjacentHTML('beforeend', hint);
      const update = () => {
        let val = f.type === 'checkbox' ? input.checked : input.value;
        if (f.type === 'lines') val = input.value.split('\n').map((s) => s.trim()).filter(Boolean);
        if (f.type === 'number') val = input.value === '' ? '' : Number(input.value);
        if (f.number) val = Number(val);
        state.values[f.key] = val;
        state.dirty = true;
        const c = wrap.querySelector('[data-count]');
        if (c) c.textContent = `${input.value.length} / ${f.max}`;
        t.fields.filter((x) => x.showIf).forEach((x) => { fieldsBox.querySelector(`[data-key="${x.key}"]`).hidden = !x.showIf(state.values); });
        renderPreview();
      };
      input.addEventListener('input', update);
      input.addEventListener('change', update);
      fieldsBox.appendChild(wrap);
    });
  };

  const renderPreview = () => {
    const t = TABS[state.tab];
    previewBox.innerHTML = '';
    const v = { ...state.values };
    if (state.photo) v.photo_url = state.photo.url;
    previewBox.appendChild(t.preview(v));
  };

  /* ---------- Photo upload (resized in the browser before upload) ---------- */
  const imageField = () => `
    <div class="adm-image">
      <div class="adm-image-actions">
        <label class="btn btn-secondary adm-sm adm-file">Choose photo<input type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" data-file hidden></label>
        <button type="button" class="btn btn-ghost adm-sm adm-danger" data-photo-remove>Remove photo</button>
      </div>
      <small class="adm-hint" data-photo-status></small>
    </div>`;

  const MAX_EDGE = 1600;
  const toJpeg = (file) => new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, MAX_EDGE / Math.max(img.naturalWidth, img.naturalHeight));
      const c = document.createElement('canvas');
      c.width = Math.round(img.naturalWidth * scale);
      c.height = Math.round(img.naturalHeight * scale);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      c.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not process that photo.'))), 'image/jpeg', 0.85);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('That file couldn’t be read. Please use a JPG, PNG or WebP photo.')); };
    img.src = url;
  });

  const bindImage = (wrap) => {
    const status = wrap.querySelector('[data-photo-status]');
    const removeBtn = wrap.querySelector('[data-photo-remove]');
    const sync = () => {
      const has = !!(state.photo || state.values.photo_url);
      removeBtn.hidden = !has;
      status.textContent = state.photo ? `New photo ready (${Math.round(state.photo.blob.size / 1024)} KB). It uploads when you save.` : has ? 'Current photo shown in the preview.' : 'No photo yet. JPG, PNG or WebP, up to 20 MB.';
    };
    wrap.querySelector('[data-file]').addEventListener('change', async (e) => {
      const file = e.target.files[0];
      e.target.value = '';
      if (!file) return;
      if (file.size > 20 * 1024 * 1024) { toast('That photo is over 20 MB. Please choose a smaller one.', 'error'); return; }
      status.textContent = 'Processing photo…';
      try {
        const blob = await toJpeg(file);
        if (state.photo?.url) URL.revokeObjectURL(state.photo.url);
        state.photo = { blob, url: URL.createObjectURL(blob) };
        state.dirty = true;
        renderPreview();
      } catch (err) { fail(err); }
      sync();
    });
    removeBtn.addEventListener('click', () => {
      if (state.photo?.url) URL.revokeObjectURL(state.photo.url);
      state.photo = null;
      state.values.photo_url = null;
      state.dirty = true;
      renderPreview();
      sync();
    });
    sync();
  };

  /* ---------- Save ---------- */
  const COLUMNS = {
    passes: ['name', 'passed_on', 'message', 'photo_url', 'photo_path', 'photo_focus'],
    reviews: ['name', 'reviewed_on', 'quote'],
    prices: ['name', 'duration', 'price', 'unit', 'note', 'features', 'featured', 'featured_label'],
    areas: ['name'],
  };

  const validate = () => {
    const t = TABS[state.tab];
    for (const f of t.fields) {
      const v = state.values[f.key];
      if (f.required && (v === '' || v == null || (typeof v === 'string' && !v.trim()))) return `Please fill in “${f.label}”.`;
      if (f.type === 'number' && v !== '' && (!Number.isInteger(v) || v < f.min || v > f.max)) return `“${f.label}” must be a whole number.`;
      if (f.maxLines && (v || []).length > f.maxLines) return `“${f.label}” can have at most ${f.maxLines} lines.`;
    }
    if (state.tab === 'areas') {
      const n = state.values.name.trim().toLowerCase();
      if (state.rows.some((r) => r !== state.editing && r.name.toLowerCase() === n)) return 'That suburb is already on the list.';
    }
    return '';
  };

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    if (state.busy) return;
    const problem = validate();
    if (problem) { toast(problem, 'error'); return; }
    const t = TABS[state.tab];
    const btn = $('[data-save]');
    const label = btn.textContent;
    state.busy = true; btn.disabled = true; btn.textContent = 'Saving…';
    const oldPath = state.editing?.photo_path || null;
    let uploadedPath = null;
    try {
      const v = state.values;
      if (state.tab === 'passes') {
        if (state.photo) {
          uploadedPath = `passes/${crypto.randomUUID()}.jpg`;
          const up = await sb.storage.from(BUCKET).upload(uploadedPath, state.photo.blob, { contentType: 'image/jpeg', cacheControl: '31536000' });
          if (up.error) throw up.error;
          v.photo_url = sb.storage.from(BUCKET).getPublicUrl(uploadedPath).data.publicUrl;
          v.photo_path = uploadedPath;
        } else if (!v.photo_url) {
          v.photo_path = null;
        }
      }
      const payload = {};
      COLUMNS[state.tab].forEach((c) => { payload[c] = typeof v[c] === 'string' ? v[c].trim() : v[c]; });
      if (state.tab === 'passes') payload.message = v.message.trim();
      if (t.sortable && !state.editing) payload.sort_order = Math.max(0, ...state.rows.map((r) => r.sort_order || 0)) + 1;
      const res = state.editing
        ? await sb.from(t.table).update(payload).eq('id', state.editing.id).select().single()
        : await sb.from(t.table).insert(payload).select().single();
      if (res.error) throw res.error;
      // Clean up a replaced or removed photo.
      if (oldPath && oldPath !== payload.photo_path) await sb.storage.from(BUCKET).remove([oldPath]);
      toast(state.editing ? 'Saved. The website is updated.' : `Added ${t.noun}. The website is updated.`);
      closeEditor(true);
      load();
    } catch (e) {
      if (uploadedPath) await sb.storage.from(BUCKET).remove([uploadedPath]);
      fail(e);
    } finally {
      state.busy = false; btn.disabled = false; btn.textContent = label;
    }
  });
})();
