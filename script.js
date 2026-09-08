/* ============================================================
   IRREGULAR
   ============================================================ */

/* ------------------------------------------------------------
   WAITLIST ENDPOINT — set this before launch.
   Any URL that accepts a JSON POST (Fourthwall, Formspree,
   Buttondown…). While it is empty the form validates the address
   and then says plainly that nothing was saved. Never fake a
   success here: people would believe they were on a list that
   does not exist.
   ------------------------------------------------------------ */
const FORM_ENDPOINT = '';

/* --- the six pieces ----------------------------------------- */
const PIECES = [
  { name: 'Long Sleeve',   price: '€65', desc: 'Garment-dyed heavyweight cotton, boxy through the body. The line printed across the chest is the one the character says at the end of every video.' },
  { name: 'Heavyweight Tee', price: '€55', desc: 'Same body, same print, short sleeve. The cheapest way into the brand and the piece most people will start with.' },
  { name: 'Work Jacket',   price: '€145', desc: 'Dry canvas chore coat with deep chest pockets. Unprinted — this one is cut and colour only, and the collar stitch is the only marking.' },
  { name: 'Quilted Vest',  price: '€95', desc: 'Sits under the jacket without fighting it. Olive drab. Made for layering in autumn, which is when the first drop lands.' },
  { name: 'Utility Trouser', price: '€85', desc: 'Wide leg, cropped short of the boot, reinforced at the knee. Sized properly rather than in three vague bands.' },
  { name: 'Watch Cap',     price: '€30', desc: 'Ribbed, folded once, stitch on the fold. The one piece where the marking is visible from the outside.' }
];

/* --- render pieces ------------------------------------------ */
(function pieces(){
  const grid = document.getElementById('grid');
  if (!grid) return;

  grid.innerHTML = PIECES.map(p => `
    <article class="card">
      <div class="thumb"><span>Photography pending</span></div>
      <div class="card-body">
        <h3>${p.name}</h3>
        <p>${p.desc}</p>
        <div class="card-foot">
          <span class="price">${p.price}</span>
          <span class="stock">Not yet released</span>
        </div>
      </div>
    </article>
  `).join('');
})();

/* --- nav ----------------------------------------------------- */
(function nav(){
  const nav    = document.getElementById('nav');
  const toggle = document.getElementById('navToggle');
  const links  = document.getElementById('navLinks');
  const scrim  = document.getElementById('scrim');
  if (!nav) return;

  const setMenu = open => {
    links.classList.toggle('open', open);
    scrim.classList.toggle('open', open);
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

  const onScroll = () => nav.classList.toggle('stuck', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();

/* --- waitlist ------------------------------------------------ */
(function join(){
  const form  = document.getElementById('form');
  const input = document.getElementById('email');
  const msg   = document.getElementById('msg');
  if (!form || !input || !msg) return;

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
      say('That address does not look right. Check it and try again.', 'bad');
      input.focus();
      return;
    }

    if (!FORM_ENDPOINT) {
      say('The list is not open yet, so nothing was saved. Check back shortly.', 'bad');
      return;
    }

    const button = form.querySelector('button');
    button.disabled = true;
    say('Adding you…');

    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (!res.ok) throw new Error(res.status);
      form.reset();
      say('You are on the list. We will email you once, when it drops.', 'good');
    } catch {
      say('That did not go through. Try again in a moment.', 'bad');
    } finally {
      button.disabled = false;
    }
  });
})();
