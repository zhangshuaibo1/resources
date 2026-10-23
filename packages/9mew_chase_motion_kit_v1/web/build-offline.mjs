import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const web = path.dirname(fileURLToPath(import.meta.url));
const kit = path.dirname(web);
const catalog = JSON.parse(fs.readFileSync(path.join(kit, 'catalog.json'), 'utf8'));
const assets = {};
for (const name of new Set([catalog.poster, ...Object.values(catalog.actions).map(a => a.sprite)].filter(Boolean))) {
  const absolute = path.resolve(kit, name);
  if (!absolute.startsWith(kit + path.sep)) throw new Error('Asset must stay inside this kit: ' + name);
  const extension = path.extname(name).slice(1).toLowerCase();
  const mime = {webp: 'image/webp', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg'}[extension];
  if (!mime) throw new Error('Unsupported raster image: ' + name);
  assets[name] = 'data:' + mime + ';base64,' + fs.readFileSync(absolute).toString('base64');
}
const font = 'data:font/woff;base64,' + fs.readFileSync(path.join(kit, 'fonts/9mew-chase.woff')).toString('base64');
const css = fs.readFileSync(path.join(web, 'demo.css'), 'utf8').replaceAll('../fonts/9mew-chase.woff', font);
const runtime = fs.readFileSync(path.join(web, 'chase-scene.js'), 'utf8').replace(/^export /gm, '');
const demo = fs.readFileSync(path.join(web, 'demo.js'), 'utf8').replace(/^import .*;\s*$/m, '');
const docsUrl = 'https://github.com/zhangshuaibo1/resources/blob/9mew-chase-motion-v1.0.0/packages/9mew_chase_motion_kit_v1/README.md';
const embedded = JSON.stringify({catalog, assets, docsUrl}).replace(/</g, '\\u003c');
let html = fs.readFileSync(path.join(web, 'index.html'), 'utf8')
  .replace('href="README.md" id="readme-link"', `href="${docsUrl}" id="readme-link"`)
  .replace('<link rel="stylesheet" href="demo.css">', `<style>${css}</style>`)
  .replace('<script type="module" src="demo.js"></script>', `<script>window.__9MEW_CHASE_EMBEDDED__=${embedded};\n(()=>{\n${runtime}\n${demo}\n})();</script>`)
  .replace('<meta name="color-scheme" content="light dark">', '<meta name="color-scheme" content="light dark">\n<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; img-src data:; font-src data:; style-src \'unsafe-inline\'; script-src \'unsafe-inline\'; connect-src \'none\'; base-uri \'none\'">');
const index = process.argv.indexOf('--out');
const destination = index >= 0 ? path.resolve(process.cwd(), process.argv[index + 1]) : path.join(kit, 'OPEN_ME.html');
fs.writeFileSync(destination, html);
console.log(JSON.stringify({output: destination, bytes: Buffer.byteLength(html), embeddedRasterFiles: Object.keys(assets).length}));
