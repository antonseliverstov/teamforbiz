// Figma JSON -> HTML converter for TeamForBiz service pages.
// usage: node tools/fig2html.js tools/pages/<name>.json
// Config (JSON): {
//   "page": "1:1860", "out": "services.marketing", "active": "services",
//   "title": "...", "description": "...",
//   "sections": ["1:1872", ...] (order on page; omit to take all FRAME children sorted by y, except header/footer/app block),
//   "request": {...params for request2 partial...},
//   "answers": ["...", ...]  (FAQ answers in order of appearance),
//   "raster": ["id", ...] (force export as image), "skip": ["id", ...]
// }
// Text stays live HTML; subtrees without text that contain vectors/images are exported as images
// through the Figma REST API (tools/figma-export.js) into assets/img/p-<page>-<id>.(svg|png).
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const cfg = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const cacheFile = path.join(__dirname, '.cache', cfg.page.replace(/[:;]/g, '_') + '.json');
if (!fs.existsSync(cacheFile)) execFileSync('node', [path.join(__dirname, 'figma-dump.js'), cfg.page, '0'], { stdio: 'ignore' });
const page = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
const slug = cfg.out.replace(/\./g, '-');

const SERVICE_LINKS = {
  'Маркетинг': 'services/marketing/', 'Комплексный маркетинг': 'services/marketing/', 'SEO': 'services/seo/', 'SEO-продвижение': 'services/seo/',
  'Сайты и веб-сервисы': 'services/development/', 'Разработка': 'services/development/', 'Контекстная реклама': 'services/ppc/', 'Таргетированная реклама': 'services/target/',
  'SMM': 'services/smm/', 'Соцсети и контент': 'services/smm/', 'Реклама на картах': 'services/maps/', 'ПромоСтраницы': 'services/promopages/',
  'Управление репутацией бренда': 'services/serm/', 'Управление репутацией': 'services/serm/', 'SERM': 'services/serm/'
};

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const px = n => +(+n).toFixed(2) + 'px';
const rgba = (c, op = 1) => {
  const a = +((c.a ?? 1) * op).toFixed(3);
  const [r, g, b] = [c.r, c.g, c.b].map(v => Math.round(v * 255));
  return a >= 1 ? '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('') : `rgba(${r},${g},${b},${a})`;
};
const visibleFills = n => (n.fills || []).filter(f => f.visible !== false);
const isVectorType = t => ['VECTOR', 'BOOLEAN_OPERATION', 'STAR', 'LINE', 'REGULAR_POLYGON', 'ELLIPSE'].includes(t);

function hasText(n) { return n.type === 'TEXT' ? n.visible !== false : (n.children || []).some(c => c.visible !== false && hasText(c)); }
function hasGraphic(n) {
  if (n.visible === false) return false;
  if (visibleFills(n).some(f => f.type === 'IMAGE')) return true;
  if (['VECTOR', 'BOOLEAN_OPERATION', 'STAR', 'LINE', 'REGULAR_POLYGON'].includes(n.type)) return true;
  if (n.rotation && Math.abs(n.rotation) > 0.001) return true;
  if ((n.fills || []).some(f => f.visible !== false && f.type.startsWith('GRADIENT') && !['LINEAR'].includes(f.type.replace('GRADIENT_', '')))) return true;
  return (n.children || []).some(hasGraphic);
}
function hasRasterNeeds(n) { // png instead of svg
  if (n.visible === false) return false;
  if (visibleFills(n).some(f => f.type === 'IMAGE')) return true;
  if ((n.effects || []).some(e => e.visible !== false)) return true;
  return (n.children || []).some(hasRasterNeeds);
}

function gradient(f) {
  const [h0, h1] = f.gradientHandlePositions || [{ x: 0, y: .5 }, { x: 1, y: .5 }];
  const ang = Math.round(Math.atan2(h1.y - h0.y, h1.x - h0.x) * 180 / Math.PI + 90);
  return `linear-gradient(${ang}deg, ${f.gradientStops.map(s => rgba(s.color, f.opacity ?? 1) + ' ' + Math.round(s.position * 100) + '%').join(', ')})`;
}

