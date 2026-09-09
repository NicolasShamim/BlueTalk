/* ============================================================
   SOLD ANYWAY — build print artwork from the character plates

     node tools/build-artwork.js

   Reads  character/neutral.png and character/grin.png
   Writes artwork/print/*.png  (print files)
          channel/avatar.png   (the grin, inside the stamp)

   The portrait is the graphic; the line is its caption. See
   artwork/README.md for why.
   ============================================================ */

const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');

const b64 = p => fs.readFileSync(p).toString('base64');
const FONTS = JSON.parse(fs.readFileSync(path.join(__dirname, 'fonts.json'), 'utf8'));

const NEUTRAL = process.env.PORTRAIT || path.join(ROOT, 'character/neutral.png');
const GRIN    = process.env.GRIN     || path.join(ROOT, 'character/grin.png');

const face = `
 @font-face{font-family:'CG';font-style:italic;font-weight:400;src:url(data:font/woff2;base64,${FONTS.italic}) format('woff2');}
 @font-face{font-family:'JB';font-weight:400;src:url(data:font/woff2;base64,${FONTS.mono}) format('woff2');}
 html,body{margin:0;background:transparent}`;

/* The portrait sits in a nebula bloom and dissolves at its edges, so it
   reads as printed artwork rather than a photograph stuck on cotton. */
const print = (W, H, img, line, lot, batch, reason, s) => `<style>${face}
 .c{width:${W}px;height:${H}px;box-sizing:border-box;position:relative;
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    padding:0 ${Math.round(W*.005)}px;color:#E9E6DE;overflow:hidden}
  .lot{font-family:'JB',monospace;font-size:${38*s}px;letter-spacing:.44em;
      opacity:.45;margin-bottom:${Math.round(H*.022)}px}
 .frame{position:relative;width:${Math.round(W*.92)}px;aspect-ratio:1;
   border-radius:50%;overflow:hidden;box-shadow:0 0 0 ${Math.max(3,Math.round(7*s))}px #E9E6DE;}
 .bloom{position:absolute;inset:0;
   background:
     radial-gradient(42% 40% at 32% 30%, rgba(244,112,58,.60), transparent 68%),
     radial-gradient(40% 40% at 70% 34%, rgba(232,68,111,.52), transparent 70%),
     radial-gradient(46% 44% at 52% 72%, rgba(122,82,216,.52), transparent 72%);
   filter:blur(${Math.round(30*s)}px);opacity:.85;mix-blend-mode:screen;}
 .port{position:absolute;inset:0;background:url('data:image/png;base64,${img}') center/cover no-repeat;
   filter:contrast(1.20) saturate(.62) brightness(1.02);
   background-size:150%;background-position:50% 22%;}
 .grain{position:absolute;inset:0;opacity:.12;mix-blend-mode:overlay;
   background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");}
 .line{font-family:'CG',serif;font-style:italic;font-size:${132*s}px;line-height:1.16;
   text-align:center;margin-top:${Math.round(H*.026)}px;max-width:${Math.round(W*.90)}px}
 .rule{width:${Math.round(W*.22)}px;height:${Math.max(2,Math.round(2.4*s))}px;background:#E9E6DE;
   opacity:.34;margin:${Math.round(H*.026)}px 0 ${Math.round(H*.018)}px}
 .rec{font-family:'JB',monospace;font-size:${34*s}px;letter-spacing:.40em;opacity:.60}
 .rec2{font-family:'JB',monospace;font-size:${25*s}px;letter-spacing:.32em;opacity:.38;
   margin-top:${Math.round(H*.010)}px}
</style>
<div class="c">
  <div class="lot">${lot}</div>
  <div class="frame"><div class="bloom"></div><div class="port"></div><div class="grain"></div></div>
  <div class="line">${line}</div>
  <div class="rule"></div>
  <div class="rec">${batch}</div>
  <div class="rec2">${reason}</div>
</div>`;

/* The grin, cropped tight, inside the stamp that is already the mark. */
const avatar = img => `<style>${face}
 .a{width:1024px;height:1024px;background:#05060A;display:flex;align-items:center;justify-content:center}
 .s{position:relative;width:660px;height:660px;transform:rotate(-5deg);
    border:20px solid #C4442D;overflow:hidden}
 .p{position:absolute;inset:0;
    background:url('data:image/png;base64,${img}') 50% 26%/205% no-repeat;
    filter:grayscale(.35) contrast(1.28) brightness(1.04);}
 .g{position:absolute;inset:0;
    background:radial-gradient(70% 60% at 50% 34%, transparent 42%, rgba(5,6,10,.72) 100%);}
</style><div class="a"><div class="s"><div class="p"></div><div class="g"></div></div></div>`;

const PIECES = [
 ['long-sleeve',    2250,2700,'They built me for a colder year','LOT 12 — INSPECTED 06:00','BATCH 0040 / FAIL','PASSED TO THE FLOOR IN ERROR',1.0],
 ['heavyweight-tee',2250,2700,'I am the last one in this colour','LOT 04 — DYE RUN 40 MIN','BATCH 0117 / FAIL','SHADE OUTSIDE TOLERANCE',1.0],
 ['hoodie',         2250,2700,'Made for a place that closed','LOT 07 — ORDER UNCOLLECTED','BATCH 0083 / FAIL','CONSIGNEE NO LONGER TRADING',1.0],
 ['ribbed-tee',     2250,2700,'This was cut for someone taller','LOT 09 — GRADED TO SPEC','BATCH 0154 / FAIL','MEASURED LONG IN THE BODY',1.0],
 ['tote',           1500,1500,'It was heavier on the way back','LOT 02 — LOAD UNRATED','BATCH 0206 / FAIL','NOT WITHDRAWN',0.62],
];

(async () => {
  for (const f of [NEUTRAL, GRIN]) {
    if (!fs.existsSync(f)) { console.error(`missing: ${f}`); process.exit(1); }
  }
  const neutral = b64(NEUTRAL), grin = b64(GRIN);
  fs.mkdirSync(path.join(ROOT,'artwork/print'), { recursive:true });

  const br = await chromium.launch();
  for (const [slug,W,H,line,lot,batch,reason,s] of PIECES) {
    const p = await br.newPage({ viewport:{width:W,height:H} });
    await p.setContent(print(W,H,neutral,line,lot,batch,reason,s));
    await p.evaluate(()=>document.fonts.ready); await p.waitForTimeout(220);
    await p.screenshot({ path: path.join(ROOT,`artwork/print/${slug}.png`), omitBackground:true });
    await p.close(); console.log(`artwork/print/${slug}.png  ${W}x${H}`);
  }
  const p = await br.newPage({ viewport:{width:1024,height:1024} });
  await p.setContent(avatar(grin));
  await p.waitForTimeout(200);
  await p.screenshot({ path: path.join(ROOT,'channel/avatar.png') });
  await p.close(); console.log('channel/avatar.png  1024x1024');
  await br.close();
})();
