// Print render-bounds offsets for nodes in a cached page dump: node tools/rb.js <pageId> <sectionId> id...
// Output: id  x,y (relative to section)  w x h  of the rendered (exported) image
const fs = require('fs'), path = require('path');
const [page, section, ...ids] = process.argv.slice(2);
const doc = JSON.parse(fs.readFileSync(path.join(__dirname, '.cache', page.replace(/[:;]/g, '_') + '.json'), 'utf8'));
const find = (n, id) => n.id === id ? n : (n.children || []).reduce((a, c) => a || find(c, id), null);
const sec = find(doc, section).absoluteBoundingBox;
for (const id of ids) {
  const n = find(doc, id);
  if (!n) { console.log(id, 'not found'); continue; }
  const r = n.absoluteRenderBounds || n.absoluteBoundingBox;
  console.log(id, `${+(r.x - sec.x).toFixed(1)},${+(r.y - sec.y).toFixed(1)}`, `${+r.width.toFixed(1)}x${+r.height.toFixed(1)}`);
}
