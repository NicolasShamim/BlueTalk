/* Render each caption as a transparent 1440x1080 overlay.
   ffmpeg here has no drawtext, and rendering in the browser also lets the
   captions use a real face rather than whatever ffmpeg can find. */
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'fs';
const [spec, outDir] = process.argv.slice(2);
const d = JSON.parse(fs.readFileSync(spec, 'utf8'));
fs.mkdirSync(outDir, { recursive: true });

const page = txt => `<style>
 html,body{margin:0;background:transparent}
 .c{width:1440px;height:1080px;display:flex;align-items:flex-end;justify-content:center;
    padding:0 90px 130px;box-sizing:border-box}
 .t{font-family:'Liberation Sans','Arial',sans-serif;font-weight:700;font-size:52px;
    line-height:1.22;color:#fff;text-align:center;max-width:1120px;
    text-shadow:0 0 5px #000,0 0 5px #000,3px 3px 0 #000,-3px 3px 0 #000,3px -3px 0 #000,-3px -3px 0 #000;}
</style><div class="c"><div class="t">${txt.replace(/&/g,'&amp;').replace(/</g,'&lt;')}</div></div>`;

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 1080 } });
let n = 0;
for (const s of d.shots) {
  n++;
  const pad = String(n).padStart(2, '0');
  if (!s.caption) continue;
  await p.setContent(page(s.caption));
  await p.waitForTimeout(60);
  await p.screenshot({ path: `${outDir}/cap${pad}.png`, omitBackground: true });
  console.log(`  caption ${pad}`);
}
await b.close();
