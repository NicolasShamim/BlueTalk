/* ============================================================
   IRREGULAR
   ============================================================ */

/* ------------------------------------------------------------
   WAITLIST ENDPOINT — set before launch. Any URL that accepts a
   JSON POST. While empty the form validates the address and then
   says nothing was saved. Never fake a success: people would
   believe they were on a list that does not exist.
   ------------------------------------------------------------ */
const FORM_ENDPOINT = '';

/* Each piece carries its own line, and each line is the last thing
   said in the video that sells it. See brand/THE-LINE.md. */
const PIECES = [
  { name: 'Long Sleeve',      note: 'I failed inspection and shipped anyway' },
  { name: 'Heavyweight Tee',  note: 'They stopped making people like this' },
  { name: 'Work Jacket',      note: 'They built me for a colder year' },
  { name: 'Quilted Vest',     note: 'I am the last one in this colour' },
  { name: 'Utility Trouser',  note: 'Manufactured during a shortage' },
  { name: 'Watch Cap',        note: 'No print. The collar mark only.' }
];

(function pieces(){
  const list = document.getElementById('piecesList');
  if (!list) return;

  list.innerHTML = PIECES.map((p, i) => `
    <li>
      <span class="n">${String(i + 1).padStart(2, '0')}</span>
      <span class="name">${p.name}</span>
      <span class="state">Unreleased</span>
      <span class="note">${p.note}</span>
    </li>
  `).join('');
})();

(function nav(){
  const nav = document.getElementById('nav');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('stuck', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();

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
      say('Check that address.', 'bad');
      input.focus();
      return;
    }

    if (!FORM_ENDPOINT) {
      say('The list is not open yet. Nothing was saved.', 'bad');
      return;
    }

    const button = form.querySelector('button');
    button.disabled = true;
    say('Adding…');

    try {
      const res = await fetch(FORM_ENDPOINT, {
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
      button.disabled = false;
    }
  });
})();
