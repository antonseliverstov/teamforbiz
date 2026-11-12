// Simple static build: src/pages/*.html -> dist/*.html with partial includes.
// Syntax inside pages:  <!-- @include header {"active":"services"} -->
// Partials live in src/partials/<name>.html and may use {{key}} placeholders,
// plus {{active:<key>}} which becomes " is-active" when params.active === key.
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const src = path.join(root, 'src');
const dist = path.join(root, 'dist');

function render(partialName, params, depth = 0) {
  if (depth > 5) throw new Error('include depth exceeded');
  let html = fs.readFileSync(path.join(src, 'partials', partialName + '.html'), 'utf8');
  html = html.replace(/\{\{active:([\w-]+)\}\}/g, (_, k) => (params.active === k ? ' is-active' : ''));
  html = html.replace(/\{\{([\w-]+)\}\}/g, (m, k) => (k === 'root' ? m : params[k] ?? ''));
  return expand(html, depth + 1);
}

function expand(html, depth = 0) {
  return html.replace(/<!--\s*@include\s+([\w-]+)\s*(\{.*?\})?\s*-->/g, (_, name, json) =>
    render(name, json ? JSON.parse(json) : {}, depth)
  );
}

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    const a = path.join(from, e.name), b = path.join(to, e.name);
    e.isDirectory() ? copyDir(a, b) : fs.copyFileSync(a, b);
  }
}

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });
for (const f of fs.readdirSync(path.join(src, 'pages'))) {
  if (!f.endsWith('.html')) continue;
  const name = f === 'index.html' ? 'index.html' : path.join(f.replace(/\.html$/, ''), 'index.html');
  // {{root}} -> relative path to site root, so the build works both on a domain root and on a GitHub Pages subpath
  const rootRel = f === 'index.html' ? './' : '../';
  const out = expand(fs.readFileSync(path.join(src, 'pages', f), 'utf8')).replace(/\{\{root\}\}/g, rootRel);
  fs.mkdirSync(path.dirname(path.join(dist, name)), { recursive: true });
  fs.writeFileSync(path.join(dist, name), out);
}
copyDir(path.join(root, 'assets'), path.join(dist, 'assets'));
for (const f of ['php']) {
  const p = path.join(root, f);
  if (fs.existsSync(p)) copyDir(p, path.join(dist, f));
}
console.log('built ->', dist);
