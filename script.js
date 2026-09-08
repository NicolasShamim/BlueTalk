/* ============================================================
   IRREGULAR — page
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

  const sellable = Shop.live() || CONFIG.previewMode;

  list.innerHTML = Shop.products().map((p, i) => {
    const variants = p.variants || [];
    const cheapest = variants.reduce(
      (min, v) => (min === null || v.price < min ? v.price : min), null);

    const right = sellable && cheapest !== null
      ? `<span class="price">${esc(Shop.money(cheapest))}</span>`
      : `<span class="state">Unreleased</span>`;

    const buy = sellable ? `
      <div class="buy" data-product="${esc(p.id)}">
        ${variants.map(v => `
          <button type="button" class="size" data-variant="${esc(v.id)}"
                  aria-pressed="false" ${v.inStock ? '' : 'disabled'}
                  aria-label="Size ${esc(v.size)}">${esc(v.size)}</button>
        `).join('')}
        <button type="button" class="add" data-product="${esc(p.id)}" disabled>Add</button>
        <span class="added" data-added="${esc(p.id)}"></span>
      </div>` : '';

    return `
      <li>
        <span class="n">${String(i + 1).padStart(2, '0')}</span>
        <span class="name">${esc(p.name)}</span>
        ${right}
        <span class="note">${esc(p.line)}</span>
        ${buy}
      </li>`;
  }).join('');

  list.querySelectorAll('.size').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.closest('.buy');
      const productId = group.dataset.product;

      group.querySelectorAll('.size').forEach(b =>
        b.setAttribute('aria-pressed', String(b === btn)));

      chosen.set(productId, btn.dataset.variant);
      group.querySelector('.add').disabled = false;
      group.querySelector('[data-added]').textContent = '';
    });
  });

  list.querySelectorAll('.add').forEach(btn => {
    btn.addEventListener('click', () => {
      const productId = btn.dataset.product;
      const variantId = chosen.get(productId);
      if (!variantId) return;

      if (Shop.add(variantId)) {
        syncCart();
        const flag = btn.parentElement.querySelector('[data-added]');
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
  $('#cartBtn').hidden = !(Shop.live() || CONFIG.previewMode);
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

  await Shop.init();
  renderPieces();
  syncCart();
})();