function boxStyle(n) {
  const st = [];
  const fills = visibleFills(n);
  const bgs = fills.map(f => f.type === 'SOLID' ? rgba(f.color, f.opacity ?? 1) : f.type === 'GRADIENT_LINEAR' ? gradient(f) : null).filter(Boolean);
  if (bgs.length === 1 && !bgs[0].startsWith('linear')) st.push('background:' + bgs[0]);
  else if (bgs.length) st.push('background:' + bgs.map(b => b.startsWith('linear') ? b : `linear-gradient(${b},${b})`).reverse().join(','));
  const strokes = (n.strokes || []).filter(s => s.visible !== false && s.type === 'SOLID');
  const shadows = [];
  if (strokes.length && n.strokeWeight) {
    const c = rgba(strokes[0].color, strokes[0].opacity ?? 1);
    if (n.strokeAlign === 'OUTSIDE') shadows.push(`0 0 0 ${px(n.strokeWeight)} ${c}`);
    else st.push(`border:${px(n.strokeWeight)} ${n.strokeDashes ? 'dashed' : 'solid'} ${c}`);
  }
  if (n.type === 'ELLIPSE') st.push('border-radius:50%');
  else if (n.rectangleCornerRadii) st.push('border-radius:' + n.rectangleCornerRadii.map(px).join(' '));
  else if (n.cornerRadius) st.push('border-radius:' + px(n.cornerRadius));
  for (const e of n.effects || []) {
    if (e.visible === false) continue;
    if (e.type === 'DROP_SHADOW' || e.type === 'INNER_SHADOW')
      shadows.push(`${e.type === 'INNER_SHADOW' ? 'inset ' : ''}${px(e.offset.x)} ${px(e.offset.y)} ${px(e.radius)}${e.spread ? ' ' + px(e.spread) : ''} ${rgba(e.color)}`);
    if (e.type === 'BACKGROUND_BLUR') st.push(`backdrop-filter:blur(${px(e.radius / 2)})`);
    if (e.type === 'LAYER_BLUR') st.push(`filter:blur(${px(e.radius / 2)})`);
  }
  if (shadows.length) st.push('box-shadow:' + shadows.join(','));
  if (n.opacity !== undefined && n.opacity < 1) st.push('opacity:' + +n.opacity.toFixed(2));
  if (n.clipsContent) st.push('overflow:hidden');
  return st;
}

function fontFamily(f) { return /unbounded/i.test(f) ? "var(--font-logo)" : 'var(--font)'; }

function textStyle(s, fills) {
  const st = [`font-family:${fontFamily(s.fontFamily)}`, `font-weight:${s.fontWeight}`, `font-size:${px(s.fontSize)}`,
    `line-height:${s.lineHeightPx ? px(s.lineHeightPx) : 'normal'}`];
  if (s.letterSpacing) st.push('letter-spacing:' + px(s.letterSpacing));
  const f = (fills || []).find(x => x.visible !== false && x.type === 'SOLID');
  if (f) st.push('color:' + rgba(f.color, f.opacity ?? 1));
  if (s.textAlignHorizontal === 'CENTER') st.push('text-align:center');
  if (s.textAlignHorizontal === 'RIGHT') st.push('text-align:right');
  if (s.textCase === 'UPPER') st.push('text-transform:uppercase');
  if (s.textDecoration === 'UNDERLINE') st.push('text-decoration:underline');
  if (s.italic) st.push('font-style:italic');
  return st;
}

function textHTML(n) {
  const chars = n.characters;
  const ov = n.characterStyleOverrides || [];
  const tbl = n.styleOverrideTable || {};
  let out = '', cur = null, buf = '';
  const flush = () => {
    if (!buf) return;
    const t = esc(buf).replace(/\n/g, '<br> ');
    if (cur) {
      const o = tbl[cur] || {};
      const st = [];
      const f = (o.fills || []).find(x => x.visible !== false && x.type === 'SOLID');
      if (f) st.push('color:' + rgba(f.color, f.opacity ?? 1));
      if (o.fontWeight && o.fontWeight !== n.style.fontWeight) st.push('font-weight:' + o.fontWeight);
      if (o.fontSize && o.fontSize !== n.style.fontSize) st.push('font-size:' + px(o.fontSize));
      if (o.textDecoration === 'UNDERLINE') st.push('text-decoration:underline');
      out += st.length ? `<span style="${st.join(';')}">${t}</span>` : t;
    } else out += t;
    buf = '';
  };
  [...chars].forEach((ch, i) => {
    const o = ov[i] || 0;
    if (o !== cur) { flush(); cur = o || null; }
    buf += ch;
  });
  flush();
  return out.replace(/ {2,}/g, m => '&nbsp;'.repeat(m.length - 1) + ' ');
}

