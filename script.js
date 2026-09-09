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
    const img = (p.images && p.images[0]) || '';

    // Colours in the order Fourthwall lists them, black first if present.
    const colours = [];
    for (const v of variants) {
      if (!colours.some(c => c.name === v.colour)) {
        colours.push({ name: v.colour || '', swatch: v.swatch || '#333' });
      }
    }
    colours.sort((a, b) => (/black/i.test(b.name) ? 1 : 0) - (/black/i.test(a.name) ? 1 : 0));
    const first = colours[0] ? colours[0].name : '';

    const plate = img
      ? `<img src="${esc(img)}" alt="${esc(p.name)}" loading="lazy">`
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

  list.querySelectorAll('.buy').forEach(group => {
    wireSizes(group);

    group.querySelectorAll('.sw').forEach(sw => {
      sw.addEventListener('click', () => {
        const colour = sw.dataset.colour;
        group.querySelectorAll('.sw').forEach(s => s.setAttribute('aria-pressed', String(s === sw)));
        group.dataset.colour = colour;

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

/* --- waitlist -------------------------------------------------- */
function waitlist(){
  const form = $('#form'), input = $('#email'), msg = $('#msg');
  if (!form) return;

  const say = (text, state) => {
    msg.textContent = text;
    msg.className = 'msg' + (state ? ' ' + state : '');
  };
  const valid = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

  input.addEventListener('input', () => {
    input.classList.remove('err');
    if (msg.classList.contains('bad')) say('');
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const email = input.value.trim();

    if (!valid(email)) {
      input.classList.add('err');
      say('Check that address.', 'bad');
      input.focus();
      return;
    }
    if (!CONFIG.waitlistEndpoint) {
      say('The list is not open yet. Nothing was saved.', 'bad');
      return;
    }

    const btn = form.querySelector('button');
    btn.disabled = true;
    say('Adding…');

    try {
      const res = await fetch(CONFIG.waitlistEndpoint, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (!res.ok) throw new Error(res.status);
      form.reset();
      say('You are on the list.', 'good');
    } catch {
      say('That did not go through. Try again.', 'bad');
    } finally {
      btn.disabled = false;
    }
  });
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
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !$('#drawer').hidden) closeDrawer();
  });

  waitlist();

  // Paint the pieces straight away, then upgrade to the live catalog.
  // The page is never blank while a network call is in flight.
  Shop.seed();
  renderPieces();
  syncCart();

  await Shop.init();
  renderPieces();
  syncCart();
})();
