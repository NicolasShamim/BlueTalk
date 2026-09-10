/* ============================================================
   SOLD ANYWAY — page
   Reads CONFIG (config.js), drives Shop (shop.js).
   ============================================================ */

const $  = sel => document.querySelector(sel);
const esc = str => String(str).replace(/[&<>"']/g,
  c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

/* --- what has been chosen ------------------------------------- */
const chosen = new Map();   // productId -> variantId
const picked = new Map();   // productId -> colour name

const productById = id => Shop.products().find(p => String(p.id) === String(id));

/* Ids come from Fourthwall, so look them up by comparing datasets
   rather than building an attribute selector around them. */
const groupFor = id => [...document.querySelectorAll('.buy')]
  .find(g => g.dataset.product === String(id));
const hangFor  = id => [...document.querySelectorAll('.hang')]
  .find(h => h.dataset.product === String(id));

/* One entry per colourway, in the order Fourthwall lists them. */
function coloursOf(p){
  const out = [];
  for (const v of (p.variants || [])) {
    const name = v.colour || '';
    if (!out.some(c => c.name === name)) out.push({ name, swatch: v.swatch || '#333' });
  }
  return out;
}

/* The colourway a piece is wearing: what the visitor last chose, else
   the one named in CONFIG, else whatever Fourthwall happens to list
   first. One answer, used by the card, the rail and the viewer alike. */
function colourOf(p){
  const cols = coloursOf(p);
  if (!cols.length) return '';
  const held = picked.get(String(p.id));
  if (held && cols.some(c => c.name === held)) return held;
  const want = (Shop.defaultColour(p.name) || '').toLowerCase();
  const hit = want && cols.find(c => c.name.toLowerCase() === want);
  return hit ? hit.name : cols[0].name;
}

const variantsIn = (p, colour) =>
  (p.variants || []).filter(v => (v.colour || '') === colour);

/* Each colourway carries its own front and back shot. A colourway with
   no photographs of its own falls back to the product's. */
function shotsFor(p, colour){
  const v = variantsIn(p, colour)[0];
  const s = (v && v.shots) || [];
  return s.length ? s : (p.images || []);
}

const sizeButtons = variants => variants.map(v => `
  <button type="button" class="size" data-variant="${esc(v.id)}"
          aria-pressed="false" ${v.inStock ? '' : 'disabled'}
          aria-label="Size ${esc(v.size)}">${esc(v.size)}</button>`).join('');

function wireSizes(group){
  group.querySelectorAll('.size').forEach(btn => {
    btn.addEventListener('click', () => {
      group.querySelectorAll('.size').forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
      chosen.set(group.dataset.product, btn.dataset.variant);
      group.querySelector('.add').disabled = false;
      group.querySelector('[data-added]').textContent = '';
    });
  });
}

/* --- pieces --------------------------------------------------- */
function renderPieces(){
  const list = $('#piecesList');
  if (!list) return;

  const sellable = Shop.isReal() || CONFIG.previewMode;

  list.innerHTML = Shop.products().map((p, i) => {
    const variants = p.variants || [];
    const cheapest = variants.reduce((m, v) => (m === null || v.price < m ? v.price : m), null);

    const colours = coloursOf(p);
    const first = colourOf(p);

    // The plate shows the colourway the swatch says is selected — showing
    // whichever variant Fourthwall listed first made the big view look
    // like it had ignored the choice.
    const img = shotsFor(p, first)[0] || '';

    const plate = img
      ? `<img src="${esc(img)}" alt="${esc(p.name)}" loading="lazy" data-plate>`
      : `<span class="plate-wait">Not yet released</span>`;

    const price = sellable && cheapest !== null
      ? `<span class="p-price">${esc(Shop.money(cheapest))}</span>` : '';

    const swatches = (sellable && colours.length > 1) ? `
      <div class="colours" role="group" aria-label="Colour">
        ${colours.map(c => `
          <button type="button" class="sw" data-colour="${esc(c.name)}"
                  aria-pressed="${c.name === first}" title="${esc(c.name)}"
                  aria-label="${esc(c.name)}"><i style="background:${esc(c.swatch)}"></i></button>
        `).join('')}
        <span class="sw-name" data-swname>${esc(first)}</span>
      </div>` : '';

    const buy = sellable ? `
      <div class="buy" data-product="${esc(p.id)}" data-colour="${esc(first)}">
        ${swatches}
        <div class="sizes">${sizeButtons(variantsIn(p, first))}</div>
        <div class="buyrow">
          <button type="button" class="add" data-product="${esc(p.id)}" disabled>Add</button>
          <span class="added" data-added="${esc(p.id)}"></span>
        </div>
      </div>` : '';

    return `
      <li class="piece" data-product="${esc(p.id)}">
        <div class="plate">${plate}<span class="p-n">${String(i + 1).padStart(2, '0')}</span></div>
        <div class="p-body">
          <div class="p-head"><h3 class="p-name">${esc(p.name)}</h3>${price}</div>
          <p class="p-line">${esc(p.line)}</p>
          ${buy}
        </div>
      </li>`;
  }).join('');

  list.querySelectorAll('.piece').forEach(li => {
    const plate = li.querySelector('.plate');
    if (!plate || !li.querySelector('[data-plate]')) return;
    plate.classList.add('open-able');
    plate.addEventListener('click', () => {
      const p = productById(li.dataset.product);
      if (p) openViewer(p);
    });
  });

  list.querySelectorAll('.buy').forEach(group => {
    wireSizes(group);

    group.querySelectorAll('.sw').forEach(sw => {
      sw.addEventListener('click', () => selectColour(group.dataset.product, sw.dataset.colour));
    });

    group.querySelector('.add').addEventListener('click', () => {
      const variantId = chosen.get(group.dataset.product);
      if (variantId && Shop.add(variantId)) {
        syncCart();
        const flag = group.querySelector('[data-added]');
        flag.textContent = 'Added';
        setTimeout(() => { flag.textContent = ''; }, 2200);
      }
    });
  });
}

/* One colourway per piece, wherever the piece appears — the card, the
   plate, the rail and the viewer all read the same choice, so changing
   it in any of them changes it in all of them. */
function selectColour(id, colour){
  const p = productById(id);
  if (!p) return;
  picked.set(String(id), colour);

  const forColour = variantsIn(p, colour);
  const shot = shotsFor(p, colour)[0] || '';

  const group = groupFor(id);
  if (group) {
    group.dataset.colour = colour;
    group.querySelectorAll('.sw').forEach(s =>
      s.setAttribute('aria-pressed', String(s.dataset.colour === colour)));
    const label = group.querySelector('[data-swname]');
    if (label) label.textContent = colour;

    // Sizes belong to a colourway, so the previous choice no longer applies.
    group.querySelector('.sizes').innerHTML = sizeButtons(forColour);
    chosen.delete(String(id));
    group.querySelector('.add').disabled = true;
    group.querySelector('[data-added]').textContent = '';
    wireSizes(group);

    const plateImg = group.closest('.piece').querySelector('[data-plate]');
    if (plateImg && shot) plateImg.src = shot;
  }

  // The rail wears whatever the card is wearing.
  const hang = hangFor(id);
  const hangImg = hang && hang.querySelector('img');
  if (hangImg && shot) hangImg.src = shot;

  if (view.product && String(view.product.id) === String(id)) dressViewer(colour);
}

/* The heading counted five pieces whatever the shop actually held. */
function renderCount(){
  const el = document.getElementById('pieceCount');
  if (!el) return;
  const n = Shop.products().length;
  const word = ['No','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten'][n] || n;
  el.textContent = `${word} piece${n === 1 ? '' : 's'}`;
}

/* --- viewer: the piece glides in, and you can turn it and go close -- */
const view = { product:null, colour:'', face:'front', zoom:false, scale:2.6, touched:false };

function openViewer(product, colour){
  if (!product) return;
  const use = colour || colourOf(product);
  if (!shotsFor(product, use).length) return;

  view.product = product;
  view.touched = false;
  view.scale = 2.6;

  $('#viewerName').textContent = product.name;
  $('#viewerLine').textContent = product.line || '';
  renderViewerColours(product, use);
  setFace('front');
  dressViewer(use);
  setZoom(false, 50, 50);

  const v = $('#viewer');
  v.hidden = false; v.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => v.classList.add('open'));

  // It settles in the middle and shows you its back — unless you have
  // already taken the controls, in which case it stays where you put it.
  clearTimeout(openViewer._t);
  openViewer._t = setTimeout(() => {
    if (!view.touched && shotsFor(view.product, view.colour).length > 1) setFace('back');
  }, 1900);
}

/* Hangs a colourway in the viewer without disturbing the face you are
   looking at or how close you are standing. */
function dressViewer(colour){
  const p = view.product;
  if (!p) return;
  const shots = shotsFor(p, colour);
  view.colour = colour;

  if (shots.length) {
    $('#viewerFront').src = shots[0];
    $('#viewerBack').src  = shots[1] || shots[0];
  }

  const back = $('.face[data-face="back"]');
  back.disabled = shots.length < 2;
  if (back.disabled && view.face === 'back') setFace('front');

  document.querySelectorAll('#viewerColours .sw').forEach(s =>
    s.setAttribute('aria-pressed', String(s.dataset.colour === colour)));
  const name = $('#viewerColourName');
  if (name) name.textContent = colour;
}

function renderViewerColours(p, colour){
  const box = $('#viewerColours');
  const cols = coloursOf(p);
  if (cols.length < 2) { box.innerHTML = ''; box.hidden = true; return; }
  box.hidden = false;

  box.innerHTML = cols.map(c => `
    <button type="button" class="sw" data-colour="${esc(c.name)}"
            aria-pressed="${c.name === colour}" title="${esc(c.name)}"
            aria-label="${esc(c.name)}"><i style="background:${esc(c.swatch)}"></i></button>`).join('')
    + `<span class="sw-name" id="viewerColourName">${esc(colour)}</span>`;

  box.querySelectorAll('.sw').forEach(sw => {
    sw.addEventListener('click', () => {
      view.touched = true;
      selectColour(p.id, sw.dataset.colour);   // card, rail and viewer together
    });
  });
}

function setFace(face){
  view.face = face;
  $('#viewer').classList.toggle('turned', face === 'back');
  document.querySelectorAll('.face').forEach(b =>
    b.setAttribute('aria-pressed', String(b.dataset.face === face)));
}

/* --- zoom: the origin follows the pointer, so moving it pans ------- */
function setZoom(on, ox, oy){
  const lens = $('#viewerLens');
  view.zoom = !!on;
  if (ox != null) lens.style.setProperty('--ox', clamp(ox, 0, 100) + '%');
  if (oy != null) lens.style.setProperty('--oy', clamp(oy, 0, 100) + '%');
  lens.style.setProperty('--zs', view.scale);
  $('#viewer').classList.toggle('zoomed', view.zoom);

  const btn = $('#viewerZoom');
  btn.setAttribute('aria-pressed', String(view.zoom));
  btn.textContent = view.zoom ? 'Zoom out' : 'Zoom in';
}

function pointAt(e){
  const box = $('#viewerClip').getBoundingClientRect();
  const t = e.touches && e.touches[0] ? e.touches[0] : e;
  return [((t.clientX - box.left) / box.width) * 100,
          ((t.clientY - box.top)  / box.height) * 100];
}

function panZoom(e){
  if (!view.zoom) return;
  if (e.cancelable && e.touches) e.preventDefault();
  const [x, y] = pointAt(e);
  const lens = $('#viewerLens');
  lens.style.setProperty('--ox', clamp(x, 0, 100) + '%');
  lens.style.setProperty('--oy', clamp(y, 0, 100) + '%');
}

function wireViewer(){
  const clip = $('#viewerClip');

  clip.addEventListener('click', e => {
    view.touched = true;
    const [x, y] = pointAt(e);
    setZoom(!view.zoom, x, y);
  });
  clip.addEventListener('mousemove', panZoom);
  clip.addEventListener('touchstart', panZoom, { passive:false });
  clip.addEventListener('touchmove',  panZoom, { passive:false });

  // The wheel changes how close you are, not how far the page has scrolled.
  clip.addEventListener('wheel', e => {
    if (!view.zoom) return;
    e.preventDefault();
    view.scale = clamp(view.scale - Math.sign(e.deltaY) * 0.28, 1.4, 3.6);
    setZoom(true);
  }, { passive:false });

  document.querySelectorAll('.face').forEach(b => {
    b.addEventListener('click', () => { view.touched = true; setFace(b.dataset.face); });
  });

  $('#viewerZoom').addEventListener('click', () => {
    view.touched = true;
    setZoom(!view.zoom, 50, 50);
  });
}

function closeViewer(){
  const v = $('#viewer');
  if (!v || v.hidden) return;
  clearTimeout(openViewer._t);
  setZoom(false, 50, 50);
  v.classList.remove('open', 'turned');
  document.body.style.overflow = '';
  view.product = null;
  setTimeout(() => { v.hidden = true; v.setAttribute('aria-hidden', 'true'); }, 420);
}

/* --- the rail ------------------------------------------------------ */
function renderRack(){
  const list = document.getElementById('rackList');
  if (!list) return;

  list.innerHTML = Shop.products().map((p, i) => {
    const colour = colourOf(p);
    const shot = shotsFor(p, colour)[0] || '';
    const tilt = [-5, 3.5, -2.5, 4.5, -3.5][i % 5];
    return `<li class="hang" data-product="${esc(p.id)}" style="--tilt:${tilt}deg">
      <span class="hook" aria-hidden="true"></span>
      ${shot ? `<img src="${esc(shot)}" alt="${esc(p.name)}" loading="lazy">`
             : `<span class="hang-wait">${esc(p.name)}</span>`}
      <span class="hang-name">${esc(p.name)}</span>
    </li>`;
  }).join('');

  // Taking hold of it pulls it aside; letting go leaves it swinging.
  // Both are animations so the two halves of the gesture weigh the same.
  list.querySelectorAll('.hang').forEach(hang => {
    hang.addEventListener('mouseenter', () => {
      hang.classList.remove('swing', 'pull');
      void hang.offsetWidth;
      hang.classList.add('pull');
    });
    hang.addEventListener('mouseleave', () => {
      hang.classList.remove('swing', 'pull');
      void hang.offsetWidth;
      hang.classList.add('swing');
    });
    hang.addEventListener('animationend', e => {
      hang.classList.remove(e.animationName === 'pull' ? 'pull' : 'swing');
    });

    const img = hang.querySelector('img');
    if (!img) return;
    hang.classList.add('open-able');
    img.addEventListener('click', () => {
      const p = productById(hang.dataset.product);
      if (p) openViewer(p);
    });
  });
}

/* --- cart ----------------------------------------------------- */
function renderCart(){
  const body = $('#drawerBody');
  const lines = Shop.lines();

  body.innerHTML = lines.length ? lines.map(l => `
    <div class="cart-line">
      <span class="cart-line-name">${esc(l.name)}</span>
      <span class="cart-line-price">${esc(Shop.money(l.price * l.qty, l.currency))}</span>
      <span class="cart-line-size">${esc(l.size)}</span>
      <div class="qty">
        <button type="button" data-step="-1" data-id="${esc(l.variantId)}" aria-label="One fewer">&minus;</button>
        <span>${l.qty}</span>
        <button type="button" data-step="1" data-id="${esc(l.variantId)}" aria-label="One more">+</button>
      </div>
      <button type="button" class="drop" data-drop="${esc(l.variantId)}">Remove</button>
    </div>
  `).join('') : '<p class="drawer-empty">Nothing in the cart yet.</p>';

  body.querySelectorAll('[data-step]').forEach(b => {
    b.addEventListener('click', () => {
      const line = Shop.lines().find(l => l.variantId === b.dataset.id);
      if (line) { Shop.setQty(b.dataset.id, line.qty + Number(b.dataset.step)); syncCart(); }
    });
  });
  body.querySelectorAll('[data-drop]').forEach(b => {
    b.addEventListener('click', () => { Shop.remove(b.dataset.drop); syncCart(); });
  });

  $('#cartTotal').textContent = lines.length ? Shop.money(Shop.total()) : '—';
  $('#checkoutBtn').disabled = !lines.length;
}

function syncCart(){
  const n = Shop.count();
  $('#cartN').textContent = n;
  $('#cartBtn').hidden = !(Shop.isReal() || CONFIG.previewMode);
  renderCart();
}

/* --- drawer --------------------------------------------------- */
let lastFocus = null;

function openDrawer(){
  lastFocus = document.activeElement;
  $('#drawer').hidden = false;
  $('#drawerScrim').hidden = false;
  requestAnimationFrame(() => {
    $('#drawer').classList.add('open');
    $('#drawerScrim').classList.add('open');
  });
  document.body.style.overflow = 'hidden';
  $('#drawerClose').focus();
}

function closeDrawer(){
  const drawer = $('#drawer'), scrim = $('#drawerScrim');
  drawer.classList.remove('open');
  scrim.classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(() => { drawer.hidden = true; scrim.hidden = true; }, 300);
  $('#drawerMsg').textContent = '';
  lastFocus?.focus();
}

/* --- checkout -------------------------------------------------- */
async function goToCheckout(){
  const btn = $('#checkoutBtn');
  const msg = $('#drawerMsg');

  btn.disabled = true;
  msg.className = 'drawer-msg';
  msg.textContent = 'Opening checkout…';

  try {
    const url = await Shop.checkout();
    // Fourthwall takes it from here — payment happens on their page.
    window.location.href = url;
  } catch (err) {
    msg.className = 'drawer-msg bad';
    msg.textContent = err.message;
    btn.disabled = false;
  }
}

/* --- boot ------------------------------------------------------ */
(async function boot(){
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('stuck', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  $('#cartBtn').addEventListener('click', openDrawer);
  $('#drawerClose').addEventListener('click', closeDrawer);
  $('#drawerScrim').addEventListener('click', closeDrawer);
  $('#checkoutBtn').addEventListener('click', goToCheckout);
  $('#viewerClose').addEventListener('click', closeViewer);
  $('#viewer').addEventListener('click', e => {
    if (e.target.id === 'viewer') closeViewer();
  });
  wireViewer();

  document.addEventListener('keydown', e => {
    const viewerOpen = !$('#viewer').hidden;
    if (e.key === 'Escape') {
      // Step back out of the zoom first; the piece stays where it is.
      if (viewerOpen && view.zoom) setZoom(false, 50, 50);
      else if (viewerOpen) closeViewer();
      else if (!$('#drawer').hidden) closeDrawer();
      return;
    }
    if (viewerOpen && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      const back = $('.face[data-face="back"]');
      if (back.disabled) return;
      view.touched = true;
      setFace(view.face === 'front' ? 'back' : 'front');
    }
  });

  // Paint the pieces straight away, then upgrade to the live catalog.
  // The page is never blank while a network call is in flight.
  Shop.seed();
  renderPieces();
  renderRack();
  renderCount();
  syncCart();

  await Shop.init();
  renderPieces();
  renderRack();
  renderCount();
  syncCart();
})();