// ---------------- image export queue ----------------
const exportsList = []; // {name, id, fmt}
const imgSlots = [];
function imgName(n, fmt) { return `p-${slug}-${n.id.replace(/[:;]/g, '-')}.${fmt}`; }

// position of node render relative to parent box; returns style for img
function imgBox(n, parentBox) {
  const b = n.absoluteBoundingBox, r = n.absoluteRenderBounds || b;
  return { b, r, left: r.x - parentBox.x, top: r.y - parentBox.y, w: r.width, h: r.height };
}

let faqIndex = 0;
const answers = cfg.answers || [];

function classify(n) {
  const name = n.name || '';
  if (/^Вопрос\s*\/|^FAQ\s*\/|^Вопрос \d/.test(name) && n.type !== 'TEXT' && hasText(n)) return 'faq';
  if (/^Направление\s*\//.test(name) && hasText(n)) return 'dir';
  if (/Кнопка|Button|CTA|Ссылка на|^Пакет.*Кнопка/i.test(name) && hasText(n) && n.type !== 'TEXT') return 'btn';
  return null;
}

function firstText(n) { if (n.type === 'TEXT') return n; for (const c of n.children || []) { const t = firstText(c); if (t) return t; } return null; }

function linkFor(text) {
  const t = text.trim();
  if (/все кейсы|читать кейс|смотреть кейс/i.test(t)) return '{{root}}cases/';
  if (/пакет|цены/i.test(t) && /смотреть|пакеты|цены/i.test(t) && !/обсудить|взять/i.test(t)) return '#prices';
  return '#request';
}

// main renderer: returns html string for node n placed relative to parent box pb
function render(n, pb, depth, ctx) {
  if (n.visible === false || (cfg.skip || []).includes(n.id)) return '';
  const b = n.absoluteBoundingBox;
  if (!b) return '';
  const left = b.x - pb.x, top = b.y - pb.y;
  const cls = depth === 1 ? 'fx' : 'fy';
  const pos = `left:${px(left)};top:${px(top)}`;

  // background pixel words
  if (/^Background word/.test(n.name) || /Background word v2/.test(n.name)) {
    const fmt = 'svg'; const name = imgName(n, fmt); exportsList.push({ name, id: n.id });
    const op = n.opacity !== undefined && n.opacity < 1 ? n.opacity : 0.72;
    return `<img class="bgword" src="{{root}}assets/img/${name}" alt="" style="${pos};height:${px(b.height)};opacity:${+op.toFixed(2)}">\n`;
  }

  if (cfg.inject && cfg.inject[n.id]) {
    const html = fs.readFileSync(path.join(ROOT, cfg.inject[n.id]), 'utf8');
    return `<div class="${cls} fxinject" style="${pos};width:${px(b.width)};height:${px(b.height)}">${html}</div>
`;
  }

  // graphics without text -> image
  if (n.type !== 'TEXT' && ((cfg.raster || []).includes(n.id) || (!hasText(n) && hasGraphic(n)))) {
    const fmt = hasRasterNeeds(n) ? 'png' : 'svg';
    const name = imgName(n, fmt);
    exportsList.push({ name, id: n.id, fmt });
    const r = n.absoluteRenderBounds || b;
    const k = imgSlots.length;
    imgSlots.push({ name, l: r.x - pb.x, t: r.y - pb.y, r: r.x + r.width - pb.x, btm: r.y + r.height - pb.y, bl: b.x - pb.x, bt: b.y - pb.y, bw: b.width, bh: b.height, rw: r.width, rh: r.height, fmt });
    const big = b.width >= 380 ? ' fxi-big' : '';
    return `<img class="${cls === 'fx' ? 'deco fxi' : 'fyi'}${big}" src="{{root}}assets/img/${name}" alt="" style="__IMG_${k}__" loading="lazy">\n`;
  }

  if (n.type === 'TEXT') {
    // web Onest renders ~1-3% wider than Figma: give text boxes a little slack so line breaks match the design
    const extra = Math.min(b.width * 0.04, 40);
    const al = n.style.textAlignHorizontal;
    const tl = al === 'RIGHT' ? left - extra : al === 'CENTER' ? left - extra / 2 : left;
    const st = [`left:${px(tl)};top:${px(top)}`, ...textStyle(n.style, n.fills)];
    if (n.style.textAutoResize === 'WIDTH_AND_HEIGHT') st.push('white-space:nowrap'); else st.push('width:' + px(b.width + extra));
    if (n.opacity !== undefined && n.opacity < 1) st.push('opacity:' + n.opacity.toFixed(2));
    const fs_ = n.style.fontSize;
    const tag = ctx.h1Done || fs_ < 40 ? (fs_ >= 22 && n.style.fontWeight >= 700 ? 'h3' : 'p') : (depth === 1 && !ctx.sectionIsHero ? 'h2' : 'h1');
    if (tag === 'h1') ctx.h1Done = true;
    const sizeCls = fs_ >= 40 ? ' fx-xl' : fs_ >= 26 ? ' fx-l' : fs_ >= 20 ? ' fx-m' : '';
    if (/^Вкладка\s*\//.test(n.name)) {
      ctx.tab = (ctx.tab ?? -1) + 1;
      return `<button type="button" class="${cls} fxtab${ctx.tab === 0 ? ' is-active' : ''}" data-tab="${ctx.tab}" style="${st.join(';')}">${textHTML(n)}</button>
`;
    }
    const role = { 'Название формата': ' js-tab-title', 'Описание формата': ' js-tab-desc' }[n.name] || '';
    if (role) return `<p class="${cls}${role}" style="${st.join(';')}">${textHTML(n)}</p>
`;
    if (/^(Все кейсы|Читать кейс|Смотреть все кейсы|Все статьи)\s*→?$/i.test(n.characters.trim()))
      return `<a class="${cls} fxlink" href="{{root}}${/стать/i.test(n.characters) ? 'blog/' : 'cases/'}" style="${st.join(';')}">${textHTML(n)}</a>\n`;
    return `<${tag} class="${cls}${sizeCls}" style="${st.join(';')}">${textHTML(n)}</${tag}>\n`;
  }

  const kind = classify(n);
  const st = [pos, `width:${px(b.width)}`, `height:${px(b.height)}`, ...boxStyle(n)];

  if (kind === 'btn' || (kind === null && n.children && n.children.length === 1 && n.children[0].type === 'TEXT' && /Кнопка|Button/i.test(n.name))) {
    const t = firstText(n);
    const tst = textStyle(t.style, t.fills).filter(s => !s.startsWith('text-align'));
    return `<a class="${cls} fxbtn" href="${linkFor(t.characters)}" style="${st.join(';')};${tst.join(';')}">${textHTML(t)}</a>\n`;
  }
  if (kind === 'dir') {
    const t = firstText(n);
    const href = SERVICE_LINKS[t.characters.trim()] ? '{{root}}' + SERVICE_LINKS[t.characters.trim()] : '{{root}}services/';
    const inner = (n.children || []).map(c => render(c, b, depth + 1, ctx)).join('');
    return `<a class="${cls} fxdir" href="${href}" style="${st.join(';')}">${inner}<span class="fxdir__arrow" aria-hidden="true">→</span></a>\n`;
  }
  if (kind === 'faq') {
    const texts = [];
    (function collect(x) { if (x.visible === false) return; if (x.type === 'TEXT') texts.push(x); (x.children || []).forEach(collect); })(n);
    const ansNode = texts.find(t => /^Ответ/.test(t.name));
    const q = texts.find(t => t !== ansNode && t.characters.trim().length > 2) || texts[0];
    const plus = texts.find(t => /^[+＋−–-]$/.test(t.characters.trim()));
    const qst = textStyle(q.style, q.fills);
    const pst = plus ? textStyle(plus.style, plus.fills) : [];
    const qb = q.absoluteBoundingBox;
    const a = ansNode ? ansNode.characters : (answers[faqIndex] || '');
    faqIndex++;
    const openAttr = ansNode ? ' open' : '';
    const ast = ansNode ? textStyle(ansNode.style, ansNode.fills).join(';') : '';
    const boxSt = [pos, `width:${px(b.width)}`, `min-height:${px(b.height)}`, ...boxStyle(n).filter(s => !s.startsWith('overflow'))];
    return `<details class="${cls} fxq"${openAttr} style="${boxSt.join(';')}"><summary style="padding:${px(qb.y - b.y)} ${px(b.x + b.width - (plus ? plus.absoluteBoundingBox.x : b.x + b.width - 60))} ${px(Math.max(8, b.height - (qb.y - b.y) - (q.style.lineHeightPx || qb.height)))} ${px(qb.x - b.x)};${qst.join(';')}">${textHTML(q)}${plus ? `<span class="fxq__plus" aria-hidden="true" style="${pst.join(';')};right:${px(b.x + b.width - plus.absoluteBoundingBox.x - plus.absoluteBoundingBox.width)};top:${px(plus.absoluteBoundingBox.y - b.y)}"></span>` : ''}</summary><div class="fxq__a" style="padding:0 ${px(Math.max(24, b.x + b.width - qb.x - qb.width))} 24px ${px(qb.x - b.x)};${ast}">${esc(a)}</div></details>\n`;
  }

  // ordinary box
  const kids = (n.children || []).filter(c => c.visible !== false)
    .slice().sort((a, c) => (a.absoluteBoundingBox?.y ?? 0) - (c.absoluteBoundingBox?.y ?? 0) || (a.absoluteBoundingBox?.x ?? 0) - (c.absoluteBoundingBox?.x ?? 0));
  // keep paint order on desktop with z-index = original index
  const order = new Map((n.children || []).map((c, i) => [c.id, i]));
  const inner = kids.map(c => render(c, b, depth + 1, ctx).replace(/^<(\w+) /, (m, t) => m)).map((h, i) => h.replace(/style="/, `style="z-index:${order.get(kids[i].id)};`)).join('');
  const isCard = !!(boxStyle(n).length);
  const small = b.width <= 120 && b.height <= 120;
  return `<div class="${cls}${isCard ? ' fxcard' : ''}${small ? ' fs' : ''}" style="${st.join(';')};--w:${px(b.width)};--h:${px(b.height)}">\n${inner}</div>\n`;
}

// ---------------- page assembly ----------------
const frameKids = page.children.filter(c => c.visible !== false);
let sectionNodes = cfg.sections ? cfg.sections.map(id => frameKids.find(c => c.id === id)) :
  frameKids.filter(c => c.type === 'FRAME' && !/^Header|^Footer/.test(c.name) && !/Application block/.test(c.name));
sectionNodes = sectionNodes.filter(Boolean).sort((a, c) => a.absoluteBoundingBox.y - c.absoluteBoundingBox.y);
const pageBox = page.absoluteBoundingBox;

let html = '';
sectionNodes.forEach((s, si) => {
  let b = s.absoluteBoundingBox;
  const headerBottom = pageBox.y + 88;
  if (b.y < headerBottom - 1) b = { x: b.x, y: headerBottom, width: b.width, height: b.y + b.height - headerBottom };
  const ctx = { h1Done: si > 0, sectionIsHero: si === 0 };
  const isPrices = /Стоимость|Цены/i.test(s.name);
  const kids = (s.children || []).filter(c => c.visible !== false);
  const order = new Map(kids.map((c, i) => [c.id, i]));
  const sorted = kids.slice().sort((a, c) => a.absoluteBoundingBox.y - c.absoluteBoundingBox.y || a.absoluteBoundingBox.x - c.absoluteBoundingBox.x);
  let inner = sorted.map(c => render(c, b, 1, ctx).replace(/style="/, `style="z-index:${order.get(c.id)};`)).join('');
  // group consecutive FAQ items into a flowing list (so opened answers push the rest down)
  inner = inner.replace(/((?:<details class="fx fxq"[\s\S]*?<\/details>\n)+)/g, block => {
    const items = block.match(/<details[\s\S]*?<\/details>\n/g);
    const first = items[0].match(/left:([\d.]+)px;top:([\d.]+)px;width:([\d.]+)px/) || items[0].match(/z-index:\d+;left:([\d.]+)px;top:([\d.]+)px;width:([\d.]+)px/);
    const tops = items.map(it => +(it.match(/top:([\d.]+)px/) || [0, 0])[1]);
    const hs = items.map(it => +(it.match(/min-height:([\d.]+)px/) || [0, 0])[1]);
    const gap = tops.length > 1 ? tops[1] - tops[0] - hs[0] : 12;
    const lst = items.map(it => it.replace(/class="fx fxq"/, 'class="fxq"').replace(/z-index:\d+;left:[\d.]+px;top:[\d.]+px;|left:[\d.]+px;top:[\d.]+px;/, ''));
    return `<div class="fx fxq-list js-accordion" style="left:${first[1]}px;top:${first[2]}px;width:${first[3]}px;gap:${gap}px">\n${lst.join('')}</div>\n`;
  });
  const id = isPrices ? ' id="prices"' : /Кейс/i.test(s.name) ? ' id="case"' : /FAQ|Вопрос/i.test(s.name) ? ' id="faq"' : '';
  html += `<!-- ${esc(s.name)} -->\n<section class="section fxs"${id}>\n<div class="stage" style="height:${px(b.height)}">\n${inner}</div>\n</section>\n\n`;
});

const req = cfg.request ? `<!-- @include ${cfg.request.t1 ? 'request3' : 'request2'} ${JSON.stringify(cfg.request)} -->` : '';
const doc = `<!doctype html>
<html lang="ru">
<head>
<!-- @include head ${JSON.stringify({ title: cfg.title, description: cfg.description })} -->
</head>
<body>
<!-- @include header {"active":"${cfg.active || 'services'}"} -->
<main>

${html}${req}

</main>
<!-- @include footer -->
<!-- @include scripts -->
</body>
</html>
`;
// export images (only missing ones)
const need = exportsList.filter((e, i, a) => a.findIndex(x => x.name === e.name) === i)
  .filter(e => !fs.existsSync(path.join(ROOT, 'assets', 'img', e.name)) || fs.statSync(path.join(ROOT, 'assets', 'img', e.name)).size === 0);
for (let i = 0; i < need.length; i += 40) {
  const chunk = need.slice(i, i + 40).map(e => `${e.name}=${e.id}`);
  try { execFileSync('node', [path.join(__dirname, 'figma-export.js'), ...chunk], { stdio: 'inherit' }); }
  catch (e) { console.error('export failed for chunk', i); }
}
// place images using their real exported size (render bounds can be clipped by ancestors)
function natSize(file, fmt) {
  const buf = fs.readFileSync(file);
  if (fmt === 'png') return { w: buf.readUInt32BE(16) / 2, h: buf.readUInt32BE(20) / 2 };
  const m = buf.toString('utf8', 0, 300).match(/width="([\d.]+)" height="([\d.]+)"/);
  return m ? { w: +m[1], h: +m[2] } : null;
}
let final = doc.replace(/__IMG_(\d+)__/g, (_, k) => {
  const sl = imgSlots[+k];
  const f = path.join(ROOT, 'assets', 'img', sl.name);
  let w = sl.rw, h = sl.rh, l = sl.l, t = sl.t;
  const nat = fs.existsSync(f) && fs.statSync(f).size ? natSize(f, sl.fmt || (sl.name.endsWith('.png') ? 'png' : 'svg')) : null;
  if (nat) {
    // exported image is never clipped; render bounds may be clipped at the section edge
    if (nat.w > sl.rw + 1.5) l = sl.l <= 0.5 ? sl.r - nat.w : sl.l;
    if (nat.h > sl.rh + 1.5) t = sl.t <= 0.5 ? sl.btm - nat.h : sl.t;
    w = nat.w; h = nat.h;
  }
  return `left:${px(l)};top:${px(t)};width:${px(w)};height:${px(h)}`;
});
fs.writeFileSync(path.join(ROOT, 'src', 'pages', cfg.out + '.html'), final);
console.log(`page ${cfg.out}: ${sectionNodes.length} sections, ${exportsList.length} images (${need.length} downloaded)`);
