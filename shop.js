/* ============================================================
   SOLD ANYWAY — shop

   Catalog, cart and checkout. Talks to the Fourthwall Storefront
   API when configured; falls back to CONFIG.pieces in preview.

   Fourthwall hosts the checkout — card details are entered on
   their page, never here. This file never sees a payment.
   ============================================================ */

const API = 'https://storefront-api.fourthwall.com/v1';
const STORE_KEY = 'irregular.cart.v1';

const Shop = (() => {

  let catalog = [];
  let realCatalog = false;   // true only when products came from Fourthwall
  let cart = load();

  /* --- persistence ------------------------------------------ */
  function load(){
    try {
      const raw = localStorage.getItem(STORE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  }

  function save(){
    try { localStorage.setItem(STORE_KEY, JSON.stringify(cart)); } catch {}
  }

  /* --- money ------------------------------------------------ */
  // Prices are held in minor units (6500 = €65.00) so nothing is
  // ever rounded in floating point.
  function money(minor, currency = CONFIG.currency){
    return new Intl.NumberFormat('en-IE', {
      style: 'currency', currency, minimumFractionDigits: 2
    }).format(minor / 100);
  }

  /* --- catalog ---------------------------------------------- */
  const live = () =>
    !CONFIG.previewMode && !!CONFIG.storefrontToken && !!CONFIG.collectionSlug;

  function fromPreview(){
    return CONFIG.pieces.map((p, i) => ({
      id: 'preview-' + i,
      name: p.name,
      line: p.line,
      available: false,
      images: [],
      variants: p.sizes.map(size => ({
        id: `preview-${i}-${size}`,
        size,
        colour: p.colour || 'Black',
        swatch: '#0f0f10',
        shots: [],
        price: p.price,
        currency: CONFIG.currency,
        inStock: true
      }))
    }));
  }

  // The line, the running order and the opening colourway all live in
  // CONFIG, not in Fourthwall. Fourthwall knows about price and stock.
  const entryFor = name => CONFIG.pieces.find(
    p => p.name.toLowerCase() === String(name).toLowerCase()
  );

  const lineFor = name => (entryFor(name) || {}).line || '';

  const defaultColour = name => (entryFor(name) || {}).colour || '';

  /* Where a piece sits on the page. Anything CONFIG has not heard of
     goes to the back rather than jumping the queue. */
  const orderOf = name => {
    const i = CONFIG.pieces.findIndex(
      p => p.name.toLowerCase() === String(name).toLowerCase()
    );
    return i < 0 ? CONFIG.pieces.length : i;
  };

  const inOrder = list =>
    list.slice().sort((a, b) => orderOf(a.name) - orderOf(b.name));

  // Fourthwall returns variant options as an attributes/options bag
  // whose exact key has changed before now. Look for a size-ish one
  // and fall back to the variant name rather than rendering blank.
  function sizeOf(variant){
    const bag = variant.attributes || variant.options || {};
    const key = Object.keys(bag).find(k => /size/i.test(k));
    if (key) {
      const v = bag[key];
      return typeof v === 'string' ? v : (v && (v.name || v.value)) || '';
    }
    return variant.name || 'One size';
  }

  const colourOf = v => {
    const c = (v.attributes || {}).color;
    return (typeof c === 'string' ? c : c && c.name) || '';
  };

  const swatchOf = v => {
    const c = (v.attributes || {}).color;
    return (c && c.swatch) || '#333';
  };

  async function fromFourthwall(){
    const url = `${API}/collections/${encodeURIComponent(CONFIG.collectionSlug)}`
              + `/products?storefront_token=${encodeURIComponent(CONFIG.storefrontToken)}`;

    // A hanging request must not hold the page hostage.
    const abort = new AbortController();
    const timer = setTimeout(() => abort.abort(), 8000);

    let data;
    try {
      const res = await fetch(url, { signal: abort.signal });
      if (!res.ok) throw new Error(`Fourthwall responded ${res.status}`);
      data = await res.json();
    } finally {
      clearTimeout(timer);
    }

    return inOrder((data.results || [])
      .filter(p => p.type !== 'BUNDLE')
      .map(p => ({
        id: p.id,
        name: p.name,
        line: lineFor(p.name),
        available: true,
        // Fourthwall returns the flat / ghost mockups first and the stock
        // model shots after them. The models are fixed per blank and none of
        // them match this brand, so the site shows flats only — index 0 —
        // until there are real photographs to replace them.
        images: (p.images || []).slice(0, CONFIG.mockupCount ?? 1)
                  .map(i => i.transformedUrl || i.url).filter(Boolean),
        // A product carries a variant per colour AND size, so the sizes
        // repeat once per colourway. Keep one button per size — the first
        // variant that offers it, preferring one in stock.
        variants: ((p.variants || []).map(v => ({
          id: v.id,
          size: sizeOf(v),
          price: Math.round((v.unitPrice?.value ?? 0) * 100),
          currency: v.unitPrice?.currency || CONFIG.currency,
          inStock: v.stock ? v.stock.type !== 'OUT_OF_STOCK' : true,
          colour: colourOf(v),
          swatch: swatchOf(v),
          // each colourway carries its own front and back shot
          shots: (v.images || []).map(i => i.transformedUrl || i.url).filter(Boolean)
        })))
      })));
  }

  /* Fills the catalog with the local pieces so the page can paint
     before any network call. init() upgrades it afterwards. */
  function seed(){
    catalog = fromPreview();
    return catalog;
  }

  async function init(){
    if (!live()) { catalog = fromPreview(); return catalog; }
    try {
      catalog = await fromFourthwall();
      realCatalog = catalog.length > 0;
      // A configured store with nothing published yet returns an empty
      // list. Show the pieces as unreleased rather than an empty page —
      // they flip to buyable on their own once products go live.
      if (!catalog.length) {
        console.info('[shop] store has no published products yet');
        catalog = fromPreview();
      }
    } catch (err) {
      // A dead store must not take the whole page down with it.
      console.error('[shop] falling back to preview:', err);
      catalog = fromPreview();
      realCatalog = false;
    }
    return catalog;
  }

  /* --- cart -------------------------------------------------- */
  const find = variantId => catalog
    .flatMap(p => p.variants.map(v => ({ product: p, variant: v })))
    .find(x => x.variant.id === variantId);

  function add(variantId, qty = 1){
    const hit = find(variantId);
    if (!hit) return false;

    const existing = cart.find(l => l.variantId === variantId);
    if (existing) existing.qty += qty;
    else cart.push({
      variantId,
      qty,
      name: hit.product.name,
      size: hit.variant.size,
      price: hit.variant.price,
      currency: hit.variant.currency
    });

    save();
    return true;
  }

  function setQty(variantId, qty){
    const line = cart.find(l => l.variantId === variantId);
    if (!line) return;
    line.qty = qty;
    if (line.qty < 1) cart = cart.filter(l => l.variantId !== variantId);
    save();
  }

  const remove = variantId => setQty(variantId, 0);
  const lines  = () => cart.slice();
  const count  = () => cart.reduce((n, l) => n + l.qty, 0);
  const total  = () => cart.reduce((n, l) => n + l.price * l.qty, 0);

  /* --- checkout ---------------------------------------------- */
  /* Creates a cart on Fourthwall, fills it, and hands the customer
     to their hosted checkout. Returns a redirect URL; the caller
     does the navigating so a failure can be shown in the UI. */
  async function checkout(){
    if (!cart.length) throw new Error('Your cart is empty.');

    if (!live()) {
      throw new Error(
        CONFIG.previewMode
          ? 'Preview mode — no store is connected, so nothing was charged.'
          : 'The shop is not connected yet.'
      );
    }
    if (!CONFIG.shopDomain) throw new Error('No checkout domain is configured.');

    const token = encodeURIComponent(CONFIG.storefrontToken);

    // The cart is created with its items in one call — POST /carts rejects a
    // body without `items`, and there is no separate step to add them to an
    // empty cart.
    const created = await fetch(`${API}/carts?storefront_token=${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cart.map(l => ({ variantId: l.variantId, quantity: l.qty }))
      })
    });
    if (!created.ok) throw new Error(`Could not open a cart (${created.status}).`);

    const { id } = await created.json();
    if (!id) throw new Error('Fourthwall did not return a cart id.');

    return `https://${CONFIG.shopDomain}/checkout/`
         + `?cartCurrency=${encodeURIComponent(CONFIG.currency)}`
         + `&cartId=${encodeURIComponent(id)}`;
  }

  function clear(){ cart = []; save(); }

  return {
    seed, init, checkout, add, setQty, remove, clear,
    isReal: () => realCatalog,
    lines, count, total, money, live, defaultColour,
    products: () => catalog
  };
})();
