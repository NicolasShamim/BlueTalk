/* ============================================================
   IRREGULAR — Room 12
   ============================================================ */

/* ------------------------------------------------------------
   WAITLIST ENDPOINT — set this before launch.
   Paste a form endpoint that accepts a POST (Formspree, Buttondown,
   Shopify customer form, etc.). While it is an empty string the form
   validates but deliberately does NOT claim anyone was added — it says
   the list is not open yet. Never fake a success state here; people
   would think they were on a list that does not exist.
   ------------------------------------------------------------ */
const FORM_ENDPOINT = '';

/* --- the six pieces ---------------------------------------- */
const WARDROBE = [
  {
    n: '01', name: 'The Issue Tee', role: 'Hero',
    desc: 'The state blank, heavyweight and boxy. Tag cut out, four stitches left in its place. The only thing anyone will actually notice is the thing nobody can see.',
    colours: ['#E9E4D9', '#9C978C']
  },
  {
    n: '02', name: 'Room 12 Overshirt', role: 'Signature',
    desc: 'Dry canvas chore coat, waxed over heat on the bench. Elbow patched from a garment that expired two winters ago. Pockets deep enough for tools.',
    colours: ['#2B2B28', '#4A4C3B']
  },
  {
    n: '03', name: 'The Liner', role: 'Layer',
    desc: 'Quilted vest, cut to sit under the overshirt without fighting it. Olive drab — the cheapest dye the Bureau ever commissioned, and still the best one.',
    colours: ['#4A4C3B']
  },
  {
    n: '04', name: 'Standard Trouser', role: 'Foundation',
    desc: 'Wide utility trouser, cropped short of the boot. Knee reinforced, because the issued version gives out in three washes and that is the design.',
    colours: ['#9C978C', '#2B2B28']
  },
  {
    n: '05', name: 'Watch Cap', role: 'Entry',
    desc: 'Ribbed, folded once. The stitch sits on the fold where it can be seen — the only piece where the mark is worn on the outside. He allows it.',
    colours: ['#E9E4D9', '#2B2B28']
  },
  {
    n: '06', name: 'Tool Roll', role: 'Accessory',
    desc: 'Canvas roll, six slots. Shears, chalk, unpicker, oil. Sold empty. What goes in it is your problem and, technically, your offence.',
    colours: ['#4A4C3B', '#9C978C']
  }
];

/* --- render wardrobe --------------------------------------- */
(function renderWardrobe(){
  const grid = document.getElementById('wardGrid');
  if (!grid) return;

  grid.innerHTML = WARDROBE.map(item => `
    <article class="ward-card">
      <div class="ward-plate"><span class="ward-num">${item.n}</span></div>
      <h3 class="ward-name">${item.name}</h3>
      <p class="ward-desc">${item.desc}</p>
      <div class="ward-foot">
        <span class="ward-role">${item.role}</span>
        <span class="swatches">${
          item.colours.map(c => `<span class="swatch" style="background:${c}"></span>`).join('')
        }</span>
      </div>
    </article>
  `).join('');
})();

/* --- notice bar -------------------------------------------- */
(function notice(){
  const bar = document.getElementById('notice');
  const close = document.getElementById('noticeClose');
  if (!bar || !close) return;
  close.addEventListener('click', () => bar.classList.add('is-hidden'));
})();

/* --- nav ---------------------------------------------------- */
(function nav(){
  const nav    = document.getElementById('nav');
  const toggle = document.getElementById('navToggle');
  const links  = document.getElementById('navLinks');
  const scrim  = document.getElementById('navScrim');
  if (!nav) return;

  const setMenu = open => {
    links.classList.toggle('is-open', open);
    scrim.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  };

  toggle?.addEventListener('click', () =>
    setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  scrim?.addEventListener('click', () => setMenu(false));
  links?.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') setMenu(false);
  });

  const onScroll = () => nav.classList.toggle('is-stuck', window.scrollY > 12);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();

/* --- reveal on scroll --------------------------------------- */
(function reveal(){
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  if (!('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('is-in'));
    return;
  }

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      obs.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

  items.forEach(el => io.observe(el));
})();

/* --- waitlist form ------------------------------------------ */
(function waitlist(){
  const form  = document.getElementById('listForm');
  const input = document.getElementById('email');
  const msg   = document.getElementById('formMsg');
  if (!form || !input || !msg) return;

  const say = (text, state) => {
    msg.textContent = text;
    msg.className = 'form-msg' + (state ? ' is-' + state : '');
  };

  const valid = value => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

  input.addEventListener('input', () => {
    input.classList.remove('has-error');
    if (msg.classList.contains('is-err')) say('');
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const email = input.value.trim();

    if (!valid(email)) {
      input.classList.add('has-error');
      say('That address will not reach anyone.', 'err');
      input.focus();
      return;
    }

    if (!FORM_ENDPOINT) {
      // Honest no-op: nothing is stored, so do not imply otherwise.
      say('The filing office is not open yet. Nothing was recorded.', 'err');
      return;
    }

    const button = form.querySelector('button');
    button.disabled = true;
    say('Filing…');

    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (!res.ok) throw new Error(res.status);
      form.reset();
      say('Filed. You will hear before anyone else.', 'ok');
    } catch {
      say('The line is down. Try again shortly.', 'err');
    } finally {
      button.disabled = false;
    }
  });
})();
