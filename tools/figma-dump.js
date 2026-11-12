// Dump a compact, human-readable spec of Figma nodes (positions relative to the dumped root).
// usage: node tools/figma-dump.js 1:180 [maxDepth]
const fs = require('fs');
const os = require('os');
const path = require('path');

const FILE_KEY = 'WKQfbiHqlnQvXMcN48rn6A';
const tokenFile = ['.figma_token', '.figma_token.txt'].map(f => path.join(os.homedir(), f)).find(fs.existsSync);
const TOKEN = fs.readFileSync(tokenFile, 'utf8').replace(/^﻿/, '').trim();
const cacheDir = path.join(__dirname, '.cache');

const hex = c => '#' + [c.r, c.g, c.b].map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('') + (c.a !== undefined && c.a < 1 ? '/' + +c.a.toFixed(2) : '');
const r = n => +(+n).toFixed(1);

function paint(p) {
  if (p.visible === false) return null;
  const op = p.opacity !== undefined && p.opacity < 1 ? ` op${r(p.opacity)}` : '';
  if (p.type === 'SOLID') return hex({ ...p.color, a: (p.color.a ?? 1) * (p.opacity ?? 1) });
  if (p.type.startsWith('GRADIENT')) return `${p.type.replace('GRADIENT_', 'grad-').toLowerCase()}(${p.gradientStops.map(s => hex(s.color) + ' ' + r(s.position * 100) + '%').join(', ')})${op}`;
  if (p.type === 'IMAGE') return `IMAGE(${p.scaleMode})${op}`;
  return p.type;
}

function line(n, ox, oy, depth) {
  const b = n.absoluteBoundingBox || { x: 0, y: 0, width: 0, height: 0 };
  const parts = [`${'  '.repeat(depth)}${n.type.toLowerCase()} ${n.id} "${n.name}"`, `[${r(b.x - ox)},${r(b.y - oy)} ${r(b.width)}x${r(b.height)}]`];
  if (n.visible === false) parts.push('HIDDEN');
  if (n.opacity !== undefined && n.opacity < 1) parts.push('opacity ' + r(n.opacity));
  if (n.rotation) parts.push('rot ' + r(n.rotation * 180 / Math.PI));
  const fills = (n.fills || []).map(paint).filter(Boolean);
  if (fills.length && n.type !== 'TEXT') parts.push('bg ' + fills.join(' + '));
  const strokes = (n.strokes || []).map(paint).filter(Boolean);
  if (strokes.length) parts.push(`stroke ${n.strokeWeight}${n.strokeAlign ? ' ' + n.strokeAlign.toLowerCase() : ''} ${strokes.join(',')}${n.strokeDashes ? ' dash ' + n.strokeDashes.join('/') : ''}`);
  if (n.cornerRadius) parts.push('radius ' + r(n.cornerRadius));
  if (n.rectangleCornerRadii) parts.push('radii ' + n.rectangleCornerRadii.map(r).join('/'));
  for (const e of n.effects || []) if (e.visible !== false)
    parts.push(`${e.type.toLowerCase()} ${e.offset ? r(e.offset.x) + ',' + r(e.offset.y) + ' ' : ''}${r(e.radius)}${e.spread ? ' sp' + r(e.spread) : ''}${e.color ? ' ' + hex(e.color) : ''}`);
  if (n.layoutMode && n.layoutMode !== 'NONE') parts.push(`auto-${n.layoutMode.toLowerCase()} gap ${n.itemSpacing || 0} pad ${n.paddingTop || 0}/${n.paddingRight || 0}/${n.paddingBottom || 0}/${n.paddingLeft || 0}`);
  if (n.clipsContent) parts.push('clip');
  if (n.type === 'TEXT') {
    const s = n.style || {};
    const tf = fills[0] || '';
    parts.push(`font ${s.fontFamily} ${s.fontWeight} ${r(s.fontSize)}/${s.lineHeightPx ? r(s.lineHeightPx) : 'auto'}${s.letterSpacing ? ' ls' + r(s.letterSpacing) : ''}${s.textAlignHorizontal && s.textAlignHorizontal !== 'LEFT' ? ' ' + s.textAlignHorizontal.toLowerCase() : ''}${s.textCase ? ' ' + s.textCase : ''}${s.textDecoration ? ' ' + s.textDecoration : ''} ${tf}`);
    // per-range style overrides (e.g. colored first line)
    let text = n.characters;
    if (n.characterStyleOverrides && n.characterStyleOverrides.some(Boolean)) {
      const tbl = n.styleOverrideTable || {};
      let out = '', cur = null;
      [...text].forEach((ch, i) => {
        const o = n.characterStyleOverrides[i] || 0;
        if (o !== cur) {
          if (cur) out += '}';
          if (o) { const st = tbl[o] || {}; const f = (st.fills || []).map(paint).filter(Boolean)[0]; out += `{${[f, st.fontWeight, st.fontSize, st.fontFamily].filter(Boolean).join(' ')}:`; }
          cur = o;
        }
        out += ch;
      });
      if (cur) out += '}';
      text = out;
    }
    parts.push('« ' + text.replace(/\n/g, ' ⏎ ') + ' »');
  }
  return parts.join(' ');
}

function walk(n, ox, oy, depth, max, out) {
  out.push(line(n, ox, oy, depth));
  if (depth >= max) { if (n.children?.length) out.push('  '.repeat(depth + 1) + `… ${n.children.length} children`); return; }
  // Skip deep internals of vector-ish groups: they are exported as assets anyway
  const vecOnly = n.children && n.children.length > 0 && n.children.every(c => ['VECTOR', 'BOOLEAN_OPERATION', 'STAR', 'LINE', 'REGULAR_POLYGON'].includes(c.type));
  if (vecOnly) { out.push('  '.repeat(depth + 1) + `… ${n.children.length} vectors`); return; }
  for (const c of n.children || []) walk(c, ox, oy, depth + 1, max, out);
}

(async () => {
  const id = process.argv[2].replace('-', ':');
  const max = +(process.argv[3] || 99);
  fs.mkdirSync(cacheDir, { recursive: true });
  const cf = path.join(cacheDir, id.replace(/[:;]/g, '_') + '.json');
  let doc;
  if (fs.existsSync(cf)) doc = JSON.parse(fs.readFileSync(cf, 'utf8'));
  else {
    const res = await fetch(`https://api.figma.com/v1/files/${FILE_KEY}/nodes?ids=${encodeURIComponent(id)}`, { headers: { 'X-Figma-Token': TOKEN } });
    if (!res.ok) throw new Error(res.status + ' ' + await res.text());
    doc = (await res.json()).nodes[id].document;
    fs.writeFileSync(cf, JSON.stringify(doc));
  }
  const b = doc.absoluteBoundingBox;
  const out = [];
  walk(doc, b.x, b.y, 0, max, out);
  console.log(out.join('\n'));
})().catch(e => { console.error(e.message); process.exit(1); });
