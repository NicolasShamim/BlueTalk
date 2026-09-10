/* ============================================================
   SOLD ANYWAY — page
   Reads CONFIG (config.js), drives Shop (shop.js).
   ============================================================ */

const $  = sel => document.querySelector(sel);
const esc = str => String(str).replace(/[&<>"']/g,
  c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));

/* --- pieces --------------------------------------------------- */
const chosen = new Map();   // productId -> variantId

function renderPieces(){
  const list = $('#piecesList');
  if (!list) return;

  const sellable = Shop.isReal() || CONFIG.previewMode;

  list.innerHTML = Shop.products().map((p, i) => {
    const variants = p.variants || [];
    const cheapest = variants.reduce((m, v) => (m === null || v.price < m ? v.price : m), null);

    // Colours in the order Fourthwall lists them, black first if present.
    const colours = [];
    for (const v of variants) {
      if (!colours.some(c => c.name === v.colour)) {
        colours.push({ name: v.colour || '', swatch: v.swatch || '#333' });
      }
    }
    colours.sort((a, b) => (/black/i.test(b.name) ? 1 : 0) - (/black/i.test(a.name) ? 1 : 0));
    const first = colours[0] ? colours[0].name : '';

    // The plate shows the colourway the swatch says is selected — the first
    // variant Fourthwall lists is a different colour, and showing that one
    // made the big view look like it had ignored the choice.
    const firstV = variants.find(v => (v.colour || '') === first) || variants[0] || {};
    const img = (firstV.shots && firstV.shots[0]) || (p.images && p.images[0]) || '';

    const plate = img
      ? `<img src="${esc(img)}" alt="${esc(p.name)}" loading="lazy" data-plate>`
      : `<span class="plate-wait">Not yet released</span>`;

    const price = sellable && cheapest !== null
      ? `<span class="p-price">${esc(Shop.money(cheapest))}</span>` : '';

    const swatches = (sellable && colours.length > 1) ? `
      <div class="colours" role="group" aria-label="Colour">
        ${colours.map((c, k) => `
          <button type="button" class="sw" data-colour="${esc(c.name)}"
                  aria-pressed="${k === 0}" title="${esc(c.name)}"
                  aria-label="${esc(c.name)}"><i style="background:${esc(c.swatch)}"></i></button>
        `).join('')}
        <span class="sw-name" data-swname>${esc(first)}</span>
      </div>` : '';

    const sizes = variants.filter(v => (v.colour || '') === first);
    const buy = sellable ? `
      <div class="buy" data-product="${esc(p.id)}" data-colour="${esc(first)}">
        ${swatches}
        <div class="sizes">
          ${sizes.map(v => `
            <button type="button" class="size" data-variant="${esc(v.id)}"
                    aria-pressed="false" ${v.inStock ? '' : 'disabled'}
                    aria-label="Size ${esc(v.size)}">${esc(v.size)}</button>`).join('')}
        </div>
        <div class="buyrow">
          <button type="button" class="add" data-product="${esc(p.id)}" disabled>Add</button>
          <span class="added" data-added="${esc(p.id)}"></span>
        </div>
      </div>` : '';

    return `
      <li class="piece">
        <div class="plate">${plate}<span class="p-n">${String(i + 1).padStart(2, '0')}</span></div>
        <div class="p-body">
          <div class="p-head"><h3 class="p-name">${esc(p.name)}</h3>${price}</div>
          <p class="p-line">${esc(p.line)}</p>
          ${buy}
        </div>
      </li>`;
  }).join('');

  const wireSizes = group => {
    group.querySelectorAll('.size').forEach(btn => {
      btn.addEventListener('click', () => {
        group.querySelectorAll('.size').forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
        chosen.set(group.dataset.product, btn.dataset.variant);
        group.querySelector('.add').disabled = false;
        group.querySelector('[data-added]').textContent = '';
      });
    });
  };

  list.querySelectorAll('.piece').forEach(li => {
    const plate = li.querySelector('.plate');
    if (!plate) return;
    if (li.querySelector('[data-plate]')) plate.style.cursor = 'zoom-in';
    plate.addEventListener('click', () => {
      const group = li.querySelector('.buy');
      const id = group ? group.dataset.product : null;
      const product = Shop.products().find(x => String(x.id) === String(id)) ||
                      Shop.products()[[...list.children].indexOf(li)];
      if (!product) return;
      const colour = group ? group.dataset.colour : '';
      const variant = (product.variants || []).find(v => (v.colour || '') === colour)
                   || (product.variants || [])[0];
      openViewer(product, variant);
    });
  });

  list.querySelectorAll('.buy').forEach(group => {
    wireSizes(group);

    group.querySelectorAll('.sw').forEach(sw => {
      sw.addEventListener('click', () => {
        const colour = sw.dataset.colour;
        group.querySelectorAll('.sw').forEach(s => s.setAttribute('aria-pressed', String(s === sw)));
        group.dataset.colour = colour;
        const label = group.querySelector('[data-swname]');
        if (label) label.textContent = colour;

        // Re-draw the sizes for this colour; the previous choice no longer applies.
        const product = Shop.products().find(x => String(x.id) === group.dataset.product);
        const forColour = (product.variants || []).filter(v => (v.colour || '') === colour);
        group.querySelector('.sizes').innerHTML = forColour.map(v => `
          <button type="button" class="size" data-variant="${esc(v.id)}"
                  aria-pressed="false" ${v.inStock ? '' : 'disabled'}
                  aria-label="Size ${esc(v.size)}">${esc(v.size)}</button>`).join('');
        chosen.delete(group.dataset.product);
        group.querySelector('.add').disabled = true;
        wireSizes(group);

        const plateImg = group.closest('.piece').querySelector('[data-plate]');
        const shot = forColour[0] && forColour[0].shots && forColour[0].shots[0];
        if (plateImg && shot) plateImg.src = shot;
      });
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

/* The heading counted five pieces whatever the shop actually held. */
function renderCount(){
  const el = document.getElementById('pieceCount');
  if (!el) return;
  const n = Shop.products().length;
  const word = ['No','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten'][n] || n;
  el.textContent = `${word} piece${n === 1 ? '' : 's'}`;
}

/* --- viewer: the piece glides to the middle, then turns around ----- */
function openViewer(product, variant){
  const v = document.getElementById('viewer');
  const front = document.getElementById('viewerFront');
  const back  = document.getElementById('viewerBack');
  const shots = (variant && variant.shots) || [];
  if (!shots.length) return;

  front.src = shots[0];
  back.src  = shots[1] || shots[0];
  document.getElementById('viewerName').textContent = product.name;
  document.getElementById('viewerLine').textContent = product.line || '';

  v.hidden = false; v.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => v.classList.add('open'));

  // it settles in the middle, then shows its back
  clearTimeout(openViewer._t);
  clearTimeout(openViewer._s);
  v.classList.remove('turned');
  sideLabel('');
  openViewer._s = setTimeout(() => sideLabel('front'), 520);
  if (shots[1]) openViewer._t = setTimeout(() => {
    v.classList.add('turned');
    sideLabel('back');
  }, 1900);
}

/* The word at the edge fades out before it changes, so 'front' never
   turns into 'back' mid-air. */
function sideLabel(text){
  const el = document.getElementById('viewerSide');
  if (!el) return;
  clearTimeout(sideLabel._t);
  el.classList.remove('in');
  if (!text) { el.textContent = ''; return; }
  sideLabel._t = setTimeout(() => {
    el.textContent = text;
    el.classList.add('in');
  }, el.textContent ? 260 : 0);
}

function closeViewer(){
  const v = document.getElementById('viewer');
  if (!v || v.hidden) return;
  clearTimeout(openViewer._t);
  clearTimeout(openViewer._s);
  sideLabel('');
  v.classList.remove('open', 'turned');
  document.body.style.overflow = '';
  setTimeout(() => { v.hidden = true; v.setAttribute('aria-hidden', 'true'); }, 420);
}

/* --- the rail ------------------------------------------------------ */
function renderRack(){
  const list = document.getElementById('rackList');
  if (!list) return;
  const items = Shop.products();
  list.innerHTML = items.map((p, i) => {
    const vs = p.variants || [];
    const v = vs.find(x => /black/i.test(x.colour || '')) || vs[0] || {};
    const shot = (v.shots && v.shots[0]) || (p.images && p.images[0]) || '';
    const tilt = [-5, 3.5, -2.5, 4.5, -3.5][i % 5];
    return `<li class="hang" style="--tilt:${tilt}deg">
      <span class="hook" aria-hidden="true"></span>
      ${shot ? `<img src="${esc(shot)}" alt="${esc(p.name)}" loading="lazy">`
             : `<span class="hang-wait">${esc(p.name)}</span>`}
      <span class="hang-name">${esc(p.name)}</span>
    </li>`;
  }).join('');

  // Hovering pushes the piece aside; letting go lets it swing itself still.
  list.querySelectorAll('.hang').forEach(hang => {
    hang.addEventListener('mouseenter', () => hang.classList.remove('swing'));
    hang.addEventListener('mouseleave', () => {
      hang.classList.remove('swing');
      void hang.offsetWidth;          // restart the animation from the top
      hang.classList.add('swing');
    });
    hang.addEventListener('animationend', () => hang.classList.remove('swing'));
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
  document.getElementById('viewerClose').addEventListener('click', closeViewer);
  document.getElementById('viewer').addEventListener('click', e => {
    if (e.target.id === 'viewer') closeViewer();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeViewer(); if (!$('#drawer').hidden) closeDrawer(); }
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
