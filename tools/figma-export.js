// Export Figma nodes via the official REST API into assets/img.
// Token is read from ~/.figma_token(.txt) — never commit it.
// usage: node tools/figma-export.js name.svg=1:234 name.png=1:235@2 ...
//   extension picks the format (svg|png|jpg); @N sets the raster scale (default 2).
const fs = require('fs');
const os = require('os');
const path = require('path');

const FILE_KEY = 'WKQfbiHqlnQvXMcN48rn6A';
const out = process.env.OUT_DIR ? path.resolve(process.env.OUT_DIR) : path.resolve(__dirname, '..', 'assets', 'img');
const tokenFile = ['.figma_token', '.figma_token.txt'].map(f => path.join(os.homedir(), f)).find(fs.existsSync);
if (!tokenFile) throw new Error('No ~/.figma_token file');
const TOKEN = fs.readFileSync(tokenFile, 'utf8').replace(/^﻿/, '').trim();

async function api(url) {
  for (let i = 0; i < 5; i++) {
    const r = await fetch(url, { headers: { 'X-Figma-Token': TOKEN } });
    if (r.status === 429) { await new Promise(s => setTimeout(s, 5000 * (i + 1))); continue; }
    if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
    return r.json();
  }
  throw new Error('rate limited');
}

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const jobs = process.argv.slice(2).map(a => {
    const [name, spec] = a.split('=');
    const [id, scale] = spec.split('@');
    const fmt = path.extname(name).slice(1);
    return { name, id: id.replace('-', ':'), fmt, scale: scale || (fmt === 'svg' ? 1 : 2) };
  });
  // group by format+scale so each group is one API call
  const groups = {};
  for (const j of jobs) (groups[j.fmt + '@' + j.scale] ||= []).push(j);
  for (const [k, list] of Object.entries(groups)) {
    const [fmt, scale] = k.split('@');
    const ids = [...new Set(list.map(j => j.id))].join(',');
    const extra = fmt === 'svg' ? '&svg_outline_text=false&svg_include_id=false&svg_simplify_stroke=true' : '';
    const res = await api(`https://api.figma.com/v1/images/${FILE_KEY}?ids=${encodeURIComponent(ids)}&format=${fmt}&scale=${scale}${extra}`);
    for (const j of list) {
      const url = res.images[j.id];
      if (!url) { console.log('NO RENDER', j.name, j.id); continue; }
      const r = await fetch(url);
      if (!r.ok) { console.log('FAIL', j.name, r.status); continue; }
      const buf = Buffer.from(await r.arrayBuffer());
      fs.writeFileSync(path.join(out, j.name), buf);
      console.log('ok', j.name, buf.length);
    }
  }
})().catch(e => { console.error(e.message); process.exit(1); });
